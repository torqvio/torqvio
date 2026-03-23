'use client'

import { motion } from 'framer-motion'
import { AlertTriangle, Shield, CheckCircle, ArrowRight, Copy, Terminal, Bug, RefreshCw, Zap, Clock, Settings, AlertCircle, Database, Server, Webhook } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8459'

const MARKDOWN_CONTENT = `# Error Handling

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
Torqvio provides comprehensive error handling with structured error responses, retry mechanisms, and detailed error reporting for robust workflow management.

## Base URL

### Development
\`\`\`
${API_URL}
\`\`\`

## Error Response Format

All API errors follow a consistent structure:

\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "workflow_name",
      "reason": "Required field missing"
    },
    "timestamp": "2024-01-15T10:35:00Z",
    "request_id": "req_123456789"
  }
}
\`\`\`

## HTTP Status Codes

| Status Code | Meaning | Common Scenarios |
|-------------|---------|------------------|
| 400 | Bad Request | Invalid input, malformed JSON |
| 401 | Unauthorized | Missing or invalid API key |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource already exists |
| 422 | Unprocessable Entity | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Unexpected server error |
| 502 | Bad Gateway | Database connection issues |
| 503 | Service Unavailable | Maintenance mode |

## Error Codes

### Validation Errors
\`\`\`json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": {
      "errors": [
        {
          "field": "workflow_name",
          "message": "Workflow name must be between 3 and 100 characters"
        },
        {
          "field": "steps",
          "message": "At least one step is required"
        }
      ]
    }
  }
}
\`\`\`

### Authentication Errors
\`\`\`json
{
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid API key",
    "details": {
      "hint": "Check your API key in the dashboard"
    }
  }
}
\`\`\`

### Rate Limit Errors
\`\`\`json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "limit": 1000,
      "window": "1 hour",
      "reset_time": "2024-01-15T11:00:00Z"
    }
  }
}
\`\`\`

### Workflow Errors
\`\`\`json
{
  "error": {
    "code": "WORKFLOW_EXECUTION_FAILED",
    "message": "Workflow execution failed",
    "details": {
      "workflow_id": "wf_123",
      "execution_id": "exec_456",
      "step": "process-payment",
      "error": "Payment gateway timeout"
    }
  }
}
\`\`\`

## Retry Strategy

### Automatic Retries
Torqvio automatically retries failed requests with exponential backoff:

| Attempt | Delay | Multiplier |
|---------|-------|------------|
| 1 | 1 second | 1x |
| 2 | 2 seconds | 2x |
| 3 | 4 seconds | 2x |
| 4 | 8 seconds | 2x |
| 5 | 16 seconds | 2x |

### Retryable Errors
- **5xx errors**: Server-side issues
- **429 errors**: Rate limiting
- **408 errors**: Request timeout
- **502/503/504 errors**: Service unavailable

### Non-Retryable Errors
- **4xx errors**: Client-side issues (except 429)
- **Validation errors**: Invalid input data
- **Authentication errors**: Invalid credentials

## Error Handling Best Practices

### 1. Always Check HTTP Status
\`\`\`javascript
async function callTorqvio(endpoint, data) {
  const response = await fetch(\`\${API_URL}\${endpoint}\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new TorqvioError(error)
  }

  return response.json()
}
\`\`\`

### 2. Implement Exponential Backoff
\`\`\`javascript
async function callWithRetry(endpoint, data, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callTorqvio(endpoint, data)
    } catch (error) {
      if (attempt === maxRetries || !error.isRetryable) {
        throw error
      }
      
      const delay = Math.pow(2, attempt - 1) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}
\`\`\`

### 3. Log Request IDs
\`\`\`javascript
try {
  const result = await callTorqvio('/workflows', data)
} catch (error) {
  console.error(\`Request failed: \${error.requestId}\`, error)
  // Send to your error tracking service
}
\`\`\`

### 4. Handle Specific Error Codes
\`\`\`javascript
try {
  const result = await callTorqvio('/workflows', data)
} catch (error) {
  switch (error.code) {
    case 'VALIDATION_ERROR':
      // Fix input data and retry
      break
    case 'RATE_LIMIT_EXCEEDED':
      // Wait until reset_time
      break
    case 'AUTHENTICATION_FAILED':
      // Refresh API key
      break
    default:
      // Log and notify
  }
}
\`\`\`

## Monitoring & Alerting

### Error Metrics
- **Error Rate**: Percentage of failed requests
- **Error Types**: Distribution by error code
- **Response Time**: Latency for successful/failed requests
- **Retry Success Rate**: Percentage of successful retries

### Health Check Endpoint
\`\`\`bash
curl -X GET ${API_URL}/health
\`\`\`

**Response:**
\`\`\`json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:35:00Z",
  "version": "v2.1.0",
  "database": "connected",
  "redis": "connected"
}
\`\`\`

## Common Error Scenarios

### Workflow Timeout
\`\`\`json
{
  "error": {
    "code": "WORKFLOW_TIMEOUT",
    "message": "Workflow execution exceeded maximum duration",
    "details": {
      "workflow_id": "wf_123",
      "timeout": "30 minutes",
      "actual_duration": "32 minutes"
    }
  }
}
\`\`\`

### Database Connection Error
\`\`\`json
{
  "error": {
    "code": "DATABASE_ERROR",
    "message": "Database connection failed",
    "details": {
      "retry_after": "30 seconds",
      "connection_pool": "exhausted"
    }
  }
}
\`\`\`

### Resource Limit Exceeded
\`\`\`json
{
  "error": {
    "code": "RESOURCE_LIMIT_EXCEEDED",
    "message": "Account resource limit exceeded",
    "details": {
      "limit": "1000 workflows",
      "current": "1000 workflows",
      "upgrade_plan": "https://torqvio.com/billing"
    }
  }
}
\`\`\`

## Client Libraries

### Node.js Error Handling
\`\`\`javascript
const { TorqvioClient } = require('@torqvio/client')

const client = new TorqvioClient({
  apiKey: process.env.TORQVIO_API_KEY,
  baseUrl: API_URL,
  retryConfig: {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000
  }
})

client.on('error', (error) => {
  console.error('Torqvio error:', error)
  // Handle errors globally
})
\`\`\`

### Python Error Handling
\`\`\`python
from torqvio import TorqvioClient
from torqvio.exceptions import TorqvioError, RateLimitError

client = TorqvioClient(
    api_key=os.environ['TORQVIO_API_KEY'],
    base_url=API_URL
)

try:
    result = client.workflows.create(data)
except RateLimitError as e:
    print(f"Rate limited: {e.reset_time}")
except TorqvioError as e:
    print(f"API Error: {e.code} - {e.message}")
\`\`\`

## Debugging Tools

### Request Tracing
Add the \`X-Request-ID\` header to trace requests:

\`\`\`bash
curl -X POST ${API_URL}/api/v1/workflows \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "X-Request-ID: debug_123456" \\
  -d '{"name": "Test Workflow"}'
\`\`\`

### Error Logging
Enable debug logging:

\`\`\`javascript
const client = new TorqvioClient({
  apiKey: 'your_api_key',
  debug: true  // Enables detailed logging
})
\`\`\`

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function ErrorHandlingPage() {
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
            <span className="text-white">Error Handling</span>
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
          <div className="p-4 bg-gradient-to-br from-red-500/20 to-orange-500/20 rounded-2xl border border-red-500/30">
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              Error Handling
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                Stable
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">15 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated 1 week ago</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Comprehensive error handling with structured responses, retry mechanisms, and detailed error reporting for robust workflow management.
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
            <Server className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Base URL</h2>
          </div>
          
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
              <span className="text-xs text-gray-400 font-mono">Development</span>
            </div>
            <div className="p-4">
              <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                <code className="text-red-400">{API_URL}</code>
              </div>
            </div>
          </div>
        </section>

        {/* Error Response Format */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Bug className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Error Response Format</h2>
          </div>
          
          <div className="space-y-6">
            <p className="text-gray-300">
              All API errors follow a consistent structure:
            </p>
            
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Error Response</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "workflow_name",
      "reason": "Required field missing"
    },
    "timestamp": "2024-01-15T10:35:00Z",
    "request_id": "req_123456789"
  }
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* HTTP Status Codes */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">HTTP Status Codes</h2>
          </div>
          
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Meaning</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Common Scenarios</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">400</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Bad Request</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Invalid input, malformed JSON</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">401</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Unauthorized</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Missing or invalid API key</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">403</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Forbidden</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Insufficient permissions</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">404</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Not Found</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Resource doesn't exist</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">422</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Unprocessable Entity</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Validation errors</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">429</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Too Many Requests</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Rate limit exceeded</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">500</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Internal Server Error</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Unexpected server error</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">502</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Bad Gateway</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Database connection issues</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm text-gray-300 font-mono">503</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Service Unavailable</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Maintenance mode</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Error Codes */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Zap className="w-6 h-6 text-red-400" />
              Error Codes
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Validation Errors */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Validation Errors</h3>
                  <p className="text-gray-400">Input data validation failures.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">422</span>
                  <code className="text-red-400 font-mono text-sm">VALIDATION_ERROR</code>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Example Response</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Input validation failed",
    "details": {
      "errors": [
        {
          "field": "workflow_name",
          "message": "Workflow name must be between 3 and 100 characters"
        },
        {
          "field": "steps",
          "message": "At least one step is required"
        }
      ]
    }
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Authentication Errors */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Authentication Errors</h3>
                  <p className="text-gray-400">API key or authentication failures.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">401</span>
                  <code className="text-red-400 font-mono text-sm">AUTHENTICATION_FAILED</code>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Example Response</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`{
  "error": {
    "code": "AUTHENTICATION_FAILED",
    "message": "Invalid API key",
    "details": {
      "hint": "Check your API key in the dashboard"
    }
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>

            {/* Rate Limit Errors */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Rate Limit Errors</h3>
                  <p className="text-gray-400">API rate limit exceeded.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs font-medium rounded">429</span>
                  <code className="text-red-400 font-mono text-sm">RATE_LIMIT_EXCEEDED</code>
                </div>
              </div>
              
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Example Response</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests",
    "details": {
      "limit": 1000,
      "window": "1 hour",
      "reset_time": "2024-01-15T11:00:00Z"
    }
  }
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Retry Strategy */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <RefreshCw className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Retry Strategy</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Automatic Retries</h3>
              <p className="text-gray-300 mb-4">
                Torqvio automatically retries failed requests with exponential backoff:
              </p>
              
              <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Attempt</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Delay</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Multiplier</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-300">1</td>
                      <td className="px-6 py-4 text-sm text-gray-300">1 second</td>
                      <td className="px-6 py-4 text-sm text-gray-300">1x</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-300">2</td>
                      <td className="px-6 py-4 text-sm text-gray-300">2 seconds</td>
                      <td className="px-6 py-4 text-sm text-gray-300">2x</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-300">3</td>
                      <td className="px-6 py-4 text-sm text-gray-300">4 seconds</td>
                      <td className="px-6 py-4 text-sm text-gray-300">2x</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-300">4</td>
                      <td className="px-6 py-4 text-sm text-gray-300">8 seconds</td>
                      <td className="px-6 py-4 text-sm text-gray-300">2x</td>
                    </tr>
                    <tr>
                      <td className="px-6 py-4 text-sm text-gray-300">5</td>
                      <td className="px-6 py-4 text-sm text-gray-300">16 seconds</td>
                      <td className="px-6 py-4 text-sm text-gray-300">2x</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                <h4 className="text-green-400 font-semibold mb-2">Retryable Errors</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 5xx errors: Server-side issues</li>
                  <li>• 429 errors: Rate limiting</li>
                  <li>• 408 errors: Request timeout</li>
                  <li>• 502/503/504 errors: Service unavailable</li>
                </ul>
              </div>
              
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <h4 className="text-red-400 font-semibold mb-2">Non-Retryable Errors</h4>
                <ul className="text-sm text-gray-300 space-y-1">
                  <li>• 4xx errors: Client-side issues (except 429)</li>
                  <li>• Validation errors: Invalid input data</li>
                  <li>• Authentication errors: Invalid credentials</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Error Handling Best Practices</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">1. Always Check HTTP Status</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`async function callTorqvio(endpoint, data) {
  const response = await fetch(\`\${API_URL}\${endpoint}\`, {
    method: 'POST',
    headers: {
      'Authorization': \`Bearer \${apiKey}\`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })

  if (!response.ok) {
    const error = await response.json()
    throw new TorqvioError(error)
  }

  return response.json()
}`}</code>
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">2. Implement Exponential Backoff</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`async function callWithRetry(endpoint, data, maxRetries = 5) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await callTorqvio(endpoint, data)
    } catch (error) {
      if (attempt === maxRetries || !error.isRetryable) {
        throw error
      }
      
      const delay = Math.pow(2, attempt - 1) * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
}`}</code>
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">3. Log Request IDs</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`try {
  const result = await callTorqvio('/workflows', data)
} catch (error) {
  console.error(\`Request failed: \${error.requestId}\`, error)
  // Send to your error tracking service
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Monitoring & Alerting */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-6 h-6 text-red-400" />
            <h2 className="text-2xl font-bold text-white">Monitoring & Alerting</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Error Metrics</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium mb-2">Error Rate</h4>
                  <p className="text-gray-300 text-sm">Percentage of failed requests</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium mb-2">Error Types</h4>
                  <p className="text-gray-300 text-sm">Distribution by error code</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium mb-2">Response Time</h4>
                  <p className="text-gray-300 text-sm">Latency for successful/failed requests</p>
                </div>
                <div className="bg-gray-800 rounded-lg p-4">
                  <h4 className="text-red-400 font-medium mb-2">Retry Success Rate</h4>
                  <p className="text-gray-300 text-sm">Percentage of successful retries</p>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold text-white mb-3">Health Check Endpoint</h3>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">cURL</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`curl -X GET ${API_URL}/health`}</code>
                  </pre>
                </div>
              </div>
              
              <div className="mt-4 bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Response</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`{
  "status": "healthy",
  "timestamp": "2024-01-15T10:35:00Z",
  "version": "v2.1.0",
  "database": "connected",
  "redis": "connected"
}`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white whitespace-nowrap">Continue Learning</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/webhooks"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Webhooks
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Learn about webhook events and error handling for real-time notifications.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                View Webhook Docs <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link
              href="/docs/rest-api"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  REST API
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Explore our REST API endpoints and comprehensive error handling.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                View API Docs <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </div>
        </section>

        {/* Support */}
        <section className="bg-gradient-to-r from-red-900/20 to-orange-900/20 rounded-xl p-8 border border-red-500/20">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
            <div>
              <h3 className="text-white font-semibold mb-2">Need Help?</h3>
              <p className="text-gray-300 text-sm mb-4">
                If you need assistance with error handling, we're here to help.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-red-400 hover:text-red-300 text-sm transition-colors">
                  Check Examples
                </Link>
                <Link href="#" className="text-red-400 hover:text-red-300 text-sm transition-colors">
                  Join Discord
                </Link>
                <Link href="#" className="text-red-400 hover:text-red-300 text-sm transition-colors">
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
