'use client'

import { motion } from 'framer-motion'
import { Code, Play, CheckCircle, Terminal, Rocket, ArrowRight, RefreshCw, Eye, Zap, Shield } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# Your First Workflow

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
A workflow in Torqvio is a sequence of steps that execute reliably, even if failures occur. Each step can retry independently, and the entire workflow can resume from where it left off.

## Step 1: Create Workflow File
### workflows/user-onboarding.js
\`\`\`javascript
import { workflow } from '@torqvio/core'

export default workflow('user-onboarding', {
  createAccount: {
    handler: async (input) => {
      console.log('Creating account for:', input.email)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        userId: 'user_' + Math.random().toString(36).substr(2, 9),
        email: input.email,
        status: 'created'
      }
    },
    retries: 3,
    timeout: 30000
  },
  
  sendWelcomeEmail: {
    handler: async (input, context) => {
      const { userId, email } = context.results.createAccount
      console.log('Sending welcome email to:', email)
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        emailId: 'email_' + Math.random().toString(36).substr(2, 9),
        sent: true
      }
    },
    retries: 5,
    timeout: 60000
  },
  
  createProfile: {
    handler: async (input, context) => {
      const { userId } = context.results.createAccount
      console.log('Creating profile for user:', userId)
      await new Promise(resolve => setTimeout(resolve, 800))
      return {
        profileId: 'profile_' + Math.random().toString(36).substr(2, 9),
        userId,
        preferences: {
          theme: 'dark',
          notifications: true
        }
      }
    },
    retries: 2,
    timeout: 20000
  }
})
\`\`\`

## Step 2: Register Workflow
### index.js
\`\`\`javascript
import { Torqvio } from '@torqvio/core'
import userOnboarding from './workflows/user-onboarding'

const aether = new Torqvio({
  database: {
    url: process.env.DATABASE_URL
  }
})

aether.register(userOnboarding)
await aether.start()
console.log('Torqvio server running on port 8459')
\`\`\`

## Step 3: Execute Workflow
### REST API
\`\`\`bash
curl -X POST http://localhost:8459/api/workflows/execute \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflowId": "user-onboarding",
    "input": {
      "email": "user@example.com"
    }
  }'
\`\`\`

### JavaScript SDK
\`\`\`javascript
import { TorqvioClient } from '@torqvio/client'

const client = new TorqvioClient({
  baseUrl: 'http://localhost:8459',
  apiKey: 'your-api-key'
})

const execution = await client.execute('user-onboarding', {
  email: 'user@example.com'
})

console.log('Workflow execution ID:', execution.id)
\`\`\`

## Step 4: Monitor Workflow
Visit the dashboard to monitor execution:
http://localhost:8459/dashboard/executions

## Key Features
- ✅ Durable - Workflows survive server restarts
- ✅ Retry Logic - Failed steps automatically retry  
- ✅ Observable - Monitor execution in real-time
- ✅ Scalable - Handle thousands of concurrent workflows

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function FirstWorkflowPage() {
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
            <span className="text-white">Your First Workflow</span>
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
            <Code className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Your First Workflow
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                beginner
              </span>
              <span className="text-gray-400">15 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated 2 days ago</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Build and deploy your first durable workflow with Torqvio. Learn the core concepts and patterns.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Overview */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <h2 className="text-2xl font-bold text-white mb-6">Understanding Workflows</h2>
          <p className="text-gray-300 mb-6">
            A workflow in Torqvio is a sequence of steps that execute reliably, even if failures occur. 
            Each step can retry independently, and the entire workflow can resume from where it left off.
          </p>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <pre className="text-sm font-mono text-gray-300 text-center">
              <code>{`Workflow → Step 1 → Step 2 → Step 3 → Complete
    ↑         ↑        ↑        ↑
  Retry    Retry    Retry    Retry`}</code>
            </pre>
          </div>
        </section>

        {/* Steps */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white whitespace-nowrap">Tutorial Steps</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>

          {/* Step 1 */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-white">Create Your Workflow File</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Create a workflow file that handles user onboarding with three steps: creating an account, sending a welcome email, and creating a user profile.
            </p>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">workflows/user-onboarding.js</span>
              </div>
              <div className="p-4 overflow-x-auto max-h-80 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`import { workflow } from '@torqvio/core'

