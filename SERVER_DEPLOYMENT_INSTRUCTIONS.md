# Server-Side Deployment Instructions for Torqvio Landing Page

This guide provides complete server-side instructions for deploying the AetherFlow landing page to torqvio.com after your first successful GitHub push.

## Prerequisites

- Ubuntu/Debian-based VPS or dedicated server
- SSH access to your server
- Domain name: `torqvio.com` pointing to your server IP
- GitHub repository with your landing page code

## Step 1: Server Setup

### 1.1 Update System Packages
```bash
sudo apt update && sudo apt upgrade -y
```

### 1.2 Install Required Dependencies
```bash
# Install Node.js (latest LTS)
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Nginx
sudo apt install nginx -y

# Install Docker and Docker Compose
sudo apt install docker.io docker-compose -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y

# Install Git
sudo apt install git -y
```

### 1.3 Configure Firewall
```bash
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Step 2: Domain Configuration

### 2.1 DNS Settings
Ensure your domain registrar has these DNS records:
```
A Record: torqvio.com -> YOUR_SERVER_IP
A Record: www.torqvio.com -> YOUR_SERVER_IP
```

### 2.2 Verify Domain Propagation
```bash
# Check if domain points to your server
nslookup torqvio.com
ping torqvio.com
```

## Step 3: GitHub Repository Setup

### 3.1 Clone Your Repository
```bash
# Create deployment directory
sudo mkdir -p /var/www/torqvio
cd /var/www/torqvio

# Clone your repository (replace with your actual repo URL)
git clone https://github.com/yourusername/AetherFlow.git .
```

### 3.2 Setup Deployment Script
Create `/var/www/torqvio/deploy.sh`:
```bash
#!/bin/bash

# Navigate to project directory
cd /var/www/torqvio/landinpage

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Build the project
npm run build

# Restart the application
docker-compose down
docker-compose up -d --build

echo "Deployment completed at $(date)"
```

Make it executable:
```bash
sudo chmod +x /var/www/torqvio/deploy.sh
```

## Step 4: Docker Configuration

### 4.1 Create Docker Compose File
Create `/var/www/torqvio/docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  landing-page:
    build:
      context: ./landinpage
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    networks:
      - torqvio-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx-with-landingpage.conf:/etc/nginx/nginx.conf
      - /etc/letsencrypt:/etc/letsencrypt
      - /var/www/certbot:/var/www/certbot
    depends_on:
      - landing-page
    restart: unless-stopped
    networks:
      - torqvio-network

networks:
  torqvio-network:
    driver: bridge
```

### 4.2 Verify Dockerfile
Ensure your `landinpage/Dockerfile` exists and is properly configured for production.

## Step 5: Nginx Configuration

### 5.1 Create Nginx Config
Create `/var/www/torqvio/nginx/nginx-with-landingpage.conf`:
```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

    # HTTP redirect to HTTPS
    server {
        listen 80;
        server_name torqvio.com www.torqvio.com;
        
        # Let's Encrypt challenge
        location /.well-known/acme-challenge/ {
            root /var/www/certbot;
        }
        
        location / {
            return 301 https://$server_name$request_uri;
        }
    }

    # HTTPS server
    server {
        listen 443 ssl http2;
        server_name torqvio.com www.torqvio.com;

        # SSL certificates
        ssl_certificate /etc/letsencrypt/live/torqvio.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/torqvio.com/privkey.pem;
        
        # SSL configuration
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
        ssl_prefer_server_ciphers off;
        ssl_session_cache shared:SSL:10m;
        ssl_session_timeout 10m;

        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Proxy to landing page
        location / {
            proxy_pass http://landing-page:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            
            # Rate limiting
            limit_req zone=api burst=20 nodelay;
        }

        # Health check endpoint
        location /health {
            access_log off;
            return 200 "healthy\n";
            add_header Content-Type text/plain;
        }
    }
}
```

## Step 6: SSL Certificate Setup

### 6.1 Obtain SSL Certificate
```bash
# Stop nginx to free up port 80
sudo systemctl stop nginx

# Get SSL certificate
sudo certbot certonly --standalone -d torqvio.com -d www.torqvio.com

# Start nginx
sudo systemctl start nginx
```

### 6.2 Setup Auto-Renewal
```bash
# Add cron job for auto-renewal
sudo crontab -e
```

Add this line:
```
0 12 * * * /usr/bin/certbot renew --quiet && docker-compose -f /var/www/torqvio/docker-compose.prod.yml restart nginx
```

## Step 7: Initial Deployment

### 7.1 Build and Start Services
```bash
cd /var/www/torqvio

# Build and start with Docker Compose
sudo docker-compose -f docker-compose.prod.yml up -d --build

# Check logs
sudo docker-compose -f docker-compose.prod.yml logs -f
```

### 7.2 Verify Deployment
```bash
# Check if services are running
sudo docker-compose -f docker-compose.prod.yml ps

# Test the application locally
curl -I http://localhost:3000

