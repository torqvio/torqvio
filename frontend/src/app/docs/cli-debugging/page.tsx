'use client'

import { motion } from 'framer-motion'
import { Terminal, Bug, AlertCircle, CheckCircle, Clock, Zap, Settings, FileText, ChevronRight, Copy, ArrowRight, Search, RefreshCw, Eye, EyeOff, Activity, Database, Wifi, WifiOff, Cpu, HardDrive, Shield, Lock, Unlock, Code, Play, Pause, Square, TrendingUp, TrendingDown, HelpCircle, Info, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# CLI Debugging

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
Debugging CLI issues requires a systematic approach to identify problems, gather diagnostic information, and apply targeted solutions. This guide covers comprehensive debugging techniques for the Torqvio CLI.

## Debug Modes

### Enable Debug Mode
\`\`\`bash
# Enable debug mode for all commands
torqvio --debug <command>

# Enable verbose output
torqvio --verbose <command>

# Enable both debug and verbose
torqvio --debug --verbose <command>

# Set debug level
torqvio --debug=trace <command>
torqvio --debug=debug <command>
torqvio --debug=info <command>
\`\`\`

### Debug Configuration
\`\`\`yaml
# ~/.torqvio/config.yaml
debug:
  enabled: true
  level: debug  # trace, debug, info, warn, error
  output: console  # console, file, both
  
  file:
    path: ~/.torqvio/logs/debug.log
    max_size: 50MB
    max_files: 10
    
  categories:
    api: true
    auth: true
    database: true
    workflow: true
    execution: true
\`\`\`

## Common Issues and Solutions

### Authentication Issues

#### "API key not found"
\`\`\`bash
# Check authentication status
torqvio auth status

# Show current configuration
torqvio config show auth

# Test API connectivity
torqvio doctor --check auth

# Reset authentication
torqvio auth logout
torqvio auth login --api-key your_key
\`\`\`

#### "Invalid credentials"
\`\`\`bash
# Verify API key format
torqvio config get auth.api_key

# Test authentication
torqvio auth whoami

# Refresh token
torqvio auth refresh

# Check token expiration
torqvio auth status --show-token
\`\`\`

### Connection Issues

#### "Connection timeout"
\`\`\`bash
# Test API connectivity
torqvio doctor --check api

# Check network connectivity
curl -I https://api.torqvio.com/health

# Increase timeout
torqvio config set api.timeout 60

# Test with different endpoint
torqvio --api-url https://backup.torqvio.com status
\`\`\`

#### "SSL certificate error"
\`\`\`bash
# Disable SSL verification (temporary)
torqvio config set ssl.verify_certificates false

# Specify custom CA certificate
torqvio config set ssl.ca_file /path/to/ca.crt

# Test SSL connection
openssl s_client -connect api.torqvio.com:443
\`\`\`

### Configuration Issues

#### "Invalid configuration"
\`\`\`bash
# Validate configuration
torqvio config validate

# Show configuration sources
torqvio config show --sources

# Reset to defaults
torqvio config reset

# Check syntax
torqvio config validate --strict
\`\`\`

#### "Environment variable not found"
\`\`\`bash
# Show environment variables
torqvio env list

# Check specific variable
torqvio env get DATABASE_URL

# Set environment variable
torqvio env set DATABASE_URL postgres://localhost/db

# Export current environment
torqvio env export --file .env
\`\`\`

## Diagnostic Commands

### System Health Check
\`\`\`bash
# Comprehensive system check
torqvio doctor

# Check specific components
torqvio doctor --check auth
torqvio doctor --check api
torqvio doctor --check config
torqvio doctor --check database

# Auto-fix issues
torqvio doctor --fix

# Detailed report
torqvio doctor --detailed --output json
\`\`\`

### Status Monitoring
\`\`\`bash
# Show system status
torqvio status

# Detailed status
torqvio status --detailed

# Watch status in real-time
torqvio status --watch

# Status for specific workspace
torqvio status --workspace my-workspace
\`\`\`

### Log Analysis
\`\`\`bash
# Show recent logs
torqvio logs

# Follow logs
torqvio logs --follow

# Filter by level
torqvio logs --level error
torqvio logs --level warn

# Filter by component
torqvio logs --component api
torqvio logs --component auth

# Show logs for time range
torqvio logs --from "2024-01-01" --to "2024-01-31"
\`\`\`

## Performance Debugging

### Performance Profiling
\`\`\`bash
# Enable performance profiling
torqvio --profile <command>

# Show performance metrics
torqvio metrics

# Profile specific operation
torqvio profile workflows list

# Export performance data
torqvio profile --export profile.json
\`\`\`

### Memory Usage
\`\`\`bash
# Show memory usage
torqvio stats memory

# Monitor memory in real-time
torqvio stats memory --watch

# Memory leak detection
torqvio debug memory --leak-detect

# Garbage collection
torqvio debug gc --force
\`\`\`

### Network Debugging
\`\`\`bash
# Test network connectivity
torqvio debug network --test

# Show network statistics
torqvio debug network --stats

# Trace network requests
torqvio debug network --trace

# DNS resolution test
torqvio debug network --dns api.torqvio.com
\`\`\`

## Workflow Debugging

### Workflow Validation
\`\`\`bash
# Validate workflow definition
torqvio workflows validate --file workflow.yaml

# Check workflow syntax
torqvio workflows lint --file workflow.yaml

# Test workflow locally
torqvio workflows test --file workflow.yaml

# Dry run execution
torqvio workflows run --dry-run <workflow-id>
\`\`\`

### Execution Debugging
\`\`\`bash
# Debug execution
torqvio executions debug <execution-id>

# Show execution trace
torqvio executions trace <execution-id>

# Step-by-step execution
torqvio executions run --step-by-step <workflow-id>

# Breakpoint debugging
torqvio executions debug --breakpoint <step-id> <execution-id>
\`\`\`

### Error Analysis
\`\`\`bash
# Show error details
torqvio errors show <error-id>

# List recent errors
torqvio errors list --limit 10

# Error pattern analysis
torqvio errors analyze --pattern "timeout"

# Error correlation
torqvio errors correlate --execution <execution-id>
\`\`\`

## Advanced Debugging

### Remote Debugging
\`\`\`bash
# Start debug server
torqvio debug server --port 9229

# Connect remote debugger
torqvio debug connect --host remote-server --port 9229

# Remote debugging session
torqvio debug remote --session-id <session-id>

# Collect remote diagnostics
torqvio debug collect --remote --output diagnostics.zip
\`\`\`

### Trace Debugging
\`\`\`bash
# Enable tracing
torqvio trace enable --component all

# Start trace session
torqvio trace start --session debug-session

# Stop trace session
torqvio trace stop --session debug-session

# Analyze trace
torqvio trace analyze --session debug-session

# Export trace data
torqvio trace export --session debug-session --format json
\`\`\`

### Heap Analysis
\`\`\`bash
# Capture heap snapshot
torqvio debug heap snapshot

# Compare heap snapshots
torqvio debug heap compare --before snapshot1.json --after snapshot2.json

# Heap analysis
torqvio debug heap analyze --snapshot snapshot.json

# Object retention analysis
torqvio debug heap retention --snapshot snapshot.json
\`\`\`

## Debug Tools

### Interactive Debugger
\`\`\`bash
# Start interactive debugger
torqvio debug

# Debug specific command
torqvio debug workflows list

# Set breakpoints
torqvio debug --breakpoint "api.request"

# Step through execution
torqvio debug --step

# Continue execution
torqvio debug --continue
\`\`\`

### Log Viewer
\`\`\`bash
# Interactive log viewer
torqvio logs view

# Filter logs interactively
torqvio logs view --filter level:error

# Search logs
torqvio logs view --search "timeout"

# Export filtered logs
torqvio logs view --export filtered-logs.json
\`\`\`

### Configuration Inspector
\`\`\`bash
# Interactive configuration viewer
torqvio config inspect

# Compare configurations
torqvio config compare --file1 config1.yaml --file2 config2.yaml

# Configuration diff
torqvio config diff --baseline config.yaml

# Validate configuration changes
torqvio config validate --diff changes.yaml
\`\`\`

## Troubleshooting Checklist

### Initial Diagnosis
- [ ] Check CLI version: \`torqvio --version\`
- [ ] Verify configuration: \`torqvio config validate\`
- [ ] Test authentication: \`torqvio auth status\`
- [ ] Check network connectivity: \`torqvio doctor --check api\`
- [ ] Review recent logs: \`torqvio logs --level error\`

### Common Fixes
- [ ] Clear cache: \`torqvio clean --cache\`
- [ ] Reset configuration: \`torqvio config reset\`
- [ ] Re-authenticate: \`torqvio auth logout && torqvio auth login\`
- [ ] Update CLI: \`npm update -g torqvio-cli\`
- [ ] Check system requirements: \`torqvio doctor\`

### Advanced Troubleshooting
- [ ] Enable debug mode: \`torqvio --debug <command>\`
- [ ] Collect diagnostics: \`torqvio doctor --export diagnostics.zip\`
- [ ] Profile performance: \`torqvio --profile <command>\`
- [ ] Trace execution: \`torqvio trace enable && torqvio trace start\`
- [ ] Analyze errors: \`torqvio errors analyze\`

## Debug Scenarios

### Scenario 1: Slow API Responses
\`\`\`bash
# 1. Test API connectivity
torqvio doctor --check api

# 2. Profile the slow command
torqvio --profile workflows list

# 3. Check network latency
torqvio debug network --test

# 4. Analyze performance metrics
torqvio metrics --component api

# 5. Adjust timeout settings
torqvio config set api.timeout 60
\`\`\`

### Scenario 2: Workflow Execution Failures
\`\`\`bash
# 1. Validate workflow definition
torqvio workflows validate --file workflow.yaml

# 2. Test workflow locally
torqvio workflows test --file workflow.yaml

# 3. Debug execution
torqvio executions debug <execution-id>

# 4. Check error details
torqvio errors show <error-id>

# 5. Dry run execution
torqvio workflows run --dry-run <workflow-id>
\`\`\`

### Scenario 3: Authentication Problems
\`\`\`bash
# 1. Check authentication status
torqvio auth status

# 2. Verify API key
torqvio config get auth.api_key

# 3. Test authentication
torqvio auth whoami

# 4. Refresh token
torqvio auth refresh

# 5. Re-authenticate
torqvio auth logout && torqvio auth login
\`\`\`

## Getting Help

### Support Commands
\`\`\`bash
# Show help for command
torqvio <command> --help

# Show examples
torqvio <command> --examples

# Show troubleshooting guide
torqvio help troubleshooting

# Generate support bundle
torqvio support bundle --output support.zip
\`\`\`

### Community Resources
- GitHub Issues: Report bugs and request features
- Discord Community: Get help from other users
- Documentation: Comprehensive guides and references
- Blog Posts: Tutorials and best practices

### Professional Support
- Enterprise Support: Priority support for enterprise customers
- Consulting Services: Custom debugging and optimization
- Training Programs: CLI debugging workshops

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function CLIDebuggingPage() {
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
            <span className="text-white">CLI Debugging</span>
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
            <Bug className="w-8 h-8 text-purple-400" />
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-3 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              CLI Debugging
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                advanced
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">18 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated today</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Master CLI debugging techniques to troubleshoot issues, optimize performance, and resolve problems efficiently with comprehensive diagnostic tools.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Debug Modes */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Terminal className="w-6 h-6 text-purple-400" />
              Debug Modes
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Enable Debug Mode</h3>
                <p className="text-gray-400">Activate different levels of debugging output for troubleshooting.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Debug</span>
                <code className="text-purple-400 font-mono text-sm">--debug</code>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Debug Flags</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Enable debug mode for all commands
torqvio --debug <command>

# Enable verbose output
torqvio --verbose <command>

# Enable both debug and verbose
torqvio --debug --verbose <command>

# Set debug level
torqvio --debug=trace <command>
torqvio --debug=debug <command>
torqvio --debug=info <command>`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Common Issues */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <AlertCircle className="w-6 h-6 text-purple-400" />
              Common Issues
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Authentication Issues */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Authentication Issues</h3>
                  <p className="text-gray-400">Resolve common authentication problems with API keys and OAuth.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 text-xs font-medium rounded">Critical</span>
                  <code className="text-purple-400 font-mono text-sm">auth</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">"API key not found" Solution</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Check authentication status
torqvio auth status

# Show current configuration
torqvio config show auth

# Test API connectivity
torqvio doctor --check auth

# Reset authentication
torqvio auth logout
torqvio auth login --api-key your_key`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Issues */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Connection Issues</h3>
                  <p className="text-gray-400">Troubleshoot network connectivity and timeout problems.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">Network</span>
                  <code className="text-purple-400 font-mono text-sm">connection</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">"Connection timeout" Solution</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Test API connectivity
torqvio doctor --check api

# Check network connectivity
curl -I https://api.torqvio.com/health

# Increase timeout
torqvio config set api.timeout 60

# Test with different endpoint
torqvio --api-url https://backup.torqvio.com status`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Diagnostic Commands */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Diagnostic Commands</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">System Health Check</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Comprehensive system check
torqvio doctor

# Check specific components
torqvio doctor --check auth
torqvio doctor --check api
torqvio doctor --check config
torqvio doctor --check database

# Auto-fix issues
torqvio doctor --fix

# Detailed report
torqvio doctor --detailed --output json`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Debugging */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Zap className="w-6 h-6 text-purple-400" />
              Performance Debugging
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Performance Profiling */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Performance Profiling</h3>
                  <p className="text-gray-400">Profile CLI performance to identify bottlenecks and optimization opportunities.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Profile</span>
                  <code className="text-purple-400 font-mono text-sm">--profile</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Profiling Commands</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Enable performance profiling
torqvio --profile <command>

# Show performance metrics
torqvio metrics

# Profile specific operation
torqvio profile workflows list

# Export performance data
torqvio profile --export profile.json`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Memory Usage */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Memory Usage</h3>
                  <p className="text-gray-400">Monitor and analyze memory consumption patterns.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Memory</span>
                  <code className="text-purple-400 font-mono text-sm">memory</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Memory Analysis</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Show memory usage
torqvio stats memory

# Monitor memory in real-time
torqvio stats memory --watch

# Memory leak detection
torqvio debug memory --leak-detect

# Garbage collection
torqvio debug gc --force`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Workflow Debugging */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Workflow Debugging</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Execution Debugging</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Debug execution
torqvio executions debug <execution-id>

# Show execution trace
torqvio executions trace <execution-id>

# Step-by-step execution
torqvio executions run --step-by-step <workflow-id>

# Breakpoint debugging
torqvio executions debug --breakpoint <step-id> <execution-id>`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting Checklist */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Troubleshooting Checklist</h2>
          </div>
          
          <div className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Initial Diagnosis</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-purple-400 rounded" readOnly />
                  <span className="text-gray-300">Check CLI version: <code className="text-purple-400">torqvio --version</code></span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-purple-400 rounded" readOnly />
                  <span className="text-gray-300">Verify configuration: <code className="text-purple-400">torqvio config validate</code></span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-purple-400 rounded" readOnly />
                  <span className="text-gray-300">Test authentication: <code className="text-purple-400">torqvio auth status</code></span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-purple-400 rounded" readOnly />
                  <span className="text-gray-300">Check network connectivity: <code className="text-purple-400">torqvio doctor --check api</code></span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-purple-400 rounded" readOnly />
                  <span className="text-gray-300">Review recent logs: <code className="text-purple-400">torqvio logs --level error</code></span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Common Fixes</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-purple-400 rounded" readOnly />
                  <span className="text-gray-300">Clear cache: <code className="text-purple-400">torqvio clean --cache</code></span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-purple-400 rounded" readOnly />
                  <span className="text-gray-300">Reset configuration: <code className="text-purple-400">torqvio config reset</code></span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-purple-400 rounded" readOnly />
                  <span className="text-gray-300">Re-authenticate: <code className="text-purple-400">torqvio auth logout && torqvio auth login</code></span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-purple-400 rounded" readOnly />
                  <span className="text-gray-300">Update CLI: <code className="text-purple-400">npm update -g torqvio-cli</code></span>
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="w-4 h-4 text-purple-400 rounded" readOnly />
                  <span className="text-gray-300">Check system requirements: <code className="text-purple-400">torqvio doctor</code></span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Next Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/cli-configuration"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  CLI Configuration
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Configure CLI settings and optimize performance for your environment.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                Configure CLI →
              </div>
            </Link>

            <Link
              href="/docs/cli-commands"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  CLI Commands
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Complete reference for all CLI commands and their options.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                View Commands →
              </div>
            </Link>
          </div>
        </section>
      </motion.div>
    </DocsPageWrapper>
  )
}