export default workflow('user-onboarding', {
  createAccount: {
    handler: async (input) => {
      console.log('Creating account for:', input.email)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return {
        userId: 'user_' + Math.random().toString(36).substr(2, 9),
        email: input.email,
        status: 'created'
      }
    },
    retries: 3,
    timeout: 30000
  },
  
  sendWelcomeEmail: {
    handler: async (input, context) => {
      const { userId, email } = context.results.createAccount
      console.log('Sending welcome email to:', email)
      await new Promise(resolve => setTimeout(resolve, 500))
      return {
        emailId: 'email_' + Math.random().toString(36).substr(2, 9),
        sent: true
      }
    },
    retries: 5,
    timeout: 60000
  },
  
  createProfile: {
    handler: async (input, context) => {
      const { userId } = context.results.createAccount
      console.log('Creating profile for user:', userId)
      await new Promise(resolve => setTimeout(resolve, 800))
      return {
        profileId: 'profile_' + Math.random().toString(36).substr(2, 9),
        userId,
        preferences: { theme: 'dark', notifications: true }
      }
    },
    retries: 2,
    timeout: 20000
  }
})`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold text-white">Register the Workflow</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Register your workflow with the Torqvio instance and start the server.
            </p>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">index.js</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`import { Torqvio } from '@torqvio/core'
import userOnboarding from './workflows/user-onboarding'

const aether = new Torqvio({
  database: {
    url: process.env.DATABASE_URL
  }
})

aether.register(userOnboarding)
await aether.start()
console.log('Torqvio server running on port 8459')`}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold text-white">Execute Your Workflow</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Execute your workflow using REST API or JavaScript SDK. You'll receive an execution ID to track progress.
            </p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">REST API</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`curl -X POST http://localhost:8459/api/workflows/execute \\
  -H "Content-Type: application/json" \\
  -d '{
    "workflowId": "user-onboarding",
    "input": {
      "email": "user@example.com"
    }
  }'`}</code>
                  </pre>
                </div>
              </div>
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">JavaScript SDK</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`import { TorqvioClient } from '@torqvio/client'

const client = new TorqvioClient({
  baseUrl: 'http://localhost:8459',
  apiKey: 'your-api-key'
})

const execution = await client.execute('user-onboarding', {
  email: 'user@example.com'
})

console.log('Execution ID:', execution.id)`}</code>
                  </pre>
                </div>
              </div>
            </div>
            <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-800/50">
              <p className="text-sm text-purple-300">
                <strong>What happens next:</strong> The workflow will start executing automatically. You'll receive an execution ID that you can use to monitor the progress in the dashboard or via API calls.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold text-white">Monitor Your Workflow</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Visit the Torqvio dashboard to monitor your workflow execution in real-time.
            </p>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <Terminal className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <pre className="text-sm font-mono text-purple-400">
                  <code>http://localhost:7243/dashboard/executions</code>
                </pre>
              </div>
            </div>
            <p className="text-gray-300 mt-4">
              View step status, retry attempts, and any errors that occurred during execution.
            </p>
          </div>
        </section>

        {/* Success */}
        <section className="bg-emerald-900/20 rounded-xl p-8 border border-emerald-800/50">
          <div className="flex items-center gap-4 mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Congratulations!</h2>
          </div>
          <p className="text-gray-300 mb-6">
            You've successfully created and deployed your first durable workflow! 
            Your workflow will automatically retry failed steps and can resume from any point.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-white">Durable</h4>
              </div>
              <p className="text-sm text-gray-400">Workflows survive server restarts</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <RefreshCw className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-white">Retry Logic</h4>
              </div>
              <p className="text-sm text-gray-400">Failed steps automatically retry</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Eye className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-white">Observable</h4>
              </div>
              <p className="text-sm text-gray-400">Monitor execution in real-time</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-white">Scalable</h4>
              </div>
              <p className="text-sm text-gray-400">Handle thousands of concurrent workflows</p>
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
              href="/docs/api-reference"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  API Reference
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Explore all available APIs and SDKs for building powerful workflows.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                View API Docs <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link
              href="/docs/guides"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Rocket className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Advanced Guides
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Learn advanced patterns and best practices for production workflows.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                View Guides <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
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
