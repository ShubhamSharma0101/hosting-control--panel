# 🚀 Hosting Control Panel

A self-hosted deployment automation platform that allows admins to deploy Docker containers with custom domains and automatic SSL using a simple control panel.

This project automates:

```text
Docker Deployment
→ Nginx Configuration
→ SSL Generation
→ Domain Routing
→ Background Processing
```

---

# Features

* Deploy Docker containers from UI
* Custom subdomain support
* Automatic Nginx configuration
* Automatic HTTPS (SSL) via Certbot
* Background job processing using BullMQ + Redis
* Live deployment status updates
* EC2-based self-hosted infrastructure
* Worker-based deployment system
* Auto polling dashboard

---

# Architecture

```text
Admin (Frontend)
        │ POST /deploy
        ▼
Express Backend API
        │
        ├─ Save Deployment → MongoDB
        └─ Push Job → Redis + BullMQ
                          │
                          ▼
                    Deployment Worker
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
      SSH into EC2    Docker Deploy    Lambda Trigger
          │               │
      Nginx Config   Container Live
          │
      SSL via Certbot
          │
          ▼
https://client.devshubham.in
```

---

# Tech Stack

## Frontend

* React
* Axios

## Backend

* Node.js
* Express.js

## Queue & Worker

* BullMQ
* Redis

## Database

* MongoDB Atlas

## Infrastructure

* AWS EC2 (Ubuntu)

## Reverse Proxy

* Nginx

## SSL

* Certbot + Let's Encrypt

## Containers

* Docker

## Automation

* SSH
* AWS Lambda

---

# Folder Structure

```text
project-root/
│
├── frontend/
│
├── backend/
│   ├── routes/
│   ├── services/
│   ├── queue/
│   ├── worker/
│   ├── models/
│   └── config/
│
└── README.md
```

---

# Installation Guide

## 1. Clone Repository

```bash
git clone YOUR_REPOSITORY_URL
cd project-name
```

---

## 2. Backend Setup

Go to backend:

```bash
cd backend
```

Install dependencies:

```bash
npm install
```

Create `.env`:

```env
PORT=5000

MONGO_URI=

REDIS_HOST=localhost
REDIS_PORT=6379

AWS_REGION=
LAMBDA_FUNCTION_NAME=

SSH_HOST=
SSH_USER=
SSH_PRIVATE_KEY_PATH=
```

Run backend:

```bash
npm run dev
```

---

## 3. Worker Setup

Open another terminal:

```bash
cd backend
npm run worker
```

Worker listens for deployment jobs.

---

## 4. Frontend Setup

Go to frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run:

```bash
npm start
```

---

# Required Services

Install these on EC2.

## Redis

```bash
sudo apt update
sudo apt install redis-server -y

sudo systemctl start redis-server
sudo systemctl enable redis-server
```

Check:

```bash
redis-cli ping
```

Expected:

```text
PONG
```

---

## Docker

Install:

```bash
sudo apt install docker.io -y
```

Start:

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

Permission:

```bash
sudo usermod -aG docker ubuntu
newgrp docker
```

Check:

```bash
docker ps
```

---

## Nginx

Install:

```bash
sudo apt install nginx -y
```

Start:

```bash
sudo systemctl start nginx
sudo systemctl enable nginx
```

Check:

```bash
sudo systemctl status nginx
```

---

## Certbot SSL

Install:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Example:

```bash
sudo certbot --nginx -d api.example.com
```

---

# Environment Variables

Create `.env` inside backend:

```env
PORT=5000

MONGO_URI=

REDIS_HOST=localhost
REDIS_PORT=6379

AWS_REGION=
LAMBDA_FUNCTION_NAME=

SSH_HOST=
SSH_USER=
SSH_PRIVATE_KEY_PATH=
```

---

# API Routes

## Deploy Container

```http
POST /api/deploy
```

Body:

```json
{
  "clientName": "Demo Client",
  "domain": "demo.example.com",
  "image": "nginx:latest"
}
```

---

## Get Deployment Status

```http
GET /api/status/:id
```

---

## Get All Deployments

```http
GET /api/deployments
```

---

# Run Using PM2

Install PM2:

```bash
npm install -g pm2
```

Start backend:

```bash
pm2 start server.js --name backend
```

Start worker:

```bash
pm2 start worker.js --name worker
```

Save process:

```bash
pm2 save
```

Auto-start after reboot:

```bash
pm2 startup
```

---

# Deployment Flow

```text
Admin clicks Deploy
        ↓
API receives request
        ↓
Save Deployment (Pending)
        ↓
BullMQ Queue
        ↓
Worker picks job
        ↓
Docker Deploy
        ↓
Nginx Config
        ↓
SSL Certificate
        ↓
Deployment Completed
```

---

# Troubleshooting

## Redis Error

```text
ECONNREFUSED 127.0.0.1:6379
```

Fix:

```bash
sudo systemctl start redis-server
```

---

## Docker Missing

```text
docker: command not found
```

Fix:

```bash
sudo apt install docker.io -y
```

---

## Nginx 502 Error

Usually means:

```text
Container not running
OR
Wrong proxy port
```

Check:

```bash
docker ps
curl http://localhost:PORT
```

---

# Security Notes

Never commit:

```text
.env
AWS keys
SSH private keys
Mongo credentials
```

Add to `.gitignore`:

```text
.env
node_modules
```

---

# Future Improvements

* Auto rollback on failure
* Deployment deletion system
* Multi-server support
* Monitoring dashboard
* Role-based authentication
* WebSocket live updates
