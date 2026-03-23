'use client'

import { motion } from 'framer-motion'
import { Terminal, Code, Play, Zap, Settings, Globe, ChevronRight, Copy, ArrowRight, CheckCircle, AlertCircle, Clock, Database, Shield, FileText, List, Eye, Pause, Square, RefreshCw, Download, Upload, Trash2, Edit3, Plus, Search, Filter, BarChart3, Users, Key, Lock, Unlock, Cpu, HardDrive, Wifi, WifiOff, AlertTriangle, Info, HelpCircle, BookOpen, GitBranch, Calendar, Timer, TrendingUp, Activity } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# CLI Commands

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
The Torqvio CLI provides comprehensive command-line access to manage workflows, monitor executions, configure settings, and interact with the Torqvio platform.

## Global Options

### Common Flags
\`\`\`bash
# Enable debug mode
torqvio --debug <command>

# Verbose output
torqvio --verbose <command>

# Specify configuration file
torqvio --config ~/.torqvio.yaml <command>

# Specify API URL
torqvio --api-url https://api.torqvio.com <command>

# Specify workspace
torqvio --workspace my-workspace <command>

# Help
torqvio --help
torqvio <command> --help
\`\`\`

## Authentication Commands

### Login
\`\`\`bash
# API Key authentication
torqvio auth login --api-key your_api_key_here

# OAuth authentication (opens browser)
torqvio auth login --oauth

# Interactive authentication
torqvio auth login

# Specify authentication method
torqvio auth login --method github
torqvio auth login --method google
\`\`\`

### Logout
\`\`\`bash
# Logout current session
torqvio auth logout

# Logout from all sessions
torqvio auth logout --all

# Logout from specific workspace
torqvio auth logout --workspace my-workspace
\`\`\`

### Status
\`\`\`bash
# Check authentication status
torqvio auth status

# Show current user info
torqvio auth whoami

# Refresh authentication token
torqvio auth refresh
\`\`\`

## Workflow Commands

### List Workflows
\`\`\`bash
# List all workflows
torqvio workflows list

# List with pagination
torqvio workflows list --limit 10 --offset 20

# Filter by status
torqvio workflows list --status active

# Search workflows
torqvio workflows list --search "approval"

# Sort results
torqvio workflows list --sort created_at --order desc

# Output format
torqvio workflows list --format json
torqvio workflows list --format table
torqvio workflows list --format yaml
\`\`\`

### Get Workflow Details
\`\`\`bash
# Get workflow by ID
torqvio workflows get <workflow-id>

# Include execution history
torqvio workflows get <workflow-id> --with-history

# Show workflow definition
torqvio workflows get <workflow-id> --show-definition

# Output format
torqvio workflows get <workflow-id> --format json
\`\`\`

### Create Workflow
\`\`\`bash
# Create from file
torqvio workflows create --file workflow.json

# Create with name and description
torqvio workflows create --name "My Workflow" --description "Description here"

# Create from template
torqvio workflows create --template approval-workflow --name "Custom Approval"

# Create with tags
torqvio workflows create --file workflow.json --tags production,api

# Create in specific workspace
torqvio workflows create --file workflow.json --workspace my-workspace
\`\`\`

### Update Workflow
\`\`\`bash
# Update workflow file
torqvio workflows update <workflow-id> --file updated-workflow.json

# Update metadata
torqvio workflows update <workflow-id> --name "New Name" --description "New description"

# Add tags
torqvio workflows update <workflow-id> --add-tags production,critical

# Remove tags
torqvio workflows update <workflow-id> --remove-tags test,deprecated

# Enable/disable workflow
torqvio workflows update <workflow-id> --enable
torqvio workflows update <workflow-id> --disable
\`\`\`

### Delete Workflow
\`\`\`bash
# Delete workflow
torqvio workflows delete <workflow-id>

# Delete with confirmation
torqvio workflows delete <workflow-id> --confirm

# Force delete (skip confirmation)
torqvio workflows delete <workflow-id> --force

# Delete multiple workflows
torqvio workflows delete <workflow-id-1> <workflow-id-2>
\`\`\`

### Execute Workflow
\`\`\`bash
# Execute workflow
torqvio workflows run <workflow-id>

# Execute with input data
torqvio workflows run <workflow-id> --data '{"input": "value"}'

# Execute from file
torqvio workflows run <workflow-id> --data-file input.json

# Execute with specific environment
torqvio workflows run <workflow-id> --environment production

# Execute asynchronously
torqvio workflows run <workflow-id> --async

# Execute and wait for completion
torqvio workflows run <workflow-id> --wait

# Execute with timeout
torqvio workflows run <workflow-id> --timeout 300
\`\`\`

## Execution Commands

### List Executions
\`\`\`bash
# List recent executions
torqvio executions list

# List with pagination
torqvio executions list --limit 20 --offset 40

# Filter by workflow
torqvio executions list --workflow <workflow-id>

# Filter by status
torqvio executions list --status running
torqvio executions list --status completed
torqvio executions list --status failed

# Filter by date range
torqvio executions list --from "2024-01-01" --to "2024-01-31"

# Sort results
torqvio executions list --sort started_at --order desc

# Output format
torqvio executions list --format table
\`\`\`

### Get Execution Details
\`\`\`bash
# Get execution by ID
torqvio executions get <execution-id>

# Show full logs
torqvio executions get <execution-id> --logs

# Show step details
torqvio executions get <execution-id> --steps

# Show input/output data
torqvio executions get <execution-id> --data

# Output format
torqvio executions get <execution-id> --format json
\`\`\`

### Watch Execution
\`\`\`bash
# Watch execution in real-time
torqvio executions watch <execution-id>

# Watch with auto-refresh
torqvio executions watch <execution-id> --refresh 5

# Watch specific steps
torqvio executions watch <execution-id> --steps

# Watch with logs
torqvio executions watch <execution-id> --logs
\`\`\`

### Cancel Execution
\`\`\`bash
# Cancel execution
torqvio executions cancel <execution-id>

# Cancel with reason
torqvio executions cancel <execution-id> --reason "User requested"

# Force cancel
torqvio executions cancel <execution-id> --force

# Cancel multiple executions
torqvio executions cancel <execution-id-1> <execution-id-2>
\`\`\`

### Retry Execution
\`\`\`bash
# Retry failed execution
torqvio executions retry <execution-id>

# Retry with new data
torqvio executions retry <execution-id> --data '{"new": "input"}'

# Retry from specific step
torqvio executions retry <execution-id> --from-step <step-id>
\`\`\`

## Configuration Commands

### View Configuration
\`\`\`bash
# List all configuration
torqvio config list

# Get specific configuration value
torqvio config get api_url
torqvio config get workspace
torqvio config get timeout

# Show effective configuration
torqvio config show
\`\`\`

### Set Configuration
\`\`\`bash
# Set API URL
torqvio config set api_url https://api.torqvio.com

# Set default workspace
torqvio config set workspace my-workspace

# Set request timeout
torqvio config set timeout 30

# Set default environment
torqvio config set environment production

# Set log level
torqvio config set log_level info
\`\`\`

### Manage Configuration
\`\`\`bash
# Reset configuration
torqvio config reset

# Reset specific key
torqvio config reset api_url

# Export configuration
torqvio config export --file config.yaml

# Import configuration
torqvio config import --file config.yaml

# Validate configuration
torqvio config validate
\`\`\`

## Template Commands

### List Templates
\`\`\`bash
# List available templates
torqvio templates list

# List with categories
torqvio templates list --category approval

# Search templates
torqvio templates list --search "api"

# Show template details
torqvio templates show approval-workflow
\`\`\`

### Use Templates
\`\`\`bash
# Create workflow from template
torqvio templates use approval-workflow --name "My Approval"

# Use with custom parameters
torqvio templates use approval-workflow --name "Custom" --param approver="admin"

# List template parameters
torqvio templates params approval-workflow
\`\`\`

### Manage Templates
\`\`\`bash
# Create template from workflow
torqvio templates create --from-workflow <workflow-id> --name "My Template"

# Update template
torqvio templates update <template-id> --file template.json

# Delete template
torqvio templates delete <template-id>
\`\`\`

## Bulk Operations

### Bulk Execute
\`\`\`bash
# Bulk execute workflows
torqvio bulk run --workflow-id <id> --inputs-file inputs.json

# Bulk execute with parallelism
torqvio bulk run --workflow-id <id> --inputs-file inputs.json --parallel 5

# Bulk execute from CSV
torqvio bulk run --workflow-id <id> --csv-file data.csv

# Bulk execute with delay
torqvio bulk run --workflow-id <id> --inputs-file inputs.json --delay 1000
\`\`\`

### Bulk Export
\`\`\`bash
# Export workflows
torqvio bulk export --format json --output workflows.json

# Export with filters
torqvio bulk export --format yaml --tag production --output prod-workflows.yaml

# Export executions
torqvio bulk export executions --format csv --output executions.csv
\`\`\`

### Bulk Import
\`\`\`bash
# Import workflows
torqvio bulk import --file workflows.json

# Import with validation
torqvio bulk import --file workflows.json --validate

# Import with overwrite
torqvio bulk import --file workflows.json --overwrite
\`\`\`

## Environment Management

### List Environments
\`\`\`bash
# List all environments
torqvio env list

# Show current environment
torqvio env current

# Show environment details
torqvio env show production
\`\`\`

### Switch Environments
\`\`\`bash
# Switch to environment
torqvio env use production

# Switch temporarily
torqvio env use production --session

# Create new environment
torqvio env create staging --clone production
\`\`\`

### Environment Variables
\`\`\`bash
# Set environment variable
torqvio env set DATABASE_URL postgres://localhost/db

# Get environment variable
torqvio env get DATABASE_URL

# List environment variables
torqvio env list --vars

# Unset environment variable
torqvio env unset DATABASE_URL
\`\`\`

## Monitoring Commands

### Status
\`\`\`bash
# Show system status
torqvio status

# Show detailed status
torqvio status --detailed

# Show workspace status
torqvio status --workspace my-workspace

# Health check
torqvio status --health
\`\`\`

### Metrics
\`\`\`bash
# Show metrics
torqvio metrics

# Show specific metric
torqvio metrics executions

# Show metrics for time range
torqvio metrics --from "2024-01-01" --to "2024-01-31"

# Real-time metrics
torqvio metrics --watch
\`\`\`

### Logs
\`\`\`bash
# Show logs
torqvio logs

# Follow logs
torqvio logs --follow

# Filter logs
torqvio logs --level error
torqvio logs --workflow <workflow-id>

# Show logs for time range
torqvio logs --from "2024-01-01" --to "2024-01-31"
\`\`\`

## Utility Commands

### Version
\`\`\`bash
# Show CLI version
torqvio --version

# Show API version
torqvio version --api

# Check for updates
torqvio version --check-updates
\`\`\`

### Completion
\`\`\`bash
# Generate completion script
torqvio completion bash
torqvio completion zsh
torqvio completion fish

# Install completion
torqvio completion install --shell bash
\`\`\`

### Doctor
\`\`\`bash
# Run diagnostics
torqvio doctor

# Check specific component
torqvio doctor --check auth
torqvio doctor --check api
torqvio doctor --check config

# Fix issues
torqvio doctor --fix
\`\`\`

### Clean
\`\`\`bash
# Clean cache
torqvio clean --cache

# Clean logs
torqvio clean --logs

# Clean all
torqvio clean --all
\`\`\`

## Advanced Commands

### Plugins
\`\`\`bash
# List plugins
torqvio plugins list

# Install plugin
torqvio plugins install <plugin-name>

# Uninstall plugin
torqvio plugins uninstall <plugin-name>

# Enable/disable plugin
torqvio plugins enable <plugin-name>
torqvio plugins disable <plugin-name>
\`\`\`

### Hooks
\`\`\`bash
# List hooks
torqvio hooks list

# Add hook
torqvio hooks add pre-run --command "echo 'Starting workflow'"

# Remove hook
torqvio hooks remove pre-run

# Test hook
torqvio hooks test pre-run
\`\`\`

### Aliases
\`\`\`bash
# List aliases
torqvio alias list

# Create alias
torqvio alias create ls "workflows list"

# Remove alias
torqvio alias remove ls

# Show alias
torqvio alias show ls
\`\`\`

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function CLICommandsPage() {
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
            <span className="text-white">CLI Commands</span>
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
              CLI Commands
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                Complete
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">15 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated 3 days ago</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Comprehensive reference for all Torqvio CLI commands, from basic workflow management to advanced bulk operations and monitoring.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Global Options */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Global Options</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Common Flags</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Enable debug mode
torqvio --debug <command>

# Verbose output
torqvio --verbose <command>

# Specify configuration file
torqvio --config ~/.torqvio.yaml <command>

# Specify API URL
torqvio --api-url https://api.torqvio.com <command>

# Specify workspace
torqvio --workspace my-workspace <command>

# Help
torqvio --help
torqvio <command> --help`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication Commands */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Shield className="w-6 h-6 text-purple-400" />
              Authentication Commands
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Login */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Login</h3>
                  <p className="text-gray-400">Authenticate with the Torqvio platform.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Auth</span>
                  <code className="text-purple-400 font-mono text-sm">auth login</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Authentication Methods</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# API Key authentication
