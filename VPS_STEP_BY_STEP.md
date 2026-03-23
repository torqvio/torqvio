# VPS Deployment Step-by-Step Guide

## Server Info
- **Domain**: torqvio.com
- **Access**: Use SSH keys (configured in GitHub secrets)
- **Project**: https://github.com/torqvio/torqvio.git

## Pre-Deployment Checklist

### 1. Connect to VPS
```bash
# Use your SSH key or credentials (stored in GitHub secrets)
ssh user@your-vps-domain
```

### 2. Verify Server Requirements
```bash
# Check OS version
cat /etc/os-release

# Check available memory
free -h

# Check disk space
df -h

# Check CPU cores
nproc
```

## Step 1: Initial Server Setup

### Update System Packages
```bash
apt-get update -y && apt-get upgrade -y
```

### Install Required Dependencies
```bash
apt-get install -y curl git nginx certbot python3-certbot-nginx ufw htop
```

### Install Docker
```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
```

### Install Docker Compose
```bash
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

## Step 2: Setup Project Directory

### Create Directory Structure
```bash
mkdir -p /var/www/torqvio/{nginx,logs,ssl}
cd /var/www/torqvio
```

### Clone Repository
```bash
git clone https://github.com/torqvio/torqvio.git .
```

### Copy Configuration Files
```bash
cp docker/docker-compose.landing-only.yml docker-compose.yml
cp docker/nginx/nginx-landing.conf nginx/default.conf
cp docker/.env.production .env
```

### Create Certbot Directory
```bash
mkdir -p /var/www/certbot
```

## Step 3: Configure Nginx

### Setup Nginx Configuration
```bash
ln -sf /var/www/torqvio/nginx/default.conf /etc/nginx/conf.d/default.conf
rm -f /etc/nginx/sites-enabled/default
```

### Test Nginx Configuration
```bash
nginx -t
```

### Start Nginx
```bash
systemctl enable nginx
systemctl start nginx
```

## Step 4: Configure Firewall

### Setup UFW Firewall
```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable
```

### Check Firewall Status
```bash
ufw status
```

## Step 5: Docker Deployment

### Start Containers
```bash
cd /var/www/torqvio
docker-compose up -d
```

### Check Container Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f landingpage
docker-compose logs -f nginx
```

## Step 6: SSL Certificate Setup

### Wait for Containers to Start
```bash
sleep 10
```

### Obtain SSL Certificate
```bash
certbot certonly --webroot --webroot-path=/var/www/certbot --email admin@torqvio.com --agree-tos --no-eff-email -d torqvio.com -d www.torqvio.com
```

### Setup Auto-Renewal
```bash
echo "0 12 * * * /usr/bin/certbot renew --quiet" | crontab -
```

### Restart Nginx with SSL
```bash
docker-compose restart nginx
```

## Step 7: Verify Deployment

### Check Website
```bash
curl -I https://torqvio.com
```

### Check SSL Certificate
```bash
openssl s_client -connect torqvio.com:443 -servername torqvio.com
```

### Check Container Health
```bash
docker-compose ps
docker-compose logs landingpage
```

## Step 8: Setup Monitoring

### Create Log Rotation
```bash
cat > /etc/logrotate.d/torqvio << EOF
/var/www/torqvio/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    sharedscripts
    postrotate
        docker-compose -f /var/www/torqvio/docker-compose.yml restart nginx
    endscript
}
EOF
```

### Setup Basic Monitoring Script
```bash
cat > /usr/local/bin/check-torqvio.sh << 'EOF'
#!/bin/bash
cd /var/www/torqvio
if ! docker-compose ps | grep -q "Up"; then
    echo "Torqvio containers are down! Restarting..." | mail -s "Torqvio Alert" admin@torqvio.com
    docker-compose restart
fi
EOF

chmod +x /usr/local/bin/check-torqvio.sh
echo "*/5 * * * * /usr/local/bin/check-torqvio.sh" | crontab -
```

## Ongoing Maintenance Commands

### Update Landing Page
```bash
cd /var/www/torqvio
git pull origin main
docker-compose build landingpage
docker-compose restart landingpage
docker image prune -f
```

### View Logs
```bash
# All logs
docker-compose logs -f

# Specific service logs
docker-compose logs -f landingpage
docker-compose logs -f nginx

# Last 100 lines
docker-compose logs --tail=100 landingpage
```

### Container Management
```bash
# Restart specific container
docker-compose restart landingpage

# Rebuild container
docker-compose build landingpage
docker-compose up -d landingpage

# Stop all containers
docker-compose down

# Start all containers
docker-compose up -d
```

### SSL Certificate Management
```bash
# Check certificate expiry
certbot certificates

# Manually renew
certbot renew

# Test renewal
certbot renew --dry-run
```

### System Monitoring
```bash
# System resources
htop
df -h
free -h

# Docker resources
docker stats

# Disk usage by containers
docker system df
```

## Troubleshooting

### If Website Not Accessible
```bash
# Check Nginx status
systemctl status nginx

# Check Docker containers
docker-compose ps

# Check ports
netstat -tlnp | grep :80
netstat -tlnp | grep :443
```

### If SSL Certificate Issues
```bash
# Check certificate files
ls -la /etc/letsencrypt/live/torqvio.com/

# Test nginx config
nginx -t

# Check certbot logs
journalctl -u certbot
```

### If Container Won't Start
```bash
# Check logs for errors
docker-compose logs landingpage

# Check disk space
df -h

# Rebuild from scratch
docker-compose down
docker-compose build --no-cache landingpage
docker-compose up -d
```

## Security Hardening (Optional)

### Fail2ban Setup
```bash
apt-get install fail2ban
cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
systemctl enable fail2ban
systemctl start fail2ban
```

### SSH Security
```bash
# Edit SSH config
nano /etc/ssh/sshd_config

# Add/Update these lines:
# PermitRootLogin no
# PasswordAuthentication no
# PubkeyAuthentication yes

# Restart SSH
systemctl restart ssh
```

## Final Verification Checklist

- [ ] Website loads at https://torqvio.com
- [ ] SSL certificate is valid
- [ ] All containers are running
- [ ] Firewall is configured
- [ ] Auto-renewal is set up
- [ ] Monitoring is active
- [ ] Logs are rotating properly

## Emergency Contacts & Recovery

### Quick Restart Commands
```bash
cd /var/www/torqvio
docker-compose restart
```

### Full Redeployment (if needed)
```bash
cd /var/www/torqvio
docker-compose down
git pull origin main
docker-compose build --no-cache
docker-compose up -d
```

### Backup Current Setup
```bash
# Export current configuration
docker-compose config > docker-compose-backup.yml

# Backup SSL certificates
tar -czf ssl-backup.tar.gz /etc/letsencrypt/
```

---

**Ready to execute!** Run these commands in order on your VPS at `root@72.61.89.88`
