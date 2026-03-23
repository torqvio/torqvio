'use client'

import { motion } from 'framer-motion'
import { Shield, Key, Lock, Unlock, User, CheckCircle, AlertCircle, ChevronRight, Copy, ArrowRight, Eye, EyeOff, RefreshCw, Settings, Globe, Code, Database, Clock, Zap, FileText, Users, Terminal } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# Authentication

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
Torqvio provides comprehensive authentication and authorization mechanisms to secure your workflows and API access. This guide covers all authentication methods, security best practices, and implementation details.

## Authentication Methods

### API Key Authentication
API keys provide simple, secure access for automated workflows and service-to-service communication.

\`\`\`bash
# Generate API key
torqvio api-keys create --name "Production API" --permissions read,write

# Use API key in environment variable
export TORQVIO_API_KEY=ak_prod_1234567890abcdef

# Use API key in configuration
torqvio config set auth.api_key ak_prod_1234567890abcdef
\`\`\`

#### API Key Configuration
\`\`\`yaml
# ~/.torqvio/config.yaml
auth:
  method: api_key
  api_key: \${TORQVIO_API_KEY}
  auto_refresh: true
  
api_keys:
  production:
    key: \${PROD_API_KEY}
    permissions: ["read", "write", "execute"]
    rate_limit: 1000/hour
    
  development:
    key: \${DEV_API_KEY}
    permissions: ["read", "write"]
    rate_limit: 100/hour
\`\`\`

### OAuth 2.0 Authentication
OAuth provides secure, delegated access for user authentication and third-party integrations.

\`\`\`bash
# Start OAuth flow
torqvio auth login --oauth

# OAuth with specific provider
torqvio auth login --oauth --provider github
torqvio auth login --oauth --provider google
torqvio auth login --oauth --provider microsoft
\`\`\`

#### OAuth Configuration
\`\`\`yaml
# OAuth Provider Configuration
oauth:
  providers:
    github:
      client_id: \${GITHUB_CLIENT_ID}
      client_secret: \${GITHUB_CLIENT_SECRET}
      scopes: ["repo", "workflow", "read:user"]
      redirect_uri: https://app.torqvio.com/auth/github/callback
      
    google:
      client_id: \${GOOGLE_CLIENT_ID}
      client_secret: \${GOOGLE_CLIENT_SECRET}
      scopes: ["openid", "email", "profile"]
      redirect_uri: https://app.torqvio.com/auth/google/callback
      
    microsoft:
      client_id: \${MICROSOFT_CLIENT_ID}
      client_secret: \${MICROSOFT_CLIENT_SECRET}
      scopes: ["workflow", "user"]
      redirect_uri: https://app.torqvio.com/auth/microsoft/callback
\`\`\`

### Service Account Authentication
Service accounts provide machine-to-machine authentication for automated workflows and background processes.

\`\`\`bash
# Create service account
torqvio service-accounts create --name "workflow-processor" --role workflow_executor

# Download service account key
torqvio service-accounts download-key workflow-processor --file key.json

# Use service account
torqvio auth login --service-account key.json
\`\`\`

#### Service Account Configuration
\`\`\`yaml
# Service Account Setup
service_account:
  email: workflow-processor@torqvio.iam.gserviceaccount.com
  key_file: ~/.torqvio/service-account.json
  project_id: my-torqvio-project
  
  permissions:
    - workflow.read
    - workflow.execute
    - execution.read
    
  impersonation:
    enabled: false
    target_email: admin@torqvio.com
\`\`\`

### JWT Authentication
JSON Web Tokens provide stateless authentication for web applications and APIs.

\`\`\`bash
# Generate JWT token
torqvio auth jwt generate --subject "user123" --expires 1h

# Validate JWT token
torqvio auth jwt validate --token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
\`\`\`

#### JWT Configuration
\`\`\`yaml
# JWT Settings
jwt:
  algorithm: HS256
  secret: \${JWT_SECRET}
  issuer: torqvio.com
  audience: torqvio-api
  
  claims:
    standard: ["iss", "sub", "aud", "exp", "iat"]
    custom: ["role", "permissions", "workspace"]
    
  refresh:
    enabled: true
    expiration: 7d
    rotation: true
\`\`\`

## Authorization and Permissions

### Role-Based Access Control (RBAC)
Define roles and permissions to control access to Torqvio resources.

\`\`\`yaml
# Role Definitions
roles:
  admin:
    description: "Full system access"
    permissions:
      - "*"
      
  developer:
    description: "Workflow development and execution"
    permissions:
      - workflow.read
      - workflow.write
      - workflow.execute
      - execution.read
      
  viewer:
    description: "Read-only access"
    permissions:
      - workflow.read
      - execution.read
      
  executor:
    description: "Workflow execution only"
    permissions:
      - workflow.execute
      - execution.read
\`\`\`

### Permission Management
\`\`\`bash
# List available permissions
torqvio permissions list

# Check user permissions
torqvio permissions check --user user@example.com --permission workflow.execute

# Grant permission to user
torqvio permissions grant --user user@example.com --permission workflow.execute

# Revoke permission from user
torqvio permissions revoke --user user@example.com --permission workflow.execute
\`\`\`

### Workspace-Level Access
\`\`\`yaml
# Workspace Permissions
workspaces:
  production:
    owners:
      - admin@company.com
    members:
      - developer1@company.com
      - developer2@company.com
    permissions:
      - workflow.read
      - workflow.execute
      - execution.read
      
  development:
    owners:
      - lead@company.com
    members:
      - dev1@company.com
      - dev2@company.com
      - intern@company.com
    permissions:
      - "*"
\`\`\`

## Security Best Practices

### API Key Security
\`\`\`bash
# Use environment variables for API keys
export TORQVIO_API_KEY=your_api_key_here

# Rotate API keys regularly
torqvio api-keys rotate --key-id ak_prod_123

# Set expiration dates
torqvio api-keys create --name "Temp Key" --expires 30d

# Limit API key scope
torqvio api-keys create --name "Read Only" --permissions read
\`\`\`

### OAuth Security
\`\`\`yaml
# OAuth Security Configuration
oauth:
  security:
    require_https: true
    state_param: true
    pkce: true
    
    token_validation:
      introspection_endpoint: https://auth.torqvio.com/introspect
      revocation_endpoint: https://auth.torqvio.com/revoke
      
    session_management:
      max_age: 8h
      refresh_token_rotation: true
      absolute_timeout: 7d
\`\`\`

### Network Security
\`\`\`yaml
# Network Security Settings
network:
  allowed_origins:
    - https://app.torqvio.com
    - https://company.torqvio.com
    
  ip_whitelist:
    - 192.168.1.0/24
    - 10.0.0.0/8
    
  rate_limiting:
    enabled: true
    requests_per_minute: 60
    burst: 10
    
  ssl:
    required: true
    min_version: TLSv1.2
    ciphers:
      - ECDHE-RSA-AES256-GCM-SHA384
      - ECDHE-RSA-AES128-GCM-SHA256
\`\`\`

## Authentication Implementation

### Client SDK Authentication
\`\`\`javascript
// JavaScript/TypeScript SDK
import { Torqvio } from '@torqvio/client'

// API Key Authentication
const client = new Torqvio({
  apiKey: process.env.TORQVIO_API_KEY,
  workspace: 'my-workspace'
})

// OAuth Authentication
const client = new Torqvio({
  oauth: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/callback'
  }
})

// Service Account Authentication
const client = new Torqvio({
  serviceAccount: {
    email: 'workflow-processor@torqvio.iam.gserviceaccount.com',
    keyFile: './service-account.json'
  }
})
\`\`\`

### REST API Authentication
\`\`\`bash
# API Key in Header
curl -H "Authorization: Bearer ak_prod_1234567890abcdef" \\
     https://api.torqvio.com/v1/workflows

# OAuth Bearer Token
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\
     https://api.torqvio.com/v1/workflows

# Service Account JWT
curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..." \\
     https://api.torqvio.com/v1/workflows
\`\`\`

### CLI Authentication
\`\`\`bash
# Interactive Authentication
torqvio auth login

# API Key Authentication
torqvio auth login --api-key ak_prod_1234567890abcdef

# OAuth Authentication
torqvio auth login --oauth --provider github

# Service Account Authentication
torqvio auth login --service-account key.json

# Check Authentication Status
torqvio auth status
torqvio auth whoami
\`\`\`

## Token Management

### Access Tokens
\`\`\`bash
# Generate access token
torqvio tokens generate --type access --expires 1h

# List active tokens
torqvio tokens list --type access

# Revoke access token
torqvio tokens revoke --token-id at_1234567890abcdef
\`\`\`

### Refresh Tokens
\`\`\`bash
# Generate refresh token
torqvio tokens generate --type refresh --expires 7d

# Use refresh token to get new access token
torqvio tokens refresh --refresh-token rt_1234567890abcdef

# Revoke refresh token
torqvio tokens revoke --token-id rt_1234567890abcdef
\`\`\`

### Session Management
\`\`\`bash
# List active sessions
torqvio sessions list

# Revoke specific session
torqvio sessions revoke --session-id sess_1234567890abcdef

# Revoke all sessions except current
torqvio sessions revoke --all-others

# Revoke all sessions
torqvio sessions revoke --all
\`\`\`

## Multi-Factor Authentication (MFA)

### Enable MFA
\`\`\`bash
# Enable MFA for user
torqvio mfa enable --method totp

# Generate backup codes
torqvio mfa backup-codes generate

# Verify MFA setup
torqvio mfa verify --code 123456
\`\`\`

### MFA Configuration
\`\`\`yaml
# MFA Settings
mfa:
  enabled: true
  methods:
    - totp
    - sms
    - email
    
  totp:
    issuer: Torqvio
    digits: 6
    window: 1
    
  sms:
    provider: twilio
    from_number: "+1234567890"
    
  email:
    template: mfa_code
    expires: 10m
\`\`\`

## Audit and Monitoring

### Authentication Events
\`\`\`bash
# List authentication events
torqvio audit events --type auth

# Monitor failed logins
torqvio audit events --type auth --status failed

# Export audit logs
torqvio audit export --from "2024-01-01" --to "2024-01-31" --file auth-audit.json
\`\`\`

### Security Monitoring
\`\`\`yaml
# Security Monitoring
security:
  monitoring:
    failed_login_threshold: 5
    lockout_duration: 15m
    
    anomaly_detection:
      enabled: true
      factors:
        - ip_address
        - user_agent
        - time_of_day
        - location
        
    alerts:
      email: security@company.com
      slack: "#security-alerts"
      webhook: https://alerts.company.com/webhook
\`\`\`

## Troubleshooting

### Common Authentication Issues
\`\`\`bash
# Check authentication status
torqvio auth status

# Test API connectivity
torqvio doctor --check auth

# Validate API key
torqvio api-keys validate --key ak_prod_1234567890abcdef

# Check token expiration
torqvio tokens show --token-id at_1234567890abcdef
\`\`\`

### Debug Authentication
\`\`\`bash
# Enable debug logging
torqvio --debug auth status

# Show detailed token information
torqvio auth whoami --detailed

# Test authentication flow
torqvio auth test --method api_key
torqvio auth test --method oauth
torqvio auth test --method service_account
\`\`\`

## Integration Examples

### GitHub Actions
\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy Workflow
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Authenticate with Torqvio
        env:
          TORQVIO_API_KEY: \${{ secrets.TORQVIO_API_KEY }}
        run: |
          torqvio auth login --api-key $TORQVIO_API_KEY
          torqvio workflows deploy --file workflow.yaml
\`\`\`

### Docker Integration
\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine

# Install Torqvio CLI
RUN npm install -g torqvio-cli

# Copy service account key
COPY service-account.json /app/service-account.json

# Authenticate and run workflow
CMD torqvio auth login --service-account /app/service-account.json && \
    torqvio workflows run --workflow-id production-workflow
\`\`\`

### Kubernetes Integration
\`\`\`yaml
# kubernetes-deployment.yaml
apiVersion: v1
kind: Secret
metadata:
  name: torqvio-secrets
type: Opaque
data:
  api-key: YWtfcHJvZF8xMjM0NTY3ODkwYWJjZGVm  # base64 encoded
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: workflow-processor
spec:
  template:
    spec:
      containers:
      - name: processor
        image: torqvio/workflow-processor:latest
        env:
        - name: TORQVIO_API_KEY
          valueFrom:
            secretKeyRef:
              name: torqvio-secrets
              key: api-key
\`\`\`

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function AuthenticationPage() {
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
            <span className="text-white">Authentication</span>
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
              Authentication
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                intermediate
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">20 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated today</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Comprehensive authentication and authorization guide for securing Torqvio workflows, APIs, and user access with multiple authentication methods.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Authentication Methods */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Key className="w-6 h-6 text-purple-400" />
              Authentication Methods
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* API Key Authentication */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">API Key Authentication</h3>
                  <p className="text-gray-400">Simple, secure access for automated workflows and service-to-service communication.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Popular</span>
                  <code className="text-purple-400 font-mono text-sm">api_key</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">API Key Setup</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Generate API key
torqvio api-keys create --name "Production API" --permissions read,write

# Use API key in environment variable
export TORQVIO_API_KEY=ak_prod_1234567890abcdef

# Use API key in configuration
torqvio config set auth.api_key ak_prod_1234567890abcdef`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* OAuth Authentication */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">OAuth 2.0 Authentication</h3>
                  <p className="text-gray-400">Secure, delegated access for user authentication and third-party integrations.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">OAuth</span>
                  <code className="text-purple-400 font-mono text-sm">oauth</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">OAuth Flow</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Start OAuth flow
