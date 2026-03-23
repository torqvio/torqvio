'use client'

import { Search } from 'lucide-react'
import { QueueStatusFilter, QueueTypeFilter } from '../types'

interface QueuesFiltersProps {
  searchQuery: string
  statusFilter: QueueStatusFilter
  typeFilter: QueueTypeFilter
  onSearchChange: (value: string) => void
  onStatusFilterChange: (value: QueueStatusFilter) => void
  onTypeFilterChange: (value: QueueTypeFilter) => void
}

export function QueuesFilters({
  searchQuery,
  statusFilter,
  typeFilter,
  onSearchChange,
  onStatusFilterChange,
  onTypeFilterChange,
}: QueuesFiltersProps) {
  return (
    <div className="flex items-center gap-4 p-4 bg-muted/30 border-b">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
        <input
          type="text"
          placeholder="Search queues..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-background border rounded-md placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>
      
      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as QueueStatusFilter)}
        className="px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="all">All Status</option>
        <option value="active">Active</option>
        <option value="paused">Paused</option>
        <option value="error">Error</option>
      </select>
      
      <select
        value={typeFilter}
        onChange={(e) => onTypeFilterChange(e.target.value as QueueTypeFilter)}
        className="px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="all">All Types</option>
        <option value="fifo">FIFO</option>
        <option value="priority">Priority</option>
        <option value="delayed">Delayed</option>
      </select>
    </div>
  )
}
