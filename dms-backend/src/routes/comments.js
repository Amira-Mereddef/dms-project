import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import cassandraClient from '../db/cassandra.js'
import { requireAuth } from '../middleware/auth.js'
import dotenv from 'dotenv'
dotenv.config()

const router = express.Router()
const KEYSPACE = process.env.CASSANDRA_KEYSPACE

// Get comments for a document
router.get('/:documentId', requireAuth, async (req, res) => {
  try {
    const result = await cassandraClient.execute(
      `SELECT * FROM ${KEYSPACE}.comments WHERE document_id = ?`,
      [req.params.documentId],
      { prepare: true }
    )
    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Add a comment
router.post('/:documentId', requireAuth, async (req, res) => {
  try {
    const { text } = req.body
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text required' })

    const commentId = uuidv4()
    const now = new Date()

    await cassandraClient.execute(
      `INSERT INTO ${KEYSPACE}.comments (document_id, comment_id, author, author_id, text, created_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.params.documentId, commentId, req.user.name, req.user.id, text, now],
      { prepare: true }
    )

    res.status(201).json({
      document_id: req.params.documentId,
      comment_id: commentId,
      author: req.user.name,
      author_id: req.user.id,
      text,
      created_at: now
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

export default router