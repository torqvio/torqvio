'use client'

import { useState, useRef, useCallback, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap, RefreshCw, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { EventToolbar, type EventTab, type EventStatusFilter, type EventSourceFilter } from '@/components/events/EventToolbar'
import { EventStreamTable, type Event, MOCK_EVENTS } from '@/components/events/EventStreamTable'
import { EventSubscriptionsTable, type EventSubscription, MOCK_SUBSCRIPTIONS } from '@/components/events/EventSubscriptionsTable'
import { EventSchemaCard, type EventSchema, BUILT_IN_SCHEMAS } from '@/components/events/EventSchemaCard'
import { SendTestEventDialog } from '@/components/events/SendTestEventDialog'

export default function EventsPage() {
  // Tab management
  const [activeTab, setActiveTab] = useState<EventTab>('stream')
  
  // Stream tab filters
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [sourceFilter, setSourceFilter] = useState<EventSourceFilter>('all')
  const [statusFilter, setStatusFilter] = useState<EventStatusFilter>('all')
  const [autoRefresh, setAutoRefresh] = useState(false)
  
  // Subscriptions tab filters
  const [subSearchQuery, setSubSearchQuery] = useState('')
  const [subStatusFilter, setSubStatusFilter] = useState<EventStatusFilter>('all')
  
  // Dialog state
  const [showTestEventDialog, setShowTestEventDialog] = useState(false)
  const [testEventPreFill, setTestEventPreFill] = useState<EventSchema | null>(null)
  
  // Auto-refresh timer
  useEffect(() => {
    if (!autoRefresh || activeTab !== 'stream') return
    
    const interval = setInterval(() => {
      // In a real implementation, this would fetch fresh data
      console.log('Auto-refreshing events...')
    }, 3000)
    
    return () => clearInterval(interval)
  }, [autoRefresh, activeTab])
  
  // Filter events for stream tab
  const filteredEvents = useMemo(() => {
    let events = [...MOCK_EVENTS]
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      events = events.filter(event => 
        event.type.toLowerCase().includes(query) ||
        event.source.toLowerCase().includes(query) ||
        JSON.stringify(event.payload).toLowerCase().includes(query)
      )
    }
    
    if (typeFilter !== 'all') {
      events = events.filter(event => event.type === typeFilter)
    }
    
    if (sourceFilter !== 'all') {
      events = events.filter(event => event.source === sourceFilter)
    }
    
    if (statusFilter !== 'all') {
      events = events.filter(event => 
        statusFilter === 'processed' ? event.processed : !event.processed
      )
    }
    
    return events
  }, [searchQuery, typeFilter, sourceFilter, statusFilter])
  
  // Filter subscriptions for subscriptions tab
  const filteredSubscriptions = useMemo(() => {
    let subscriptions = [...MOCK_SUBSCRIPTIONS]
    
    if (subSearchQuery.trim()) {
      const query = subSearchQuery.toLowerCase()
      subscriptions = subscriptions.filter(sub => 
        sub.eventType.toLowerCase().includes(query) ||
        sub.workflowName.toLowerCase().includes(query)
      )
    }
    
    if (subStatusFilter !== 'all') {
      subscriptions = subscriptions.filter(sub => 
        subStatusFilter === 'processed' ? sub.active : !sub.active
      )
    }
    
    return subscriptions
  }, [subSearchQuery, subStatusFilter])
  
  // Event counts for footer
  const eventStats = useMemo(() => {
    const total = MOCK_EVENTS.length
    const unprocessed = MOCK_EVENTS.filter(e => !e.processed).length
    return { total, unprocessed }
  }, [])
  
  const handleSendTestEvent = useCallback((eventType?: string, payload?: Record<string, unknown>) => {
    // Create a minimal schema object for prefilling
    const prefillSchema = eventType ? {
      eventType,
      source: 'manual',
      description: '',
      schema: {},
      subscriptionCount: 0,
      recentCount: 0,
      examplePayload: payload || {}
    } : null
    setTestEventPreFill(prefillSchema)
    setShowTestEventDialog(true)
  }, [])
  
  const handleTestEventSent = useCallback((eventId: string) => {
    setShowTestEventDialog(false)
    setTestEventPreFill(null)
    // Switch to stream tab to see the new event
    setActiveTab('stream')
    console.log('Event sent with ID:', eventId)
  }, [])
  
  const handleNewSubscription = useCallback(() => {
    // In a real implementation, this would open a subscription creation dialog
    console.log('Create new subscription')
  }, [])
  
  return (
    <div className="flex overflow-hidden -m-6" style={{ height: 'calc(100vh - 48px)' }}>
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Toolbar */}
        <div className="flex-shrink-0 bg-surface border-b border-border p-4">
          <EventToolbar
            activeTab={activeTab}
            onTabChange={setActiveTab}
            // Stream tab props
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            typeFilter={typeFilter}
            onTypeFilterChange={setTypeFilter}
            sourceFilter={sourceFilter}
            onSourceFilterChange={setSourceFilter}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
            autoRefresh={autoRefresh}
            onAutoRefreshToggle={() => setAutoRefresh(!autoRefresh)}
            // Subscriptions tab props
            subSearchQuery={subSearchQuery}
            onSubSearchChange={setSubSearchQuery}
            subStatusFilter={subStatusFilter}
            onSubStatusFilterChange={setSubStatusFilter}
            // Actions
            onSendTestEvent={() => handleSendTestEvent()}
            onNewSubscription={handleNewSubscription}
          />
        </div>
        
        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'stream' && (
              <motion.div
                key="stream"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                {filteredEvents.length > 0 ? (
                  <EventStreamTable events={filteredEvents} />
                ) : (
                  <Card className="p-8 text-center">
                    <Zap className="w-12 h-12 text-text-muted mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                      No events yet
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Events will appear here when your workflows receive triggers. Send a test event to get started.
                    </p>
                    <Button onClick={() => handleSendTestEvent()}>
                      <Plus className="w-4 h-4 mr-2" />
                      Send Test Event
                    </Button>
                  </Card>
                )}
              </motion.div>
            )}
            
            {activeTab === 'subscriptions' && (
              <motion.div
                key="subscriptions"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                {filteredSubscriptions.length > 0 ? (
                  <EventSubscriptionsTable subscriptions={filteredSubscriptions} />
                ) : (
                  <Card className="p-8 text-center">
                    <div className="w-12 h-12 bg-surface-light rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-6 h-6 text-text-muted" />
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                      No event subscriptions
                    </h3>
                    <p className="text-text-secondary mb-4">
                      Create a subscription to wire an event type to a workflow. When the event fires, the workflow runs.
                    </p>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Subscription
                    </Button>
                  </Card>
                )}
              </motion.div>
            )}
            
            {activeTab === 'schemas' && (
              <motion.div
                key="schemas"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="p-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {BUILT_IN_SCHEMAS.map((schema) => (
                    <EventSchemaCard
                      key={schema.eventType}
                      eventType={schema.eventType}
                      source={schema.source}
                      description={schema.description}
                      schema={schema.schema}
                      subscriptionCount={schema.subscriptionCount}
                      recentCount={schema.recentCount}
                      examplePayload={schema.examplePayload}
                      onSendTestEvent={() => handleSendTestEvent(schema.eventType, schema.examplePayload)}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 bg-surface border-t border-border px-4 py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-text-secondary">
              <span>
                <span className="text-text-primary font-medium">{eventStats.total}</span> total events
              </span>
              <span>
                <span className="text-yellow-400 font-medium">{eventStats.unprocessed}</span> unprocessed
              </span>
            </div>
            
            {activeTab === 'stream' && (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAutoRefresh(!autoRefresh)}
                  className={cn(
                    "text-xs",
                    autoRefresh && "text-primary bg-primary/10 hover:bg-primary/20"
                  )}
                >
                  <RefreshCw className={cn("w-3 h-3 mr-1", autoRefresh && "animate-spin")} />
                  Auto-refresh
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Send Test Event Dialog */}
      <SendTestEventDialog
        open={showTestEventDialog}
        prefillSchema={testEventPreFill}
        onClose={() => setShowTestEventDialog(false)}
        onSent={handleTestEventSent}
      />
    </div>
  )
}
