#!/bin/bash

# HealthX Git Deployment Script
# This script automates pulling the latest code and restarting the production containers.

set -e

echo "🚀 Starting HealthX Deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest code from Git..."
git pull origin main

# 2. Rebuild and restart containers
echo "🏗️ Rebuilding production containers..."
docker compose -f docker-compose.prod.yml up -d --build

# 3. Clean up unused images to save space
echo "🧹 Cleaning up old images..."
docker image prune -f

echo "✅ Deployment successful! Your app is now up-to-date."
