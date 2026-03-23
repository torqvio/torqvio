#!/bin/bash
# Update landing page from GitHub
# Usage: bash update-landing.sh

set -e

APP_DIR="/var/www/torqvio"
REPO_URL="https://github.com/torqvio/torqvio.git"

echo "==> Changing to app directory"
cd "$APP_DIR"

echo "==> Pulling latest changes"
git pull origin main

echo "==> Rebuilding landing page container"
docker-compose build landingpage

echo "==> Restarting landing page"
docker-compose restart landingpage

echo "==> Cleaning up old images"
docker image prune -f

echo ""
echo "✅ Landing page updated successfully!"
echo "🌐 https://torqvio.com"
echo ""
echo "Current status:"
docker-compose ps