torqvio auth login --api-key your_api_key_here

# OAuth authentication (opens browser)
torqvio auth login --oauth

# Interactive authentication
torqvio auth login

# Specify authentication method
torqvio auth login --method github
torqvio auth login --method google`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Status</h3>
                  <p className="text-gray-400">Check authentication status and user information.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Info</span>
                  <code className="text-purple-400 font-mono text-sm">auth status</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Status Commands</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Check authentication status
torqvio auth status

# Show current user info
torqvio auth whoami

# Refresh authentication token
torqvio auth refresh`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Commands */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <FileText className="w-6 h-6 text-purple-400" />
              Workflow Commands
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* List Workflows */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">List Workflows</h3>
                  <p className="text-gray-400">Browse and filter your workflow collection.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Browse</span>
                  <code className="text-purple-400 font-mono text-sm">workflows list</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">List Options</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# List all workflows
torqvio workflows list

# List with pagination
torqvio workflows list --limit 10 --offset 20

# Filter by status
torqvio workflows list --status active

# Search workflows
torqvio workflows list --search "approval"

# Sort results
torqvio workflows list --sort created_at --order desc

# Output format
torqvio workflows list --format json
torqvio workflows list --format table
torqvio workflows list --format yaml`}</code>
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
                  <p className="text-gray-400">Run workflows with various execution options.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">Execute</span>
                  <code className="text-purple-400 font-mono text-sm">workflows run</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Execution Options</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Execute workflow
torqvio workflows run <workflow-id>

# Execute with input data
torqvio workflows run <workflow-id> --data '{"input": "value"}'

# Execute from file
torqvio workflows run <workflow-id> --data-file input.json

# Execute with specific environment
torqvio workflows run <workflow-id> --environment production

# Execute asynchronously
torqvio workflows run <workflow-id> --async

# Execute and wait for completion
torqvio workflows run <workflow-id> --wait

# Execute with timeout
torqvio workflows run <workflow-id> --timeout 300`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Execution Commands */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Play className="w-6 h-6 text-purple-400" />
              Execution Commands
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Watch Execution */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Watch Execution</h3>
                  <p className="text-gray-400">Monitor workflow executions in real-time.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Monitor</span>
                  <code className="text-purple-400 font-mono text-sm">executions watch</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Watch Options</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Watch execution in real-time
