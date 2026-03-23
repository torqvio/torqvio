'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, ChevronRight, Book, Code2, Terminal, Users, Shield, Database, Search } from 'lucide-react'
import PublicNavbar from '@/components/layout/PublicNavbar'

const navigation = [
  {
    title: 'Getting Started',
    icon: Book,
    items: [
      { title: 'Installation', href: '/docs/installation' },
      { title: 'Quick Start', href: '/docs/quick-start' },
      { title: 'AI Agents', href: '/docs/ai-agents' },
      { title: 'Configuration', href: '/docs/configuration' },
      { title: 'First Workflow', href: '/docs/first-workflow' },
    ],
  },
  {
    title: 'API Reference',
    icon: Code2,
    items: [
      { title: 'Client SDK', href: '/docs/client-sdk' },
      { title: 'REST API', href: '/docs/rest-api' },
      { title: 'Webhooks', href: '/docs/webhooks' },
      { title: 'Error Handling', href: '/docs/error-handling' },
    ],
  },
  {
    title: 'CLI Tools',
    icon: Terminal,
    items: [
      { title: 'Installation', href: '/docs/cli-installation' },
      { title: 'Commands', href: '/docs/cli-commands' },
      { title: 'Configuration', href: '/docs/cli-configuration' },
      { title: 'Debugging', href: '/docs/cli-debugging' },
    ],
  },
  {
    title: 'Guides',
    icon: Users,
    items: [
      { title: 'Webhook Integration', href: '/docs/webhook-integration' },
      { title: 'Payment Processing', href: '/docs/payment-processing' },
      { title: 'Event Streaming', href: '/docs/event-streaming' },
      { title: 'Batch Jobs', href: '/docs/batch-jobs' },
    ],
  },
  {
    title: 'Security',
    icon: Shield,
    items: [
      { title: 'Authentication', href: '/docs/authentication' },
      { title: 'API Keys', href: '/docs/api-keys' },
      { title: 'Network Security', href: '/docs/network-security' },
      { title: 'Compliance', href: '/docs/compliance' },
    ],
  },
  {
    title: 'Infrastructure',
    icon: Database,
    items: [
      { title: 'Deployment', href: '/docs/deployment' },
      { title: 'Monitoring', href: '/docs/monitoring' },
      { title: 'Scaling', href: '/docs/scaling' },
      { title: 'Backup & Recovery', href: '/docs/backup-recovery' },
    ],
  },
]

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['Getting Started'])
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const isSectionActive = (section: typeof navigation[0]) => {
    return section.items.some(item => pathname === item.href)
  }

  const filteredNavigation = navigation.map(section => ({
    ...section,
    items: section.items.filter(item => 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      section.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(section => 
    searchQuery === '' || 
    section.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    section.items.length > 0
  )

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <PublicNavbar currentPage="docs" />

      <div className="flex">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            fixed top-16 bottom-0 left-0 z-50 w-72 bg-gray-900/95 backdrop-blur-xl border-r border-gray-800/50 
            transition-transform duration-300 ease-in-out
            lg:translate-x-0 lg:fixed lg:top-16 lg:bottom-0 lg:left-0 lg:z-40
            overflow-y-auto
          `}
        >
          {/* Mobile header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-800/50 lg:hidden">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Book className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Documentation</h2>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile search bar */}
          <div className="px-6 pb-6 lg:hidden">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-800/30 border border-gray-700/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all duration-200"
              />
            </div>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:block p-6 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                <Book className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-white">Documentation</h2>
            </div>
          </div>

          {/* Search bar */}
          <div className="px-6 pb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-gray-800/30 border border-gray-700/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all duration-200"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-4 space-y-2">
            {filteredNavigation.map((section) => {
              const Icon = section.icon
              const isExpanded = expandedSections.includes(section.title) || searchQuery !== ''
              const isActive = isSectionActive(section)

              return (
                <div key={section.title} className="space-y-1">
                  {/* Section header */}
                  <button
                    onClick={() => toggleSection(section.title)}
                    className={`
                      w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all duration-200
                      ${isActive 
                        ? 'bg-purple-500/10 text-purple-400 border-l-2 border-purple-400' 
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{section.title}</span>
                    </div>
                    <ChevronRight 
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                    />
                  </button>

                  {/* Section items */}
                  {isExpanded && (
                    <div className="ml-7 space-y-0.5 animate-in slide-in-from-top-1 duration-200">
                      {section.items.map((item) => {
                        const isItemActive = pathname === item.href
                        return (
                          <Link
                            key={item.title}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                              block px-3 py-2 text-sm rounded-lg transition-all duration-200
                              ${isItemActive
                                ? 'bg-purple-500/10 text-purple-400 border-l-2 border-purple-400 ml-2'
                                : 'text-gray-300 hover:text-white hover:bg-gray-800/50 ml-2'
                              }
                            `}
                          >
                            {item.title}
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="hidden lg:block p-4 mt-auto border-t border-gray-800/50">
            <div className="px-3 py-2">
              <p className="text-xs text-gray-500 mb-2">Need help?</p>
              <div className="space-y-1">
                <Link href="#" className="block text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  Join our Discord
                </Link>
                <Link href="#" className="block text-xs text-purple-400 hover:text-purple-300 transition-colors">
                  GitHub Discussions
                </Link>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 lg:ml-72">
          {/* Mobile menu button */}
          <div className="lg:hidden sticky top-0 z-30 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 px-4 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>

          {/* Page content */}
          <div className="min-h-screen">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
