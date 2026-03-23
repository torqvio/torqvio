'use client'

import { motion } from 'framer-motion'
import { Shield, Lock, Wifi, WifiOff, Globe, AlertTriangle, CheckCircle, Eye, EyeOff, Key, RefreshCw, Settings, Database, Users, Terminal, Code } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# Network Security

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
Network security is crucial for protecting Torqvio deployments from unauthorized access, data breaches, and cyber threats. This guide covers network security best practices, firewall configuration, SSL/TLS setup, and monitoring.

## SSL/TLS Configuration

### Enable HTTPS
\`\`\`bash
# Generate SSL certificate
torqvio ssl generate --domain api.torqvio.com

# Install SSL certificate
torqvio ssl install --certificate cert.pem --key key.pem

# Enable HTTPS
torqvio config set ssl.enabled true
torqvio config set ssl.port 443
\`\`\`

### SSL Configuration
\`\`\`yaml
# SSL/TLS Settings
ssl:
  enabled: true
  port: 443
  min_version: TLSv1.2
  
  certificates:
    certificate: /etc/ssl/certs/torqvio.crt
    private_key: /etc/ssl/private/torqvio.key
    chain: /etc/ssl/certs/chain.crt
    
  ciphers:
    - ECDHE-RSA-AES256-GCM-SHA384
    - ECDHE-RSA-AES128-GCM-SHA256
    - ECDHE-RSA-CHACHA20-POLY1305
    
  protocols:
    - TLSv1.3
    - TLSv1.2
    
  hsts:
    enabled: true
    max_age: 31536000
    include_subdomains: true
    preload: true
\`\`\`

### Certificate Management
\`\`\`bash
# Check certificate validity
torqvio ssl check --domain api.torqvio.com

# Renew certificate
torqvio ssl renew --domain api.torqvio.com

# List certificates
torqvio ssl list

# Remove certificate
torqvio ssl remove --domain api.torqvio.com
\`\`\`

## Firewall Configuration

### Basic Firewall Rules
\`\`\`bash
# Allow HTTP/HTTPS traffic
torqvio firewall allow --port 80 --protocol tcp
torqvio firewall allow --port 443 --protocol tcp

# Allow SSH access
torqvio firewall allow --port 22 --protocol tcp --source 192.168.1.0/24

# Deny all other traffic
torqvio firewall deny --all

# Show firewall rules
torqvio firewall list
\`\`\`

### Advanced Firewall Rules
\`\`\`yaml
# Firewall Configuration
firewall:
  default_policy: deny
  
  rules:
    - name: "Allow HTTPS"
      port: 443
      protocol: tcp
      action: allow
      
    - name: "Allow HTTP"
      port: 80
      protocol: tcp
      action: allow
      redirect_to: 443
      
    - name: "Allow SSH from Office"
      port: 22
      protocol: tcp
      source: 192.168.1.0/24
      action: allow
      
    - name: "Allow API from Partners"
      port: 8459
      protocol: tcp
      source: 203.0.113.0/24
      action: allow
      
    - name: "Rate Limit API"
      port: 8459
      protocol: tcp
      rate_limit: 100/minute
      action: allow
\`\`\`

### IP Whitelisting
\`\`\`bash
# Add IP to whitelist
torqvio firewall whitelist add --ip 192.168.1.100

# Add IP range to whitelist
torqvio firewall whitelist add --range 192.168.1.0/24

# Remove from whitelist
torqvio firewall whitelist remove --ip 192.168.1.100

# Show whitelist
torqvio firewall whitelist list
\`\`\`

## Network Segmentation

### VPC Configuration
\`\`\`yaml
# VPC Setup
vpc:
  cidr: 10.0.0.0/16
  
  subnets:
    public:
      cidr: 10.0.1.0/24
      gateway: 10.0.1.1
      routes:
        - destination: 0.0.0.0/0
          gateway: internet
          
    private:
      cidr: 10.0.2.0/24
      gateway: 10.0.2.1
      routes:
        - destination: 10.0.1.0/24
          gateway: nat
          
    database:
      cidr: 10.0.3.0/24
      gateway: 10.0.3.1
      isolated: true
      
  security_groups:
    web:
      inbound:
        - port: 80
          protocol: tcp
          source: 0.0.0.0/0
        - port: 443
          protocol: tcp
          source: 0.0.0.0/0
          
    app:
      inbound:
        - port: 8459
          protocol: tcp
          source: web
      outbound:
        - port: 5432
          protocol: tcp
          destination: database
          
    database:
      inbound:
        - port: 5432
          protocol: tcp
          source: app
\`\`\`

### Docker Network Security
\`\`\`bash
# Create isolated network
docker network create --driver bridge torqvio-internal

# Run services in isolated network
docker run -d --network torqvio-internal torqvio/api

# Expose only necessary ports
docker run -d -p 443:443 --network torqvio-internal torqvio/web

# Network policies
kubectl apply -f network-policy.yaml
\`\`\`

## DDoS Protection

### Rate Limiting
\`\`\`yaml
# Rate Limiting Configuration
rate_limiting:
  enabled: true
  
  global_limits:
    requests_per_second: 1000
    burst: 2000
    
  ip_limits:
    requests_per_second: 10
    burst: 20
    
  endpoint_limits:
    /api/v1/workflows:
      requests_per_second: 100
      burst: 200
      
    /api/v1/executions:
      requests_per_second: 50
      burst: 100
      
  whitelist:
    - 192.168.1.0/24
    - 203.0.113.0/24
\`\`\`

### DDoS Mitigation
\`\`\`bash
# Enable DDoS protection
torqvio security ddos enable

# Configure protection levels
torqvio security ddos configure --level high

# Add trusted IPs
torqvio security ddos trust --ip 192.168.1.100

# Monitor DDoS status
torqvio security ddos status
\`\`\`

## Intrusion Detection

### Security Monitoring
\`\`\`yaml
# Security Monitoring
monitoring:
  enabled: true
  
  alerts:
    failed_login_threshold: 5
    unusual_traffic_threshold: 2x
    port_scan_threshold: 100
    
  notifications:
    email: security@company.com
    slack: "#security-alerts"
    webhook: https://alerts.company.com/webhook
    
  logging:
    level: info
    retention: 90d
    export: true
\`\`\`

### Intrusion Detection Rules
\`\`\`bash
# Enable intrusion detection
torqvio security ids enable

# Add custom rules
torqvio security ids rule add --name "Port Scan Detection" \\
  --condition "tcp_syn_rate > 100" --action alert

# Add IP blocking rule
torqvio security ids rule add --name "Block Suspicious IP" \\
  --condition "failed_logins > 10" --action block

# Show detected threats
torqvio security ids threats
\`\`\`

## VPN and Remote Access

### VPN Configuration
\`\`\`bash
# Set up VPN server
torqvio vpn setup --protocol wireguard

# Create VPN user
torqvio vpn user create --username developer --role engineer

# Generate VPN config
torqvio vpn config generate --username developer --file developer.conf

# Show VPN status
torqvio vpn status
\`\`\`

### Remote Access Security
\`\`\`yaml
# Remote Access Settings
remote_access:
  vpn:
    enabled: true
    protocol: wireguard
    port: 51820
    
  ssh:
    enabled: true
    port: 22
    key_based_auth: true
    password_auth: false
    
    allowed_users:
      - admin
      - developer
      
    source_restrictions:
      - 192.168.1.0/24
      - vpn
      
  bastion_host:
    enabled: true
    instance: bastion.torqvio.com
    required: true
\`\`\`

## Network Monitoring

### Traffic Monitoring
\`\`\`bash
# Monitor network traffic
torqvio monitor traffic --real-time

# Show bandwidth usage
torqvio monitor bandwidth

# Monitor connections
torqvio monitor connections --state established

# Export network metrics
torqvio monitor export --format prometheus --file metrics.txt
\`\`\`

### Security Events
\`\`\`bash
# Show security events
torqvio security events

# Filter by type
torqvio security events --type intrusion
torqvio security events --type ddos
torqvio security events --type failed_auth

# Show recent events
torqvio security events --last 1h

# Export security logs
torqvio security export --from "2024-01-01" --to "2024-01-31" --file security.json
\`\`\`

## Compliance and Auditing

### Security Compliance
\`\`\`bash
# Run security audit
torqvio security audit

# Check compliance
torqvio security compliance --standard SOC2
torqvio security compliance --standard GDPR
torqvio security compliance --standard HIPAA

# Generate compliance report
torqvio security report --format pdf --file compliance-report.pdf
\`\`\`

### Security Scanning
\`\`\`bash
# Run vulnerability scan
torqvio security scan --type vulnerability

# Run port scan
torqvio security scan --type port

# Run SSL scan
torqvio security scan --type ssl

# Schedule regular scans
torqvio security schedule --type vulnerability --cron "0 2 * * *"
\`\`\`

## Best Practices

### Network Security Checklist
\`\`\`yaml
# Security Checklist
checklist:
  encryption:
    - ssl_enabled: true
    - tls_version: ">=1.2"
    - strong_ciphers: true
    - hsts_enabled: true
    
  firewall:
    - default_deny: true
    - unnecessary_ports_closed: true
    - ip_whitelisting: true
    - rate_limiting: true
    
  monitoring:
    - intrusion_detection: true
    - traffic_monitoring: true
    - security_logging: true
    - alert_system: true
    
  access_control:
    - vpn_required: true
    - ssh_key_auth: true
    - bastion_host: true
    - session_timeout: true
\`\`\`

### Security Hardening
\`\`\`bash
# Harden system
torqvio security harden

# Disable unnecessary services
torqvio security disable-service telnet
torqvio security disable-service ftp

# Update system packages
torqvio security update

# Security patches
torqvio security patch --all
\`\`\`

## Troubleshooting

### Network Issues
\`\`\`bash
# Test connectivity
torqvio network test --host api.torqvio.com

# Check DNS resolution
torqvio network dns --resolve api.torqvio.com

# Trace route
torqvio network traceroute api.torqvio.com

# Check SSL certificate
torqvio ssl check --domain api.torqvio.com
\`\`\`

### Security Issues
\`\`\`bash
# Check firewall status
torqvio firewall status

# Show blocked IPs
torqvio firewall blocked

# Check intrusion detection
torqvio security ids status

# Security diagnostics
torqvio security doctor
\`\`\`

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function NetworkSecurityPage() {
  return (
    <DocsPageWrapper copyForAIContent={MARKDOWN_CONTENT}>
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="mb-8"
      >
        <ol className="flex items-center space-x-2 text-sm text-gray-400">
          <li>
            <Link href="/docs" className="hover:text-white transition-colors">
              Documentation
            </Link>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="text-white">Network Security</span>
          </li>
        </ol>
      </motion.nav>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-2xl border border-purple-500/30">
            <Shield className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Network Security
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                advanced
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">25 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated today</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Comprehensive network security guide covering SSL/TLS configuration, firewall setup, DDoS protection, intrusion detection, and security monitoring for Torqvio deployments.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* SSL/TLS Configuration */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Lock className="w-6 h-6 text-purple-400" />
              SSL/TLS Configuration
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Enable HTTPS</h3>
                <p className="text-gray-400">Configure SSL/TLS certificates and enable secure HTTPS connections.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Security</span>
                <code className="text-purple-400 font-mono text-sm">ssl</code>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">SSL Setup</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Generate SSL certificate
torqvio ssl generate --domain api.torqvio.com

# Install SSL certificate
torqvio ssl install --certificate cert.pem --key key.pem

# Enable HTTPS
torqvio config set ssl.enabled true
torqvio config set ssl.port 443`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Firewall Configuration */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Wifi className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Firewall Configuration</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Basic Firewall Rules</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Allow HTTP/HTTPS traffic
torqvio firewall allow --port 80 --protocol tcp
torqvio firewall allow --port 443 --protocol tcp

