'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { RefreshCw, Activity, Webhook, Shield, Zap, Clock, Database, Users, Rocket, GitBranch, Timer, BarChart3, Code2, Globe, Lock, HeadphonesIcon, Cpu, Link2, FileText, PieChart, CheckCircle2 } from 'lucide-react'
import PublicNavbar from '@/components/layout/PublicNavbar'

// ─── Background ───────────────────────────────────────────────────────────────

function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute rounded-full blur-[160px] opacity-15"
        style={{ background: '#6C5CE7', width: 800, height: 800, top: '-20%', left: '-15%' }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full blur-[120px] opacity-10"
        style={{ background: '#00C896', width: 600, height: 600, bottom: '-10%', right: '-10%' }}
        animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(#6C5CE7 1px, transparent 1px),
                            linear-gradient(90deg, #6C5CE7 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  )
}

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  benefits: string[]
  category: 'core' | 'reliability' | 'observability' | 'integration' | 'enterprise'
  color: string
}

interface FeatureCategory {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
}

const categories: FeatureCategory[] = [
  {
    id: 'core',
    name: 'Core Engine',
    description: 'The foundation of durable execution',
    icon: <Cpu className="w-6 h-6" />,
    color: 'purple'
  },
  {
    id: 'reliability',
    name: 'Reliability',
    description: 'Never lose a workflow again',
    icon: <Shield className="w-6 h-6" />,
    color: 'emerald'
  },
  {
    id: 'observability',
    name: 'Observability',
    description: 'See everything that happens',
    icon: <BarChart3 className="w-6 h-6" />,
    color: 'blue'
  },
  {
    id: 'integration',
    name: 'Integrations',
    description: 'Connect with everything',
    icon: <Link2 className="w-6 h-6" />,
    color: 'orange'
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Built for scale and security',
    icon: <Lock className="w-6 h-6" />,
    color: 'red'
  }
]

const features: Feature[] = [
  // Core Features
  {
    icon: <Rocket className="w-6 h-6" />,
    title: 'Durable Execution',
    description: 'Workflows survive crashes, restarts, and infrastructure failures. Your business logic keeps running no matter what.',
    benefits: [
      'Automatic state persistence',
      'Crash recovery and resume',
      'Infrastructure-agnostic execution',
      'Zero data loss guarantee'
    ],
    category: 'core',
    color: '#6C5CE7'
  },
  {
    icon: <GitBranch className="w-6 h-6" />,
    title: 'Workflow Orchestration',
    description: 'Complex multi-step workflows with conditional branching, parallel execution, and error handling.',
    benefits: [
      'Visual workflow designer',
      'Conditional logic and branching',
      'Parallel and sequential steps',
      'Dynamic workflow generation'
    ],
    category: 'core',
    color: '#6C5CE7'
  },
  {
    icon: <Timer className="w-6 h-6" />,
    title: 'Smart Scheduling',
    description: 'Cron-based scheduling with timezone support, retry logic, and calendar integration.',
    benefits: [
      'Cron expression support',
      'Timezone-aware scheduling',
      'Missed execution catch-up',
      'Calendar-based triggers'
    ],
    category: 'core',
    color: '#6C5CE7'
  },
  // Reliability Features
  {
    icon: <RefreshCw className="w-6 h-6" />,
    title: 'Intelligent Retries',
    description: 'Exponential backoff, circuit breakers, and custom retry policies for handling transient failures.',
    benefits: [
      'Exponential backoff algorithms',
      'Circuit breaker patterns',
      'Custom retry policies',
      'Dead letter queue handling'
    ],
    category: 'reliability',
    color: '#00C896'
  },
  {
    icon: <Activity className="w-6 h-6" />,
    title: 'Health Monitoring',
    description: 'Real-time health checks, system diagnostics, and automated failure detection.',
    benefits: [
      'Real-time health metrics',
      'Automated failure detection',
      'System diagnostics',
      'Performance monitoring'
    ],
    category: 'reliability',
    color: '#00C896'
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: 'High Performance',
    description: 'Optimized execution engine with sub-second latency and massive scalability.',
    benefits: [
      'Sub-second execution latency',
      'Horizontal scalability',
      'Resource optimization',
      'Load balancing'
    ],
    category: 'reliability',
    color: '#00C896'
  },
  // Observability Features
  {
    icon: <BarChart3 className="w-6 h-6" />,
    title: 'Real-time Analytics',
    description: 'Live dashboards, execution metrics, and performance insights.',
    benefits: [
      'Live execution dashboards',
      'Custom metrics and alerts',
      'Performance analytics',
      'Historical trend analysis'
    ],
    category: 'observability',
    color: '#3B82F6'
  },
  {
    icon: <FileText className="w-6 h-6" />,
    title: 'Detailed Logging',
    description: 'Structured logging with search, filtering, and archival capabilities.',
    benefits: [
      'Structured log format',
      'Advanced search and filtering',
      'Log retention policies',
      'Export and archival'
    ],
    category: 'observability',
    color: '#3B82F6'
  },
  {
    icon: <PieChart className="w-6 h-6" />,
    title: 'Usage Analytics',
    description: 'Track resource consumption, costs, and utilization patterns.',
    benefits: [
      'Resource usage tracking',
      'Cost analysis and reporting',
      'Utilization patterns',
      'Capacity planning insights'
    ],
    category: 'observability',
    color: '#3B82F6'
  },
  // Integration Features
  {
    icon: <Webhook className="w-6 h-6" />,
    title: 'Webhook Delivery',
    description: 'Guaranteed webhook delivery with retries, signing, and monitoring.',
    benefits: [
      'Guaranteed delivery SLA',
      'Webhook signature verification',
      'Delivery monitoring',
      'Custom retry policies'
    ],
    category: 'integration',
    color: '#FF6B35'
  },
  {
    icon: <Code2 className="w-6 h-6" />,
    title: 'API Integration',
    description: 'RESTful APIs, GraphQL support, and SDKs for major programming languages.',
    benefits: [
      'RESTful API design',
      'GraphQL support',
      'Multi-language SDKs',
      'OpenAPI documentation'
    ],
    category: 'integration',
    color: '#FF6B35'
  },
  {
    icon: <Globe className="w-6 h-6" />,
    title: 'Third-party Connectors',
    description: 'Pre-built connectors for popular services and platforms.',
    benefits: [
      '100+ pre-built connectors',
      'Custom connector development',
      'OAuth integration',
      'API key management'
    ],
    category: 'integration',
    color: '#FF6B35'
  },
  // Enterprise Features
  {
    icon: <Lock className="w-6 h-6" />,
    title: 'Enterprise Security',
    description: 'SOC 2 compliance, encryption at rest and in transit, and audit logging.',
    benefits: [
      'SOC 2 Type II certified',
      'End-to-end encryption',
      'Comprehensive audit logs',
      'Role-based access control'
    ],
    category: 'enterprise',
    color: '#EF4444'
  },
  {
    icon: <Users className="w-6 h-6" />,
    title: 'Team Collaboration',
    description: 'Role-based access control, team management, and collaboration tools.',
    benefits: [
      'Role-based permissions',
      'Team workspace management',
      'Collaborative workflow design',
      'Activity tracking'
    ],
    category: 'enterprise',
    color: '#EF4444'
  },
  {
    icon: <HeadphonesIcon className="w-6 h-6" />,
    title: 'Premium Support',
    description: '24/7 enterprise support with dedicated account managers and SLAs.',
    benefits: [
      '24/7 technical support',
      'Dedicated account manager',
      '99.9% uptime SLA',
      'Priority bug fixes'
    ],
    category: 'enterprise',
    color: '#EF4444'
  }
]

function FeatureCard({ feature, index }: { feature: Feature; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative rounded-2xl p-6 cursor-default h-full"
      style={{
        background: 'rgba(20, 25, 38, 0.6)',
        border: '1px solid rgba(42, 49, 66, 0.7)',
        backdropFilter: 'blur(8px)',
      }}
    >
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(circle at 30% 30%, ${feature.color}08, transparent 70%)` }}
      />
      
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `${feature.color}18`, border: `1px solid ${feature.color}30` }}
      >
        <div style={{ color: feature.color }}>
          {feature.icon}
        </div>
      </div>

      <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-4">{feature.description}</p>

      <div className="space-y-2">
        {feature.benefits.map((benefit, i) => (
          <div key={i} className="flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            <span className="text-xs text-gray-300">{benefit}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function CategorySection({ category, features }: { category: FeatureCategory; features: Feature[] }) {
  const getCategoryColor = (color: string) => {
    const colors = {
      purple: 'from-purple-500 to-purple-600',
      emerald: 'from-emerald-500 to-emerald-600',
      blue: 'from-blue-500 to-blue-600',
      orange: 'from-orange-500 to-orange-600',
      red: 'from-red-500 to-red-600'
    }
    return colors[color as keyof typeof colors] || 'from-gray-500 to-gray-600'
  }

  const getCategoryBgColor = (color: string) => {
    const colors = {
      purple: 'bg-purple-500/10',
      emerald: 'bg-emerald-500/10',
      blue: 'bg-blue-500/10',
      orange: 'bg-orange-500/10',
      red: 'bg-red-500/10'
    }
    return colors[color as keyof typeof colors] || 'bg-gray-500/10'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="mb-16"
    >
      <div className="text-center mb-8">
        <div className={`inline-flex items-center gap-3 px-4 py-2 rounded-full ${getCategoryBgColor(category.color)} mb-4`}>
          <div className={`bg-gradient-to-r ${getCategoryColor(category.color)} bg-clip-text text-transparent`}>
            {category.icon}
          </div>
          <span className={`text-sm font-semibold bg-gradient-to-r ${getCategoryColor(category.color)} bg-clip-text text-transparent`}>
            {category.name}
          </span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">{category.name}</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">{category.description}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => (
          <FeatureCard key={`${category.id}-${index}`} feature={feature} index={index} />
        ))}
      </div>
    </motion.div>
  )
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <Background />
      <div className="relative z-10">
        <PublicNavbar currentPage="features" />
        
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-16"
            >
              <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">Features</p>
              <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tight mb-6">
                Built for<br />
                <span className="text-purple-400">Production Scale</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed mb-12">
                Every feature engineered for reliability, scalability, and developer experience. 
                From startup to enterprise, Torqvio grows with you.
              </p>

              <div className="flex justify-center gap-8 mb-12">
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-400">99.9%</div>
                  <div className="text-sm text-gray-400">Uptime SLA</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-emerald-400">&lt;100ms</div>
                  <div className="text-sm text-gray-400">Execution Latency</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-400">10M+</div>
                  <div className="text-sm text-gray-400">Executions/day</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-orange-400">100+</div>
                  <div className="text-sm text-gray-400">Integrations</div>
                </div>
              </div>
            </motion.div>

            {/* Category Sections */}
            {categories.map((category) => (
              <CategorySection
                key={category.id}
                category={category}
                features={features.filter(f => f.category === category.id)}
              />
            ))}

            {/* CTA Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mt-16"
            >
              <div className="rounded-2xl p-12 max-w-4xl mx-auto"
                style={{
                  background: 'rgba(108, 92, 231, 0.1)',
                  border: '1px solid rgba(108, 92, 231, 0.3)',
                  backdropFilter: 'blur(8px)',
                }}
              >
                <h2 className="text-3xl font-bold text-white mb-4">
                  Ready to build something<br />
                  <span className="text-purple-400">extraordinary?</span>
                </h2>
                <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                  Join thousands of developers who trust Torqvio for their most critical workflows.
                  Start free, scale as you grow.
                </p>
                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => router.push('/pricing')}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 font-semibold"
                  >
                    View Pricing
                  </button>
                  <button
                    onClick={() => router.push('/login')}
                    className="px-6 py-3 border border-gray-600 text-white rounded-lg hover:border-gray-500 transition-colors font-semibold"
                  >
                    Get Started Free
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}
