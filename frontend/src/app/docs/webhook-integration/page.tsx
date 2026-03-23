'use client'

import { motion } from 'framer-motion'
import { Webhook, Code, CheckCircle, ArrowRight, Copy, Play, Terminal, Shield, AlertCircle, Zap, Clock, Settings, Globe, Key, Link2, Server, Database, RefreshCw, Eye, EyeOff, Lock, Unlock, Send, Receive, FileText, GitBranch, Activity, Bell, Plug, Cpu } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# Webhook Integration

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
Webhook integration enables Torqvio to communicate with external systems in real-time, allowing you to build powerful automated workflows that respond to events from third-party services.

## Integration Architecture

### Webhook Flow
\`\`\`
External Service → Torqvio → Your Application
       ↓                ↓              ↓
   Event Trigger   → Process Event  → Take Action
\`\`\`

### Components
1. **Webhook Receiver** - Endpoint that accepts incoming webhooks
2. **Event Processor** - Handles and validates incoming events
3. **Action Executor** - Triggers workflows based on events
4. **Response Handler** - Manages acknowledgments and retries

## Setting Up Webhook Integration

### 1. Create Webhook Endpoint

#### Node.js Express Example
\`\`\`javascript
const express = require('express')
const crypto = require('crypto')
const app = express()

// Middleware to parse raw body for signature verification
app.use('/webhooks', express.raw({ type: 'application/json' }))

app.post('/webhooks/torqvio', (req, res) => {
  const signature = req.headers['x-torqvio-signature']
  const payload = req.body.toString()
  
  // Verify webhook signature
  if (!verifyWebhookSignature(payload, signature, process.env.WEBHOOK_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  
  try {
    const event = JSON.parse(payload)
    
    // Process the event
    processWebhookEvent(event)
    
    // Acknowledge receipt
    res.status(200).json({ status: 'received' })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Processing failed' })
  }
})

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')
  
  return \`sha256=\${expectedSignature}\` === signature
}

app.listen(3000, () => console.log('Webhook server running on port 3000'))
\`\`\`

#### Python Flask Example
\`\`\`python
from flask import Flask, request, jsonify
import hmac
import hashlib
import json

app = Flask(__name__)

@app.route('/webhooks/torqvio', methods=['POST'])
def torqvio_webhook():
    signature = request.headers.get('X-Torqvio-Signature')
    payload = request.data.decode('utf-8')
    
    # Verify webhook signature
    if not verify_webhook_signature(payload, signature, app.config['WEBHOOK_SECRET']):
        return jsonify({'error': 'Invalid signature'}), 401
    
    try:
        event = json.loads(payload)
        
        # Process the event
        process_webhook_event(event)
        
        # Acknowledge receipt
        return jsonify({'status': 'received'}), 200
    except Exception as error:
        print(f'Error processing webhook: {error}')
        return jsonify({'error': 'Processing failed'}), 500

def verify_webhook_signature(payload, signature, secret):
    expected_signature = hmac.new(
        secret.encode('utf-8'),
        payload.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()
    
    return f'sha256={expected_signature}' == signature

if __name__ == '__main__':
    app.run(port=3000)
\`\`\`

### 2. Configure Webhook in Torqvio

#### CLI Configuration
\`\`\`bash
# Add webhook endpoint
torqvio webhooks add \\
  --name "production-webhook" \\
  --url "https://your-app.com/webhooks/torqvio" \\
  --secret "your-webhook-secret" \\
  --events "workflow.started,workflow.completed,workflow.failed"

# Test webhook
torqvio webhooks test --name "production-webhook"

# List webhooks
torqvio webhooks list
\`\`\`

#### API Configuration
\`\`\`bash
curl -X POST http://localhost:8459/api/webhooks \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "production-webhook",
    "url": "https://your-app.com/webhooks/torqvio",
    "secret": "your-webhook-secret",
    "events": ["workflow.started", "workflow.completed", "workflow.failed"],
    "active": true
  }'
\`\`\`

## Event Types and Payloads

### Workflow Events

#### Workflow Started
\`\`\`json
{
  "event": "workflow.started",
  "id": "evt_123456789",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "workflow_id": "wf_abc123",
    "execution_id": "exec_def456",
    "workflow_name": "Data Processing Pipeline",
    "trigger_type": "webhook",
    "trigger_data": {
      "source": "github",
      "repository": "my-repo",
      "commit": "abc123"
    },
    "started_at": "2024-01-15T10:30:00Z"
  }
}
\`\`\`

#### Workflow Completed
\`\`\`json
{
  "event": "workflow.completed",
  "id": "evt_123456790",
  "timestamp": "2024-01-15T10:35:00Z",
  "data": {
    "workflow_id": "wf_abc123",
    "execution_id": "exec_def456",
    "workflow_name": "Data Processing Pipeline",
    "status": "completed",
    "result": {
      "processed_records": 1000,
      "output_file": "s3://bucket/output.json",
      "duration_seconds": 300
    },
    "completed_at": "2024-01-15T10:35:00Z"
  }
}
\`\`\`

#### Workflow Failed
\`\`\`json
{
  "event": "workflow.failed",
  "id": "evt_123456791",
  "timestamp": "2024-01-15T10:32:00Z",
  "data": {
    "workflow_id": "wf_abc123",
    "execution_id": "exec_def456",
    "workflow_name": "Data Processing Pipeline",
    "status": "failed",
    "error": {
      "type": "ValidationError",
      "message": "Invalid input data format",
      "step_id": "step_ghi789",
      "step_name": "Data Validation"
    },
    "failed_at": "2024-01-15T10:32:00Z"
  }
}
\`\`\`

### System Events

#### System Maintenance
\`\`\`json
{
  "event": "system.maintenance",
  "id": "evt_123456792",
  "timestamp": "2024-01-15T02:00:00Z",
  "data": {
    "type": "scheduled_maintenance",
    "message": "System maintenance in progress",
    "start_time": "2024-01-15T02:00:00Z",
    "estimated_duration": "30 minutes",
    "affected_services": ["workflow_engine", "api"]
  }
}
\`\`\`

#### Resource Alerts
\`\`\`json
{
  "event": "system.resource_alert",
  "id": "evt_123456793",
  "timestamp": "2024-01-15T10:45:00Z",
  "data": {
    "alert_type": "high_memory_usage",
    "severity": "warning",
    "metric": "memory_usage",
    "value": 85,
    "threshold": 80,
    "service": "workflow_engine",
    "instance": "worker-3"
  }
}
\`\`\`

## Third-Party Integrations

### GitHub Integration

#### Setup GitHub Webhook
\`\`\`bash
# Add GitHub repository webhook
curl -X POST https://api.github.com/repos/owner/repo/hooks \\
  -H "Authorization: token YOUR_GITHUB_TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "web",
    "active": true,
    "events": ["push", "pull_request"],
    "config": {
      "url": "https://your-torqvio.com/webhooks/github",
      "content_type": "json",
      "secret": "your-github-webhook-secret"
    }
  }'
\`\`\`

#### Handle GitHub Events
\`\`\`javascript
// GitHub webhook handler
app.post('/webhooks/github', async (req, res) => {
  const event = req.headers['x-github-event']
  const signature = req.headers['x-hub-signature-256']
  
  // Verify GitHub signature
  if (!verifyGitHubSignature(req.body, signature, process.env.GITHUB_SECRET)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  
  try {
    switch (event) {
      case 'push':
        await handlePushEvent(req.body)
        break
      case 'pull_request':
        await handlePullRequestEvent(req.body)
        break
      default:
        console.log(\`Unhandled event: \${event}\`)
    }
    
    res.status(200).json({ status: 'received' })
  } catch (error) {
    console.error('Error processing GitHub webhook:', error)
    res.status(500).json({ error: 'Processing failed' })
  }
})

async function handlePushEvent(payload) {
  const { repository, ref, commits } = payload
  
  // Trigger Torqvio workflow
  await triggerWorkflow('github-push', {
    repository: repository.full_name,
    branch: ref.replace('refs/heads/', ''),
    commits: commits.map(commit => ({
      message: commit.message,
      author: commit.author.name,
      url: commit.url
    }))
  })
}
\`\`\`

### Slack Integration

#### Setup Slack Webhook
\`\`\`bash
# Create Slack app and enable incoming webhooks
# Get webhook URL: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
\`\`\`

#### Send Notifications to Slack
\`\`\`javascript
async function sendSlackNotification(message, channel = '#general') {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL
  
  const payload = {
    channel,
    username: 'Torqvio',
    icon_emoji: ':robot_face:',
    text: message,
    attachments: [{
      color: 'good',
      fields: [{
        title: 'Workflow Status',
        value: message,
        short: false
      }]
    }]
  }
  
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
  } catch (error) {
    console.error('Error sending Slack notification:', error)
  }
}
\`\`\`

### Jira Integration

#### Setup Jira Webhook
\`\`\`bash
# Add Jira webhook through Jira admin panel
# Webhook URL: https://your-app.com/webhooks/jira
\`\`\`

#### Handle Jira Events
\`\`\`javascript
app.post('/webhooks/jira', async (req, res) => {
  const event = req.headers['x-atlassian-event']
  
  try {
    switch (event) {
      case 'jira:issue_created':
        await handleIssueCreated(req.body)
        break
      case 'jira:issue_updated':
        await handleIssueUpdated(req.body)
        break
      default:
        console.log(\`Unhandled Jira event: \${event}\`)
    }
    
    res.status(200).json({ status: 'received' })
  } catch (error) {
    console.error('Error processing Jira webhook:', error)
    res.status(500).json({ error: 'Processing failed' })
  }
})

async function handleIssueCreated(payload) {
  const { issue } = payload
  
  // Trigger workflow based on issue type
  if (issue.fields.issuetype.name === 'Bug') {
    await triggerWorkflow('bug-report', {
      issue_key: issue.key,
      summary: issue.fields.summary,
      description: issue.fields.description,
      priority: issue.fields.priority.name,
      reporter: issue.fields.reporter.displayName
    })
  }
}
\`\`\`

## Security Best Practices

### Signature Verification
Always verify webhook signatures to ensure requests are authentic:

\`\`\`javascript
// Strong signature verification
function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !signature.startsWith('sha256=')) {
    return false
  }
  
  const receivedSignature = signature.slice(7)
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')
  
  // Use constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}
\`\`\`

### Rate Limiting
Implement rate limiting to prevent abuse:

\`\`\`javascript
const rateLimit = require('express-rate-limit')

const webhookRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many webhook requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
})

app.use('/webhooks', webhookRateLimit)
\`\`\`

### IP Whitelisting
Restrict webhook requests to known sources:

\`\`\`javascript
const allowedIPs = ['52.20.1.234', '54.210.1.234'] // Torqvio IPs

function ipWhitelist(req, res, next) {
  const clientIP = req.ip || req.connection.remoteAddress
  
  if (allowedIPs.includes(clientIP)) {
    next()
  } else {
    res.status(403).json({ error: 'IP not allowed' })
  }
}

app.use('/webhooks', ipWhitelist)
\`\`\`

## Error Handling and Retries

### Retry Logic
Implement exponential backoff for failed webhook deliveries:

\`\`\`javascript
async function sendWebhookWithRetry(url, payload, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Torqvio-Signature': generateSignature(payload, secret)
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        return { success: true, attempt }
      }
      
      throw new Error(\`HTTP \${response.status}: \${response.statusText}\`)
    } catch (error) {
      if (attempt === maxRetries) {
        throw error
      }
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
\`\`\`

### Dead Letter Queue
Handle failed webhook deliveries:

\`\`\`javascript
const deadLetterQueue = []

async function handleWebhookFailure(event, error) {
  // Add to dead letter queue
  deadLetterQueue.push({
    event,
    error: error.message,
    timestamp: new Date().toISOString(),
    retries: 0
  })
  
  // Log for monitoring
  console.error(\`Webhook delivery failed:\`, {
    eventId: event.id,
    error: error.message,
    eventType: event.event
  })
}

// Process dead letter queue periodically
setInterval(async () => {
  while (deadLetterQueue.length > 0) {
    const item = deadLetterQueue.shift()
    
    try {
      await sendWebhookWithRetry(item.event)
      console.log(\`Successfully retried webhook: \${item.event.id}\`)
    } catch (error) {
      item.retries++
      
      if (item.retries < 3) {
        deadLetterQueue.push(item)
      } else {
        console.error(\`Permanently failed webhook: \${item.event.id}\`)
      }
    }
  }
}, 60000) // Process every minute
\`\`\`

## Monitoring and Logging

### Webhook Metrics
Track webhook performance and reliability:

\`\`\`javascript
const webhookMetrics = {
  totalReceived: 0,
  totalProcessed: 0,
  totalFailed: 0,
  averageProcessingTime: 0
}

function trackWebhookMetrics(startTime, success) {
  const processingTime = Date.now() - startTime
  
  webhookMetrics.totalReceived++
  
  if (success) {
    webhookMetrics.totalProcessed++
  } else {
    webhookMetrics.totalFailed++
  }
  
  // Update average processing time
  webhookMetrics.averageProcessingTime = 
    (webhookMetrics.averageProcessingTime + processingTime) / 2
}
\`\`\`

### Structured Logging
Use structured logging for better observability:

\`\`\`javascript
function logWebhookEvent(event, status, error = null) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    eventId: event.id,
    eventType: event.event,
    status,
    processingTime: Date.now() - new Date(event.timestamp).getTime(),
    error: error ? {
      message: error.message,
      stack: error.stack
    } : null
  }
  
  console.log(JSON.stringify(logEntry))
}
\`\`\`

## Testing Webhook Integration

### Local Testing
Use ngrok for local development:

\`\`\`bash
# Start ngrok
ngrok http 3000

# Update webhook URL to use ngrok URL
torqvio webhooks update \\
  --name "dev-webhook" \\
  --url "https://abc123.ngrok.io/webhooks/torqvio"
\`\`\`

### Webhook Testing Tools

#### Test Webhook Delivery
\`\`\`bash
# Test webhook with sample payload
torqvio webhooks test \\
  --name "production-webhook" \\
  --event "workflow.started" \\
  --data '{"workflow_id": "test_123"}'
\`\`\`

#### Verify Webhook Endpoint
\`\`\`bash
# Test webhook endpoint health
curl -X POST https://your-app.com/webhooks/torqvio \\
  -H "Content-Type: application/json" \\
  -H "X-Torqvio-Signature: sha256=test" \\
  -d '{"test": "payload"}'
\`\`\`

## Troubleshooting

### Common Issues

#### Signature Verification Failed
- Check webhook secret configuration
- Ensure raw body is used for signature calculation
- Verify signature format (sha256=...)

#### Timeout Errors
- Increase webhook timeout in Torqvio configuration
- Optimize webhook processing time
- Implement async processing for long-running tasks

#### Duplicate Events
- Implement idempotency in webhook handlers
- Use event IDs to track processed events
- Add deduplication logic

### Debug Tools

#### Webhook Inspector
\`\`\`javascript
// Middleware to log webhook details
function webhookInspector(req, res, next) {
  console.log('Webhook received:', {
    headers: req.headers,
    body: req.body,
    timestamp: new Date().toISOString()
  })
  
  next()
}

app.use('/webhooks', webhookInspector)
\`\`\`

#### Event Replay
\`\`\`bash
# Replay failed webhook events
torqvio webhooks replay \\
  --event-id "evt_123456789" \\
  --webhook "production-webhook"
\`\`\`

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function WebhookIntegrationPage() {
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
            <span className="text-white">Webhook Integration</span>
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
          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-2xl border border-blue-500/30">
            <Webhook className="w-8 h-8 text-blue-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Webhook Integration
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                intermediate
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">15 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated today</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Learn how to integrate Torqvio with external systems using webhooks for real-time event-driven automation and communication.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Integration Architecture */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <GitBranch className="w-6 h-6 text-blue-400" />
              Integration Architecture
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Webhook Flow</h3>
                <p className="text-gray-400">Understanding how webhooks flow through your system.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Flow</span>
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Event Flow Diagram</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`External Service → Torqvio → Your Application
       ↓                ↓              ↓
   Event Trigger   → Process Event  → Take Action`}</code>
                  </pre>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Components</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Webhook Receiver - Accepts incoming events</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Event Processor - Validates and handles events</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Action Executor - Triggers workflows</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <span>Response Handler - Manages acknowledgments</span>
                    </li>
                  </ul>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Benefits</h4>
                  <ul className="space-y-2 text-sm text-gray-300">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Real-time event processing</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Decoupled system architecture</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Scalable event handling</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-400" />
                      <span>Extensible integration points</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Setting Up Integration */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Setting Up Integration</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Node.js Express Example</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`const express = require('express')
