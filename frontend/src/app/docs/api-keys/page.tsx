'use client'

import { motion } from 'framer-motion'
import { Key, Shield, CheckCircle, AlertCircle, Copy, RefreshCw, Download, Upload, Eye, EyeOff, Clock, Settings, Lock, Unlock, Zap, Users, FileText, Terminal } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# API Keys

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
API keys provide secure, programmatic access to Torqvio's APIs and services. They're ideal for server-to-server communication, automated workflows, and third-party integrations.

## Creating API Keys

### Generate New API Key
\`\`\`bash
# Create API key with default permissions
torqvio api-keys create --name "Production API"

# Create API key with specific permissions
torqvio api-keys create --name "Read Only API" --permissions read

# Create API key with expiration
torqvio api-keys create --name "Temp Key" --expires 30d

# Create API key with rate limit
torqvio api-keys create --name "Limited API" --rate-limit 1000/hour
\`\`\`

### API Key Types
\`\`\`bash
# Production key (full access)
torqvio api-keys create --name "Production" --type production --permissions "*"

# Development key (limited access)
torqvio api-keys create --name "Development" --type development --permissions read,write

# Service key (service-to-service)
torqvio api-keys create --name "Microservice" --type service --permissions execute
\`\`\`

## Managing API Keys

### List API Keys
\`\`\`bash
# List all API keys
torqvio api-keys list

# List with details
torqvio api-keys list --detailed

# Filter by type
torqvio api-keys list --type production
torqvio api-keys list --type development

# Show expired keys
torqvio api-keys list --expired
\`\`\`

### API Key Details
\`\`\`bash
# Show API key information
torqvio api-keys show <key-id>

# Show usage statistics
torqvio api-keys show <key-id> --usage

# Show permissions
torqvio api-keys show <key-id> --permissions
\`\`\`

### Update API Key
\`\`\`bash
# Update name
torqvio api-keys update <key-id> --name "New Name"

# Update permissions
torqvio api-keys update <key-id> --permissions read,write,execute

# Update rate limit
torqvio api-keys update <key-id> --rate-limit 2000/hour

# Extend expiration
torqvio api-keys update <key-id> --expires 90d
\`\`\`

### Delete API Key
\`\`\`bash
# Delete API key
torqvio api-keys delete <key-id>

# Delete with confirmation
torqvio api-keys delete <key-id> --confirm

# Force delete (skip confirmation)
torqvio api-keys delete <key-id> --force
\`\`\`

## API Key Security

### Best Practices
\`\`\`bash
# Use environment variables
export TORQVIO_API_KEY=ak_prod_1234567890abcdef

# Rotate keys regularly
torqvio api-keys rotate <key-id>

# Set expiration dates
torqvio api-keys create --name "Temp Key" --expires 7d

# Limit permissions (principle of least privilege)
torqvio api-keys create --name "Read Only" --permissions read
\`\`\`

### Secure Storage
\`\`\`bash
# Store in secure environment
echo "TORQVIO_API_KEY=ak_prod_1234567890abcdef" >> ~/.env

# Use secret management tools
kubectl create secret generic torqvio-api-key --from-literal=key=ak_prod_1234567890abcdef

# AWS Secrets Manager
aws secretsmanager create-secret --name torqvio-api-key --secret-string ak_prod_1234567890abcdef
\`\`\`

## Permissions and Scopes

### Permission Levels
\`\`\`yaml
# Permission Hierarchy
permissions:
  read:
    - workflows.read
    - executions.read
    - users.read
    
  write:
    - workflows.write
    - executions.write
    - configurations.write
    
  execute:
    - workflows.execute
    - executions.execute
    
  admin:
    - "*"
\`\`\`

### Resource-Based Permissions
\`\`\`bash
# Grant specific resource access
torqvio api-keys create --name "Workflow Executor" \\
  --permissions workflow.execute:workflow_123

# Grant workspace-level access
torqvio api-keys create --name "Workspace Admin" \\
  --permissions workspace.admin:workspace_456

# Grant project-level access
torqvio api-keys create --name "Project Reader" \\
  --permissions project.read:project_789
\`\`\`

## Rate Limiting

### Configure Rate Limits
\`\`\`bash
# Set rate limit per hour
torqvio api-keys create --name "Limited API" --rate-limit 1000/hour

# Set rate limit per minute
torqvio api-keys create --name "Burst API" --rate-limit 10/minute

# Set custom rate limits
torqvio api-keys create --name "Custom API" \\
  --rate-limit "1000/hour,10/minute"
\`\`\`

### Rate Limit Monitoring
\`\`\`bash
# Check current usage
torqvio api-keys usage <key-id>

# Show rate limit status
torqvio api-keys rate-limit <key-id>

# Reset rate limit
torqvio api-keys reset-rate-limit <key-id>
\`\`\`

## API Key Rotation

### Manual Rotation
\`\`\`bash
# Rotate API key
torqvio api-keys rotate <key-id>

# Rotate with grace period
torqvio api-keys rotate <key-id> --grace-period 24h

# Rotate and invalidate old key immediately
torqvio api-keys rotate <key-id> --immediate
\`\`\`

### Automatic Rotation
\`\`\`yaml
# Auto-rotation Configuration
auto_rotation:
  enabled: true
  interval: 90d
  grace_period: 24h
  notification: email
  
  notification_settings:
    email: admin@company.com
    slack: "#api-alerts"
    webhook: https://alerts.company.com/webhook
\`\`\`

## Using API Keys

### Environment Variables
\`\`\`bash
# Set API key
export TORQVIO_API_KEY=ak_prod_1234567890abcdef

# Use in CLI
torqvio workflows list

# Use in configuration
torqvio config set auth.api_key $TORQVIO_API_KEY
\`\`\`

### Configuration File
\`\`\`yaml
# ~/.torqvio/config.yaml
auth:
  method: api_key
  api_key: \${TORQVIO_API_KEY}

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

### HTTP Headers
\`\`\`bash
# Using curl
curl -H "Authorization: Bearer ak_prod_1234567890abcdef" \\
     https://api.torqvio.com/v1/workflows

# Using in code
const headers = {
  'Authorization': 'Bearer ak_prod_1234567890abcdef',
  'Content-Type': 'application/json'
}
\`\`\`

## Monitoring and Auditing

### Usage Monitoring
\`\`\`bash
# Show usage statistics
torqvio api-keys usage <key-id>

# Show daily usage
torqvio api-keys usage <key-id> --daily

# Show usage by endpoint
torqvio api-keys usage <key-id> --by-endpoint

# Export usage data
torqvio api-keys usage <key-id> --export usage.csv
\`\`\`

### Audit Logs
\`\`\`bash
# Show API key events
torqvio audit events --api-key <key-id>

# Show failed requests
torqvio audit events --api-key <key-id> --status failed

# Show suspicious activity
torqvio audit events --api-key <key-id> --suspicious
\`\`\`

## Troubleshooting

### Common Issues
\`\`\`bash
# Check API key validity
torqvio api-keys validate <key-id>

# Test API key
torqvio api-keys test <key-id>

# Check permissions
torqvio api-keys permissions <key-id>

# Check rate limit status
torqvio api-keys rate-limit <key-id>
\`\`\`

### Debug API Key Issues
\`\`\`bash
# Enable debug logging
torqvio --debug api-keys show <key-id>

# Show detailed error information
torqvio api-keys show <key-id> --debug

# Test API connectivity
torqvio doctor --check api-key
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
      
      - name: Deploy with Torqvio
        env:
          TORQVIO_API_KEY: \${{ secrets.TORQVIO_API_KEY }}
        run: |
          torqvio workflows deploy --file workflow.yaml
\`\`\`

### Docker
\`\`\`dockerfile
# Dockerfile
FROM node:18-alpine

# Install Torqvio CLI
RUN npm install -g torqvio-cli

# Set API key
ENV TORQVIO_API_KEY=ak_prod_1234567890abcdef

# Run workflow
CMD torqvio workflows run --workflow-id production-workflow
\`\`\`

### Kubernetes
\`\`\`yaml
# kubernetes-secret.yaml
apiVersion: v1
kind: Secret
metadata:
  name: torqvio-api-key
type: Opaque
data:
  key: YWtfcHJvZF8xMjM0NTY3ODkwYWJjZGVm  # base64 encoded
---
apiVersion: batch/v1
kind: Job
metadata:
  name: workflow-runner
spec:
  template:
    spec:
      containers:
      - name: runner
        image: torqvio/cli:latest
        env:
        - name: TORQVIO_API_KEY
          valueFrom:
            secretKeyRef:
              name: torqvio-api-key
              key: key
        command: ["torqvio", "workflows", "run", "--workflow-id", "prod-workflow"]
\`\`\`

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function APIKeysPage() {
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
            <span className="text-white">API Keys</span>
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
            <Key className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              API Keys
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                beginner
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">8 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated today</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Secure API key management for programmatic access to Torqvio services, including creation, rotation, permissions, and best practices.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Creating API Keys */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Key className="w-6 h-6 text-purple-400" />
              Creating API Keys
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Generate New API Key</h3>
                <p className="text-gray-400">Create API keys with different permission levels and expiration settings.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Create</span>
                <code className="text-purple-400 font-mono text-sm">api-keys create</code>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">API Key Creation</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Create API key with default permissions
torqvio api-keys create --name "Production API"

# Create API key with specific permissions
torqvio api-keys create --name "Read Only API" --permissions read

# Create API key with expiration
torqvio api-keys create --name "Temp Key" --expires 30d

# Create API key with rate limit
torqvio api-keys create --name "Limited API" --rate-limit 1000/hour`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* API Key Security */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">API Key Security</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Security Best Practices</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Use environment variables
export TORQVIO_API_KEY=ak_prod_1234567890abcdef

