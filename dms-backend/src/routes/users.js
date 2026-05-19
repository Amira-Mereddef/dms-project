import express from 'express'
import bcrypt from 'bcryptjs'
import { query } from '../db/postgres.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT id, name, email, role, department, status, created_at FROM users ORDER BY created_at DESC'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body
    const hashed = await bcrypt.hash(password, 10)
    const { rows } = await query(
      `INSERT INTO users (name, email, password, role, department)
       VALUES ($1,$2,$3,$4,$5)
       RETURNING id, name, email, role, department, status, created_at`,
      [name, email, hashed, role || 'user', department || '']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' })
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { name, email, role, department, status } = req.body
    const { rows } = await query(
      `UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        role = COALESCE($3, role),
        department = COALESCE($4, department),
        status = COALESCE($5, status)
       WHERE id = $6
       RETURNING id, name, email, role, department, status, created_at`,
      [name, email, role, department, status, req.params.id]
    )
    if (rows.length === 0) return res.status(404).json({ error: 'User not found' })
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM users WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router