torqvio auth login --oauth

# OAuth with specific provider
torqvio auth login --oauth --provider github
torqvio auth login --oauth --provider google
torqvio auth login --oauth --provider microsoft`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Service Account Authentication */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Service Account Authentication</h3>
                  <p className="text-gray-400">Machine-to-machine authentication for automated workflows and background processes.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Service</span>
                  <code className="text-purple-400 font-mono text-sm">service_account</code>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Service Account Setup</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Create service account
torqvio service-accounts create --name "workflow-processor" --role workflow_executor

# Download service account key
torqvio service-accounts download-key workflow-processor --file key.json

# Use service account
torqvio auth login --service-account key.json`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* JWT Authentication */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">JWT Authentication</h3>
                  <p className="text-gray-400">Stateless authentication for web applications and APIs using JSON Web Tokens.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded">JWT</span>
                  <code className="text-purple-400 font-mono text-sm">jwt</code>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">JWT Commands</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Generate JWT token
torqvio auth jwt generate --subject "user123" --expires 1h

# Validate JWT token
torqvio auth jwt validate --token eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`}</code>
                    </pre>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">JWT Configuration (yaml)</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`jwt:
  algorithm: HS256
  secret: \${JWT_SECRET}
  issuer: torqvio.com
  audience: torqvio-api

  claims:
    standard: ["iss", "sub", "aud", "exp", "iat"]
    custom: ["role", "permissions", "workspace"]

  refresh:
    enabled: true
    expiration: 7d
    rotation: true`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authorization and Permissions */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Lock className="w-6 h-6 text-purple-400" />
              Authorization &amp; Permissions
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>

          <div className="space-y-6">
            {/* RBAC */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Role-Based Access Control</h3>
                  <p className="text-gray-400">Define roles and permissions to control access to Torqvio resources.</p>
                </div>
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">RBAC</span>
              </div>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Role Definitions (yaml)</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`roles:
  admin:
    description: "Full system access"
    permissions:
      - "*"

  developer:
    description: "Workflow development and execution"
    permissions:
      - workflow.read
      - workflow.write
      - workflow.execute
      - execution.read

  viewer:
    description: "Read-only access"
    permissions:
      - workflow.read
      - execution.read

  executor:
    description: "Workflow execution only"
    permissions:
      - workflow.execute
      - execution.read`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Permission Management */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Permission Management</h3>
                  <p className="text-gray-400">Grant and revoke individual permissions for users.</p>
                </div>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">CLI</span>
              </div>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Permission Commands</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# List available permissions
torqvio permissions list

# Check user permissions
torqvio permissions check --user user@example.com --permission workflow.execute

# Grant permission to user
torqvio permissions grant --user user@example.com --permission workflow.execute

# Revoke permission from user
torqvio permissions revoke --user user@example.com --permission workflow.execute`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Workspace-Level Access */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Workspace-Level Access</h3>
                  <p className="text-gray-400">Isolate permissions per workspace for team and environment separation.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">Workspaces</span>
              </div>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Workspace Permissions (yaml)</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`workspaces:
  production:
    owners:
      - admin@company.com
    members:
      - developer1@company.com
      - developer2@company.com
    permissions:
      - workflow.read
      - workflow.execute
      - execution.read

  development:
    owners:
      - lead@company.com
    members:
      - dev1@company.com
      - dev2@company.com
    permissions:
      - "*"`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Security Best Practices */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <CheckCircle className="w-6 h-6 text-purple-400" />
              Security Best Practices
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* API Key Security */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">API Key Security</h3>
                  <p className="text-gray-400">Best practices for managing and securing API keys.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">Security</span>
                  <code className="text-purple-400 font-mono text-sm">best_practices</code>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Security Commands</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Use environment variables for API keys
