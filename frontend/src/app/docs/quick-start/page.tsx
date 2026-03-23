'use client'

import { motion } from 'framer-motion'
import { Play, CheckCircle, Terminal, ArrowRight, Zap, Shield, Rocket } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8459'

const MARKDOWN_CONTENT = `# Quick Start Guide

> 🚀 **Get started in 5 minutes** - Create your first Torqvio workflow and see durable automation in action.

## Overview
Torqvio is a durable workflow engine that handles failures automatically. Focus on your business logic, let us handle the reliability.

## Quick Commands
Start server: \`npm run dev\`
Create workflow: POST \`/api/v1/flows\`
Execute workflow: POST \`/api/v1/flows/{id}/execute\`
Track: Visit \`/dashboard/executions\`

## Key Benefits
- ✅ Zero Downtime - Workflows survive server restarts
- ✅ Auto Retry - Failed steps retry automatically  
- ✅ Real-time Tracking - Monitor execution live
- ✅ 5-minute Setup - From zero to running workflows

---

© ${new Date().getFullYear()} Torqvio. Built for reliability.`

export default function QuickStartPage() {
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
            <span className="text-white">Quick Start</span>
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
            <Rocket className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Quick Start
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                beginner
              </span>
              <span className="text-gray-400">5 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated today</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Get up and running with Torqvio in just 5 minutes. Create reliable workflows that never fail.
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
          <h2 className="text-2xl font-bold text-white mb-6">Why Torqvio?</h2>
          <p className="text-gray-300 mb-6">
            Stop worrying about failed automation. Torqvio handles failures automatically so your workflows always complete successfully.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">100%</div>
              <div className="text-sm text-gray-400">Reliability</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-emerald-400 mb-1">5min</div>
              <div className="text-sm text-gray-400">Setup Time</div>
            </div>
            <div className="bg-gray-800 rounded-xl p-4 border border-gray-700 text-center">
              <div className="text-2xl font-bold text-blue-400 mb-1">∞</div>
              <div className="text-sm text-gray-400">Retries</div>
            </div>
          </div>
        </section>

        {/* Steps */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white whitespace-nowrap">Get Started</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>

          {/* Step 1 */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold text-white">Start the Server</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Launch the Torqvio development server to begin building workflows.
            </p>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">terminal</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`npm run dev`}</code>
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
              <h3 className="text-xl font-semibold text-white">Create Your First Workflow</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Send a POST request to create a simple workflow that welcomes users.
            </p>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">cURL</span>
              </div>
              <div className="p-4 overflow-x-auto max-h-60 overflow-y-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`curl -X POST ${API_URL}/api/v1/flows \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Welcome Flow",
    "definition": {
      "id": "welcome-flow",
      "steps": [
        {
          "name": "send-welcome",
          "handler": "async (input) => { console.log("Welcome to Torqvio!"); return { success: true }; }"
        }
      ]
    }
  }'`}</code>
                </pre>
              </div>
            </div>
            <div className="mt-4 p-4 bg-emerald-900/20 rounded-lg border border-emerald-800/50">
              <p className="text-sm text-emerald-300">
                <strong>Expected Response:</strong> HTTP 201 with workflow ID and status
              </p>
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
              Run the workflow you just created using a simple API call.
            </p>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">cURL</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`curl -X POST ${API_URL}/api/v1/flows/welcome-flow/execute \\
  -H "Content-Type: application/json" \\
  -d '{"payload": {}}'`}</code>
                </pre>
              </div>
            </div>
            <div className="mt-4 p-4 bg-purple-900/20 rounded-lg border border-purple-800/50">
              <p className="text-sm text-purple-300">
                <strong>What happens:</strong> Your workflow starts executing and you'll receive an execution ID to track progress.
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center text-sm font-bold">
                4
              </div>
              <h3 className="text-xl font-semibold text-white">Track Execution</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Watch your workflow run live and see detailed execution metrics.
            </p>
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <div className="text-center">
                <Terminal className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                <pre className="text-sm font-mono text-purple-400">
                  <code>{API_URL}/dashboard/executions</code>
                </pre>
              </div>
            </div>
            <p className="text-gray-300 mt-4">
              See real-time status, execution logs, and performance metrics.
            </p>
          </div>
        </section>

        {/* Success */}
        <section className="bg-emerald-900/20 rounded-xl p-8 border border-emerald-800/50">
          <div className="flex items-center gap-4 mb-6">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
            <h2 className="text-2xl font-bold text-white">Success!</h2>
          </div>
          <p className="text-gray-300 mb-6">
            You've successfully created and executed your first Torqvio workflow! 
            Your automation is now running with bulletproof reliability.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-white">Zero Downtime</h4>
              </div>
              <p className="text-sm text-gray-400">Workflows survive any server restarts</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-emerald-400" />
                <h4 className="font-semibold text-white">Lightning Fast</h4>
              </div>
              <p className="text-sm text-gray-400">From zero to production in 5 minutes</p>
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
                  <Play className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Your First Workflow
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Build a complete workflow with multiple steps and learn advanced patterns.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                View Tutorial <ArrowRight className="w-4 h-4 ml-1" />
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
                  REST API Reference
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Explore all available API endpoints for building powerful workflows.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                View API Docs <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>
          </div>
        </section>
      </motion.div>
    </DocsPageWrapper>
  )
}