# Test SSL
curl -I https://torqvio.com
```

## Step 8: Automated Deployment Setup

### 8.1 Setup GitHub Webhook (Optional)
For automated deployment on push:

1. Go to your GitHub repository Settings > Webhooks
2. Add webhook URL: `https://torqvio.com/webhook/deploy`
3. Set content type to `application/json`
4. Select "Just the `push` event"

### 8.2 Create Webhook Handler
Create `/var/www/torqvio/webhook-server.js`:
```javascript
const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
const PORT = 3001;

// GitHub webhook secret (set this in GitHub webhook settings)
const WEBHOOK_SECRET = 'your-webhook-secret';

app.use(express.json());

app.post('/webhook/deploy', (req, res) => {
    const signature = req.headers['x-hub-signature-256'];
    const hash = crypto.createHmac('sha256', WEBHOOK_SECRET)
                       .update(JSON.stringify(req.body))
                       .digest('hex');
    
    if (`sha256=${hash}` !== signature) {
        return res.status(401).send('Unauthorized');
    }

    if (req.body.ref === 'refs/heads/main') {
        exec('/var/www/torqvio/deploy.sh', (error, stdout, stderr) => {
            if (error) {
                console.error(`Deployment error: ${error}`);
                return res.status(500).send('Deployment failed');
            }
            console.log(`Deployment output: ${stdout}`);
            res.status(200).send('Deployment successful');
        });
    } else {
        res.status(200).send('Not a main branch push');
    }
});

app.listen(PORT, () => {
    console.log(`Webhook server running on port ${PORT}`);
});
```

### 8.3 Add Webhook Server to Docker Compose
Update your `docker-compose.prod.yml` to include the webhook service.

## Step 9: Monitoring and Maintenance

### 9.1 Setup Log Rotation
```bash
# Create logrotate config
sudo nano /etc/logrotate.d/torqvio
```

Add:
```
/var/www/torqvio/logs/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
}
```

### 9.2 Setup Monitoring Script
Create `/var/www/torqvio/monitor.sh`:
```bash
#!/bin/bash

# Check if services are running
if ! docker-compose -f docker-compose.prod.yml ps | grep -q "Up"; then
    echo "Some services are down. Restarting..."
    docker-compose -f docker-compose.prod.yml restart
    
    # Send alert (optional)
    # curl -X POST "your-webhook-url" -d "Services restarted on $(date)"
fi

# Check disk space
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "Disk usage is ${DISK_USAGE}%. Consider cleanup."
fi
```

Add to crontab:
```bash
# Run monitoring every 5 minutes
*/5 * * * * /var/www/torqvio/monitor.sh
```

## Step 10: Backup Strategy

### 10.1 Setup Backup Script
Create `/var/www/torqvio/backup.sh`:
```bash
#!/bin/bash

BACKUP_DIR="/var/backups/torqvio"
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application files
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/torqvio

# Backup SSL certificates
tar -czf $BACKUP_DIR/ssl_$DATE.tar.gz /etc/letsencrypt

# Keep only last 7 days of backups
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

Add to crontab for daily backups:
```bash
0 2 * * * /var/www/torqvio/backup.sh
```

## Troubleshooting

### Common Issues and Solutions

1. **Port 80/443 already in use**
   ```bash
   sudo sudo netstat -tulpn | grep :80
   sudo systemctl stop apache2  # or other conflicting service
   ```

2. **Docker build fails**
   ```bash
   # Clean Docker cache
   docker system prune -a
   docker-compose down
   docker-compose up -d --build
   ```

3. **SSL certificate issues**
   ```bash
   # Check certificate status
   sudo certbot certificates
   
   # Renew manually
   sudo certbot renew
   ```

4. **Application not accessible**
   ```bash
   # Check logs
   docker-compose logs landing-page
   docker-compose logs nginx
   
   # Restart services
   docker-compose restart
   ```

## Final Verification

After completing all steps:

1. **Visit your domain**: `https://torqvio.com`
2. **Check SSL certificate**: Click the padlock icon in browser
3. **Test all pages**: Home, Terms, Privacy
4. **Verify SEO**: Check robots.txt and sitemap.xml
5. **Performance test**: Use Google PageSpeed Insights

## Security Recommendations

1. **Regular updates**: Keep system and Docker images updated
2. **Fail2Ban**: Install and configure to prevent brute force attacks
3. **Regular backups**: Ensure backup strategy is working
4. **Monitor logs**: Check for suspicious activity regularly
5. **Limit SSH access**: Use key-based authentication only

## Support Commands

Keep these commands handy for maintenance:

```bash
# View logs
sudo docker-compose -f /var/www/torqvio/docker-compose.prod.yml logs -f

# Restart services
sudo docker-compose -f /var/www/torqvio/docker-compose.prod.yml restart

# Update application
cd /var/www/torqvio && ./deploy.sh

# Check SSL status
sudo certbot certificates

# View system resources
htop
df -h
free -h
```

Your landing page should now be fully operational at `https://torqvio.com` with automated deployment, SSL security, and monitoring in place!