export TORQVIO_API_KEY=your_api_key_here

# Rotate API keys regularly
torqvio api-keys rotate --key-id ak_prod_123

# Set expiration dates
torqvio api-keys create --name "Temp Key" --expires 30d

# Limit API key scope
torqvio api-keys create --name "Read Only" --permissions read`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* OAuth Security */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">OAuth Security</h3>
                  <p className="text-gray-400">Harden your OAuth flows with PKCE, state parameters, and token introspection.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">OAuth</span>
                  <code className="text-purple-400 font-mono text-sm">hardening</code>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">OAuth Security Configuration (yaml)</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`oauth:
  security:
    require_https: true
    state_param: true
    pkce: true

    token_validation:
      introspection_endpoint: https://auth.torqvio.com/introspect
      revocation_endpoint: https://auth.torqvio.com/revoke

    session_management:
      max_age: 8h
      refresh_token_rotation: true
      absolute_timeout: 7d`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Network Security */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Network Security</h3>
                  <p className="text-gray-400">Restrict access by origin, IP allowlist, rate limits, and TLS version.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">Network</span>
                  <code className="text-purple-400 font-mono text-sm">tls</code>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Network Security Settings (yaml)</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`network:
  allowed_origins:
    - https://app.torqvio.com
    - https://company.torqvio.com

  ip_whitelist:
    - 192.168.1.0/24
    - 10.0.0.0/8

  rate_limiting:
    enabled: true
    requests_per_minute: 60
    burst: 10

  ssl:
    required: true
    min_version: TLSv1.2
    ciphers:
      - ECDHE-RSA-AES256-GCM-SHA384
      - ECDHE-RSA-AES128-GCM-SHA256`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication Implementation */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Code className="w-6 h-6 text-purple-400" />
              Authentication Implementation
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Client SDK */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Client SDK Authentication</h3>
                  <p className="text-gray-400">Implement authentication using the Torqvio client SDKs.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">SDK</span>
                  <code className="text-purple-400 font-mono text-sm">javascript</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">JavaScript/TypeScript SDK</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`// JavaScript/TypeScript SDK
