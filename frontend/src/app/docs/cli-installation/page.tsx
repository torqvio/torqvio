'use client'

import { motion } from 'framer-motion'
import { Terminal, Download, Package, CheckCircle, ArrowRight, Copy, Play, Shield, AlertCircle, Zap, Clock, Settings, Code, Globe, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# CLI Installation

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
The Torqvio CLI provides command-line access to manage workflows, monitor executions, and interact with the Torqvio platform directly from your terminal.

## Installation Methods

### npm (Recommended)
\`\`\`bash
npm install -g torqvio-cli
\`\`\`

### yarn
\`\`\`bash
yarn global add torqvio-cli
\`\`\`

### Direct Download
\`\`\`bash
# macOS
curl -L https://github.com/torqvio/cli/releases/latest/download/torqvio-macos -o torqvio
chmod +x torqvio
sudo mv torqvio /usr/local/bin/

# Linux
curl -L https://github.com/torqvio/cli/releases/latest/download/torqvio-linux -o torqvio
chmod +x torqvio
sudo mv torqvio /usr/local/bin/

# Windows
curl -L https://github.com/torqvio/cli/releases/latest/download/torqvio-windows.exe -o torqvio.exe
.\\torqvio.exe install
\`\`\`

## Quick Start

1. **Initialize a project**
\`\`\`bash
torqvio init
\`\`\`

2. **Authenticate**
\`\`\`bash
torqvio auth login --api-key your_api_key_here
\`\`\`

3. **Deploy a template**
\`\`\`bash
torqvio deploy payment-recovery
\`\`\`

## Authentication

### API Key Authentication
\`\`\`bash
torqvio auth login --api-key your_api_key_here
\`\`\`

### OAuth Authentication
\`\`\`bash
torqvio auth login --oauth --method github
\`\`\`

### Environment Variables
\`\`\`bash
export TORQVIO_API_KEY=your_api_key_here
export TORQVIO_API_URL=https://api.torqvio.com
\`\`\`

## Basic Commands

### Workflow Management
\`\`\`bash
# List all workflows
torqvio workflows list

# Get workflow details
torqvio workflows get <workflow-id>

# Create a new workflow
torqvio workflows create --name "My Workflow" --file workflow.json

# Execute a workflow
torqvio workflows run <workflow-id> --data '{"input": "value"}'

# Delete a workflow
torqvio workflows delete <workflow-id>
\`\`\`

### Execution Monitoring
\`\`\`bash
# List recent executions
torqvio executions list

# Get execution details
torqvio executions get <execution-id>

# Watch execution in real-time
torqvio executions watch <execution-id>

# Cancel execution
torqvio executions cancel <execution-id>
\`\`\`

### Configuration
\`\`\`bash
# Set default API URL
torqvio config set api_url https://api.torqvio.com

# Set default workspace
torqvio config set workspace my-workspace

# View current configuration
torqvio config list

# Reset configuration
torqvio config reset
\`\`\`

## Advanced Features

### Workflow Templates
\`\`\`bash
# List available templates
torqvio templates list

# Create workflow from template
torqvio templates use approval-workflow --name "My Approval Flow"

# Create custom template
torqvio templates create --from-workflow <workflow-id> --name "My Template"
\`\`\`

### Bulk Operations
\`\`\`bash
# Bulk execute workflows
torqvio bulk run --workflow-id <id> --inputs-file inputs.json

# Bulk export workflows
torqvio bulk export --format json --output workflows.json

# Bulk import workflows
torqvio bulk import --file workflows.json
\`\`\`

### Environment Management
\`\`\`bash
# Switch environments
torqvio env use production

# List environments
torqvio env list

# Set environment variables
torqvio env set DATABASE_URL postgres://localhost/db
\`\`\`

## Configuration File

Create a \`.torqvio\` configuration file in your project root:

\`\`\`yaml
# .torqvio
api_url: https://api.torqvio.com
workspace: my-workspace
default_environment: development

environments:
  development:
    api_url: http://localhost:8459
  production:
    api_url: https://api.torqvio.com

workflows:
  auto_discover: true
  paths:
    - ./workflows
    - ./src/workflows
\`\`\`

## Shell Completions

### Bash
\`\`\`bash
# Add to ~/.bashrc
eval "$(torqvio completion bash)"
\`\`\`

### Zsh
\`\`\`bash
# Add to ~/.zshrc
eval "$(torqvio completion zsh)"
\`\`\`

### Fish
\`\`\`bash
# Add to ~/.config/fish/config.fish
torqvio completion fish | source
\`\`\`

## Troubleshooting

### Common Issues

#### "API key not found"
\`\`\`bash
# Check if API key is set
torqvio config list

# Set API key
torqvio auth login --api-key your_key
\`\`\`

#### "Connection timeout"
\`\`\`bash
# Check API URL
torqvio config get api_url

# Set custom timeout
torqvio config set timeout 30
\`\`\`

#### "Permission denied"
\`\`\`bash
# Check file permissions
ls -la $(which torqvio)

# Reinstall with proper permissions
npm uninstall -g torqvio-cli
sudo npm install -g torqvio-cli
\`\`\`

### Debug Mode
\`\`\`bash
# Enable debug logging
torqvio --debug workflows list

# Verbose output
torqvio --verbose executions get <id>
\`\`\`

### Version Management
\`\`\`bash
# Check current version
torqvio --version

# Update to latest
npm update -g torqvio-cli

# Install specific version
npm install -g torqvio-cli@1.2.0
\`\`\`

## Best Practices

- Store API keys in environment variables, not in configuration files
- Use workspace-specific configurations for team collaboration
- Enable shell completions for improved productivity
- Use debug mode when troubleshooting issues
- Keep CLI updated to access latest features

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function CLIInstallationPage() {
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
            <span className="text-white">CLI Installation</span>
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
              CLI Installation
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                Stable
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">8 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated 3 days ago</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          The Torqvio CLI provides command-line access to manage workflows, monitor executions, and interact with the platform directly from your terminal.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Installation Methods */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Download className="w-6 h-6 text-purple-400" />
              Installation Methods
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* npm Installation */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">npm (Recommended)</h3>
                  <p className="text-gray-400">Install via npm for easy updates and dependency management.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Recommended</span>
                  <code className="text-purple-400 font-mono text-sm">npm</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Install Command</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`npm install -g torqvio-cli`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* yarn Installation */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">yarn</h3>
                  <p className="text-gray-400">Alternative package manager installation.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Alternative</span>
                  <code className="text-purple-400 font-mono text-sm">yarn</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Install Command</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`yarn global add torqvio-cli`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Download */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Direct Download</h3>
                  <p className="text-gray-400">Download pre-compiled binaries for your platform.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Universal</span>
                  <code className="text-purple-400 font-mono text-sm">Binary</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Platform-specific Commands</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# macOS
curl -L https://github.com/torqvio/cli/releases/latest/download/torqvio-macos -o torqvio
chmod +x torqvio
sudo mv torqvio /usr/local/bin/

# Linux
curl -L https://github.com/torqvio/cli/releases/latest/download/torqvio-linux -o torqvio
chmod +x torqvio
sudo mv torqvio /usr/local/bin/

# Windows
curl -L https://github.com/torqvio/cli/releases/latest/download/torqvio-windows.exe -o torqvio.exe
.\\torqvio.exe install`}</code>
                    </pre>
                  </div>
                </div>
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
                <span className="text-xs text-gray-400 font-mono">API Key Authentication</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`torqvio auth login --api-key your_api_key_here`}</code>
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">OAuth Authentication</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`torqvio auth login --oauth`}</code>
                </pre>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Environment Variables</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`export TORQVIO_API_KEY=your_api_key_here
export TORQVIO_API_URL=https://api.torqvio.com`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Basic Commands */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Code className="w-6 h-6 text-purple-400" />
              Basic Commands
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Workflow Management */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Workflow Management</h3>
                  <p className="text-gray-400">Manage your workflows from the command line.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Core</span>
                  <code className="text-purple-400 font-mono text-sm">workflows</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Common Commands</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# List all workflows
