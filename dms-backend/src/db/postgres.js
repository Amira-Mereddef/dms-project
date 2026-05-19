import pg from 'pg'

const { Pool } = pg

const pool = new Pool({
  host: 'localhost',
  port: 5433,
  user: 'dms',
  password: 'dms123',
  database: 'dmsdb',
})

export const query = (text, params) => pool.query(text, params)

export const initPostgres = async () => {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'user',
      department VARCHAR(100),
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS departments (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      head VARCHAR(100),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS categories (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100) UNIQUE NOT NULL,
      color VARCHAR(20) DEFAULT '#c0392b',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS documents (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      description TEXT,
      category VARCHAR(100),
      owner_id INTEGER REFERENCES users(id),
      owner_name VARCHAR(100),
      department VARCHAR(100),
      visibility VARCHAR(20) DEFAULT 'department',
      version INTEGER DEFAULT 1,
      file_key VARCHAR(500),
      file_url TEXT,
      file_size VARCHAR(50),
      translated_title VARCHAR(500),
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS document_versions (
      id SERIAL PRIMARY KEY,
      document_id INTEGER REFERENCES documents(id),
      version INTEGER NOT NULL,
      note TEXT,
      author VARCHAR(100),
      file_key VARCHAR(500),
      file_size VARCHAR(50),
      created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS activity_log (
      id SERIAL PRIMARY KEY,
      user_name VARCHAR(100),
      action VARCHAR(200),
      target VARCHAR(200),
      created_at TIMESTAMP DEFAULT NOW()
    );
  `)

  const { rows: userRows } = await pool.query('SELECT COUNT(*) FROM users')
  if (userRows[0].count === '0') {
    await pool.query(`
      INSERT INTO users (name, email, password, role, department, status) VALUES
      ('Amira Mereddef', 'admin@dms.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', 'IT', 'active')
    `)
    console.log('Admin seeded — login: admin@dms.com / password')
  }

  console.log('PostgreSQL ready')
}