import { Torqvio } from '@torqvio/client'

// API Key Authentication
const client = new Torqvio({
  apiKey: process.env.TORQVIO_API_KEY,
  workspace: 'my-workspace'
})

// OAuth Authentication
const client = new Torqvio({
  oauth: {
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    redirectUri: 'http://localhost:3000/callback'
  }
})`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* REST API */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">REST API Authentication</h3>
                  <p className="text-gray-400">Direct API authentication using HTTP headers and tokens.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">API</span>
                  <code className="text-purple-400 font-mono text-sm">http</code>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">HTTP Authentication</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# API Key in Header
curl -H "Authorization: Bearer ak_prod_1234567890abcdef" \\
     https://api.torqvio.com/v1/workflows

# OAuth Bearer Token
curl -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\
     https://api.torqvio.com/v1/workflows

# Service Account JWT
curl -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9..." \\
     https://api.torqvio.com/v1/workflows`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* CLI Authentication */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">CLI Authentication</h3>
                  <p className="text-gray-400">Authenticate via the Torqvio CLI for local development and CI/CD pipelines.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">CLI</span>
                  <code className="text-purple-400 font-mono text-sm">terminal</code>
                </div>
              </div>

              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">CLI Auth Commands</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Interactive login
torqvio auth login

# API Key auth
torqvio auth login --api-key ak_prod_1234567890abcdef

