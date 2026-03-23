'use client'

import { motion } from 'framer-motion'
import { Globe, Code, CheckCircle, ArrowRight, Copy, Play, Terminal, Shield, AlertCircle, Webhook, Zap, Clock, Settings } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8459'

const MARKDOWN_CONTENT = `# Webhooks

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
Webhooks allow Torqvio to send real-time notifications to your application when workflow events occur.

## Base URL

### Development
\`\`\`
${API_URL}
\`\`\`

## Authentication
All webhook requests include a signature in the \`X-Torqvio-Signature\` header for verification:

\`\`\`
X-Torqvio-Signature: sha256=signature_hash
\`\`\`

### Verify Webhook Signature
\`\`\`javascript
const crypto = require('crypto')

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return \`sha256=\${expectedSignature}\` === signature
}
\`\`\`

## Workflow Events

### Workflow Started
Sent when a workflow execution begins.

**Payload:**
\`\`\`json
{
  "event": "workflow.started",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "timestamp": "2024-01-15T10:35:00Z",
  "data": {
    "workflow_name": "Order Processing",
    "input_payload": { "orderId": "12345" }
  }
}
\`\`\`

### Workflow Completed
Sent when a workflow finishes successfully.

**Payload:**
\`\`\`json
{
  "event": "workflow.completed",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "timestamp": "2024-01-15T10:37:00Z",
  "data": {
    "workflow_name": "Order Processing",
    "result": { "status": "processed", "orderId": "12345" },
    "execution_time": 120
  }
}
\`\`\`

### Workflow Failed
Sent when a workflow encounters an error.

**Payload:**
\`\`\`json
{
  "event": "workflow.failed",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "timestamp": "2024-01-15T10:37:00Z",
  "data": {
    "workflow_name": "Order Processing",
    "error": {
      "message": "Invalid order data",
      "code": "VALIDATION_ERROR",
      "step": "validate-order"
    },
    "execution_time": 45
  }
}
\`\`\`

## Webhook Management

### Create Webhook
\`\`\`bash
curl -X POST ${API_URL}/api/v1/webhooks \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-app.com/webhooks/torqvio",
    "events": ["workflow.started", "workflow.completed", "workflow.failed"],
    "secret": "your_webhook_secret",
    "active": true
  }'
\`\`\`

### List Webhooks
\`\`\`bash
curl -X GET ${API_URL}/api/v1/webhooks \\
  -H "Authorization: Bearer your_api_key_here"
\`\`\`

### Update Webhook
\`\`\`bash
curl -X PATCH ${API_URL}/api/v1/webhooks/{id} \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "active": false
  }'
\`\`\`

### Delete Webhook
\`\`\`bash
curl -X DELETE ${API_URL}/api/v1/webhooks/{id} \\
  -H "Authorization: Bearer your_api_key_here"
\`\`\`

## Retry Policy
Webhooks are retried with exponential backoff:

| Attempt | Delay |
|---------|-------|
| 1 | Immediate |
| 2 | 1 minute |
| 3 | 5 minutes |
| 4 | 15 minutes |
| 5 | 30 minutes |

If all retries fail, the webhook is marked as inactive.

## Best Practices

- Use HTTPS endpoints for security
- Always verify webhook signatures
- Respond quickly (within 30 seconds)
- Return 2xx status codes to acknowledge receipt
- Implement idempotent processing

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function WebhooksPage() {
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
            <span className="text-white">Webhooks</span>
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
            <Webhook className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Webhooks
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                Stable
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">12 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated 1 week ago</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Webhooks allow Torqvio to send real-time notifications to your application when workflow events occur.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Base URL */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Base URL</h2>
          </div>
          
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
              <span className="text-xs text-gray-400 font-mono">Development</span>
            </div>
            <div className="p-4">
              <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                <code className="text-purple-400">{API_URL}</code>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Authentication</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">HTTP Header</span>
              </div>
              <div className="p-4">
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                  <code className="text-gray-300">X-Torqvio-Signature: sha256=signature_hash</code>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Verify Signature (Node.js)</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`const crypto = require('crypto')

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return \`sha256=\${expectedSignature}\` === signature
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Events */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Zap className="w-6 h-6 text-purple-400" />
              Workflow Events
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Workflow Started */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Workflow Started</h3>
                  <p className="text-gray-400">Sent when a workflow execution begins.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">POST</span>
                  <code className="text-purple-400 font-mono text-sm">webhook endpoint</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Payload</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`{
  "event": "workflow.started",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "timestamp": "2024-01-15T10:35:00Z",
  "data": {
    "workflow_name": "Order Processing",
    "input_payload": { "orderId": "12345" }
  }
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Completed */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Workflow Completed</h3>
                  <p className="text-gray-400">Sent when a workflow finishes successfully.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">POST</span>
                  <code className="text-purple-400 font-mono text-sm">webhook endpoint</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Payload</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`{
  "event": "workflow.completed",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "timestamp": "2024-01-15T10:37:00Z",
  "data": {
    "workflow_name": "Order Processing",
    "result": { "status": "processed", "orderId": "12345" },
    "execution_time": 120
  }
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Workflow Failed */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Workflow Failed</h3>
                  <p className="text-gray-400">Sent when a workflow encounters an error.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">POST</span>
                  <code className="text-purple-400 font-mono text-sm">webhook endpoint</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Payload</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`{
  "event": "workflow.failed",
  "workflow_id": "wf_123",
  "execution_id": "exec_456",
  "timestamp": "2024-01-15T10:37:00Z",
  "data": {
    "workflow_name": "Order Processing",
    "error": {
      "message": "Invalid order data",
      "code": "VALIDATION_ERROR",
      "step": "validate-order"
    },
    "execution_time": 45
  }
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Webhook Management */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Settings className="w-6 h-6 text-purple-400" />
              Webhook Management
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Create Webhook */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Create Webhook</h3>
                  <p className="text-gray-400">Register a new webhook endpoint.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">POST</span>
                  <code className="text-purple-400 font-mono text-sm">/api/v1/webhooks</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Request Body</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`{
  "url": "https://your-app.com/webhooks/torqvio",
  "events": ["workflow.started", "workflow.completed", "workflow.failed"],
  "secret": "your_webhook_secret",
  "active": true
}`}</code>
                    </pre>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">cURL</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`curl -X POST ${API_URL}/api/v1/webhooks \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://your-app.com/webhooks/torqvio",
    "events": ["workflow.started", "workflow.completed", "workflow.failed"],
    "secret": "your_webhook_secret",
    "active": true
  }'`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* List Webhooks */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">List Webhooks</h3>
                  <p className="text-gray-400">Get all registered webhooks.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">GET</span>
                  <code className="text-purple-400 font-mono text-sm">/api/v1/webhooks</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">cURL</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`curl -X GET ${API_URL}/api/v1/webhooks \\
  -H "Authorization: Bearer your_api_key_here"`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Retry Policy */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Retry Policy</h2>
          </div>
          
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Attempt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Delay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300">1</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Immediate</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300">2</td>
                  <td className="px-6 py-4 text-sm text-gray-300">1 minute</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300">3</td>
                  <td className="px-6 py-4 text-sm text-gray-300">5 minutes</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300">4</td>
                  <td className="px-6 py-4 text-sm text-gray-300">15 minutes</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300">5</td>
                  <td className="px-6 py-4 text-sm text-gray-300">30 minutes</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              If all retries fail, the webhook is marked as inactive and will no longer receive events.
            </p>
          </div>
        </section>

        {/* Best Practices */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Best Practices</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Use HTTPS endpoints for security</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Always verify webhook signatures</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Respond quickly (within 30 seconds)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Return 2xx status codes to acknowledge receipt</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Implement idempotent processing</p>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white whitespace-nowrap">Continue Learning</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/rest-api"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  REST API
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Learn about our REST API endpoints for workflow management.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                View API Docs <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link
              href="/docs/client-sdk"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Client SDK
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Use our official client libraries for easier integration.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                View SDK Docs <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* Support */}
        <section className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-8 border border-purple-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-400 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-2">Need Help?</h3>
              <p className="text-gray-300 text-sm mb-4">
                If you need assistance with webhooks, we're here to help.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  Check Examples
                </Link>
                <Link href="#" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  Join Discord
                </Link>
                <Link href="#" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">
                  GitHub Issues
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-20 pt-8 border-t border-zinc-600/50">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-zinc-300 text-sm">
                &copy; {new Date().getFullYear()} Torqvio. Built with durability in mind.
              </div>
              <div className="flex items-center gap-8 text-sm">
                <Link href="#" className="text-zinc-300 hover:text-emerald-300 transition-colors">
                  GitHub
                </Link>
                <Link href="#" className="text-zinc-300 hover:text-emerald-300 transition-colors">
                  Discord
                </Link>
                <Link href="#" className="text-zinc-300 hover:text-emerald-300 transition-colors">
                  Twitter
                </Link>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </DocsPageWrapper>
  )
}
