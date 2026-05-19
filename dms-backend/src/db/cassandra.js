import cassandra from 'cassandra-driver'

const cassandraClient = new cassandra.Client({
  contactPoints: ['127.0.0.1'],
  localDataCenter: 'datacenter1',
  socketOptions: { readTimeout: 60000 },
  policies: {
    reconnection: new cassandra.policies.reconnection.ExponentialReconnectionPolicy(1000, 60000)
  }
})

export const initCassandra = async (retries = 10) => {
  for (let i = 0; i < retries; i++) {
    try {
      await cassandraClient.connect()

      await cassandraClient.execute(`
        CREATE KEYSPACE IF NOT EXISTS dms_keyspace
        WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1}
      `)

      await cassandraClient.execute(`
        CREATE TABLE IF NOT EXISTS dms_keyspace.comments (
          document_id TEXT,
          comment_id UUID,
          author TEXT,
          author_id INT,
          text TEXT,
          created_at TIMESTAMP,
          PRIMARY KEY (document_id, created_at, comment_id)
        ) WITH CLUSTERING ORDER BY (created_at ASC, comment_id ASC)
      `)

      console.log('Cassandra ready')
      return
    } catch (err) {
      console.log(`Cassandra not ready yet, retrying in 10s... (${i + 1}/${retries})`)
      await new Promise(r => setTimeout(r, 10000))
    }
  }
  throw new Error('Cassandra failed to connect after retries')
}

export default cassandraClient