# OAuth auth
torqvio auth login --oauth --provider github

# Service Account auth
torqvio auth login --service-account key.json

# Check current auth status
torqvio auth status
torqvio auth whoami`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Multi-Factor Authentication */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Users className="w-6 h-6 text-purple-400" />
              Multi-Factor Authentication
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Enable MFA</h3>
                  <p className="text-gray-400">Add a second factor via TOTP, SMS, or email to protect user accounts.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">Recommended</span>
              </div>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">MFA Commands</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Enable MFA for user
torqvio mfa enable --method totp

# Generate backup codes
torqvio mfa backup-codes generate

# Verify MFA setup
torqvio mfa verify --code 123456`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">MFA Configuration</h3>
                  <p className="text-gray-400">Configure supported MFA methods and provider settings.</p>
                </div>
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Config</span>
              </div>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">MFA Settings (yaml)</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`mfa:
  enabled: true
  methods:
    - totp
    - sms
    - email

  totp:
    issuer: Torqvio
    digits: 6
    window: 1

  sms:
    provider: twilio
    from_number: "+1234567890"

  email:
    template: mfa_code
    expires: 10m`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Token Management */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <RefreshCw className="w-6 h-6 text-purple-400" />
              Token Management
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Key className="w-4 h-4 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Access Tokens</h3>
              </div>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Access Token Commands</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Generate access token
torqvio tokens generate --type access --expires 1h

# List active tokens
torqvio tokens list --type access

# Revoke token
torqvio tokens revoke --token-id at_1234567890abcdef`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <RefreshCw className="w-4 h-4 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Refresh Tokens</h3>
              </div>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Refresh Token Commands</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Generate refresh token
