#!/bin/bash
# Deploy landing page only to torqvio.com
# Usage: bash deploy-landing-only.sh

set -e

DOMAIN="torqvio.com"
APP_DIR="/var/www/torqvio"
REPO_URL="https://github.com/torqvio/torqvio.git"

echo "==> Updating system"
apt-get update -y && apt-get upgrade -y

echo "==> Installing dependencies"
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw

echo "==> Installing Docker"
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

echo "==> Installing Docker Compose"
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "==> Creating app directory"
mkdir -p "$APP_DIR"/{nginx,logs,ssl}
cd "$APP_DIR"

echo "==> Cloning repository"
git clone "$REPO_URL" .

echo "==> Copying configuration files"
cp docker/docker-compose.landing-only.yml "$APP_DIR/docker-compose.yml"
cp docker/nginx/nginx-landing.conf "$APP_DIR/nginx/default.conf"
cp docker/.env.production "$APP_DIR/.env"

echo "==> Creating certbot directory"
mkdir -p /var/www/certbot

echo "==> Setting up Nginx"
ln -sf "$APP_DIR/nginx/default.conf" /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/sites-enabled/default

echo "==> Testing Nginx config"
nginx -t

echo "==> Configuring firewall"
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "==> Starting containers"
cd "$APP_DIR"
docker-compose up -d

echo "==> Waiting for containers to start"
sleep 10

echo "==> Obtaining SSL certificate"
certbot certonly --webroot --webroot-path=/var/www/certbot --email admin@torqvio.com --agree-tos --no-eff-email -d torqvio.com -d www.torqvio.com

echo "==> Setting up SSL renewal"
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -

echo "==> Restarting Nginx with SSL"
docker-compose restart nginx

echo ""
echo "✅ Landing page deployed successfully!"
echo "🌐 https://torqvio.com"
echo ""
echo "Useful commands:"
echo "  cd $APP_DIR && docker-compose ps"
echo "  cd $APP_DIR && docker-compose logs -f landingpage"
echo "  cd $APP_DIR && docker-compose logs -f nginx"
echo "  docker-compose restart landingpage"
echo ""
