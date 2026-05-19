import express from 'express'
import multer from 'multer'
import { query } from '../db/postgres.js'
import { requireAuth } from '../middleware/auth.js'
import { uploadToS3, getPresignedUrl } from '../services/s3.js'
import { setCache, getCache, deleteCache } from '../db/redis.js'
import { publishEvent } from '../services/kafka.js'

const router = express.Router()
const upload = multer({ storage: multer.memoryStorage() })

// Get all documents with visibility filtering
router.get('/', requireAuth, async (req, res) => {
  try {
    const cacheKey = `documents_${req.user.id}_${req.user.department}_${req.user.role}`
    const cached = await getCache(cacheKey)
    if (cached) {
      console.log(`Cache hit for user ${req.user.name}`)
      return res.json({ source: 'cache', data: cached })
    }

    const { rows } = await query(`
      SELECT * FROM documents
      WHERE status = 'active'
      ORDER BY created_at DESC
    `)

    let accessible
    if (req.user.role === 'admin') {
      accessible = rows
    } else {
      accessible = rows.filter(doc => {
        if (doc.visibility === 'public') return true
        if (doc.visibility === 'private') return doc.owner_id === req.user.id
        if (doc.visibility === 'department') {
          const userDepts = (req.user.department || '').split(',').map(d => d.trim())
          return userDepts.includes(doc.department) || doc.owner_id === req.user.id
        }
        return false
      })
    }

    console.log(`User ${req.user.name} (dept: ${req.user.department}) sees ${accessible.length} of ${rows.length} docs`)
    await setCache(cacheKey, accessible, 30)
    res.json({ source: 'database', data: accessible })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get single document
router.get('/:id', requireAuth, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM documents WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Document not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Upload new document
router.post('/', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { title, description, category, visibility, department } = req.body
    let fileKey = null
    let fileSize = null

    if (req.file) {
      fileKey = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype)
      fileSize = `${(req.file.size / 1024 / 1024).toFixed(2)} MB`
    }

    const docDepartment = department || req.user.department || ''

    const { rows } = await query(`
      INSERT INTO documents (title, description, category, owner_id, owner_name, department, visibility, file_key, file_size)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `, [
      title,
      description || '',
      category || 'General',
      req.user.id,
      req.user.name,
      docDepartment,
      visibility || 'department',
      fileKey,
      fileSize || '0 MB'
    ])

    // Also create version 1 record
    await query(`
      INSERT INTO document_versions (document_id, version, note, author, file_key, file_size)
      VALUES ($1, 1, 'Initial upload', $2, $3, $4)
    `, [rows[0].id, req.user.name, fileKey, fileSize || '0 MB'])

    await deleteCache(`documents_${req.user.id}_${req.user.department}_${req.user.role}`)

    await publishEvent('document-uploaded', {
      documentId: rows[0].id,
      title: rows[0].title,
      owner: req.user.name,
      ownerId: req.user.id,
      category: rows[0].category,
      department: rows[0].department,
      visibility: rows[0].visibility,
      timestamp: new Date().toISOString()
    })

    res.status(201).json(rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Update document
router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { visibility, title, description, version, translated_title } = req.body
    const { rows } = await query(`
      UPDATE documents SET
        visibility = COALESCE($1, visibility),
        title = COALESCE($2, title),
        description = COALESCE($3, description),
        version = COALESCE($4, version),
        translated_title = COALESCE($5, translated_title)
      WHERE id = $6 RETURNING *
    `, [visibility, title, description, version, translated_title, req.params.id])
    await deleteCache(`documents_${req.user.id}_${req.user.department}_${req.user.role}`)
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Download document with pre-signed URL
router.get('/:id/download', requireAuth, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM documents WHERE id = $1', [req.params.id])
    if (rows.length === 0) return res.status(404).json({ error: 'Not found' })
    if (!rows[0].file_key) return res.status(400).json({ error: 'No file attached' })
    const url = await getPresignedUrl(rows[0].file_key)
    res.json({ url, expiresIn: 3600 })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Get all versions for a document
router.get('/:id/versions', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM document_versions WHERE document_id = $1 ORDER BY version DESC',
      [req.params.id]
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// Upload a new version with file
router.post('/:id/versions', requireAuth, upload.single('file'), async (req, res) => {
  try {
    const { note } = req.body

    if (!req.file) {
      return res.status(400).json({ error: 'File is required for a new version' })
    }
    if (!note || !note.trim()) {
      return res.status(400).json({ error: 'Version note is required' })
    }

    // Get current version number
    const { rows: docRows } = await query(
      'SELECT version, file_key FROM documents WHERE id = $1',
      [req.params.id]
    )
    if (docRows.length === 0) return res.status(404).json({ error: 'Document not found' })

    const newVersionNum = (docRows[0].version || 1) + 1

    // Upload new file to S3
    const fileKey = await uploadToS3(req.file.buffer, req.file.originalname, req.file.mimetype)
    const fileSize = `${(req.file.size / 1024 / 1024).toFixed(2)} MB`

    // Save version record
    const { rows: versionRows } = await query(`
      INSERT INTO document_versions (document_id, version, note, author, file_key, file_size)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [req.params.id, newVersionNum, note.trim(), req.user.name, fileKey, fileSize])

    // Update document to point to new file
    await query(`
      UPDATE documents SET
        version = $1,
        file_key = $2,
        file_size = $3
      WHERE id = $4
    `, [newVersionNum, fileKey, fileSize, req.params.id])

    // Invalidate cache
    await deleteCache(`documents_${req.user.id}_${req.user.department}_${req.user.role}`)

    res.status(201).json({
      ...versionRows[0],
      newVersion: newVersionNum,
      fileKey,
      fileSize
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Download a specific version file
router.get('/:id/versions/:versionId/download', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM document_versions WHERE id = $1 AND document_id = $2',
      [req.params.versionId, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'Version not found' })
    if (!rows[0].file_key) return res.status(400).json({ error: 'No file for this version' })
    const url = await getPresignedUrl(rows[0].file_key)
    res.json({ url, expiresIn: 3600 })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router