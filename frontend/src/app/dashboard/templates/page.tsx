'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, Clock, Star, Download, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MarketplaceTemplate {
  id: string
  name: string
  description: string
  category: 'automation' | 'integration' | 'notification' | 'data' | 'retry'
  setupTime: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  downloads: number
  rating: number
  trending?: boolean
}

const marketplaceTemplates: MarketplaceTemplate[] = [
  {
    id: 'user-onboarding-flow',
    name: 'User Onboarding Flow',
    description: 'Complete user registration with email verification and welcome sequence',
    category: 'automation',
    setupTime: '5 min',
    difficulty: 'easy',
    tags: ['onboarding', 'email', 'verification'],
    downloads: 1247,
    rating: 4.9,
    trending: true,
  },
  {
    id: 'webhook-relay-pipeline',
    name: 'Webhook Relay Pipeline',
    description: 'Relay webhooks between services with retry logic and dead letter queue',
    category: 'integration',
    setupTime: '3 min',
    difficulty: 'easy',
    tags: ['webhook', 'relay', 'retry'],
    downloads: 856,
    rating: 4.7,
  },
  {
    id: 'scheduled-data-sync',
    name: 'Scheduled Data Sync',
    description: 'Automated data synchronization between databases on schedule',
    category: 'data',
    setupTime: '4 min',
    difficulty: 'medium',
    tags: ['sync', 'database', 'schedule'],
    downloads: 623,
    rating: 4.6,
  },
  {
    id: 'email-notification-sequence',
    name: 'Email Notification Sequence',
    description: 'Send targeted email sequences based on user actions',
    category: 'notification',
    setupTime: '2 min',
    difficulty: 'easy',
    tags: ['email', 'notification', 'marketing'],
    downloads: 445,
    rating: 4.8,
    trending: true,
  },
  {
    id: 'api-retry-circuit-breaker',
    name: 'API Retry with Circuit Breaker',
    description: 'Intelligent API retry logic with circuit breaker pattern',
    category: 'retry',
    setupTime: '3 min',
    difficulty: 'medium',
    tags: ['api', 'retry', 'circuit-breaker'],
    downloads: 312,
    rating: 4.5,
  },
]

const CATEGORIES: { value: string; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'automation', label: 'Automation' },
  { value: 'integration', label: 'Integration' },
  { value: 'notification', label: 'Notification' },
  { value: 'data', label: 'Data' },
  { value: 'retry', label: 'Retry' },
]

const DIFFICULTY_COLOR: Record<MarketplaceTemplate['difficulty'], string> = {
  easy:   'bg-success/10 text-success',
  medium: 'bg-warning/10 text-warning',
  hard:   'bg-error/10 text-error',
}

export default function TemplatesPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const filtered = marketplaceTemplates.filter((t) => {
    const q = searchQuery.toLowerCase()
    const matchesSearch = !q || t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  return (
    <div className="flex flex-col overflow-hidden -m-6" style={{ height: 'calc(100vh - 48px)' }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between h-12 px-4 border-b border-border gap-3 flex-shrink-0">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted pointer-events-none" />
          <input
            type="text"
            placeholder="Search templates…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-[26px] pl-8 pr-3 text-xs bg-surface border border-border rounded-md text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-1 focus:ring-primary/50"
          />
        </div>

        <div className="flex items-center gap-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={cn(
                'h-[26px] px-3 text-xs rounded-full transition-colors whitespace-nowrap',
                selectedCategory === cat.value
                  ? 'bg-primary/20 text-primary font-medium'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <span className="text-xs text-text-muted flex-shrink-0">
          {filtered.length} template{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Grid */}
      <div className="overflow-auto flex-1 p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-text-muted text-sm">
            No templates match your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((template) => (
              <div
                key={template.id}
                className="bg-surface border border-border rounded-lg p-4 flex flex-col gap-3 hover:border-primary/30 hover:-translate-y-px transition-all duration-150"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <h3 className="font-semibold text-text-primary text-sm truncate">{template.name}</h3>
                      {template.trending && (
                        <TrendingUp className="w-3 h-3 text-primary flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-xs text-text-secondary line-clamp-2">{template.description}</p>
                  </div>
                  <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0 capitalize', DIFFICULTY_COLOR[template.difficulty])}>
                    {template.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-xs text-text-muted">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {template.setupTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Download className="w-3 h-3" />
                    {template.downloads.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-warning" />
                    {template.rating}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1">
                  {template.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 bg-surface-light text-text-muted rounded-md">
                      {tag}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/dashboard/workflows/new?template=${template.id}`}
                  className="mt-auto inline-flex items-center justify-center h-[28px] px-3 text-xs font-medium rounded-md bg-purple-600 text-white hover:bg-purple-700 transition-colors"
                >
                  Use Template
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