const crypto = require('crypto')

app.post('/webhooks/torqvio', (req, res) => {
  const signature = req.headers['x-torqvio-signature']
  const payload = req.body.toString()
  
  // Verify webhook signature
  if (!verifyWebhookSignature(payload, signature, secret)) {
    return res.status(401).json({ error: 'Invalid signature' })
  }
  
  const event = JSON.parse(payload)
  processWebhookEvent(event)
  
  res.status(200).json({ status: 'received' })
})`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Event Types */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Bell className="w-6 h-6 text-blue-400" />
              Event Types
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Workflow Events */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Workflow Events</h3>
                  <p className="text-gray-400">Events triggered by workflow lifecycle changes.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Workflow</span>
                  <Cpu className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Workflow Started</h4>
                  <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                    <code>{`{
  "event": "workflow.started",
  "id": "evt_123456789",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "workflow_id": "wf_abc123",
    "execution_id": "exec_def456",
    "workflow_name": "Data Processing Pipeline"
  }
}`}</code>
                  </pre>
                </div>
                
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Workflow Completed</h4>
                  <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                    <code>{`{
  "event": "workflow.completed",
  "data": {
    "workflow_id": "wf_abc123",
    "status": "completed",
    "result": {
      "processed_records": 1000,
      "duration_seconds": 300
    }
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* System Events */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">System Events</h3>
                  <p className="text-gray-400">Events related to system health and maintenance.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded">System</span>
                  <Server className="w-5 h-5 text-orange-400" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-lg font-semibold text-white mb-2">Resource Alerts</h4>
                  <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                    <code>{`{
  "event": "system.resource_alert",
  "data": {
    "alert_type": "high_memory_usage",
    "severity": "warning",
    "value": 85,
    "threshold": 80
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Third-Party Integrations */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Plug className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Third-Party Integrations</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <GitBranch className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">GitHub</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">Trigger workflows from GitHub events like pushes and pull requests.</p>
              <div className="text-xs text-blue-400">push, pull_request</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <Send className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Slack</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">Send workflow notifications and updates to Slack channels.</p>
              <div className="text-xs text-blue-400">notifications, alerts</div>
            </div>
            
            <div className="bg-gray-800 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                  <FileText className="w-4 h-4 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-white">Jira</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">Automate workflows based on Jira issue creation and updates.</p>
              <div className="text-xs text-blue-400">issue_created, issue_updated</div>
            </div>
          </div>
        </section>

        {/* Security Best Practices */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Shield className="w-6 h-6 text-blue-400" />
              Security Best Practices
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Signature Verification</h3>
                  <p className="text-gray-400">Always verify webhook signatures to ensure authenticity.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Security</span>
                  <Lock className="w-5 h-5 text-green-400" />
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Strong Verification</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`function verifyWebhookSignature(payload, signature, secret) {
  if (!signature || !signature.startsWith('sha256=')) {
    return false
  }
  
  const receivedSignature = signature.slice(7)
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('hex')
  
  // Use constant-time comparison
  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  )
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  <h3 className="text-xl font-bold text-white">Rate Limiting</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">Implement rate limiting to prevent abuse and ensure system stability.</p>
                <div className="text-xs text-gray-500">1000 requests per 15 minutes</div>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-5 h-5 text-blue-400" />
                  <h3 className="text-xl font-bold text-white">IP Whitelisting</h3>
                </div>
                <p className="text-sm text-gray-400 mb-3">Restrict webhook requests to known Torqvio IP addresses.</p>
                <div className="text-xs text-gray-500">Allowed IPs only</div>
              </div>
            </div>
          </div>
        </section>

        {/* Error Handling */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-blue-400" />
            <h2 className="text-2xl font-bold text-white">Error Handling & Retries</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Exponential Backoff</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`async function sendWebhookWithRetry(url, payload, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Torqvio-Signature': generateSignature(payload, secret)
        },
        body: JSON.stringify(payload)
      })
      
      if (response.ok) {
        return { success: true, attempt }
      }
      
      throw new Error(\`HTTP \${response.status}\`)
    } catch (error) {
      if (attempt === maxRetries) throw error
      
      // Exponential backoff
      const delay = Math.pow(2, attempt) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Testing & Troubleshooting */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Terminal className="w-6 h-6 text-blue-400" />
              Testing & Troubleshooting
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-bold text-white">Local Testing</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">Use ngrok for testing webhooks locally during development.</p>
              <div className="bg-gray-800 rounded-lg p-3">
                <code className="text-xs text-purple-400">ngrok http 3000</code>
              </div>
            </div>
            
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <RefreshCw className="w-5 h-5 text-green-400" />
                <h3 className="text-xl font-bold text-white">Event Replay</h3>
              </div>
              <p className="text-sm text-gray-400 mb-3">Replay failed webhook events for testing and debugging.</p>
              <div className="bg-gray-800 rounded-lg p-3">
                <code className="text-xs text-green-400">torqvio webhooks replay</code>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Next Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/webhooks"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Webhooks API
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Explore the complete webhooks API reference and documentation.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                View API Docs →
              </div>
            </Link>

            <Link
              href="/docs/rest-api"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  REST API
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Learn about Torqvio's REST API for programmatic access.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                Explore API →
              </div>
            </Link>
          </div>
        </section>
      </motion.div>
    </DocsPageWrapper>
  )
}
