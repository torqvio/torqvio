'use client'

import { motion } from 'framer-motion'
import { Search } from 'lucide-react'
import {
  SectionCard,
  Background,
  DocsSearch,
  docSections,
  useDocsSearch
} from '@/features/docs'
import PublicNavbar from '@/components/layout/PublicNavbar'

export default function DocsPage() {
  const { searchState, filteredDocs, isSearching, actions } = useDocsSearch()
  const hasActiveFilter = searchState.query !== '' || searchState.difficulty !== 'all'

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Background />

      <div className="relative z-10">
        <PublicNavbar currentPage="docs" />

        {/* Hero */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="max-w-7xl mx-auto px-6 pt-24 pb-10 text-center"
        >
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Build Durable Workflows
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-3xl mx-auto">
            Comprehensive documentation to help you master Torqvio. From quick start guides to advanced architecture patterns.
          </p>

          <div className="max-w-2xl mx-auto">
            <DocsSearch
              query={searchState.query}
              difficulty={searchState.difficulty}
              onQueryChange={actions.updateQuery}
              onDifficultyChange={actions.updateDifficulty}
              resultCount={filteredDocs.reduce((acc, s) => acc + s.docs.length, 0)}
              isSearching={isSearching}
            />
          </div>
        </motion.section>

        {/* Stats */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="max-w-7xl mx-auto px-6 py-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { label: 'Total Docs', value: docSections.reduce((acc, s) => acc + s.docs.length, 0) },
              { label: 'Categories', value: docSections.length },
              { label: 'Quick Start', value: '5 min' },
              { label: 'Updated', value: 'Daily' }
            ].map((stat) => (
              <div key={stat.label} className="text-center p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                <div className="text-2xl font-bold text-purple-400 mb-2">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* Sections */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="max-w-7xl mx-auto px-6 py-8"
        >
          {filteredDocs.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No documentation found</h3>
              <p className="text-gray-400 mb-4">Try adjusting your search or filters</p>
              {hasActiveFilter && (
                <button
                  onClick={actions.clearFilters}
                  className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            filteredDocs.map((section, index) => (
              <SectionCard
                key={section.id}
                section={section}
                index={index}
                searchQuery={searchState.query}
              />
            ))
          )}
        </motion.section>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="max-w-7xl mx-auto px-6 py-12 border-t border-gray-800"
        >
          <div className="text-center text-gray-400">
            <p>© {new Date().getFullYear()} Torqvio. Built with durability in mind.</p>
          </div>
        </motion.footer>
      </div>
    </div>
  )
}
