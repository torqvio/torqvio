'use client'

import { motion } from 'framer-motion'
import { Settings, Database, Server, CheckCircle, Copy, Terminal, Shield } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# Torqvio Configuration Guide

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Configuration Overview
Configure your Torqvio instance for optimal performance and reliability in production environments.

## Environment Variables
Create a \`.env\` file in your backend directory:

\`\`\`bash
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/torqvio
DATABASE_POOL_SIZE=10

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=8459
NODE_ENV=development

# Security
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
NEXTAUTH_SECRET=your_nextauth_secret_key_min_32_chars
API_KEY_SECRET=your_super_secret_api_key_min_32_chars
\`\`\`

## Database Setup
\`\`\`bash
# Create database
createdb torqvio

# Run migrations (from backend directory)
cd backend && npm run db:migrate

# Seed data (optional)
cd backend && npm run db:seed
\`\`\`

## Server Configuration
Torqvio automatically loads configuration from environment variables and the internal config file. The main settings are:

\`\`\`javascript
// Server settings are loaded from:
// - process.env.PORT (default: 8459)
// - process.env.CORS_ORIGIN (default: http://localhost:7243)
// - process.env.LOG_LEVEL (default: info)

// Database pool settings:
// - min: 2 connections
// - max: 10 connections  
// - idleTimeoutMillis: 10000ms
// - allowExitOnIdle: true (Neon® compatible)

// Workflow settings:
// - timeout: 300000ms (5 minutes)
// - retries: 3 attempts
// - backoff: exponential
\`\`\`

## Production Checklist
- Set strong JWT_SECRET and API_KEY_SECRET
- Configure production database with connection pooling
- Set up Redis for caching and session storage
- Configure proper CORS origins
- Enable logging and monitoring

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function ConfigurationPage() {
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
            <span className="text-white">Configuration</span>
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
            <Settings className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Configuration
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                beginner
              </span>
              <span className="text-gray-400">8 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated 2 days ago</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Configure your Torqvio instance for optimal performance and reliability in production environments.
        </p>
      </motion.header>

        {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-12"
      >
        {/* Configuration CTA */}
        <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-12 border border-purple-800/50">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-4">Ready to configure?</h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">Follow this comprehensive guide to set up your Torqvio instance for production use.</p>
            <Link
              href="/docs/quick-start"
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold text-lg transition-all hover:from-purple-700 hover:to-purple-800 hover:shadow-xl hover:shadow-purple-500/25 transform hover:scale-105"
            >
              <Terminal className="w-5 h-5" />
              Quick Start
              <div className="w-0 group-hover:w-5 h-5 overflow-hidden transition-all flex items-center justify-center">
                →
              </div>
            </Link>
          </div>
        </div>

        {/* Configuration Sections */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3 space-y-8">
            <div className="flex items-center gap-4 mb-8">
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
              <h2 className="text-3xl font-bold text-white whitespace-nowrap">Configuration Steps</h2>
              <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            </div>
          
            {/* Step 1: Environment Variables */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <h3 className="text-xl font-semibold text-white">Environment Variables</h3>
              </div>
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700/50 overflow-hidden mb-4">
                <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">.env</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/torqvio
DATABASE_POOL_SIZE=10

# Redis Configuration (Optional)
REDIS_URL=redis://localhost:6379

# Server Configuration
PORT=8459
NODE_ENV=development

# Security
JWT_SECRET=your-secret-key
API_KEY_SECRET=your-api-secret`}</code>
                  </pre>
                </div>
              </div>
              <p className="text-gray-300">
                Configure essential environment variables for your Torqvio instance. Create a <code className="text-purple-400 bg-purple-900/20 px-1 rounded">.env</code> file in your backend directory.
              </p>
            </div>

            {/* Step 2: Database Setup */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <h3 className="text-xl font-semibold text-white">Database Setup</h3>
              </div>
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700/50 overflow-hidden mb-4">
                <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">terminal</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Create database
createdb torqvio

# Run migrations
npx torqvio migrate

# Seed data (optional)
npx torqvio seed`}</code>
                  </pre>
                </div>
              </div>
              <p className="text-gray-300">
                Torqvio uses PostgreSQL as its primary database. Set up the database and run migrations to create the required tables.
              </p>
            </div>

            {/* Step 3: Server Configuration */}
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <h3 className="text-xl font-semibold text-white">Server Configuration</h3>
              </div>
              <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl border border-gray-700/50 overflow-hidden mb-4">
                <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">torqvio.config.js</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`module.exports = {
  server: {
    port: process.env.PORT || 8459,
    host: '0.0.0.0',
    cors: {
      origin: ['http://localhost:3000'],
      credentials: true
    }
  },
  
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10,
      idleTimeoutMillis: 10000
    }
  },
  
  redis: {
    url: process.env.REDIS_URL,
    keyPrefix: 'torqvio:'
  },
  
  workflows: {
    timeout: 300000, // 5 minutes
    retries: 3,
    backoff: 'exponential'
  }
}`}</code>
                  </pre>
                </div>
              </div>
              <p className="text-gray-300">
                Fine-tune server settings, database connections, and workflow behavior. Create an <code className="text-purple-400 bg-purple-900/20 px-1 rounded">torqvio.config.js</code> file in your backend directory.
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                <h3 className="font-semibold text-white mb-4">Progress</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Environment variables</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Database setup</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm text-gray-300">Server configuration</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

          {/* Production Checklist */}
          <section className="bg-emerald-900/20 rounded-xl p-8 border border-emerald-800/50">
            <div className="flex items-center gap-4 mb-6">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
              <h2 className="text-2xl font-bold text-white">Production Checklist</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300">Set strong JWT_SECRET and API_KEY_SECRET</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300">Configure production database with connection pooling</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300">Set up Redis for caching and session storage</span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300">Configure proper CORS origins</span>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-gray-300">Enable logging and monitoring</span>
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
                href="/docs/first-workflow"
                className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                    <Terminal className="w-5 h-5 text-purple-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                    Build Your First Workflow
                  </h3>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  Create and deploy your first durable workflow with step-by-step guidance.
                </p>
                <div className="flex items-center text-purple-400 text-sm font-medium">
                  Get Started →
                </div>
              </Link>

              <Link
                href="/docs/api-reference"
                className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                    API Reference
                  </h3>
                </div>
                <p className="text-gray-300 text-sm mb-3">
                  Complete API documentation for all endpoints and data structures.
                </p>
                <div className="flex items-center text-blue-400 text-sm font-medium">
                  View API →
                </div>
              </Link>
            </div>
          </section>
        </motion.div>

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
      </DocsPageWrapper>
    )
  }