torqvio tokens generate --type refresh --expires 7d

# Use to get new access token
torqvio tokens refresh --refresh-token rt_1234567890abcdef

# Revoke refresh token
torqvio tokens revoke --token-id rt_1234567890abcdef`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <Clock className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-bold text-white">Session Management</h3>
            </div>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Session Commands</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# List active sessions
torqvio sessions list

# Revoke specific session
torqvio sessions revoke --session-id sess_1234567890abcdef

# Revoke all other sessions
torqvio sessions revoke --all-others

# Revoke all sessions
torqvio sessions revoke --all`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Audit and Monitoring */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <FileText className="w-6 h-6 text-purple-400" />
              Audit &amp; Monitoring
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Authentication Events</h3>
                  <p className="text-gray-400">Query and export auth event logs for compliance and debugging.</p>
                </div>
                <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">Audit</span>
              </div>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Audit Commands</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# List authentication events
torqvio audit events --type auth

# Monitor failed logins
torqvio audit events --type auth --status failed

# Export audit logs
torqvio audit export --from "2024-01-01" --to "2024-01-31" --file auth-audit.json`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Security Monitoring</h3>
                  <p className="text-gray-400">Detect anomalies, lock out bad actors, and alert your team automatically.</p>
                </div>
                <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">Alerts</span>
              </div>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Security Monitoring (yaml)</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`security:
  monitoring:
    failed_login_threshold: 5
    lockout_duration: 15m

    anomaly_detection:
      enabled: true
      factors:
        - ip_address
        - user_agent
        - time_of_day
        - location

    alerts:
      email: security@company.com
      slack: "#security-alerts"
      webhook: https://alerts.company.com/webhook`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <AlertCircle className="w-6 h-6 text-purple-400" />
              Troubleshooting
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Common Issues</h3>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Diagnostic Commands</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Check auth status
torqvio auth status

