import { Registry, Counter, Histogram, Gauge, collectDefaultMetrics } from 'prom-client'

export const register = new Registry()

collectDefaultMetrics({ register })

export const httpRequestCounter = new Counter({
  name: 'dms_http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
  registers: [register]
})

export const httpRequestDuration = new Histogram({
  name: 'dms_http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route'],
  buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5],
  registers: [register]
})

export const documentsTotal = new Gauge({
  name: 'dms_documents_total',
  help: 'Total number of active documents in the system',
  registers: [register]
})

export const usersTotal = new Gauge({
  name: 'dms_users_total',
  help: 'Total number of users in the system',
  registers: [register]
})

export const commentsTotal = new Counter({
  name: 'dms_comments_total',
  help: 'Total number of comments posted',
  registers: [register]
})

export const kafkaEventsTotal = new Counter({
  name: 'dms_kafka_events_total',
  help: 'Total Kafka events published',
  labelNames: ['topic'],
  registers: [register]
})