import { DocSection } from './types'

export const docSections: DocSection[] = [
  {
    id: 'getting-started',
    title: 'Getting Started',
    description: 'Quick start guides and basic concepts',
    icon: 'Book',
    color: '#6C5CE7',
    docs: [
      {
        title: 'Installation',
        description: 'Install Torqvio in your environment',
        url: '/installation',
        difficulty: 'beginner',
        estimatedTime: '5 min',
        tags: ['setup', 'installation', 'basics']
      },
      {
        title: 'Quick Start',
        description: 'Get up and running in 5 minutes',
        url: '/quick-start',
        difficulty: 'beginner',
        estimatedTime: '5 min',
        tags: ['setup', 'installation', 'basics']
      },
      {
        title: 'Configuration',
        description: 'Configure your Torqvio instance',
        url: '/configuration',
        difficulty: 'beginner',
        estimatedTime: '8 min',
        tags: ['config', 'setup', 'environment']
      },
      {
        title: 'First Workflow',
        description: 'Build and deploy your first durable workflow',
        url: '/first-workflow',
        difficulty: 'beginner',
        estimatedTime: '15 min',
        tags: ['tutorial', 'workflow', 'deployment']
      }
    ]
  },
  {
    id: 'api-reference',
    title: 'API Reference',
    description: 'Complete API documentation and SDKs',
    icon: 'Code2',
    color: '#00C896',
    docs: [
      {
        title: 'Client SDK',
        description: 'Official client libraries for major languages',
        url: '/client-sdk',
        difficulty: 'beginner',
        estimatedTime: '10 min',
        tags: ['sdk', 'client', 'libraries']
      },
      {
        title: 'REST API',
        description: 'Complete REST API reference',
        url: '/rest-api',
        difficulty: 'intermediate',
        estimatedTime: '45 min',
        tags: ['api', 'rest', 'reference']
      },
      {
        title: 'Webhooks',
        description: 'Webhook configuration and delivery',
        url: '/webhooks',
        difficulty: 'intermediate',
        estimatedTime: '15 min',
        tags: ['webhooks', 'api', 'integration']
      },
      {
        title: 'Error Handling',
        description: 'Handle errors and retries properly',
        url: '/error-handling',
        difficulty: 'intermediate',
        estimatedTime: '20 min',
        tags: ['errors', 'retries', 'best-practices']
      }
    ]
  },
  {
    id: 'cli-tools',
    title: 'CLI Tools',
    description: 'Command-line interface for managing workflows',
    icon: 'Terminal',
    color: '#FF6B35',
    docs: [
      {
        title: 'Installation',
        description: 'Install the Torqvio CLI',
        url: '/cli-installation',
        difficulty: 'beginner',
        estimatedTime: '3 min',
        tags: ['cli', 'installation', 'tools']
      },
      {
        title: 'Commands',
        description: 'Complete CLI command reference',
        url: '/cli-commands',
        difficulty: 'intermediate',
        estimatedTime: '25 min',
        tags: ['cli', 'commands', 'reference']
      },
      {
        title: 'Configuration',
        description: 'Configure CLI settings and profiles',
        url: '/cli-configuration',
        difficulty: 'intermediate',
        estimatedTime: '12 min',
        tags: ['cli', 'config', 'settings']
      },
      {
        title: 'Debugging',
        description: 'Debug workflows using CLI tools',
        url: '/cli-debugging',
        difficulty: 'advanced',
        estimatedTime: '18 min',
        tags: ['cli', 'debugging', 'troubleshooting']
      }
    ]
  },
  {
    id: 'guides',
    title: 'Guides',
    description: 'Step-by-step tutorials and best practices',
    icon: 'Users',
    color: '#F59E0B',
    docs: [
      {
        title: 'Webhook Integration',
        description: 'Handle incoming webhooks reliably',
        url: '/webhook-integration',
        difficulty: 'intermediate',
        estimatedTime: '18 min',
        tags: ['webhooks', 'integration', 'api']
      },
      {
        title: 'Workflow Automation',
        description: 'Build automated workflows for business processes',
        url: '/workflow-automation',
        difficulty: 'intermediate',
        estimatedTime: '25 min',
        tags: ['automation', 'workflows', 'business']
      },
      {
        title: 'Event Streaming',
        description: 'Process real-time event streams',
        url: '/event-streaming',
        difficulty: 'advanced',
        estimatedTime: '30 min',
        tags: ['events', 'streaming', 'realtime']
      },
      {
        title: 'Batch Jobs',
        description: 'Handle large-scale batch processing',
        url: '/batch-jobs',
        difficulty: 'advanced',
        estimatedTime: '35 min',
        tags: ['batch', 'processing', 'scale']
      }
    ]
  },
  {
    id: 'security',
    title: 'Security',
    description: 'Security best practices and configuration',
    icon: 'Shield',
    color: '#8B5CF6',
    docs: [
      {
        title: 'Authentication',
        description: 'Secure authentication and authorization',
        url: '/authentication',
        difficulty: 'intermediate',
        estimatedTime: '20 min',
        tags: ['auth', 'security', 'oauth']
      },
      {
        title: 'API Authentication',
        description: 'Configure API keys and authentication for workflows',
        url: '/api-authentication',
        difficulty: 'beginner',
        estimatedTime: '8 min',
        tags: ['api-keys', 'auth', 'security']
      },
      {
        title: 'Network Security',
        description: 'Secure network configuration',
        url: '/network-security',
        difficulty: 'advanced',
        estimatedTime: '25 min',
        tags: ['network', 'security', 'infrastructure']
      },
      {
        title: 'Compliance',
        description: 'SOC 2 and compliance requirements',
        url: '/compliance',
        difficulty: 'advanced',
        estimatedTime: '30 min',
        tags: ['compliance', 'soc2', 'security']
      }
    ]
  },
  {
    id: 'infrastructure',
    title: 'Infrastructure',
    description: 'Deploy and scale Torqvio in any environment',
    icon: 'Database',
    color: '#3B82F6',
    docs: [
      {
        title: 'Deployment',
        description: 'Deploy Torqvio to production',
        url: '/deployment',
        difficulty: 'intermediate',
        estimatedTime: '40 min',
        tags: ['deployment', 'production', 'infrastructure']
      },
      {
        title: 'Monitoring',
        description: 'Set up comprehensive monitoring',
        url: '/monitoring',
        difficulty: 'intermediate',
        estimatedTime: '30 min',
        tags: ['monitoring', 'observability', 'metrics']
      },
      {
        title: 'Scaling',
        description: 'Scale Torqvio for high throughput',
        url: '/scaling',
        difficulty: 'advanced',
        estimatedTime: '35 min',
        tags: ['scaling', 'performance', 'architecture']
      },
      {
        title: 'Backup & Recovery',
        description: 'Implement backup and disaster recovery',
        url: '/backup-recovery',
        difficulty: 'advanced',
        estimatedTime: '25 min',
        tags: ['backup', 'recovery', 'disaster']
      }
    ]
  },
  {
    id: 'deployment',
    title: 'Cloud Deployment',
    description: 'Deploy Torqvio to our managed cloud infrastructure',
    icon: 'Cloud',
    color: '#3B82F6',
    docs: [
      {
        title: 'Quick Deploy',
        description: 'One-click deployment to Torqvio Cloud',
        url: '/deployment/quick-deploy',
        difficulty: 'beginner',
        estimatedTime: '5 min',
        tags: ['cloud', 'deployment', 'managed']
      },
      {
        title: 'Environment Configuration',
        description: 'Configure staging and production environments',
        url: '/deployment/environments',
        difficulty: 'intermediate',
        estimatedTime: '15 min',
        tags: ['environments', 'config', 'production']
      },
      {
        title: 'Custom Domains',
        description: 'Connect your custom domain with SSL',
        url: '/deployment/custom-domains',
        difficulty: 'intermediate',
        estimatedTime: '10 min',
        tags: ['domains', 'ssl', 'custom']
      },
      {
        title: 'CI/CD Integration',
        description: 'Automate deployments from GitHub/GitLab',
        url: '/deployment/cicd',
        difficulty: 'intermediate',
        estimatedTime: '15 min',
        tags: ['cicd', 'automation', 'github']
      }
    ]
  },
  {
    id: 'scheduling',
    title: 'Cron & Scheduling',
    description: 'Schedule recurring jobs that run reliably and never silently fail',
    icon: 'Clock',
    color: '#F59E0B',
    docs: [
      {
        title: 'Scheduling Overview',
        description: 'How the Torqvio scheduler works — polling, persistence, and failure handling',
        url: '/scheduling/overview',
        difficulty: 'beginner',
        estimatedTime: '10 min',
        tags: ['cron', 'scheduling', 'overview']
      },
      {
        title: 'Cron Syntax',
        description: 'Write cron expressions for any schedule — with examples',
        url: '/scheduling/cron-syntax',
        difficulty: 'beginner',
        estimatedTime: '8 min',
        tags: ['cron', 'syntax', 'scheduling']
      },
      {
        title: 'Retry & Recovery',
        description: 'Configure what happens when a scheduled job fails — retries, backoff, alerts',
        url: '/scheduling/retry-recovery',
        difficulty: 'intermediate',
        estimatedTime: '15 min',
        tags: ['cron', 'retries', 'recovery', 'scheduling']
      },
      {
        title: 'Managing Scheduled Jobs',
        description: 'Create, pause, inspect, and delete scheduled jobs via API and dashboard',
        url: '/scheduling/managing-jobs',
        difficulty: 'beginner',
        estimatedTime: '12 min',
        tags: ['cron', 'jobs', 'management', 'api']
      }
    ]
  }
]

export const quickLinks = [
  { title: 'Installation Guide', href: '/installation', icon: 'Zap' },
  { title: 'API Documentation', href: '/rest-api', icon: 'Code2' },
  { title: 'Examples', href: '#examples', icon: 'PlayCircle' },
  { title: 'Troubleshooting', href: '#troubleshooting', icon: 'Search' }
]