torqvio executions watch <execution-id>

# Watch with auto-refresh
torqvio executions watch <execution-id> --refresh 5

# Watch specific steps
torqvio executions watch <execution-id> --steps

# Watch with logs
torqvio executions watch <execution-id> --logs`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancel Execution */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Cancel Execution</h3>
                  <p className="text-gray-400">Stop running workflow executions.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">Stop</span>
                  <code className="text-purple-400 font-mono text-sm">executions cancel</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Cancel Options</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Cancel execution
torqvio executions cancel <execution-id>

# Cancel with reason
torqvio executions cancel <execution-id> --reason "User requested"

# Force cancel
torqvio executions cancel <execution-id> --force

# Cancel multiple executions
torqvio executions cancel <execution-id-1> <execution-id-2>`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration Commands */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Configuration Commands</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Configuration Management</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# List all configuration
torqvio config list

# Get specific configuration value
torqvio config get api_url
torqvio config get workspace
torqvio config get timeout

# Set API URL
torqvio config set api_url https://api.torqvio.com

# Set default workspace
torqvio config set workspace my-workspace

# Set request timeout
torqvio config set timeout 30

# Reset configuration
torqvio config reset

# Export configuration
torqvio config export --file config.yaml

# Import configuration
torqvio config import --file config.yaml`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Bulk Operations */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Zap className="w-6 h-6 text-purple-400" />
              Bulk Operations
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Bulk Execute */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Bulk Execute</h3>
                  <p className="text-gray-400">Execute multiple workflows efficiently.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Advanced</span>
                  <code className="text-purple-400 font-mono text-sm">bulk run</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Bulk Execution Options</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Bulk execute workflows
torqvio bulk run --workflow-id <id> --inputs-file inputs.json

# Bulk execute with parallelism
torqvio bulk run --workflow-id <id> --inputs-file inputs.json --parallel 5

# Bulk execute from CSV
torqvio bulk run --workflow-id <id> --csv-file data.csv

# Bulk execute with delay
torqvio bulk run --workflow-id <id> --inputs-file inputs.json --delay 1000`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Bulk Export */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Bulk Export</h3>
                  <p className="text-gray-400">Export workflows and executions in various formats.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Export</span>
                  <code className="text-purple-400 font-mono text-sm">bulk export</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Export Options</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Export workflows
