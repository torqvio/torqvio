'use client'

import { motion } from 'framer-motion'
import { Globe, Code, CheckCircle, ArrowRight, Copy, Play, Terminal, Shield, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8459'

const MARKDOWN_CONTENT = `# REST API

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
Complete REST API reference for integrating with Torqvio programmatically.

## Base URL

### Development
\`\`\`
${API_URL}
\`\`\`

## Authentication

### API Key Authentication
All API requests must include your API key in the Authorization header:

\`\`\`
Authorization: Bearer your_api_key_here
\`\`\`

### Example Request
\`\`\`bash
curl -X GET ${API_URL}/api/v1/workflows \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json"
\`\`\`

## Workflows Endpoints

### Create Workflow
\`\`\`bash
curl -X POST ${API_URL}/api/v1/flows \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Order Processing",
    "definition": {
      "id": "order-processing",
      "steps": [
        {
          "name": "validate-order",
          "handler": "async (input) => { return { valid: true }; }"
        }
      ]
    }
  }'
\`\`\`

### Execute Workflow
\`\`\`bash
curl -X POST ${API_URL}/api/v1/flows/{id}/execute \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": {
      "orderId": "12345",
      "customerId": "67890"
    }
  }'
\`\`\`

## Error Handling

| Status Code | Error Type | Description |
|-------------|------------|-------------|
| 401 | Unauthorized | Invalid API key |
| 400 | Bad Request | Missing required field |
| 404 | Not Found | Workflow not found |
| 429 | Rate Limited | Too many requests |

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function RestAPIPage() {
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
            <span className="text-white">REST API</span>
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
            <Terminal className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              REST API
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
          Complete REST API reference for integrating with Torqvio programmatically.
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
                  <code className="text-gray-300">Authorization: Bearer your_api_key_here</code>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Example Request</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`curl -X GET ${API_URL}/api/v1/workflows \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json"`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Workflows Endpoints */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Code className="w-6 h-6 text-purple-400" />
              Workflows
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Create Workflow */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Create Workflow</h3>
                  <p className="text-gray-400">Start a new automation workflow.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">POST</span>
                  <code className="text-purple-400 font-mono text-sm">/api/v1/flows</code>
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
  "name": "Order Processing",
  "definition": {
    "id": "order-processing",
    "steps": [
      {
        "name": "validate-order",
        "handler": "async (input) => { return { valid: true }; }"
      }
    ]
  }
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
                      <code>{`curl -X POST ${API_URL}/api/v1/flows \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Order Processing",
    "definition": {
      "id": "order-processing",
      "steps": [
        {
          "name": "validate-order",
          "handler": "async (input) => { return { valid: true }; }"
        }
      ]
    }
  }'`}</code>
                    </pre>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-mono">Response</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/30">201</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`{
  "id": "wf_123",
  "name": "Order Processing",
  "status": "active",
  "created_at": "2024-01-15T10:30:00Z",
  "definition": {
    "id": "order-processing",
    "steps": [...]
  }
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Execute Workflow */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Execute Workflow</h3>
                  <p className="text-gray-400">Run a workflow with input data.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">POST</span>
                  <code className="text-purple-400 font-mono text-sm">/api/v1/flows/{'{id}'}/execute</code>
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
  "payload": {
    "orderId": "12345",
    "customerId": "67890"
  }
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
                      <code>{`curl -X POST ${API_URL}/api/v1/flows/wf_123/execute \\
  -H "Authorization: Bearer your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "payload": {
      "orderId": "12345",
      "customerId": "67890"
    }
  }'`}</code>
                    </pre>
                  </div>
                </div>
                
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center justify-between">
                    <span className="text-xs text-gray-400 font-mono">Response</span>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded border border-emerald-500/30">200</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`{
  "execution_id": "exec_456",
  "status": "running",
  "started_at": "2024-01-15T10:35:00Z",
  "workflow_id": "wf_123"
}`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Error Handling */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <AlertCircle className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Error Handling</h2>
          </div>
          
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status Code</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Error Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">401</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-red-400">Unauthorized</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Invalid API key</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">400</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-yellow-400">Bad Request</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Missing required field</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">404</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-yellow-400">Not Found</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Workflow not found</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">429</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-red-400">Rate Limited</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Too many requests</td>
                </tr>
              </tbody>
            </table>
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
              href="/docs/client-sdk"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Code className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Client SDK
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Use our official client libraries for easier integration.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                View SDK Docs <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link
              href="/docs/error-handling"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Error Handling
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Learn about error handling best practices.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                View Guides <ArrowRight className="w-4 h-4 ml-1" />
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
                If you need assistance with the REST API, we're here to help.
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
