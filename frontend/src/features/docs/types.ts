export interface DocSection {
  id: string
  title: string
  description: string
  icon: string
  color: string
  docs: DocItem[]
}

export interface DocItem {
  title: string
  description: string
  url: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  estimatedTime: string
  tags: string[]
}

export type SearchFilter = 'all' | 'beginner' | 'intermediate' | 'advanced'

export interface SearchState {
  query: string
  difficulty: SearchFilter
  selectedSection: string | null
}
