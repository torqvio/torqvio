'use client'

import { PerfectSearch } from './PerfectSearch'
import { SearchFilter } from '../types'

interface DocsSearchProps {
  query: string
  difficulty: SearchFilter
  onQueryChange: (value: string) => void
  onDifficultyChange: (value: SearchFilter) => void
  resultCount?: number
  isSearching?: boolean
}

export function DocsSearch({ 
  query, 
  difficulty, 
  onQueryChange, 
  onDifficultyChange,
  resultCount,
  isSearching 
}: DocsSearchProps) {
  return (
    <PerfectSearch
      query={query}
      difficulty={difficulty}
      onQueryChange={onQueryChange}
      onDifficultyChange={onDifficultyChange}
      resultCount={resultCount}
      isSearching={isSearching}
    />
  )
}
