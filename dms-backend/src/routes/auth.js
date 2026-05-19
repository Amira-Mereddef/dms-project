import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { query } from '../db/postgres.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' })
    }

    const { rows } = await query('SELECT * FROM users WHERE email = $1', [email])
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const user = rows[0]
    if (user.status === 'suspended') {
      return res.status(403).json({ error: 'Account suspended' })
    }

    const valid = await bcrypt.compare(password, user.password)
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' })
    }

    const token = jwt.sign(
      { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    )

    res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role, department: user.department }
    })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Server error' })
  }
})

// Get current user
router.get('/me', requireAuth, async (req, res) => {
  const { rows } = await query('SELECT id, name, email, role, department, status FROM users WHERE id = $1', [req.user.id])
  res.json(rows[0])
})

// Register new user (admin only in real app, open here for demo)
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body
    const hashed = await bcrypt.hash(password, 10)
    const { rows } = await query(
      'INSERT INTO users (name, email, password, role, department) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role, department',
      [name, email, hashed, role || 'user', department || '']
    )
    res.status(201).json(rows[0])
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Email already exists' })
    res.status(500).json({ error: 'Server error' })
  }
})

export default router