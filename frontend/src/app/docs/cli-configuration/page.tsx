'use client'

import { motion } from 'framer-motion'
import { Settings, FileText, Globe, Shield, Database, ChevronRight, Copy, ArrowRight, CheckCircle, AlertCircle, Clock, Terminal, Key, Lock, Save, RefreshCw, Download, Upload, Eye, EyeOff, Zap } from 'lucide-react'
import Link from 'next/link'
import { DocsPageWrapper } from '@/features/docs/components/DocsPageWrapper'
import { CopyForAIButton } from '@/features/docs/components/CopyForAIButton'

const MARKDOWN_CONTENT = `# CLI Configuration

> 🤖 **AI Editor Optimized** - This markdown is formatted for AI code editors like Cursor, Claude Code, GitHub Copilot, and other AI assistants.

## Overview
The Torqvio CLI uses a flexible configuration system that allows you to customize settings, manage environments, and optimize performance for your specific use case.

## Configuration Files

### Primary Configuration File
The CLI looks for configuration files in the following order:
1. \`~/.torqvio/config.yaml\` (global)
2. \`./.torqvio/config.yaml\` (project-specific)
3. \`./.torqvio.yaml\` (project root)
4. Environment variables

### Configuration File Structure
\`\`\`yaml
# ~/.torqvio/config.yaml
api:
  url: https://api.torqvio.com
  timeout: 30
  retries: 3

auth:
  method: oauth
  api_key: null

workspace:
  default: my-workspace
  environments:
    development:
      api_url: http://localhost:8459
      database_url: postgres://localhost/dev
    production:
      api_url: https://api.torqvio.com
      database_url: postgres://user:pass@localhost:5432/torqvio

cli:
  output_format: table
  log_level: info
  auto_confirm: false
  pager: true

monitoring:
  enabled: true
  metrics_endpoint: https://metrics.torqvio.com
  trace_sampling: 0.1

features:
  auto_completion: true
  syntax_highlighting: true
  error_suggestions: true
\`\`\`

## Environment Configuration

### Environment Variables
\`\`\`bash
# API Configuration
export TORQVIO_API_URL=https://api.torqvio.com
export TORQVIO_API_KEY=your_api_key_here
export TORQVIO_TIMEOUT=30

# Workspace Configuration
export TORQVIO_WORKSPACE=my-workspace
export TORQVIO_ENVIRONMENT=production

# CLI Configuration
export TORQVIO_LOG_LEVEL=info
export TORQVIO_OUTPUT_FORMAT=json
export TORQVIO_AUTO_CONFIRM=false

# Database Configuration
export DATABASE_URL=postgres://user:pass@localhost:5432/torqvio
export REDIS_URL=redis://localhost:6379
\`\`\`

### Environment-Specific Configs
\`\`\`yaml
# .torqvio/environments/development.yaml
api:
  url: http://localhost:8459
  timeout: 10

workspace:
  name: development
  database_url: postgres://localhost:5432/torqvio_dev

cli:
  log_level: debug
  auto_confirm: true

# .torqvio/environments/production.yaml
api:
  url: https://api.torqvio.com
  timeout: 60

workspace:
  name: production
  database_url: postgres://user:pass@localhost:5432/torqvio

cli:
  log_level: warn
  auto_confirm: false
\`\`\`

## Authentication Configuration

### API Key Authentication
\`\`\`yaml
auth:
  method: api_key
  api_key: your_api_key_here
  auto_refresh: true
  
# Or use environment variable
auth:
  method: api_key
  api_key: your_api_key_here
\`\`\`

### OAuth Configuration
\`\`\`yaml
auth:
  method: oauth
  provider: github  # github, google, microsoft
  client_id: your_client_id_here
  client_secret: your_client_secret_here
  redirect_uri: http://localhost:7243/auth/callback
  
oauth_providers:
  github:
    scopes: ["repo", "workflow"]
  google:
    scopes: ["openid", "email", "profile"]
  microsoft:
    scopes: ["workflow", "user"]
\`\`\`

### Service Account Configuration
\`\`\`yaml
auth:
  method: service_account
  key_file: ~/.torqvio/service-account.json
  project_id: my-project
  
service_account:
  email: torqvio@my-project.iam.gserviceaccount.com
  scopes: ["https://www.googleapis.com/auth/cloud-platform"]
\`\`\`

## Workspace Configuration

### Multi-Workspace Setup
\`\`\`yaml
workspaces:
  personal:
    api_url: https://api.torqvio.com
    workspace_id: ws_personal_123
    default_environment: development
    
  company:
    api_url: https://company.torqvio.com
    workspace_id: ws_company_456
    default_environment: production
    
  client:
    api_url: https://client.torqvio.com
    workspace_id: ws_client_789
    default_environment: staging
\`\`\`

### Environment Management
\`\`\`yaml
environments:
  development:
    api_url: http://localhost:8459
    database_url: postgres://localhost:5432/torqvio_dev
    redis_url: redis://localhost:6379
    log_level: debug
    
  staging:
    api_url: https://staging.torqvio.com
    database_url: postgres://staging-user:pass@localhost:5432/torqvio_staging
    redis_url: redis://localhost:6379
    log_level: info
    
  production:
    api_url: https://api.torqvio.com
    database_url: postgres://prod-user:pass@localhost:5432/torqvio_prod
    redis_url: redis://localhost:6379
    log_level: warn
\`\`\`

## Performance Configuration

### Connection Pooling
\`\`\`yaml
database:
  pool:
    min: 2
    max: 10
    idle_timeout: 30000
    acquire_timeout: 60000
    
redis:
  pool:
    min: 1
    max: 5
    timeout: 5000
    
api:
  connection_pool:
    max_connections: 20
    keep_alive: true
    timeout: 30000
\`\`\`

### Caching Configuration
\`\`\`yaml
cache:
  enabled: true
  ttl: 3600
  max_size: 1000
  backend: redis
  
  strategies:
    workflows:
      ttl: 1800
      max_size: 100
      
    executions:
      ttl: 300
      max_size: 500
      
    users:
      ttl: 7200
      max_size: 50
\`\`\`

### Rate Limiting
\`\`\`yaml
rate_limiting:
  enabled: true
  
  limits:
    api_calls:
      requests_per_minute: 60
      burst: 10
      
    workflow_executions:
      requests_per_minute: 30
      burst: 5
      
    bulk_operations:
      requests_per_hour: 100
      burst: 20
\`\`\`

## CLI Behavior Configuration

### Output Formatting
\`\`\`yaml
cli:
  output_format: table  # table, json, yaml, csv
  color: true
  unicode: true
  
  table:
    max_width: 120
    wrap_text: false
    
  json:
    pretty_print: true
    sort_keys: false
    
  yaml:
    indent: 2
    inline_level: 4
\`\`\`

### Logging Configuration
\`\`\`yaml
logging:
  level: info  # debug, info, warn, error
  format: text  # text, json
  
  handlers:
    console:
      enabled: true
      color: true
      
    file:
      enabled: true
      path: ~/.torqvio/logs/torqvio.log
      max_size: 10MB
      max_files: 5
      
    syslog:
      enabled: false
      facility: user
      address: localhost:514
\`\`\`

### Interactive Features
\`\`\`yaml
interactive:
  auto_confirm: false
  pager: true
  progress_bar: true
  spinners: true
  
  completion:
    enabled: true
    case_sensitive: false
    
  history:
    enabled: true
    max_size: 1000
    file: ~/.torqvio/history
\`\`\`

## Security Configuration

### SSL/TLS Configuration
\`\`\`yaml
ssl:
  enabled: true
  verify_certificates: true
  ca_file: /etc/ssl/certs/ca-certificates.crt
  
  client_cert:
    enabled: false
    cert_file: ~/.torqvio/client.crt
    key_file: ~/.torqvio/client.key
\`\`\`

### Encryption Configuration
\`\`\`yaml
encryption:
  algorithm: AES-256-GCM
  key_derivation: PBKDF2
  
  secrets:
    encryption_key: your_encryption_key_here
    key_rotation_days: 90
    
  at_rest:
    enabled: true
    algorithm: AES-256-CBC
\`\`\`

### Access Control
\`\`\`yaml
access_control:
  ip_whitelist:
    - 192.168.1.0/24
    - 10.0.0.0/8
    
  ip_blacklist:
    - 0.0.0.0/8
    
  rate_limiting:
    enabled: true
    requests_per_minute: 60
\`\`\`

## Monitoring and Observability

### Metrics Configuration
\`\`\`yaml
metrics:
  enabled: true
  endpoint: https://metrics.torqvio.com
  interval: 60
  
  collectors:
    system:
      enabled: true
      metrics: ["cpu", "memory", "disk"]
      
    application:
      enabled: true
      metrics: ["requests", "errors", "latency"]
      
    custom:
      enabled: true
      prefix: torqvio_cli
\`\`\`

### Tracing Configuration
\`\`\`yaml
tracing:
  enabled: true
  sampling: 0.1
  endpoint: https://trace.torqvio.com
  
  exporters:
    jaeger:
      enabled: true
      endpoint: http://localhost:14268/api/traces
      
    zipkin:
      enabled: false
      endpoint: http://localhost:9411/api/v2/spans
\`\`\`

## Advanced Configuration

### Plugin Configuration
\`\`\`yaml
plugins:
  enabled: true
  directory: ~/.torqvio/plugins
  
  plugins:
    slack:
      enabled: true
      webhook_url: https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK
      
    github:
      enabled: true
      token: github_pat_your_token_here
      
    datadog:
      enabled: false
      api_key: your_datadog_api_key_here
\`\`\`

### Hook Configuration
\`\`\`yaml
hooks:
  pre_run:
    - command: "echo 'Starting workflow'"
    - command: "torqvio check --environment"
    
  post_run:
    - command: "torqvio notify --slack"
    - command: "torqvio cleanup --temp-files"
    
  on_error:
    - command: "torqvio alert --email"
    - command: "torqvio rollback --last"
\`\`\`

### Alias Configuration
\`\`\`yaml
aliases:
  ls: "workflows list"
  run: "workflows run"
  ps: "executions list"
  logs: "executions logs"
  status: "system status"
  
  complex_aliases:
    deploy_prod: |
      workflows validate --file workflow.yaml &&
      workflows deploy --environment production &&
      executions monitor --workflow-id $LAST_ID
\`\`\`

## Configuration Commands

### View Configuration
\`\`\`bash
# Show current configuration
torqvio config show

# Show specific section
torqvio config show api
torqvio config show auth
torqvio config show workspace

# Show effective configuration (merged)
torqvio config show --effective

# Show configuration sources
torqvio config show --sources
\`\`\`

### Set Configuration
\`\`\`bash
# Set configuration values
torqvio config set api.url https://api.torqvio.com
torqvio config set auth.method oauth
torqvio config set workspace.default my-workspace

# Set nested values
torqvio config set database.pool.max 10
torqvio config set logging.level debug

# Set from file
torqvio config set --file config.yaml
\`\`\`

### Manage Configuration
\`\`\`bash
# Export configuration
torqvio config export --file config.yaml
torqvio config export --format json --file config.json

# Import configuration
torqvio config import --file config.yaml
torqvio config import --merge --file additional-config.yaml

# Validate configuration
torqvio config validate
torqvio config validate --strict

# Reset configuration
torqvio config reset
torqvio config reset api.timeout
torqvio config reset --all
\`\`\`

## Configuration Templates

### Development Template
\`\`\`yaml
# development.yaml
api:
  url: http://localhost:8459
  timeout: 10
  
workspace:
  default: development
  environments:
    development:
      api_url: http://localhost:8459
      database_url: postgres://localhost:5432/torqvio_dev
      
cli:
  log_level: debug
  auto_confirm: true
  output_format: json
  
monitoring:
  enabled: false
\`\`\`

### Production Template
\`\`\`yaml
# production.yaml
api:
  url: https://api.torqvio.com
  timeout: 60
  
workspace:
  default: production
  environments:
    production:
      api_url: https://api.torqvio.com
      database_url: postgres://user:pass@localhost:5432/torqvio
      
cli:
  log_level: warn
  auto_confirm: false
  output_format: table
  
security:
  ssl:
    enabled: true
    verify_certificates: true
    
monitoring:
  enabled: true
  metrics:
    enabled: true
    endpoint: https://metrics.torqvio.com
\`\`\`

## Best Practices

### Security Best Practices
- Store sensitive values in environment variables
- Use service accounts for automated workflows
- Enable SSL certificate verification
- Regularly rotate API keys and encryption keys
- Use principle of least privilege for access control

### Performance Best Practices
- Configure appropriate connection pool sizes
- Enable caching for frequently accessed data
- Set reasonable timeouts for API calls
- Monitor resource usage and adjust limits
- Use compression for large data transfers

### Organization Best Practices
- Use separate configurations for each environment
- Store configuration files in version control (excluding secrets)
- Document custom configuration options
- Use configuration templates for consistency
- Implement configuration validation in CI/CD

---

© ${new Date().getFullYear()} Torqvio. Built with durability in mind.`

