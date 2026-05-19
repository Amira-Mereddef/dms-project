import express from 'express'
import { query } from '../db/postgres.js'
import { requireAuth, requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/', requireAuth, requireAdmin, async (req, res) => {
  try {
    const { rows } = await query(
      'SELECT * FROM activity_log ORDER BY created_at DESC LIMIT 100'
    )
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

export default router