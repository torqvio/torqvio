#!/bin/bash
# Run this ONCE on a fresh VPS to set everything up.
# Usage: bash setup-vps.sh

set -e

DOMAIN="YOUR_DOMAIN.com"
APP_DIR="/var/www/torqvio"
BACKEND_REPO="git@github.com:YOUR_ORG/torqvio-backend.git"
FRONTEND_REPO="git@github.com:YOUR_ORG/torqvio-frontend.git"

echo "==> Updating system"
apt-get update -y && apt-get upgrade -y

echo "==> Installing dependencies"
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw logrotate

echo "==> Installing Docker"
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

echo "==> Creating app directory"
mkdir -p "$APP_DIR"/{nginx,logs}
cd "$APP_DIR"

echo "==> Cloning repositories"
git clone "$BACKEND_REPO" backend
git clone "$FRONTEND_REPO" frontend

echo "==> Copying docker-compose and nginx config from backend repo"
cp backend/docker/docker-compose.prod.yml "$APP_DIR/docker-compose.prod.yml"
cp backend/nginx/nginx.conf "$APP_DIR/nginx/nginx.conf"

echo "==> Creating .env — FILL THIS IN before starting containers"
cp backend/.env.production.example "$APP_DIR/.env"
echo ""
echo "  !! Edit $APP_DIR/.env with your real secrets before continuing !!"
echo ""
read -rp "Press Enter once .env is filled in..."

echo "==> Setting up Nginx"
sed -i "s/YOUR_DOMAIN.com/$DOMAIN/g" "$APP_DIR/nginx/nginx.conf"
ln -sf "$APP_DIR/nginx/nginx.conf" /etc/nginx/sites-enabled/torqvio
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> Obtaining TLS certificate"
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "admin@$DOMAIN"

echo "==> Setting up log rotation"
cat > /etc/logrotate.d/torqvio << EOF
/var/log/nginx/torqvio_*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        nginx -s reopen
    endscript
}
EOF

echo "==> Configuring firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Starting all containers"
cd "$APP_DIR"
docker compose -f docker-compose.prod.yml up -d

echo "==> Running database migrations"
docker compose -f docker-compose.prod.yml exec -T backend npm run db:migrate

echo ""
echo "Done. Torqvio is running at https://$DOMAIN"
echo ""
echo "Useful commands:"
echo "  docker compose -f $APP_DIR/docker-compose.prod.yml ps"
echo "  docker compose -f $APP_DIR/docker-compose.prod.yml logs -f backend"
echo "  docker compose -f $APP_DIR/docker-compose.prod.yml logs -f frontend"
