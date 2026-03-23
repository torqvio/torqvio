'use client'

import { motion } from 'framer-motion'
import { Code, Package, CheckCircle, AlertCircle, ArrowRight, Download, Rocket, Terminal, Zap, Shield } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# Client SDK

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
Official Torqvio client libraries for seamless integration with your applications.

## Installation

### Node.js / TypeScript
\`\`\`bash
npm install @torqvio/client
# or
yarn add @torqvio/client
# or
pnpm add @torqvio/client
\`\`\`

### Python
\`\`\`bash
pip install torqvio-client
\`\`\`

### Go
\`\`\`bash
go get github.com/torqvio/client-go
\`\`\`

## Initialization

### JavaScript/TypeScript
\`\`\`javascript
import { TorqvioClient } from '@torqvio/client'

// Uses environment variables automatically
const client = new TorqvioClient({
  apiKey: process.env.TORQVIO_API_KEY
})

// Or with explicit configuration
const client = new TorqvioClient({
  apiKey: process.env.TORQVIO_API_KEY,
  baseUrl: 'https://api.torqvio.com',
  timeout: 30000,
  retries: 3
})
\`\`\`

## Core Features
- ✅ Workflow Management - Create, update, and manage workflows
- ✅ Event Handling - Listen to and process workflow events in real-time
- ✅ Error Recovery - Built-in retry logic and automatic error handling
- ✅ Type Safety - Full TypeScript support with comprehensive type definitions

## Usage Examples

### Creating a Workflow
\`\`\`javascript
const workflow = await client.workflows.create({
  name: 'Order Processing',
  description: 'Process customer orders',
  steps: [
    {
      name: 'validate-order',
      type: 'function',
      config: { functionName: 'validateOrder' }
    },
    {
      name: 'process-payment',
      type: 'webhook',
      config: { url: 'https://api.payment.com/process' }
    }
  ]
})
\`\`\`

### Triggering a Workflow
\`\`\`javascript
const execution = await client.workflows.trigger(workflow.id, {
  orderId: '12345',
  customerId: '67890',
  amount: 99.99
})
\`\`\`

### Listening to Events
\`\`\`javascript
client.events.on('workflow.completed', (event) => {
  console.log('Workflow completed:', event.data)
})

client.events.on('workflow.failed', (event) => {
  console.error('Workflow failed:', event.error)
})
\`\`\`

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| apiKey | string | - | Your API key |
| baseUrl | string | process.env.NEXT_PUBLIC_API_URL | API base URL |
| timeout | number | 30000 | Request timeout in ms |
| retries | number | 3 | Number of retry attempts |

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function ClientSDKPage() {
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
            <span className="text-white">Client SDK</span>
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
            <Package className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Client SDK
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                Stable
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">10 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated 1 week ago</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Official Torqvio client libraries for seamless integration with your applications.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Installation */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Download className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Installation</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Node.js / TypeScript</span>
              </div>
              <div className="p-4 space-y-2">
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                  <code className="text-green-400">npm</code> install @torqvio/client
                </div>
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                  <code className="text-green-400">yarn</code> add @torqvio/client
                </div>
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                  <code className="text-green-400">pnpm</code> add @torqvio/client
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Python</span>
              </div>
              <div className="p-4">
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                  <code className="text-green-400">pip</code> install torqvio-client
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Go</span>
              </div>
              <div className="p-4">
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                  <code className="text-green-400">go</code> get github.com/torqvio/client-go
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Initialization */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Code className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Initialization</h2>
          </div>
          
          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
              <span className="text-xs text-gray-400 font-mono">JavaScript/TypeScript</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-gray-300">
                <code>{`import { TorqvioClient } from '@torqvio/client'

// Uses environment variables automatically
const client = new TorqvioClient({
  apiKey: process.env.TORQVIO_API_KEY
})

// Or with explicit configuration
const client = new TorqvioClient({
  apiKey: process.env.TORQVIO_API_KEY,
  baseUrl: 'https://api.torqvio.com',
  timeout: 30000,
  retries: 3
})`}</code>
              </pre>
            </div>
          </div>
        </section>

        {/* Core Features */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Core Features</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <CheckCircle className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Workflow Management</h3>
              <p className="text-gray-400 text-sm">
                Create, update, and manage workflows with simple API calls.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <CheckCircle className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Event Handling</h3>
              <p className="text-gray-400 text-sm">
                Listen to and process workflow events in real-time.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <CheckCircle className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Error Recovery</h3>
              <p className="text-gray-400 text-sm">
                Built-in retry logic and automatic error handling.
              </p>
            </div>

            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
              <CheckCircle className="w-6 h-6 text-emerald-400 mb-3" />
              <h3 className="text-lg font-semibold text-white mb-2">Type Safety</h3>
              <p className="text-gray-400 text-sm">
                Full TypeScript support with comprehensive type definitions.
              </p>
            </div>
          </div>
        </section>

        {/* Usage Examples */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white whitespace-nowrap">Usage Examples</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Creating a Workflow</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`const workflow = await client.workflows.create({
  name: 'Order Processing',
  description: 'Process customer orders',
  steps: [
    {
      name: 'validate-order',
      type: 'function',
      config: { functionName: 'validateOrder' }
    },
    {
      name: 'process-payment',
      type: 'webhook',
      config: { url: 'https://api.payment.com/process' }
    }
  ]
})`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Triggering a Workflow</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`const execution = await client.workflows.trigger(workflow.id, {
  orderId: '12345',
  customerId: '67890',
  amount: 99.99
})`}</code>
                </pre>
              </div>
            </div>
          </div>

          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Listening to Events</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`client.events.on('workflow.completed', (event) => {
  console.log('Workflow completed:', event.data)
})

client.events.on('workflow.failed', (event) => {
  console.error('Workflow failed:', event.error)
})`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Configuration Options</h2>
          </div>
          
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Option</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Default</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-purple-400">apiKey</td>
                  <td className="px-6 py-4 text-sm text-gray-300">string</td>
                  <td className="px-6 py-4 text-sm text-gray-400">-</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Your API key</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-purple-400">baseUrl</td>
                  <td className="px-6 py-4 text-sm text-gray-300">string</td>
                  <td className="px-6 py-4 text-sm text-gray-400">process.env.NEXT_PUBLIC_API_URL</td>
                  <td className="px-6 py-4 text-sm text-gray-300">API base URL</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-purple-400">timeout</td>
                  <td className="px-6 py-4 text-sm text-gray-300">number</td>
                  <td className="px-6 py-4 text-sm text-gray-400">30000</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Request timeout in ms</td>
                </tr>
                <tr>
                  <td className="px-6 py-4 text-sm font-mono text-purple-400">retries</td>
                  <td className="px-6 py-4 text-sm text-gray-300">number</td>
                  <td className="px-6 py-4 text-sm text-gray-400">3</td>
                  <td className="px-6 py-4 text-sm text-gray-300">Number of retry attempts</td>
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
              href="/docs/rest-api"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  REST API Reference
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Explore the complete REST API documentation.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                View API Docs <ArrowRight className="w-4 h-4 ml-1" />
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
                If you need assistance with the client SDK, we're here to help.
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
