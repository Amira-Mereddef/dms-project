# Document Management System (DMS)
> Enterprise Computing Project 

A full stack enterprise Document Management System built with React, Node.js, and a polyglot persistence architecture. The system supports role based access control, department-based document visibility, AI powered title translation, real time monitoring, and event driven architecture.

---

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | React 18, Vite, React Router | User interface |
| Backend | Node.js, Express | REST API |
| Auth | JWT + bcrypt | Stateless authentication |
| Primary DB | PostgreSQL 15 | Users, documents, metadata |
| Comments DB | Cassandra 4.1 | High-write comment storage |
| Cache | Redis 7 | Hot read path caching |
| File Storage | MinIO (S3-compatible) | PDF binary storage |
| Messaging | Apache Kafka | Event-driven architecture |
| AI Service | Python + Groq (Llama3) | Arabic title translation |
| Monitoring | Prometheus + Grafana | Metrics and dashboards |
| Containers | Docker + Docker Compose | Service orchestration |
| Testing | Playwright | End-to-end testing |

---

## Features

### End User
- Login with JWT authentication
- View documents filtered by department and visibility
- Upload documents with PDF files stored in S3
- Download documents via pre-signed URLs (1 hour expiry)
- Comment on accessible documents
- View document version history
- See AI-translated Arabic title on document detail

### Admin
- Create and manage users, departments, categories
- Import users from CSV file
- Suspend / activate users
- Multi-select bulk actions (suspend, export CSV)
- Assign users to departments
- View full activity log

### System
- Department-based visibility (Public / Department-only / Private)
- Redis caching with automatic invalidation on writes
- Kafka event published on every document upload
- Python consumer translates title to Arabic via Groq AI
- Prometheus scrapes metrics every 5 seconds
- Grafana dashboard with 4 panels
- Playwright E2E tests

---

## Getting Started

### Prerequisites

- Node.js 18+
- Docker Desktop
- Python 3.10+
- A free Groq API key from https://console.groq.com

### 1. Clone the repository

```bash
git clone https://github.com/your-username/dms-project.git
cd dms-project
```

### 2. Start infrastructure

```bash
cd dms-backend
docker-compose up -d
```

Wait 60 seconds for all services to start, especially Cassandra.

### 3. Start the backend

```bash
cd dms-backend
npm install
npm run dev
```

### 4. Start the Python consumer

```bash
cd dms-python-consumer
pip install -r requirements.txt

# Set your Groq API key
$env:GROQ_API_KEY="gsk_your_key_here"   # Windows PowerShell
export GROQ_API_KEY="gsk_your_key_here"  # Mac/Linux

python consumer.py
```

### 5. Start the frontend

```bash
cd dms-assignment
npm install
npm run dev
```

Open http://localhost:5173

### 6. Default login

| Email | Password | Role |
|---|---|---|
| admin@dms.com | password | Admin |

---

## Environment Variables

### Backend (`dms-backend/.env`)

```env
PORT=4000
JWT_SECRET=your_secret_key

PG_HOST=localhost
PG_PORT=5433
PG_USER=dms
PG_PASSWORD=dms123
PG_DATABASE=dmsdb

REDIS_URL=redis://localhost:6379

CASSANDRA_HOST=localhost
CASSANDRA_KEYSPACE=dms_keyspace

S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=dms-documents
S3_REGION=us-east-1
```

### Python Consumer (`dms-python-consumer/.env`)

```env
GROQ_API_KEY=gsk_your_key_here
KAFKA_BOOTSTRAP_SERVERS=localhost:9092
DB_HOST=localhost
DB_PORT=5433
DB_NAME=dmsdb
DB_USER=dms
DB_PASSWORD=dms123
```

---

## API Endpoints

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | /api/auth/login | Login and receive JWT token |
| GET | /api/auth/me | Get current user info |

### Documents
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/documents | Get all accessible documents |
| GET | /api/documents/:id | Get single document |
| POST | /api/documents | Upload new document with file |
| PATCH | /api/documents/:id | Update document |
| GET | /api/documents/:id/download | Get pre-signed download URL |
| GET | /api/documents/:id/versions | Get version history |
| POST | /api/documents/:id/versions | Upload new version |

### Comments
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/comments/:documentId | Get comments for document |
| POST | /api/comments/:documentId | Post a comment |

### Users (Admin only)
| Method | Endpoint | Description |
|---|---|---|
| GET | /api/users | Get all users |
| POST | /api/users | Create user |
| PATCH | /api/users/:id | Update user |
| DELETE | /api/users/:id | Delete user |

### System
| Method | Endpoint | Description |
|---|---|---|
| GET | /health | Health check |
| GET | /metrics | Prometheus metrics |

---

## Database Design

### PostgreSQL Tables
- **users** — id, name, email, password (bcrypt), role, department, status
- **documents** — id, title, category, owner_id, department, visibility, file_key, translated_title, version
- **document_versions** — id, document_id, version, note, author, file_key, file_size
- **departments** — id, name, head
- **categories** — id, name, color
- **activity_log** — id, user_name, action, target, created_at

### Cassandra Table
- **comments** — document_id (partition key), comment_id, author, text, created_at

### Why polyglot persistence?
- PostgreSQL for structured relational data with complex queries
- Cassandra for write-heavy append-only comments accessed by document ID only
- Redis for caching hot read paths (document lists per user)

---

### Grafana Dashboard
Open http://localhost:3000 (admin/admin)

Panels:
1. Total Active Documents
2. Total API Requests
3. Requests per Second
4. Total Users

---

## Running Tests

```bash
cd dms-assignment

# Run all E2E tests
npx playwright test --reporter=list

# Run specific test file
npx playwright test tests/e2e.spec.js --reporter=list

# Run with visible browser
npx playwright test --headed

# View HTML report
npx playwright show-report
```

---

## Enterprise Design Decisions

**Scalability** — Stateless JWT authentication allows multiple backend replicas. Cassandra scales horizontally by adding nodes. Redis reduces PostgreSQL load on hot paths.

**Availability** — Kubernetes deployment defines 2 backend replicas. If one crashes, K8s restarts it automatically while the other handles traffic.

**Security** — Passwords hashed with bcrypt. JWT signed and verified on every request. Document visibility enforced on backend private data never sent to unauthorized clients. Pre signed URLs expire after 1 hour. All traffic through API Gateway  microservices not exposed directly.

**Fault Isolation** — Kafka decouples upload from AI translation. If the Python consumer crashes, document upload still works. Messages wait in Kafka and are processed when the consumer recovers.

**Consistency** — PostgreSQL provides ACID transactions for critical data. Cassandra provides eventual consistency for comments acceptable tradeoff for high write throughput.

---
