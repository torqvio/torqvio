# VPS Docker Deployment Guide for Torqvio

## Overview
This guide outlines the complete process for deploying Torqvio services using Docker containers on your VPS.

## Prerequisites

### Server Requirements
- **VPS**: Ubuntu 20.04+ or CentOS 8+
- **RAM**: Minimum 4GB, Recommended 8GB+
- **Storage**: Minimum 50GB SSD
- **CPU**: Minimum 2 cores
- **Network**: Static IP address

### Software Requirements
- Docker Engine 20.10+
- Docker Compose 2.0+
- Git
- Nginx (for reverse proxy)
- SSL certificates (Let's Encrypt recommended)

## Information Needed From You

### 1. VPS Details
- [ ] VPS Provider (DigitalOcean, AWS, Linode, etc.)
- [ ] Server IP Address
- [ ] SSH Key Location
- [ ] Root/Sudo User Credentials

### 2. Domain Configuration
- [ ] Domain Name (e.g., torqvio.com)
- [ ] Subdomains planned:
  - [ ] app.torqvio.com (frontend)
  - [ ] api.torqvio.com (backend)
  - [ ] www.torqvio.com (landing page)

### 3. Environment Variables
- [ ] Database credentials
- [ ] JWT secret keys
- [ ] API keys for external services
- [ ] Email configuration (if needed)

### 4. SSL/Security
- [ ] SSL certificate preference (Let's Encrypt vs custom)
- [ ] Firewall configuration preferences
- [ ] Backup strategy requirements

## Deployment Architecture

### Container Stack
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Nginx Proxy   │────│  Landing Page   │    │   Frontend      │
│   (Port 80/443) │    │   (Port 3000)   │    │   (Port 7243)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   PostgreSQL    │────│     Redis       │────│     Backend     │
│   (Port 5432)   │    │   (Port 6379)   │    │   (Port 8459)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Implementation Steps

### Phase 1: Server Setup
1. **Initial Server Configuration**
   - Update system packages
   - Install Docker and Docker Compose
   - Configure firewall
   - Set up user accounts
   - Configure SSH security

2. **Directory Structure Setup**
   ```bash
   /var/www/torqvio/
   ├── docker-compose.prod.yml
   ├── nginx/
   │   └── nginx.conf
   ├── ssl/
   ├── backups/
   └── logs/
   ```

### Phase 2: Docker Configuration
1. **Production Docker Compose**
   - Modify docker-compose.yml for production
   - Add environment-specific configurations
   - Configure health checks
   - Set up volume mounts for persistence

2. **Network Configuration**
   - Create Docker networks
   - Configure container communication
   - Set up port mappings

### Phase 3: SSL & Security
1. **SSL Certificate Setup**
   - Install Let's Encrypt Certbot
   - Configure automatic renewal
   - Set up HTTPS redirects

2. **Security Hardening**
   - Configure fail2ban
   - Set up intrusion detection
   - Configure log monitoring

### Phase 4: CI/CD Integration
1. **GitHub Actions Updates**
   - Modify workflows for Docker deployment
   - Add SSH keys to GitHub secrets
   - Configure deployment triggers

2. **Automated Deployment**
   - Set up rolling updates
   - Configure health checks
   - Implement rollback strategies

### Phase 5: Monitoring & Maintenance
1. **Monitoring Setup**
   - Install monitoring tools
   - Configure alerting
   - Set up log aggregation

2. **Backup Strategy**
   - Database backups
   - File system backups
   - Disaster recovery plan

## Required Files to Create

### 1. Production Docker Compose
- `docker-compose.prod.yml`
- Environment configuration files
- Nginx configuration

### 2. Deployment Scripts
- `deploy.sh` - Main deployment script
- `backup.sh` - Backup automation
- `update.sh` - Rolling update script

### 3. Monitoring Configuration
- Docker health checks
- Nginx status monitoring
- Database monitoring

## Security Considerations

### Network Security
- [ ] Firewall rules configuration
- [ ] VPN access for admin
- [ ] DDOS protection
- [ ] Rate limiting

### Application Security
- [ ] Environment variable encryption
- [ ] Database encryption
- [ ] API authentication
- [ ] CORS configuration

### Container Security
- [ ] Non-root user execution
- [ ] Resource limits
- [ ] Security scanning
- [ ] Image vulnerability scanning

## Cost Estimation

### VPS Monthly Costs (Approximate)
- **Basic Setup**: $20-40/month
- **Production Setup**: $50-100/month
- **High Availability**: $100-200/month

### Additional Costs
- Domain: $10-15/year
- SSL Certificate: Free (Let's Encrypt)
- Monitoring: $0-50/month
- Backup Storage: $5-20/month

## Timeline Estimation

### Phase 1: Server Setup (1-2 days)
- Initial configuration
- Docker installation
- Basic security setup

### Phase 2: Docker Deployment (2-3 days)
- Container configuration
- Network setup
- Testing

### Phase 3: SSL & Security (1-2 days)
- Certificate setup
- Security hardening

### Phase 4: CI/CD Integration (2-3 days)
- Workflow updates
- Testing automation

### Phase 5: Monitoring (1-2 days)
- Setup monitoring
- Configure alerts

**Total Estimated Time: 7-12 days**

## Next Steps

1. **Provide the required information** listed in the "Information Needed" section
2. **Choose your VPS provider** and server specifications
3. **Decide on domain strategy** and SSL approach
4. **Review security requirements** and compliance needs

Once you provide the required information, I can:
- Create the specific configuration files
- Generate the deployment scripts
- Update the GitHub Actions workflows
- Provide detailed commands for each step

## Support & Maintenance

### Ongoing Tasks
- Regular security updates
- Performance monitoring
- Backup verification
- Log analysis
- Scaling planning

### Emergency Procedures
- Container restart procedures
- Database recovery
- SSL certificate renewal
- Security incident response

---

**Ready to proceed?** Please provide the information requested in the "Information Needed" section, and we'll start with Phase 1 immediately.
