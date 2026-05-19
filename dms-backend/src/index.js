import express from 'express'
import cors from 'cors'
import { initPostgres, query } from './db/postgres.js'
import { initRedis } from './db/redis.js'
import { initCassandra } from './db/cassandra.js'
import { initS3 } from './services/s3.js'
import { initKafka } from './services/kafka.js'
import { register, documentsTotal, usersTotal } from './services/metrics.js'
import { metricsMiddleware } from './middleware/metricsMiddleware.js'
import authRoutes from './routes/auth.js'
import documentRoutes from './routes/documents.js'
import commentRoutes from './routes/comments.js'
import userRoutes from './routes/users.js'
import departmentRoutes from './routes/departments.js'
import categoryRoutes from './routes/categories.js'
import activityRoutes from './routes/activity.js'

const app = express()

app.use(cors())
app.use(express.json())
app.use(metricsMiddleware)

app.use('/api/auth', authRoutes)
app.use('/api/documents', documentRoutes)
app.use('/api/comments', commentRoutes)
app.use('/api/users', userRoutes)
app.use('/api/departments', departmentRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/activity', activityRoutes)

app.get('/health', (req, res) => res.json({ status: 'ok' }))

// Metrics endpoint — Prometheus scrapes this
app.get('/metrics', async (req, res) => {
  try {
    // Update live gauges before serving
    const docResult = await query('SELECT COUNT(*) FROM documents WHERE status = $1', ['active'])
    documentsTotal.set(Number(docResult.rows[0].count))

    const userResult = await query('SELECT COUNT(*) FROM users WHERE status = $1', ['active'])
    usersTotal.set(Number(userResult.rows[0].count))

    res.set('Content-Type', register.contentType)
    res.end(await register.metrics())
  } catch (err) {
    res.status(500).end(err.message)
  }
})

const start = async () => {
  try {
    await initPostgres()
    await initRedis()
    await initCassandra()
    await initS3()
    await initKafka()
    app.listen(4000, () => {
      console.log('Backend running on http://localhost:4000')
    })
  } catch (err) {
    console.error('Failed to start:', err)
    process.exit(1)
  }
}

start()