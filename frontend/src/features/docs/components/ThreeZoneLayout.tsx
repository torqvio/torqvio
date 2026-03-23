'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronRight, Book, Code2, Terminal, Users, Shield, Database, Search, Zap, Rocket, Wrench } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const USE_CASE_NAVIGATION = [
  {
    title: 'Get Started',
    icon: Rocket,
    description: 'First steps with Torqvio',
    items: [
      { title: 'Installation', href: '/docs/installation', badge: '5 min' },
      { title: 'Quick Start', href: '/docs/quick-start', badge: '5 min' },
      { title: 'First Workflow', href: '/docs/first-workflow', badge: '10 min' },
    ],
  },
  {
    title: 'Build & Automate',
    icon: Zap,
    description: 'Create powerful workflows',
    items: [
      { title: 'Send First Request', href: '/docs/rest-api', badge: 'Interactive' },
      { title: 'Create Workflow', href: '/docs/workflows', badge: 'Interactive' },
      { title: 'Handle Webhooks', href: '/docs/webhooks', badge: 'Advanced' },
      { title: 'Automate Workflows', href: '/docs/workflow-automation', badge: 'Business' },
    ],
  },
  {
    title: 'Scale & Monitor',
    icon: Wrench,
    description: 'Production-ready features',
    items: [
      { title: 'Error Handling', href: '/docs/error-handling', badge: 'Important' },
      { title: 'Monitoring', href: '/docs/monitoring', badge: 'Pro' },
      { title: 'Cloud Deploy', href: '/docs/deployment/cloud-deploy', badge: 'Managed' },
      { title: 'Security', href: '/docs/security', badge: 'Critical' },
    ],
  }
]

interface TwoZoneLayoutProps {
  children: React.ReactNode
  title?: string
  description?: string
}

export default function TwoZoneLayout({ 
  children, 
  title,
  description 
}: TwoZoneLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [expandedSections, setExpandedSections] = useState<string[]>(['Get Started'])
  const [searchQuery, setSearchQuery] = useState('')
  const pathname = usePathname()

  const toggleSection = (section: string) => {
    setExpandedSections(prev =>
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    )
  }

  const filteredNavigation = USE_CASE_NAVIGATION.map(section => ({
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
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Left Sidebar - Navigation */}
      <motion.aside
        initial={{ x: -300 }}
        animate={{ x: sidebarOpen ? 0 : -300 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 left-0 bottom-0 w-72 bg-gray-950/95 backdrop-blur-xl border-r border-gray-800/50 z-20 overflow-y-auto lg:translate-x-0"
      >
        {/* Mobile header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-800/50 lg:hidden">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Book className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-semibold text-white">Torqvio Docs</h2>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Desktop header */}
        <div className="hidden lg:block p-6 border-b border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Book className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Torqvio Docs</h2>
              <p className="text-xs text-gray-400">Developer Playground</p>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="px-6 pb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-gray-800/30 border border-gray-700/30 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/40 transition-all duration-200"
            />
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-4">
          {filteredNavigation.map((section) => {
            const Icon = section.icon
            const isExpanded = expandedSections.includes(section.title) || searchQuery !== ''
            const isActive = section.items.some(item => pathname === item.href)

            return (
              <div key={section.title} className="space-y-2">
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
                    <div className="text-left">
                      <span className="font-medium text-sm">{section.title}</span>
                      <p className="text-xs text-gray-500 mt-0.5">{section.description}</p>
                    </div>
                  </div>
                  <ChevronRight 
                    className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} 
                  />
                </button>

                {/* Section items */}
                {isExpanded && (
                  <div className="ml-7 space-y-1 animate-in slide-in-from-top-1 duration-200">
                    {section.items.map((item) => {
                      const isItemActive = pathname === item.href
                      return (
                        <Link
                          key={item.title}
                          href={item.href}
                          onClick={() => setSidebarOpen(false)}
                          className={`
                            flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-all duration-200
                            ${isItemActive
                              ? 'bg-purple-500/10 text-purple-400 border-l-2 border-purple-400 ml-2'
                              : 'text-gray-300 hover:text-white hover:bg-gray-800/50 ml-2'
                            }
                          `}
                        >
                          <span>{item.title}</span>
                          {item.badge && (
                            <span className="text-xs px-1.5 py-0.5 bg-gray-700/50 text-gray-400 rounded">
                              {item.badge}
                            </span>
                          )}
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
      </motion.aside>

      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-30">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2.5 bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content Area */}
      <div className="lg:ml-72">
        {/* Page Header */}
        {(title || description) && (
          <div className="bg-gradient-to-b from-gray-900/50 to-transparent px-8 py-12 border-b border-gray-800/50">
            <div className="max-w-4xl">
              {title && (
                <h1 className="text-4xl font-bold text-white mb-4">
                  {title}
                </h1>
              )}
              {description && (
                <p className="text-xl text-gray-300 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-8 py-8">
          {children}
        </div>
      </div>
    </div>
  )
}
