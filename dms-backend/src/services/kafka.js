import { Kafka } from 'kafkajs'

const kafka = new Kafka({
  clientId: 'dms-backend',
  brokers: ['localhost:9092'],
  retry: { retries: 5, initialRetryTime: 3000 }
})

const producer = kafka.producer()
let producerConnected = false

export const initKafka = async () => {
  try {
    await producer.connect()
    producerConnected = true
    console.log('Kafka producer ready')
  } catch (err) {
    console.log('Kafka not available, continuing without it:', err.message)
  }
}

export const publishEvent = async (topic, message) => {
  if (!producerConnected) return
  try {
    await producer.send({
      topic,
      messages: [{ value: JSON.stringify(message) }]
    })
    console.log(`Event published to topic: ${topic}`)
  } catch (err) {
    console.log('Failed to publish event:', err.message)
  }
}