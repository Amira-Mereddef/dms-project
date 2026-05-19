import express from 'express'
import { query } from '../db/postgres.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, async (req, res) => {
  try {
    const { rows } = await query('SELECT * FROM categories ORDER BY created_at DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.post('/', requireAuth, async (req, res) => {
  try {
    const { name, color } = req.body
    const { rows } = await query(
      'INSERT INTO categories (name, color) VALUES ($1,$2) RETURNING *',
      [name, color || '#c0392b']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Category already exists' })
    res.status(500).json({ error: 'Server error' })
  }
})

router.patch('/:id', requireAuth, async (req, res) => {
  try {
    const { name, color } = req.body
    const { rows } = await query(
      `UPDATE categories SET
        name = COALESCE($1, name),
        color = COALESCE($2, color)
       WHERE id = $3 RETURNING *`,
      [name, color, req.params.id]
    )
    res.json(rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

router.delete('/:id', requireAuth, async (req, res) => {
  try {
    await query('DELETE FROM categories WHERE id = $1', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router