torqvio workflows list

# Get workflow details
torqvio workflows get <workflow-id>

# Create a new workflow
torqvio workflows create --name "My Workflow" --file workflow.json

# Execute a workflow
torqvio workflows run <workflow-id> --data '{"input": "value"}'

# Delete a workflow
torqvio workflows delete <workflow-id>`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Execution Monitoring */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Execution Monitoring</h3>
                  <p className="text-gray-400">Monitor and manage workflow executions.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">Monitoring</span>
                  <code className="text-purple-400 font-mono text-sm">executions</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Monitoring Commands</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# List recent executions
torqvio executions list

# Get execution details
torqvio executions get <execution-id>

# Watch execution in real-time
torqvio executions watch <execution-id>

# Cancel execution
torqvio executions cancel <execution-id>`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Settings className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Configuration</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Configuration Commands</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Set default API URL
torqvio config set api_url https://api.torqvio.com

# Set default workspace
torqvio config set workspace my-workspace

# View current configuration
torqvio config list

# Reset configuration
torqvio config reset`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Shell Completions */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Shell Completions</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Bash</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Add to ~/.bashrc
eval "$(torqvio completion bash)"`}</code>
                </pre>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Zsh</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Add to ~/.zshrc
eval "$(torqvio completion zsh)"`}</code>
                </pre>
              </div>
            </div>

            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Fish</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# Add to ~/.config/fish/config.fish
torqvio completion fish | source`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <AlertCircle className="w-6 h-6 text-purple-400" />
              Troubleshooting
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* Common Issues */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Common Issues</h3>
                  <p className="text-gray-400">Solutions to frequently encountered problems.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 text-xs font-medium rounded">Help</span>
                  <code className="text-purple-400 font-mono text-sm">debug</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">"API key not found"</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Check if API key is set
torqvio config list

# Set API key
torqvio auth login --api-key your_key`}</code>
                    </pre>
                  </div>
                </div>

                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">"Connection timeout"</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Check API URL
torqvio config get api_url

# Set custom timeout
torqvio config set timeout 30`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best Practices */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <CheckCircle className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Best Practices</h2>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Store API keys in environment variables, not in configuration files</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Use workspace-specific configurations for team collaboration</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Enable shell completions for improved productivity</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Use debug mode when troubleshooting issues</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Keep CLI updated to access latest features</p>
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
              href="/docs/rest-api"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Globe className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  REST API
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Learn about our REST API endpoints for workflow management.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                View API Docs <ArrowRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link
              href="/docs/configuration"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  Configuration
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Set up your environment, database, and advanced settings.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                Configure <ArrowRight className="w-4 h-4 ml-1" />
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
                If you need assistance with the CLI, we're here to help.
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
