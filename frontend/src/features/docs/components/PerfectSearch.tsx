'use client'

import { useEffect, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { SearchFilter } from '../types'

interface PerfectSearchProps {
  query: string
  difficulty: SearchFilter
  onQueryChange: (value: string) => void
  onDifficultyChange: (value: SearchFilter) => void
  resultCount?: number
  isSearching?: boolean
}

const LEVELS: { value: SearchFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
]

export function PerfectSearch({
  query,
  difficulty,
  onQueryChange,
  onDifficultyChange,
  resultCount,
  isSearching,
}: PerfectSearchProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="w-full space-y-3">
      {/* Search input */}
      <div className="flex items-center gap-3 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 focus-within:border-purple-500 transition-colors">
        <Search className="w-5 h-5 text-gray-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search documentation, APIs, examples..."
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none text-base"
        />
        {query && (
          <button
            onClick={() => onQueryChange('')}
            className="text-gray-500 hover:text-white transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filters + result count */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {LEVELS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => onDifficultyChange(value)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                difficulty === value
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  : 'text-gray-500 hover:text-gray-300 border border-transparent'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {query && (
          <span className="text-xs text-gray-500">
            {isSearching ? 'Searching...' : `${resultCount ?? 0} result${resultCount !== 1 ? 's' : ''}`}
          </span>
        )}
      </div>
    </div>
  )
}
