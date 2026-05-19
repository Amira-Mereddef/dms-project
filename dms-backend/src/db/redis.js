import { createClient } from 'redis'

const client = createClient({ url: 'redis://localhost:6379' })

client.on('error', (err) => console.log('Redis error:', err))

export const initRedis = async () => {
  await client.connect()
  console.log('Redis ready')
}

export const setCache = async (key, value, ttlSeconds = 60) => {
  await client.setEx(key, ttlSeconds, JSON.stringify(value))
}

export const getCache = async (key) => {
  const data = await client.get(key)
  return data ? JSON.parse(data) : null
}

export const deleteCache = async (key) => {
  await client.del(key)
}

export default client