# Test API connectivity
torqvio doctor --check auth

# Validate API key
torqvio api-keys validate --key ak_prod_123

# Check token expiration
torqvio tokens show --token-id at_1234567890abcdef`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <h3 className="text-lg font-bold text-white mb-4">Debug Auth</h3>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Debug Commands</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Enable debug logging
torqvio --debug auth status

# Detailed token info
torqvio auth whoami --detailed

# Test each auth method
torqvio auth test --method api_key
torqvio auth test --method oauth
torqvio auth test --method service_account`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Integration Examples */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Globe className="w-6 h-6 text-purple-400" />
              Integration Examples
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">GitHub Actions</h3>
                  <p className="text-gray-400">Authenticate in CI/CD pipelines using repository secrets.</p>
                </div>
                <span className="px-3 py-1 bg-gray-600/50 text-gray-300 text-xs font-medium rounded">CI/CD</span>
              </div>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">.github/workflows/deploy.yml</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`name: Deploy Workflow
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Authenticate with Torqvio
        env:
          TORQVIO_API_KEY: \${{ secrets.TORQVIO_API_KEY }}
        run: |
          torqvio auth login --api-key $TORQVIO_API_KEY
          torqvio workflows deploy --file workflow.yaml`}</code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Docker</h3>
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Container</span>
                </div>
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Dockerfile</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`FROM node:18-alpine

RUN npm install -g torqvio-cli

COPY service-account.json /app/service-account.json

CMD torqvio auth login \\
    --service-account /app/service-account.json && \\
    torqvio workflows run \\
    --workflow-id production-workflow`}</code>
                      </pre>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-white">Kubernetes</h3>
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">K8s</span>
                </div>
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">kubernetes-secret.yaml</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`apiVersion: v1
kind: Secret
metadata:
  name: torqvio-secrets
type: Opaque
data:
  api-key: YWtfcHJvZF8xMjM0NTY3ODkwYWJjZGVm
---
# Reference in deployment
env:
- name: TORQVIO_API_KEY
  valueFrom:
    secretKeyRef:
      name: torqvio-secrets
      key: api-key`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white whitespace-nowrap">Next Steps</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/api-keys"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Key className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  API Keys
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Learn how to create, manage, and secure API keys for your applications.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                Manage API Keys →
              </div>
            </Link>

            <Link
              href="/docs/network-security"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Network Security
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Configure network security, firewalls, and SSL/TLS settings.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                Secure Network →
              </div>
            </Link>
          </div>
        </section>
      </motion.div>
    </DocsPageWrapper>
  )
}
