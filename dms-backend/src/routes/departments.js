import express from 'express'
import { query } from '../db/postgres.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM departments ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, head } = req.body
    const { rows } = await query(
      'INSERT INTO departments (name, head) VALUES ($1,$2) RETURNING *',
      [name, head || '']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Department already exists' })
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { name, head } = req.body
    const { rows } = await query(
      `UPDATE departments SET
        name = COALESCE($1, name),
        head = COALESCE($2, head)
       WHERE id = $3 RETURNING *`,
      [name, head, req.params.id]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM departments WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router