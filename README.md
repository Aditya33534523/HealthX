# HealthX
# 🏥 PharmaCare - Python Only with Docker

A complete pharmaceutical chatbot system built entirely with **Python** (no Node.js/React), featuring Flask backend and frontend, MongoDB, and Ollama AI integration.

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Installation Guide](#installation-guide)
4. [Docker Desktop Setup](#docker-desktop-setup)
5. [Building and Running](#building-and-running)
6. [Using Docker Desktop GUI](#using-docker-desktop-gui)
7. [Accessing the Application](#accessing-the-application)
8. [Troubleshooting](#troubleshooting)

---

## ✅ Prerequisites

### Required Software

**Only 1 thing needed:**
- **Docker Desktop** (includes Docker and Docker Compose)

That's it! Everything else runs in containers.

### System Requirements

- **Windows 10/11** (64-bit, Pro/Enterprise/Education) or **macOS** (10.15+)
- **RAM:** 8 GB minimum (16 GB recommended)
- **Disk Space:** 10 GB free
- **Internet:** For initial downloads

---

## 📁 Project Structure

```
pharmacare-python/
├── docker-compose.yml          # Main Docker configuration
├── .env                         # Environment variables
├── .dockerignore               # Docker ignore rules
├── README.md                   # This file
│
├── backend/                    # Python Flask Backend
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── app.py
│   ├── config.py
│   ├── models/
│   │   └── database.py
│   ├── routes/
│   │   ├── chat.py
│   │   └── drugs.py
│   └── utils/
│       ├── ollama_client.py
│       └── db_init.py
│
└── frontend/                   # Python Flask Frontend
    ├── Dockerfile
    ├── requirements.txt
    ├── app.py
    ├── static/
    │   ├── css/
    │   │   └── style.css
    │   └── js/
    │       └── main.js
    └── templates/
        ├── base.html
        ├── login.html
        └── chat.html
```

---

## 🚀 Installation Guide

### Step 1: Install Docker Desktop

#### For Windows

1. **Download Docker Desktop:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Click **"Download for Windows"**
   - Save `Docker Desktop Installer.exe`

2. **Install:**
   ```
   - Double-click the installer
   - Follow the installation wizard
   - Check "Use WSL 2 instead of Hyper-V" (recommended)
   - Click "OK" when prompted
   - Restart your computer
   ```

3. **Verify Installation:**
   - Open **PowerShell** or **Command Prompt**
   ```powershell
   docker --version
   docker compose version
   ```
   
   Expected output:
   ```
   Docker version 24.x.x
   Docker Compose version v2.x.x
   ```

4. **Start Docker Desktop:**
   - Find Docker Desktop in Start Menu
   - Launch it
   - Wait for "Docker Desktop is running" in system tray

#### For Mac

1. **Download Docker Desktop:**
   - Visit: https://www.docker.com/products/docker-desktop/
   - Choose your chip:
     - **Intel Mac:** Download for Intel chip
     - **Apple Silicon (M1/M2):** Download for Apple chip

2. **Install:**
   ```
   - Open the downloaded .dmg file
   - Drag Docker icon to Applications folder
   - Open Docker from Applications
   - Grant permissions when asked
   - Enter your password if prompted
   ```

3. **Verify Installation:**
   - Open **Terminal**
   ```bash
   docker --version
   docker compose version
   ```

4. **Start Docker Desktop:**
   - Docker should auto-start
   - Check for Docker whale icon in menu bar

---

### Step 2: Create Project

1. **Create project folder:**

   **Windows (PowerShell):**
   ```powershell
   mkdir pharmacare-python
   cd pharmacare-python
   ```

   **Mac/Linux (Terminal):**
   ```bash
   mkdir pharmacare-python
   cd pharmacare-python
   ```

2. **Create all files:**
   
   Copy all the code files I provided above into their respective folders. The structure should match the [Project Structure](#project-structure) section.

---

## 🐳 Docker Desktop Setup

### Understanding Docker Desktop Interface

When you open Docker Desktop, you'll see:

1. **Dashboard** - Shows running containers
2. **Images** - Downloaded Docker images
3. **Volumes** - Data storage
4. **Settings** - Configuration options

### Before Building

1. **Start Docker Desktop:**
   - Windows: Launch from Start Menu
   - Mac: Open from Applications
   - Wait for "Docker Desktop is running" status

2. **Check Docker Status:**
   ```bash
   docker info
   ```
   
   Should show your system info without errors.

---

## 🏗️ Building and Running

### Method 1: Command Line (Recommended)

#### Step 1: Navigate to Project
```bash
cd pharmacare-python
```

#### Step 2: Build and Start Services
```bash
docker compose up --build
```

**What happens:**
- ⬇️ Downloads MongoDB image (~700 MB)
- ⬇️ Downloads Ollama image (~1.5 GB)
- ⬇️ Downloads Python image (~150 MB)
- 🔨 Builds backend container
- 🔨 Builds frontend container
- 🚀 Starts all services

**Expected output:**
```
[+] Building 45.2s (25/25) FINISHED
[+] Running 4/4
 ✔ Container pharmacare-mongodb    Started
 ✔ Container pharmacare-ollama     Started
 ✔ Container pharmacare-backend    Started
 ✔ Container pharmacare-frontend   Started
```

**This will take 5-10 minutes first time!**

#### Step 3: Pull Ollama Model

**Open a NEW terminal** (keep the previous one running):

```bash
# Pull the AI model (400 MB download)
docker exec -it pharmacare-ollama ollama pull qwen2.5:0.5b
```

**Output:**
```
pulling manifest
pulling 8eeb52dfb3bb...  100% ▕████████████████▏ 400 MB
pulling 11ce4ee3e170...  100% ▕████████████████▏ 1.7 KB
pulling 0ba8f0e314b4...  100% ▕████████████████▏   12 KB
pulling 56bb8bd477a5...  100% ▕████████████████▏   96 B
pulling 1a4c3c319823...  100% ▕████████████████▏  485 B
verifying sha256 digest
writing manifest
success
```

#### Step 4: Verify Services

Check all services are healthy:
```bash
docker compose ps
```

**Expected output:**
```
NAME                    STATUS              PORTS
pharmacare-mongodb      Up (healthy)        0.0.0.0:27017->27017/tcp
pharmacare-ollama       Up (healthy)        0.0.0.0:11434->11434/tcp
pharmacare-backend      Up (healthy)        0.0.0.0:5000->5000/tcp
pharmacare-frontend     Up                  0.0.0.0:3000->3000/tcp
```

---

### Method 2: Using Docker Desktop GUI

#### Step 1: Open Docker Desktop

Launch Docker Desktop application.

#### Step 2: Pull Images Manually

1. Click **"Images"** in sidebar
2. Click **"Pull an image"**
3. Pull these images one by one:
   - Type: `mongo:7.0` → Click "Pull"
   - Type: `ollama/ollama:latest` → Click "Pull"
   - Type: `python:3.11-slim` → Click "Pull"

Wait for each to complete (shows in Images list).

#### Step 3: Build Custom Images

1. Open **Terminal** in project folder
2. Build backend:
   ```bash
   docker build -t pharmacare-backend ./backend
   ```
3. Build frontend:
   ```bash
   docker build -t pharmacare-frontend ./frontend
   ```

#### Step 4: Create Network

In Docker Desktop:
1. Click **"Networks"** in sidebar
2. Click **"Create Network"**
3. Name: `pharmacare-network`
4. Click "Create"

#### Step 5: Create Volumes

In Docker Desktop:
1. Click **"Volumes"** in sidebar
2. Create two volumes:
   - `mongodb_data`
   - `ollama_data`

#### Step 6: Run Containers

1. Click **"Containers"** in sidebar
2. Click **"Run"** for each image:

**MongoDB Container:**
- Image: `mongo:7.0`
- Container name: `pharmacare-mongodb`
- Ports: `27017:27017`
- Environment variables:
  - `MONGO_INITDB_ROOT_USERNAME=admin`
  - `MONGO_INITDB_ROOT_PASSWORD=pharmacare123`
- Volume: `mongodb_data:/data/db`
- Network: `pharmacare-network`

**Ollama Container:**
- Image: `ollama/ollama:latest`
- Container name: `pharmacare-ollama`
- Ports: `11434:11434`
- Volume: `ollama_data:/root/.ollama`
- Network: `pharmacare-network`

**Backend Container:**
- Image: `pharmacare-backend`
- Container name: `pharmacare-backend`
- Ports: `5000:5000`
- Environment variables:
  - `MONGO_URI=mongodb://admin:pharmacare123@mongodb:27017/pharma_chatbot?authSource=admin`
  - `OLLAMA_HOST=http://ollama:11434`
  - `OLLAMA_MODEL=qwen2.5:0.5b`
- Network: `pharmacare-network`

**Frontend Container:**
- Image: `pharmacare-frontend`
- Container name: `pharmacare-frontend`
- Ports: `3000:3000`
- Environment variables:
  - `BACKEND_URL=http://backend:5000`
- Network: `pharmacare-network`

#### Step 7: Pull Ollama Model

1. Click on **pharmacare-ollama** container
2. Click **"Exec"** tab (terminal)
3. Run: `ollama pull qwen2.5:0.5b`

---

## 🌐 Accessing the Application

### URLs

| Service | URL | Purpose |
|---------|-----|---------|
| **Frontend** | http://localhost:3000 | Main web interface |
| **Backend API** | http://localhost:5000 | API endpoints |
| **Health Check** | http://localhost:5000/health | API status |
| **MongoDB** | localhost:27017 | Database |
| **Ollama** | http://localhost:11434 | AI service |

### Using the Application

1. **Open Browser:**
   - Go to: http://localhost:3000

2. **Login:**
   - Enter any email (e.g., `user@example.com`)
   - Enter any password
   - Click "Sign In"

3. **Start Chatting:**
   - Type your question in the input box
   - Try: "What is Aspirin used for?"
   - Try: "Are there any banned drugs?"
   - Try: "Tell me about drug interactions"

---

## 🔍 Using Docker Desktop GUI

### View Running Containers

1. Open Docker Desktop
2. Click **"Containers"** in sidebar
3. You should see 4 running containers

### View Logs

1. Click on any container
2. Click **"Logs"** tab
3. View real-time logs

### Stop/Start Containers

**Stop All:**
1. Click "Stop" button on container group
2. Or use terminal: `docker compose down`

**Start All:**
1. Click "Start" button
2. Or use terminal: `docker compose up`

### Restart a Single Container

1. Click on the container
2. Click "Restart" button
3. Or use terminal: `docker restart pharmacare-backend`

### View Container Details

1. Click on container
2. Tabs available:
   - **Logs**: View output
   - **Inspect**: See configuration
   - **Stats**: CPU, memory usage
   - **Exec**: Open terminal
   - **Files**: Browse filesystem

### Inspect Images

1. Click **"Images"** in sidebar
2. See all downloaded images
3. Click on image to see:
   - Size
   - Layers
   - History

### Manage Volumes

1. Click **"Volumes"** in sidebar
2. See data volumes:
   - `mongodb_data` (database files)
   - `ollama_data` (AI model files)
3. Can backup/remove volumes here

---

## 🔧 Managing the Application

### Stop Services

```bash
# Stop all containers (keeps data)
docker compose down

# Stop and remove data
docker compose down -v
```

### Start Services

```bash
# Start existing containers
docker compose up

# Rebuild and start
docker compose up --build
```

### View Logs

```bash
# All services
docker compose logs

# Specific service
docker compose logs backend
docker compose logs frontend

# Follow logs (real-time)
docker compose logs -f backend
```

### Execute Commands in Containers

```bash
# Open bash in backend
docker exec -it pharmacare-backend bash

# Check Python version
docker exec pharmacare-backend python --version

# List Ollama models
docker exec pharmacare-ollama ollama list
```

### Check Resource Usage

```bash
# See CPU, memory usage
docker stats

# In Docker Desktop: Click container → Stats tab
```

---

## 🐛 Troubleshooting

### Problem: Docker Desktop won't start

**Windows:**
```powershell
# Enable WSL 2
wsl --install
wsl --set-default-version 2

# Restart Docker Desktop
```

**Mac:**
```bash
# Reset Docker Desktop
# Applications → Docker → Troubleshoot → Reset to factory defaults
```

### Problem: "Cannot connect to Docker daemon"

**Solution:**
```bash
# Make sure Docker Desktop is running
# Check system tray (Windows) or menu bar (Mac)

# Restart Docker Desktop
```

### Problem: Port already in use

**Find what's using the port:**
```bash
# Windows
netstat -ano | findstr :3000
netstat -ano | findstr :5000

# Mac/Linux
lsof -i :3000
lsof -i :5000
```

**Solution:**
```bash
# Stop the service using the port
# Or change port in docker-compose.yml
# Change: "3000:3000" to "3001:3000"
```

### Problem: Ollama not responding

**Check Ollama is running:**
```bash
docker exec pharmacare-ollama ollama list
```

**Pull model again:**
```bash
docker exec -it pharmacare-ollama ollama pull qwen2.5:0.5b
```

### Problem: Backend can't connect to MongoDB

**Check MongoDB:**
```bash
docker exec pharmacare-mongodb mongosh --eval "db.adminCommand('ping')"
```

**Restart MongoDB:**
```bash
docker restart pharmacare-mongodb
docker restart pharmacare-backend
```

### Problem: "No space left on device"

**Clean up Docker:**
```bash
# Remove unused images
docker image prune -a

# Remove unused volumes
docker volume prune

# Remove everything (careful!)
docker system prune -a --volumes
```

### Problem: Slow performance

**Increase Docker resources:**

1. Open Docker Desktop
2. Click Settings (gear icon)
3. Resources → Advanced
4. Increase:
   - **CPUs:** 4+
   - **Memory:** 8 GB+
   - **Disk:** 60 GB+
5. Click "Apply & Restart"

### Problem: Container keeps restarting

**Check logs:**
```bash
docker logs pharmacare-backend --tail 100
```

**Common fixes:**
```bash
# Rebuild container
docker compose up --build backend

# Reset everything
docker compose down -v
docker compose up --build
```

### Problem: Can't access localhost:3000

**Check container is running:**
```bash
docker compose ps
```

**Check port mapping:**
```bash
docker port pharmacare-frontend
# Should show: 3000/tcp -> 0.0.0.0:3000
```

**Try:**
```bash
# Windows: http://localhost:3000
# Mac: http://localhost:3000
# Not working? Try: http://127.0.0.1:3000
```

---

## 📊 Monitoring

### Check Service Health

```bash
# All services
docker compose ps

# Backend health
curl http://localhost:5000/health

# Frontend health
curl http://localhost:3000/health
```

### Monitor Logs

```bash
# Real-time all services
docker compose logs -f

# Just backend
docker compose logs -f backend

# Last 100 lines
docker compose logs --tail 100
```

### Database Check

```bash
# Connect to MongoDB
docker exec -it pharmacare-mongodb mongosh \
  -u admin -p pharmacare123 \
  --authenticationDatabase admin

# Show databases
show dbs

# Use database
use pharma_chatbot

# Show collections
show collections

# Count drugs
db.drugs.countDocuments()

# Exit
exit
```

---

## 🎯 Quick Commands Reference

### Starting

```bash
# First time (builds everything)
docker compose up --build

# Pull AI model
docker exec -it pharmacare-ollama ollama pull qwen2.5:0.5b

# Subsequent times
docker compose up
```

### Stopping

```bash
# Stop containers (keep data)
docker compose down

# Stop and remove data
docker compose down -v
```

### Viewing

```bash
# See running containers
docker compose ps

# View logs
docker compose logs -f

# Check health
curl http://localhost:5000/health
```

### Cleaning

```bash
# Remove stopped containers
docker compose down

# Remove images
docker compose down --rmi all

# Clean everything
docker system prune -a --volumes
```

---

## 📦 What Gets Downloaded

| Item | Size | When |
|------|------|------|
| MongoDB Image | ~700 MB | First `docker compose up` |
| Ollama Image | ~1.5 GB | First `docker compose up` |
| Python Image | ~150 MB | First `docker compose up` |
| Qwen AI Model | ~400 MB | When you run `ollama pull` |
| **Total** | **~2.75 GB** | **One-time download** |

---

## ✅ Success Checklist

- [ ] Docker Desktop installed and running
- [ ] Project files created
- [ ] `docker compose up --build` completed successfully
- [ ] Ollama model pulled (`qwen2.5:0.5b`)
- [ ] All containers showing "healthy" status
- [ ] Frontend accessible at http://localhost:3000
- [ ] Backend API responding at http://localhost:5000/health
- [ ] Can login and send messages in chat

---

## 🎓 Next Steps

### Change AI Model

```bash
# Pull different model
docker exec -it pharmacare-ollama ollama pull llama2

# Update .env file
OLLAMA_MODEL=llama2

# Restart backend
docker compose restart backend
```

### View Database

```bash
# Install MongoDB Compass (optional)
# Download from: https://www.mongodb.com/products/compass

# Connection string:
mongodb://admin:pharmacare123@localhost:27017/?authSource=admin
```

### Backup Data

```bash
# Backup volumes
docker run --rm -v mongodb_data:/data -v $(pwd):/backup \
  alpine tar czf /backup/mongodb_backup.tar.gz /data
```

---

## 🆘 Getting Help

If you're still stuck:

1. **Check Docker Desktop logs**
2. **Check container logs**: `docker compose logs -f`
3. **Verify all services**: `docker compose ps`
4. **Try rebuilding**: `docker compose up --build`
5. **Reset everything**: `docker compose down -v && docker compose up --build`

---

## 🎉 Summary

You now have a complete Python-only pharmaceutical chatbot running in Docker with:

- ✅ Python Flask backend (API)
- ✅ Python Flask frontend (web interface)
- ✅ MongoDB database
- ✅ Ollama AI (Qwen 0.5B model)
- ✅ All running in isolated Docker containers
- ✅ No Node.js or React required!

**Access your app at:** http://localhost:3000

Enjoy! 🏥💊