# Rotate keys regularly
torqvio api-keys rotate <key-id>

# Set expiration dates
torqvio api-keys create --name "Temp Key" --expires 7d

# Limit permissions (principle of least privilege)
torqvio api-keys create --name "Read Only" --permissions read`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Using API Keys */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Terminal className="w-6 h-6 text-purple-400" />
              Using API Keys
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Environment Variables */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Environment Variables</h3>
                  <p className="text-gray-400">Set and use API keys through environment variables.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Environment</span>
                  <code className="text-purple-400 font-mono text-sm">env</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Environment Setup</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Set API key
export TORQVIO_API_KEY=ak_prod_1234567890abcdef

# Use in CLI
torqvio workflows list

# Use in configuration
torqvio config set auth.api_key $TORQVIO_API_KEY`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* HTTP Headers */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">HTTP Headers</h3>
                  <p className="text-gray-400">Use API keys in HTTP requests with Bearer authentication.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">HTTP</span>
                  <code className="text-purple-400 font-mono text-sm">bearer</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">HTTP Authentication</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Using curl
curl -H "Authorization: Bearer ak_prod_1234567890abcdef" \\
     https://api.torqvio.com/v1/workflows

# Using in code
const headers = {
  'Authorization': 'Bearer ak_prod_1234567890abcdef',
  'Content-Type': 'application/json'
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Next Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/authentication"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Authentication
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Learn about other authentication methods and security best practices.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                Explore Auth →
              </div>
            </Link>

            <Link
              href="/docs/network-security"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Lock className="w-5 h-5 text-blue-400" />
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
