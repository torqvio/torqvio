'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, XCircle, AlertCircle, Loader } from 'lucide-react'
import { apiClient } from '@/services/api'
import { useToast } from '@/components/ui/toast'

interface ActivityEvent {
  id: string
  type: 'success' | 'error' | 'warning' | 'running'
  workflow: string
  description: string
  timestamp: Date
  duration?: number
}


export function LiveActivityFeed() {
  const [events, setEvents] = useState<ActivityEvent[]>([])
  const [isLive, setIsLive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Load recent executions from API
  const loadRecentActivity = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await apiClient.getExecutions({ limit: 10 })
      
      interface ApiExecution {
  id: string;
  workflow_name: string;
  workflow_id: string;
  status: string;
  started_at: string;
  updated_at?: string;
  created_at: string;
}

      // Transform executions to activity events
      const activityEvents: ActivityEvent[] = response.executions.map((exec: ApiExecution) => {
        const duration = exec.updated_at && exec.created_at 
          ? new Date(exec.updated_at).getTime() - new Date(exec.created_at).getTime()
          : null
        
        return {
          id: exec.id,
          type: exec.status === 'completed' ? 'success' : 
                 exec.status === 'failed' ? 'error' : 
                 exec.status === 'running' ? 'running' : 
                 'warning',
          workflow: exec.workflow_name,
          description: exec.status === 'failed' ? 'Execution failed' : 'Execution completed',
          timestamp: new Date(exec.started_at),
          duration: duration || 0
        }
      })
      
      setEvents(activityEvents)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load activity';
      console.error('Failed to load activity:', err)
      setError(errorMessage)
      toast({
        type: 'error',
        title: 'Activity Load Failed',
        message: 'Unable to load recent activity. Please refresh the page.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Load initial data
  useEffect(() => {
    loadRecentActivity()
  }, [])

  // Simulate live updates (poll for new executions)
  useEffect(() => {
    if (!isLive) return

    const interval = setInterval(async () => {
      try {
        const response = await apiClient.getExecutions({ limit: 1 })
        if (response.executions.length > 0) {
          const latestExec = response.executions[0]
          const latestEventId = events[0]?.id
          
          // Only add if it's a new execution
          if (latestExec.id !== latestEventId) {
            const duration = latestExec.updated_at && latestExec.created_at 
              ? new Date(latestExec.updated_at).getTime() - new Date(latestExec.created_at).getTime()
              : null
            
            const newEvent: ActivityEvent = {
              id: latestExec.id,
              type: latestExec.status === 'completed' ? 'success' : 
                     latestExec.status === 'failed' ? 'error' : 
                     latestExec.status === 'running' ? 'running' : 
                     'warning',
              workflow: latestExec.flow_name || 'Unknown Workflow',
              description: latestExec.status === 'completed' 
                ? 'Execution completed successfully'
                : latestExec.status === 'failed'
                ? latestExec.error_message || 'Execution failed'
                : latestExec.status === 'running'
                ? 'Execution in progress...'
                : 'Execution pending',
              timestamp: new Date(latestExec.created_at),
              duration: duration ? Math.round(duration) : undefined
            }
            
            setEvents(prev => [newEvent, ...prev.slice(0, 9)])
          }
        }
      } catch (err) {
        console.error('Failed to fetch live updates:', err)
      }
    }, 5000) // Poll every 5 seconds

    return () => clearInterval(interval)
  }, [isLive, events])

  const getEventIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-success" />
      case 'error': return <XCircle className="w-4 h-4 text-error" />
      case 'warning': return <AlertCircle className="w-4 h-4 text-warning" />
      case 'running': return <Loader className="w-4 h-4 text-primary animate-spin" />
    }
  }

  const getEventColor = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'success': return 'bg-success/10 border-success/20 text-success'
      case 'error': return 'bg-error/10 border-error/20 text-error'
      case 'warning': return 'bg-warning/10 border-warning/20 text-warning'
      case 'running': return 'bg-primary/10 border-primary/20 text-primary'
    }
  }

  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}h ago`
    
    return date.toLocaleDateString()
  }

  return (
    <Card className="bg-surface border-border shadow-lg hover:shadow-xl transition-all duration-300 h-full flex flex-col">
      <CardHeader className="border-b border-border flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-text-primary flex items-center gap-2">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
            Live Activity
          </CardTitle>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium transition-all ${
              isLive 
                ? 'bg-success/20 border-success/30 text-success' 
                : 'bg-surface-light border-border text-text-secondary'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-success animate-pulse' : 'bg-text-muted'}`} />
              {isLive ? 'Live' : 'Paused'}
            </div>
            <button
              onClick={() => setIsLive(!isLive)}
              className="text-xs px-3 py-1 rounded-lg bg-primary text-white font-medium hover:bg-primary/90 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              {isLive ? 'Pause' : 'Resume'}
            </button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <style jsx>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 3px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: linear-gradient(to bottom, #4b5563, #374151);
              border-radius: 3px;
              transition: background 0.2s;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: linear-gradient(to bottom, #374151, #1f2937);
            }
          `}</style>
          <div className="space-y-2 p-4">
            {isLoading ? (
              <div className="text-center py-8 text-xs text-text-muted">
                Loading activity...
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="text-sm text-error mb-2">{error}</div>
                <button 
                  onClick={loadRecentActivity}
                  className="text-xs text-primary hover:underline"
                >
                  Retry
                </button>
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-8 text-xs text-text-muted">
                No recent activity
              </div>
            ) : (
              <AnimatePresence>
                {events.map((event, index) => (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:shadow-md ${getEventColor(event.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="p-1.5 rounded-lg bg-surface-light">
                          {getEventIcon(event.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-text-primary mb-1">
                            {event.workflow}
                          </p>
                          <p className="text-xs text-text-secondary leading-relaxed">
                            {event.description}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1 ml-4">
                        <div className="text-xs font-medium text-text-muted">
                          {formatTimestamp(event.timestamp)}
                        </div>
                        {event.duration && (
                          <div className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            event.duration < 1000 ? 'bg-success/20 text-success' :
                            event.duration < 2000 ? 'bg-warning/20 text-warning' :
                            'bg-error/20 text-error'
                          }`}>
                            {event.duration}ms
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
