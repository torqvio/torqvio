'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  List, 
  Plus, 
  RefreshCw 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { 
  useQueues, 
  useMessages,
  QueuesTable,
  MessagesTable,
  QueueMetrics,
  QueuesFilters,
  type QueueTab 
} from '@/features/queues'
import { cn } from '@/lib/utils'

export default function QueuesPage() {
  const [activeTab, setActiveTab] = useState<QueueTab>('queues')
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showMessageDetails, setShowMessageDetails] = useState<string | null>(null)
  
  // Custom hooks for state management
  const queues = useQueues()
  const messages = useMessages()
  
  const handleQueueAction = (action: string, queueId: string) => {
    if (action === 'create') {
      setShowCreateDialog(true)
      return
    }
    queues.actions.handleQueueAction({ action, queueId })
  }
  
  const handleMessageAction = (action: string, messageId: string) => {
    messages.actions.handleMessageAction({ action, messageId })
  }
  
  const handleShowMessageDetails = (messageId: string) => {
    setShowMessageDetails(messageId)
  }

  return (
    <div className="flex overflow-hidden -m-6" style={{ height: 'calc(100vh - 48px)' }}>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-surface border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
                <List className="w-6 h-6" />
                Queues
              </h1>
              <p className="text-text-secondary">Manage message queues and background job processing</p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => queues.actions.setAutoRefresh(!queues.filters.autoRefresh)}
                className={cn(
                  queues.filters.autoRefresh && "text-primary bg-primary/10 hover:bg-primary/20"
                )}
              >
                <RefreshCw className={cn("w-4 h-4 mr-2", queues.filters.autoRefresh && "animate-spin")} />
                Auto-refresh
              </Button>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Queue
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex items-center gap-6 mt-4 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Total Queues:</span>
              <span className="text-text-primary font-medium">{queues.stats.total}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Active:</span>
              <span className="text-green-400 font-medium">{queues.stats.active}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Paused:</span>
              <span className="text-yellow-400 font-medium">{queues.stats.paused}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Errors:</span>
              <span className="text-red-400 font-medium">{queues.stats.error}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-text-secondary">Total Messages:</span>
              <span className="text-text-primary font-medium">{queues.stats.totalMessages.toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex-shrink-0 bg-surface border-b border-border">
          <div className="flex items-center gap-1 px-6">
            {[
              { value: 'queues', label: 'Queues' },
              { value: 'messages', label: 'Messages' },
              { value: 'metrics', label: 'Metrics' }
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as QueueTab)}
                className={cn(
                  'px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.value
                    ? 'text-primary border-primary'
                    : 'text-text-muted border-transparent hover:text-text-secondary'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'queues' && (
              <motion.div
                key="queues"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <QueuesFilters
                  searchQuery={queues.filters.searchQuery}
                  statusFilter={queues.filters.statusFilter}
                  typeFilter={queues.filters.typeFilter}
                  onSearchChange={queues.actions.setSearchQuery}
                  onStatusFilterChange={queues.actions.setStatusFilter}
                  onTypeFilterChange={queues.actions.setTypeFilter}
                />
                <div className="p-6">
                  <QueuesTable
                    queues={queues.filteredQueues}
                    onQueueAction={handleQueueAction}
                  />
                </div>
              </motion.div>
            )}
            
            {activeTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                {/* Messages Filters */}
                <div className="flex items-center gap-4 p-4 bg-muted/30 border-b mb-6">
                  <select
                    value={messages.filters.selectedQueueId}
                    onChange={(e) => messages.actions.setSelectedQueueId(e.target.value)}
                    className="px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">All Queues</option>
                    {queues.queues.map(queue => (
                      <option key={queue.id} value={queue.id}>{queue.name}</option>
                    ))}
                  </select>
                  
                  <select
                    value={messages.filters.messageStatusFilter}
                    onChange={(e) => messages.actions.setMessageStatusFilter(e.target.value as 'all' | 'pending' | 'processing' | 'completed' | 'failed')}
                    className="px-3 py-2 bg-background border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                  </select>
                  
                  <div className="relative flex-1 max-w-md">
                    <input
                      type="text"
                      placeholder="Search messages..."
                      value={messages.filters.messageSearch}
                      onChange={(e) => messages.actions.setMessageSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 bg-background border rounded-md placeholder-muted focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>
                
                <MessagesTable
                  messages={messages.filteredMessages}
                  onMessageAction={handleMessageAction}
                  onShowMessageDetails={handleShowMessageDetails}
                />
              </motion.div>
            )}
            
            {activeTab === 'metrics' && (
              <motion.div
                key="metrics"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <QueueMetrics
                  queues={queues.queues}
                  stats={queues.stats}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