export default function CLIConfigurationPage() {
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
            <span className="text-white">CLI Configuration</span>
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
              CLI Configuration
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                intermediate
              </span>
              <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-medium">
                v2.1.0
              </span>
              <span className="text-gray-400">12 min read</span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-400">Updated today</span>
            </div>
          </div>
          <CopyForAIButton content={MARKDOWN_CONTENT} />
        </div>
        <p className="text-xl text-gray-300 leading-relaxed max-w-3xl">
          Configure the Torqvio CLI for your specific environment, optimize performance, and customize behavior with comprehensive configuration options.
        </p>
      </motion.header>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-8"
      >
        {/* Configuration Files */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <FileText className="w-6 h-6 text-purple-400" />
              Configuration Files
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">Primary Configuration</h3>
                <p className="text-gray-400">The CLI looks for configuration files in a specific order of precedence.</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="px-3 py-1 bg-purple-500/20 text-purple-400 text-xs font-medium rounded">Config</span>
                <code className="text-purple-400 font-mono text-sm">~/.torqvio/</code>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-xl overflow-hidden">
                <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                  <span className="text-xs text-gray-400 font-mono">Configuration File Precedence</span>
                </div>
                <div className="p-4 overflow-x-auto">
                  <pre className="text-sm font-mono text-gray-300">
                    <code>{`# Priority order (highest to lowest)
1. ~/.torqvio/config.yaml (global)
2. ./.torqvio/config.yaml (project-specific)
3. ./.torqvio.yaml (project root)
4. Environment variables`}</code>
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Environment Configuration */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Globe className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Environment Configuration</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Environment Variables</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`# API Configuration
export TORQVIO_API_URL=https://api.torqvio.com
export TORQVIO_API_KEY=your_api_key_here
export TORQVIO_TIMEOUT=30

# Workspace Configuration
export TORQVIO_WORKSPACE=my-workspace
export TORQVIO_ENVIRONMENT=production`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Authentication Configuration */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Shield className="w-6 h-6 text-purple-400" />
              Authentication Configuration
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* API Key Auth */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">API Key Authentication</h3>
                  <p className="text-gray-400">Configure API key-based authentication for secure access.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-medium rounded">Secure</span>
                  <code className="text-purple-400 font-mono text-sm">api_key</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">API Key Configuration</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`auth:
  method: api_key
  api_key: your_api_key_here
  auto_refresh: true
  
# Or use environment variable
auth:
  method: api_key
  api_key: your_api_key_here`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* OAuth Config */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">OAuth Configuration</h3>
                  <p className="text-gray-400">Set up OAuth authentication with multiple providers.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">OAuth</span>
                  <code className="text-purple-400 font-mono text-sm">oauth</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">OAuth Provider Setup</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`auth:
  method: oauth
  provider: github  # github, google, microsoft
  client_id: your_client_id_here
  client_secret: your_client_secret_here
  redirect_uri: http://localhost:7243/auth/callback`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Performance Configuration */}
        <section className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white">Performance Configuration</h2>
          </div>
          
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl overflow-hidden">
              <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                <span className="text-xs text-gray-400 font-mono">Connection Pooling</span>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300">
                  <code>{`database:
  pool:
    min: 2
    max: 10
    idle_timeout: 30000
    acquire_timeout: 60000
    
redis:
  pool:
    min: 1
    max: 5
    timeout: 5000`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* Configuration Commands */}
        <section className="space-y-8">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
            <h2 className="text-3xl font-bold text-white flex items-center gap-3 whitespace-nowrap">
              <Terminal className="w-6 h-6 text-purple-400" />
              Configuration Commands
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent flex-1"></div>
          </div>
          
          <div className="space-y-8">
            {/* View Config */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">View Configuration</h3>
                  <p className="text-gray-400">Display current and effective configuration settings.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-blue-500/20 text-blue-400 text-xs font-medium rounded">View</span>
                  <code className="text-purple-400 font-mono text-sm">config show</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Display Commands</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Show current configuration
torqvio config show

# Show specific section
torqvio config show api
torqvio config show auth

# Show effective configuration (merged)
torqvio config show --effective`}</code>
                    </pre>
                  </div>
                </div>
              </div>
            </div>

            {/* Set Config */}
            <div className="bg-gray-900/50 rounded-xl p-8 border border-gray-800">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Set Configuration</h3>
                  <p className="text-gray-400">Update configuration values interactively.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-medium rounded">Set</span>
                  <code className="text-purple-400 font-mono text-sm">config set</code>
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-gray-800 rounded-xl overflow-hidden">
                  <div className="bg-gray-700 px-4 py-2 border-b border-gray-600">
                    <span className="text-xs text-gray-400 font-mono">Set Commands</span>
                  </div>
                  <div className="p-4 overflow-x-auto">
                    <pre className="text-sm font-mono text-gray-300">
                      <code>{`# Set configuration values
torqvio config set api.url https://api.torqvio.com
torqvio config set auth.method oauth
torqvio config set workspace.default my-workspace

# Set nested values
torqvio config set database.pool.max 10
torqvio config set logging.level debug`}</code>
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
                <p className="text-gray-300">Store sensitive values in environment variables, not in configuration files</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Use separate configurations for each environment (dev, staging, prod)</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Configure appropriate connection pool sizes for your workload</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Enable SSL certificate verification and use secure authentication methods</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
              <div>
                <p className="text-gray-300">Regularly rotate API keys and encryption keys for security</p>
              </div>
            </div>
          </div>
        </section>

        {/* Next Steps */}
        <section className="space-y-6">
          <h2 className="text-3xl font-bold text-white">Next Steps</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link
              href="/docs/cli-debugging"
              className="group block p-6 bg-gradient-to-br from-purple-900/30 to-purple-800/30 rounded-xl border border-purple-700/50 hover:from-purple-800/40 hover:to-purple-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Terminal className="w-5 h-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-purple-300 transition-colors">
                  CLI Debugging
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Learn how to debug CLI issues and troubleshoot configuration problems.
              </p>
              <div className="flex items-center text-purple-400 text-sm font-medium">
                Debug CLI →
              </div>
            </Link>

            <Link
              href="/docs/cli-installation"
              className="group block p-6 bg-gradient-to-br from-blue-900/30 to-blue-800/30 rounded-xl border border-blue-700/50 hover:from-blue-800/40 hover:to-blue-700/40 transition-all hover:transform hover:scale-105"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                  <Download className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-semibold text-white group-hover:text-blue-300 transition-colors">
                  CLI Installation
                </h3>
              </div>
              <p className="text-gray-300 text-sm mb-3">
                Install and set up the Torqvio CLI for your platform.
              </p>
              <div className="flex items-center text-blue-400 text-sm font-medium">
                Install CLI →
              </div>
            </Link>
          </div>
        </section>
      </motion.div>
    </DocsPageWrapper>
  )
}
