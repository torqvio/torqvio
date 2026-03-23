'use client'

import { motion } from 'framer-motion'
import { Globe, Code, CheckCircle, ArrowRight, Terminal, Shield, AlertCircle, Zap, Clock, Settings, Layers, Play, Pause, StopCircle, RefreshCw, List } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8459'

const MARKDOWN_CONTENT = `# Batch Jobs

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
Batch jobs allow you to process large volumes of work reliably using Torqvio's durable execution engine. Each item in the batch maps to a flow execution. Jobs support concurrency control, per-item retries, pause/resume, and real-time progress tracking.

## Base URL

### Development
\`\`\`
${API_URL}
\`\`\`

## Authentication
All batch job endpoints require an API key. Pass it via the \`X-API-Key\` header or as a Bearer token:

\`\`\`
X-API-Key: your_api_key_here
\`\`\`

\`\`\`
Authorization: Bearer your_api_key_here
\`\`\`

## Create a Batch Job

\`\`\`
POST /api/v1/batch-jobs
\`\`\`

### Request Body
\`\`\`json
{
  "name": "nightly-invoice-processing",
  "flow_id": "uuid-of-your-flow",
  "items": [
    { "id": "inv_001", "customer": "acme" },
    { "id": "inv_002", "customer": "globex" }
  ],
  "concurrency": 5,
  "retry_policy": {
    "max_attempts": 3,
    "backoff": "exponential",
    "initial_delay_ms": 1000,
    "max_delay_ms": 60000
  },
  "scheduled_at": "2024-01-16T02:00:00Z"
}
\`\`\`

### Fields
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✓ | Human-readable name for this batch run |
| flow_id | UUID | ✓ | ID of the flow to execute for each item |
| items | array | ✓ | Array of JSON objects — each becomes the flow's input payload |
| concurrency | integer | | Parallel item limit (1–100, default: 5) |
| retry_policy | object | | Per-item retry config (see Retry Policy section) |
| scheduled_at | ISO 8601 | | Defer start; omit to start immediately |

### cURL
\`\`\`bash
curl -X POST ${API_URL}/api/v1/batch-jobs \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "nightly-invoice-processing",
    "flow_id": "uuid-of-your-flow",
    "items": [
      { "id": "inv_001", "customer": "acme" },
      { "id": "inv_002", "customer": "globex" }
    ],
    "concurrency": 5
  }'
\`\`\`

### Response — 201 Created
\`\`\`json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "project_id": "proj_abc",
  "name": "nightly-invoice-processing",
  "flow_id": "uuid-of-your-flow",
  "status": "queued",
  "concurrency": 5,
  "total_items": 2,
  "completed_items": 0,
  "failed_items": 0,
  "skipped_items": 0,
  "retry_policy": {
    "max_attempts": 3,
    "backoff": "exponential",
    "initial_delay_ms": 1000,
    "max_delay_ms": 60000
  },
  "scheduled_at": null,
  "started_at": null,
  "completed_at": null,
  "created_at": "2024-01-15T23:00:00Z",
  "updated_at": "2024-01-15T23:00:00Z"
}
\`\`\`

## List Batch Jobs

\`\`\`bash
curl -X GET "${API_URL}/api/v1/batch-jobs?status=running&page=1&limit=20" \\
  -H "X-API-Key: your_api_key_here"
\`\`\`

### Query Parameters
| Parameter | Type | Description |
|-----------|------|-------------|
| status | string | Filter by status: queued, running, paused, completed, failed, cancelled |
| page | integer | Page number (default: 1) |
| limit | integer | Items per page (default: 20, max: 100) |

### Response
\`\`\`json
{
  "data": [...],
  "pagination": { "page": 1, "limit": 20, "count": 3 }
}
\`\`\`

## Get Batch Job Status

\`\`\`bash
curl -X GET ${API_URL}/api/v1/batch-jobs/{id} \\
  -H "X-API-Key: your_api_key_here"
\`\`\`

### Response
\`\`\`json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "running",
  "total_items": 1000,
  "completed_items": 432,
  "failed_items": 3,
  "skipped_items": 0,
  "progress_percent": 43.5,
  "started_at": "2024-01-16T02:00:00Z",
  "completed_at": null
}
\`\`\`

## List Batch Job Items

\`\`\`bash
curl -X GET "${API_URL}/api/v1/batch-jobs/{id}/items?status=failed&page=1&limit=50" \\
  -H "X-API-Key: your_api_key_here"
\`\`\`

Returns the individual items and their execution status, execution_id link, attempt count, and any error details.

## Control Endpoints

### Pause
\`\`\`bash
curl -X POST ${API_URL}/api/v1/batch-jobs/{id}/pause \\
  -H "X-API-Key: your_api_key_here"
\`\`\`

### Resume
\`\`\`bash
curl -X POST ${API_URL}/api/v1/batch-jobs/{id}/resume \\
  -H "X-API-Key: your_api_key_here"
\`\`\`

### Cancel
\`\`\`bash
curl -X POST ${API_URL}/api/v1/batch-jobs/{id}/cancel \\
  -H "X-API-Key: your_api_key_here"
\`\`\`

### Retry Failed Items
\`\`\`bash
curl -X POST ${API_URL}/api/v1/batch-jobs/{id}/retry \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{ "failed_only": true }'
\`\`\`

Pass \`"failed_only": false\` to reset all non-completed items.

## Job Status Values

| Status | Description |
|--------|-------------|
| queued | Job is waiting to start |
| running | Job is actively processing items |
| paused | Job has been paused by the user |
| completed | All items finished (check failed_items count) |
| failed | All items failed — no completions |
| cancelled | Job was manually cancelled |

## Retry Policy

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| max_attempts | integer | 3 | Maximum retries per item |
| backoff | string | exponential | Strategy: linear, exponential, fixed |
| initial_delay_ms | integer | 1000 | First retry delay (ms) |
| max_delay_ms | integer | 60000 | Maximum delay cap (ms) |

## Best Practices

- Use \`flow_id\` (not workflow_id) — this is the ID from \`GET /api/v1/flows\`
- Set concurrency based on your downstream system's throughput capacity
- Use \`scheduled_at\` to run heavy batch jobs during off-peak hours
- Always check \`failed_items\` after completion, not just \`status\`
- Use exponential backoff in retry_policy for transient errors
- Break very large batches (>100k items) into smaller sub-batches

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function BatchJobsPage() {
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
            <span className="text-gray-400">Guides</span>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="text-white">Batch Jobs</span>
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
            <Layers className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Batch Jobs
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
              <span className="text-gray-400">Updated today</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Process large volumes of work reliably with Torqvio's durable batch execution engine — with built-in retries, concurrency control, and real-time progress tracking.
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
          <p className="text-gray-400 mb-4 text-sm">Pass your API key via either header. Both are accepted.</p>
          <div className="space-y-3">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-medium">Preferred</span>
                <span className="text-xs text-gray-400 font-mono">X-API-Key header</span>
              </div>
              <div className="p-4">
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                  <code className="text-gray-300">X-API-Key: your_api_key_here</code>
                </div>
              </div>
            </div>
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Authorization: Bearer</span>
              </div>
              <div className="p-4">
                <div className="bg-gray-900 rounded-lg p-3 font-mono text-sm">
                  <code className="text-gray-300">Authorization: Bearer your_api_key_here</code>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Endpoints header */}
        <div className="flex items-center gap-4">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
            <Zap className="w-6 h-6 text-purple-400" />
            Endpoints
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
        </div>

        {/* Create Batch Job */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Create a Batch Job</h3>
              <p className="text-gray-400">Submit a batch of items to be processed by a flow. Starts immediately unless <code className="text-purple-300 text-xs">scheduled_at</code> is set.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">POST</span>
              <code className="text-purple-400 font-mono text-sm">/api/v1/batch-jobs</code>
            </div>
          </div>

          <div className="space-y-4">
            {/* Request body */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Request Body</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300"><code>{`{
  "name": "nightly-invoice-processing",
  "flow_id": "uuid-of-your-flow",
  "items": [
    { "id": "inv_001", "customer": "acme" },
    { "id": "inv_002", "customer": "globex" }
  ],
  "concurrency": 5,
  "retry_policy": {
    "max_attempts": 3,
    "backoff": "exponential",
    "initial_delay_ms": 1000,
    "max_delay_ms": 60000
  },
  "scheduled_at": "2024-01-16T02:00:00Z"
}`}</code></pre>
              </div>
            </div>

            {/* Fields table */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Fields</span>
              </div>
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Field</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Req</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {[
                    { field: 'name', type: 'string', req: '✓', desc: 'Human-readable name for this batch run' },
                    { field: 'flow_id', type: 'UUID', req: '✓', desc: 'ID of the flow to execute for each item' },
                    { field: 'items', type: 'array', req: '✓', desc: 'JSON objects — each becomes the flow\'s input payload' },
                    { field: 'concurrency', type: 'integer', req: '', desc: 'Parallel item limit (1–100, default: 5)' },
                    { field: 'retry_policy', type: 'object', req: '', desc: 'Per-item retry config (see Retry Policy section)' },
                    { field: 'scheduled_at', type: 'ISO 8601', req: '', desc: 'Defer start; omit to start immediately' },
                  ].map(({ field, type, req, desc }) => (
                    <tr key={field}>
                      <td className="px-4 py-3 text-sm font-mono text-purple-400">{field}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{type}</td>
                      <td className="px-4 py-3 text-sm text-emerald-400">{req}</td>
                      <td className="px-4 py-3 text-sm text-gray-300">{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* cURL */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">cURL</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300"><code>{`curl -X POST ${API_URL}/api/v1/batch-jobs \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "nightly-invoice-processing",
    "flow_id": "uuid-of-your-flow",
    "items": [
      { "id": "inv_001", "customer": "acme" },
      { "id": "inv_002", "customer": "globex" }
    ],
    "concurrency": 5
  }'`}</code></pre>
              </div>
            </div>

            {/* Response */}
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600 flex items-center gap-2">
                <span className="text-xs text-emerald-400 font-medium">201 Created</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300"><code>{`{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "project_id": "proj_abc",
  "name": "nightly-invoice-processing",
  "flow_id": "uuid-of-your-flow",
  "status": "queued",
  "concurrency": 5,
  "total_items": 2,
  "completed_items": 0,
  "failed_items": 0,
  "skipped_items": 0,
  "retry_policy": { "max_attempts": 3, "backoff": "exponential",
                    "initial_delay_ms": 1000, "max_delay_ms": 60000 },
  "scheduled_at": null,
  "started_at": null,
  "completed_at": null,
  "created_at": "2024-01-15T23:00:00Z",
  "updated_at": "2024-01-15T23:00:00Z"
}`}</code></pre>
              </div>
            </div>
          </div>
        </section>

        {/* List Batch Jobs */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">List Batch Jobs</h3>
              <p className="text-gray-400">Retrieve a paginated list of batch jobs for your project.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">GET</span>
              <code className="text-purple-400 font-mono text-sm">/api/v1/batch-jobs</code>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Query Parameters</span>
              </div>
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Parameter</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-purple-400">status</td>
                    <td className="px-4 py-3 text-sm text-gray-400">string</td>
                    <td className="px-4 py-3 text-sm text-gray-300">Filter: queued, running, paused, completed, failed, cancelled</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-purple-400">page</td>
                    <td className="px-4 py-3 text-sm text-gray-400">integer</td>
                    <td className="px-4 py-3 text-sm text-gray-300">Page number (default: 1)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-purple-400">limit</td>
                    <td className="px-4 py-3 text-sm text-gray-400">integer</td>
                    <td className="px-4 py-3 text-sm text-gray-300">Items per page (default: 20, max: 100)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">cURL</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300"><code>{`curl "${API_URL}/api/v1/batch-jobs?status=running&page=1&limit=20" \\
  -H "X-API-Key: your_api_key_here"`}</code></pre>
              </div>
            </div>
          </div>
        </section>

        {/* Get Status */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Get Batch Job Status</h3>
              <p className="text-gray-400">Real-time progress for a specific batch job. Includes <code className="text-purple-300 text-xs">progress_percent</code> calculated from item counters.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">GET</span>
              <code className="text-purple-400 font-mono text-sm">/api/v1/batch-jobs/:id</code>
            </div>
          </div>

          <div className="bg-gray-800 rounded-xl overflow-hidden">
            <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
              <span className="text-xs text-gray-400 font-mono">Response</span>
            </div>
            <div className="p-4 overflow-x-auto">
              <pre className="text-sm font-mono text-gray-300"><code>{`{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "running",
  "total_items": 1000,
  "completed_items": 432,
  "failed_items": 3,
  "skipped_items": 0,
  "progress_percent": 43.5,
  "started_at": "2024-01-16T02:00:00Z",
  "completed_at": null
}`}</code></pre>
            </div>
          </div>
        </section>

        {/* List Items */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">List Batch Job Items</h3>
              <p className="text-gray-400">Inspect individual items — their status, linked <code className="text-purple-300 text-xs">execution_id</code>, attempt count, and error details.</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">GET</span>
              <code className="text-purple-400 font-mono text-sm">/api/v1/batch-jobs/:id/items</code>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">cURL — list failed items</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300"><code>{`curl "${API_URL}/api/v1/batch-jobs/{id}/items?status=failed&limit=50" \\
  -H "X-API-Key: your_api_key_here"`}</code></pre>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Response</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300"><code>{`{
  "data": [
    {
      "id": "item-uuid",
      "batch_job_id": "job-uuid",
      "payload": { "id": "inv_001", "customer": "acme" },
      "status": "failed",
      "execution_id": null,
      "attempt": 3,
      "error": { "message": "Connection timeout", "code": "ECONNRESET" },
      "started_at": "2024-01-16T02:01:00Z",
      "completed_at": "2024-01-16T02:01:05Z"
    }
  ],
  "pagination": { "page": 1, "limit": 50, "count": 1 }
}`}</code></pre>
              </div>
            </div>
          </div>
        </section>

        {/* Job Controls */}
        <div className="flex items-center gap-4">
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
            <Settings className="w-6 h-6 text-purple-400" />
            Job Controls
          </h2>
          <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pause */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                <Pause className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Pause</h3>
                <span className="text-xs font-mono text-gray-400">POST /batch-jobs/{'{id}'}/pause</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-gray-300"><code>{`curl -X POST ${API_URL}/api/v1/batch-jobs/{id}/pause \\
  -H "X-API-Key: your_api_key_here"`}</code></pre>
              </div>
            </div>
          </div>

          {/* Resume */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <Play className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Resume</h3>
                <span className="text-xs font-mono text-gray-400">POST /batch-jobs/{'{id}'}/resume</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-gray-300"><code>{`curl -X POST ${API_URL}/api/v1/batch-jobs/{id}/resume \\
  -H "X-API-Key: your_api_key_here"`}</code></pre>
              </div>
            </div>
          </div>

          {/* Cancel */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <StopCircle className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Cancel</h3>
                <span className="text-xs font-mono text-gray-400">POST /batch-jobs/{'{id}'}/cancel</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-gray-300"><code>{`curl -X POST ${API_URL}/api/v1/batch-jobs/{id}/cancel \\
  -H "X-API-Key: your_api_key_here"`}</code></pre>
              </div>
            </div>
          </div>

          {/* Retry Failed */}
          <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Retry Failed</h3>
                <span className="text-xs font-mono text-gray-400">POST /batch-jobs/{'{id}'}/retry</span>
              </div>
            </div>
            <div className="bg-gray-800 rounded-lg overflow-hidden">
              <div className="p-4 overflow-x-auto">
                <pre className="text-xs font-mono text-gray-300"><code>{`curl -X POST ${API_URL}/api/v1/batch-jobs/{id}/retry \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{ "failed_only": true }'`}</code></pre>
              </div>
            </div>
          </div>
        </div>

        {/* Status Values */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <List className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Job Status Values</h2>
          </div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[
                  { status: 'queued',    color: 'text-gray-400',   bg: 'bg-gray-500/20',   desc: 'Waiting to start' },
                  { status: 'running',   color: 'text-blue-400',   bg: 'bg-blue-500/20',   desc: 'Actively processing items' },
                  { status: 'paused',    color: 'text-yellow-400', bg: 'bg-yellow-500/20', desc: 'Paused by user — resumable' },
                  { status: 'completed', color: 'text-green-400',  bg: 'bg-green-500/20',  desc: 'All items finished (check failed_items count)' },
                  { status: 'failed',    color: 'text-red-400',    bg: 'bg-red-500/20',    desc: 'All items failed — no completions' },
                  { status: 'cancelled', color: 'text-orange-400', bg: 'bg-orange-500/20', desc: 'Manually cancelled; pending items skipped' },
                ].map(({ status, color, bg, desc }) => (
                  <tr key={status}>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-xs font-mono font-medium ${color} ${bg}`}>{status}</span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Field</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Default</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {[
                  { field: 'max_attempts',    type: 'integer', def: '3',           desc: 'Max retries per item' },
                  { field: 'backoff',         type: 'string',  def: 'exponential', desc: 'linear | exponential | fixed' },
                  { field: 'initial_delay_ms',type: 'integer', def: '1000',        desc: 'First retry delay (ms)' },
                  { field: 'max_delay_ms',    type: 'integer', def: '60000',       desc: 'Maximum delay cap (ms)' },
                ].map(({ field, type, def, desc }) => (
                  <tr key={field}>
                    <td className="px-6 py-4 text-sm font-mono text-purple-400">{field}</td>
                    <td className="px-6 py-4 text-sm text-gray-400">{type}</td>
                    <td className="px-6 py-4 text-sm font-mono text-gray-400">{def}</td>
                    <td className="px-6 py-4 text-sm text-gray-300">{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Best Practices */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Best Practices</h2>
          </div>
          <div className="space-y-4">
            {[
              { title: 'Use flow_id, not workflow_id', body: 'The field is flow_id — get the correct UUID from GET /api/v1/flows.' },
              { title: 'Size your concurrency carefully', body: 'Set concurrency based on your downstream service\'s throughput. Start low and increase after observing behavior.' },
              { title: 'Schedule heavy jobs off-peak', body: 'Use scheduled_at to defer large batches to overnight hours to avoid impacting real-time traffic.' },
              { title: 'Check failed_items, not just status', body: 'A status of "completed" means all items were processed — some may still have failed. Always read failed_items.' },
              { title: 'Use exponential backoff', body: 'For transient errors (network, timeouts) exponential backoff prevents hammering a degraded service.' },
              { title: 'Split very large batches', body: 'Batches over 100k items should be split into sub-batches to keep each job observable and manageable.' },
            ].map((tip, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-400 rounded-full mt-2 shrink-0"></div>
                <div>
                  <span className="text-white font-medium">{tip.title} — </span>
                  <span className="text-gray-300">{tip.body}</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Continue Learning */}
        <section className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white whitespace-nowrap">Continue Learning</h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/event-streaming"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  Event Streaming
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Stream real-time events from your workflows and batch jobs.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                View Docs <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link
              href="/docs/webhooks"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Webhooks
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Receive push notifications for batch job progress and completion.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                View Docs <ArrowRight className="w-4 h-4 ml-1" />
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
                If you need assistance with batch jobs, we're here to help.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">Check Examples</Link>
                <Link href="#" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">Join Discord</Link>
                <Link href="#" className="text-purple-400 hover:text-purple-300 text-sm transition-colors">GitHub Issues</Link>
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
                <Link href="#" className="text-zinc-300 hover:text-emerald-300 transition-colors">GitHub</Link>
                <Link href="#" className="text-zinc-300 hover:text-emerald-300 transition-colors">Discord</Link>
                <Link href="#" className="text-zinc-300 hover:text-emerald-300 transition-colors">Twitter</Link>
              </div>
            </div>
          </div>
        </footer>
      </motion.div>
    </DocsPageWrapper>
  )
}