# Allow SSH access
torqvio firewall allow --port 22 --protocol tcp --source 192.168.1.0/24

# Deny all other traffic
torqvio firewall deny --all`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* DDoS Protection */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <AlertTriangle className="w-6 h-6 text-purple-400" />
              DDoS Protection
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Rate Limiting</h3>
                <p className="text-gray-400">Configure rate limiting to protect against DDoS attacks and abuse.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">Protection</span>
                <code className="text-purple-400 font-mono text-sm">rate_limit</code>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Rate Limiting Configuration</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Enable DDoS protection
torqvio security ddos enable

# Configure protection levels
torqvio security ddos configure --level high

# Add trusted IPs
torqvio security ddos trust --ip 192.168.1.100`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Network Monitoring */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Eye className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Network Monitoring</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Traffic Monitoring</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Monitor network traffic
torqvio monitor traffic --real-time

# Show bandwidth usage
torqvio monitor bandwidth

# Monitor connections
torqvio monitor connections --state established`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Next Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/compliance"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Compliance
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Ensure compliance with security standards and regulations.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                Ensure Compliance →
              </div>
            </Link>

            <Link
              href="/docs/deployment"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Deployment
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Deploy Torqvio securely with network best practices.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                Deploy Securely →
              </div>
            </Link>
          </div>
        </section>
      </motion.div>
    </DocsPageWrapper>
  )
}
