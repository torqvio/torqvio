'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { docSections } from '../data'
import { DocItem, SearchFilter, SearchState } from '../types'

export function useDocsSearch() {
  const [searchState, setSearchState] = useState<SearchState>({
    query: '',
    difficulty: 'all',
    selectedSection: null
  })
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)

  // Debounce search query
  useEffect(() => {
    if (searchState.query.trim() === '') {
      setDebouncedQuery('')
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const timer = setTimeout(() => {
      setDebouncedQuery(searchState.query)
      setIsSearching(false)
    }, 300)

    return () => {
      clearTimeout(timer)
      setIsSearching(false)
    }
  }, [searchState.query])

  const filteredDocs = useMemo(() => {
    let sections = [...docSections]

    // Filter by selected section
    if (searchState.selectedSection) {
      sections = sections.filter(section => section.id === searchState.selectedSection)
    }

    // Filter each section's docs using debounced query
    const result = sections.map(section => ({
      ...section,
      docs: section.docs.filter(doc => {
        // Filter by query
        const matchesQuery = !debouncedQuery || 
          doc.title.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          doc.description.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
          doc.tags.some(tag => tag.toLowerCase().includes(debouncedQuery.toLowerCase()))

        // Filter by difficulty
        const matchesDifficulty = searchState.difficulty === 'all' || doc.difficulty === searchState.difficulty

        return matchesQuery && matchesDifficulty
      })
    })).filter(section => section.docs.length > 0) // Remove empty sections

    return result
  }, [debouncedQuery, searchState.difficulty, searchState.selectedSection])

  const allDocs = useMemo(() => {
    return docSections.flatMap(section => section.docs)
  }, [])

  const updateQuery = useCallback((query: string) => {
    setSearchState(prev => ({ ...prev, query }))
  }, [])

  const updateDifficulty = (difficulty: SearchFilter) => {
    setSearchState(prev => ({ ...prev, difficulty }))
  }

  const updateSection = (sectionId: string | null) => {
    setSearchState(prev => ({ ...prev, selectedSection: sectionId }))
  }

  const clearFilters = () => {
    setSearchState({
      query: '',
      difficulty: 'all',
      selectedSection: null
    })
    setDebouncedQuery('')
  }

  return {
    searchState,
    filteredDocs,
    allDocs,
    isSearching,
    actions: {
      updateQuery,
      updateDifficulty,
      updateSection,
      clearFilters
    }
  }
}
