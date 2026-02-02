# Deployment Guide for HealthX 🚀

This guide provides step-by-step instructions for deploying the HealthX application on a web server.

---

## 🛠️ Prerequisites

- A VPS (e.g., DigitalOcean Droplet, AWS EC2, Linode) running Ubuntu 22.04+
- Docker and Docker Compose installed on the server
- A Domain Name (optional but recommended)

---

## 📦 Option 1: Dockerized Deployment (Recommended)

This method uses the production-ready `docker-compose.prod.yml` to run the entire stack on a single server.

### 1. Prepare the Server
```bash
# Update and install Docker
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Clone your repository
git clone <your-repo-url>
cd HealthX
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory:
```bash
SECRET_KEY=generate_a_secure_random_string
MONGO_ROOT_USER=admin
MONGO_ROOT_PASSWORD=your_secure_db_password
FRONTEND_URL=http://your-domain-or-ip
```

### 3. Deploy
```bash
docker compose -f docker-compose.prod.yml up -d --build
```
The application will be accessible at `http://your-server-ip`.

---

## 🔄 Option 3: Git-Based Deployment (Continuous Updates)

This is the recommended way to keep your server updated easily.

### 1. Initial Setup on Server
```bash
git clone <your-repo-url>
cd HealthX
# Set up your .env file as described in Option 1
chmod +x deploy.sh
```

### 2. To Update Your App
Whenever you push new code to your Git repository, simply run this on your server:
```bash
./deploy.sh
```

This script will automatically:
- Pull the latest code.
- Rebuild the production images.
- Restart the containers with minimal downtime.
- Clean up old Docker images.

---

## ☁️ Option 2: Managed Services (Serverless)

If you prefer not to manage a VPS, you can split the services:

### 1. Frontend (Vercel / Netlify)
- **Deployment**: Connect your GitHub repo.
- **Root Directory**: `frontend`
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Environment Variables**: `VITE_API_URL=https://your-backend-url.com/api`

### 2. Backend (Render / Railway / Fly.io)
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn --bind 0.0.0.0:$PORT app:app`
- **Environment Variables**: Define your `MONGO_URI`, `SECRET_KEY`, etc.

### 3. Database (MongoDB Atlas)
- Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
- Get the Connection String and use it as `MONGO_URI` for your backend.

---

## 🔒 Security & Optimization

> [!IMPORTANT]
> **HTTPS/SSL**: For production, always use HTTPS. You can use **Caddy** or **Nginx with Certbot** as a reverse proxy to handle SSL certificates automatically.

> [!TIP]
> **AI Provider**: If you cannot run Ollama on your production server (it requires high RAM/GPU), consider switching the backend to use a hosted AI API like **Gemini** or **OpenAI**.

---

## 🧪 Verification
After deployment, run:
1. `curl http://your-domain/api/health` to check backend.
2. Visit `http://your-domain` in a browser to check frontend.