torqvio bulk export --format json --output workflows.json

# Export with filters
torqvio bulk export --format yaml --tag production --output prod-workflows.yaml

# Export executions
torqvio bulk export executions --format csv --output executions.csv`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Monitoring Commands */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Monitoring Commands</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">System Monitoring</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Show system status
torqvio status

# Show detailed status
torqvio status --detailed

# Show workspace status
torqvio status --workspace my-workspace

# Health check
torqvio status --health

# Show metrics
torqvio metrics

# Show specific metric
torqvio metrics executions

# Show metrics for time range
torqvio metrics --from "2024-01-01" --to "2024-01-31"

# Real-time metrics
torqvio metrics --watch`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Reference */}
        <section className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 rounded-xl p-8 border border-purple-500/20">
          <div className="flex items-center gap-3 mb-6">
            <HelpCircle className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Quick Reference</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-purple-300">Authentication</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Login</span>
                  <code className="text-purple-400">auth login</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status</span>
                  <code className="text-purple-400">auth status</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Logout</span>
                  <code className="text-purple-400">auth logout</code>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-purple-300">Workflows</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">List</span>
                  <code className="text-purple-400">workflows list</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Create</span>
                  <code className="text-purple-400">workflows create</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Run</span>
                  <code className="text-purple-400">workflows run</code>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-purple-300">Executions</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">List</span>
                  <code className="text-purple-400">executions list</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Watch</span>
                  <code className="text-purple-400">executions watch</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Cancel</span>
                  <code className="text-purple-400">executions cancel</code>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-purple-300">Configuration</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">List</span>
                  <code className="text-purple-400">config list</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Set</span>
                  <code className="text-purple-400">config set</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Get</span>
                  <code className="text-purple-400">config get</code>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-purple-300">Templates</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">List</span>
                  <code className="text-purple-400">templates list</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Use</span>
                  <code className="text-purple-400">templates use</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Create</span>
                  <code className="text-purple-400">templates create</code>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="text-lg font-semibold text-purple-300">Utilities</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Version</span>
                  <code className="text-purple-400">--version</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Help</span>
                  <code className="text-purple-400">--help</code>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Doctor</span>
                  <code className="text-purple-400">doctor</code>
                </div>
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
              href="/docs/cli-installation"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  CLI Installation
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Learn how to install and set up the Torqvio CLI.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                Install CLI <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link
              href="/docs/rest-api"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  REST API
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Explore our REST API for programmatic workflow management.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                View API Docs <ArrowRight className="w-4 h-4 ml-1" />
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
                If you need assistance with CLI commands, we're here to help.
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
