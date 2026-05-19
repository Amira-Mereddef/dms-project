import { httpRequestCounter, httpRequestDuration } from '../services/metrics.js'

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now()
  const route = req.path

  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000
    httpRequestCounter.inc({
      method: req.method,
      route,
      status: res.statusCode
    })
    httpRequestDuration.observe({ method: req.method, route }, duration)
  })

  next()
}