'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

export interface Toast {
  id: string
  type: 'error' | 'success' | 'info' | 'warning'
  title: string
  message?: string
  duration?: number
}

interface ToastContextType {
  toasts: Toast[]
  toast: (toast: Omit<Toast, 'id'>) => void
  dismiss: (id: string) => void
  clear: () => void
}

const ToastContext = createContext<ToastContextType | null>(null)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = useCallback((newToast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const toast: Toast = { ...newToast, id, duration: newToast.duration || 5000 }
    
    setToasts(prev => [...prev, toast])
    
    if (toast.duration !== 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, toast.duration)
    }
  }, [])

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  const clear = useCallback(() => {
    setToasts([])
  }, [])

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss, clear }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return context
}

function ToastContainer() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </AnimatePresence>
    </div>
  )
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const icons = {
    error: <AlertCircle size={16} className="text-red-400" />,
    success: <CheckCircle size={16} className="text-emerald-400" />,
    info: <Info size={16} className="text-blue-400" />,
    warning: <AlertTriangle size={16} className="text-amber-400" />,
  }

  const backgrounds = {
    error: 'bg-red-500/10 border-red-500/20',
    success: 'bg-emerald-500/10 border-emerald-500/20',
    info: 'bg-blue-500/10 border-blue-500/20',
    warning: 'bg-amber-500/10 border-amber-500/20',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="pointer-events-auto overflow-hidden rounded-xl"
      style={{
        background: 'rgba(13, 17, 23, 0.9)',
        backdropFilter: 'blur(16px) saturate(180%)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: '0 12px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(0, 217, 255, 0.05)',
      }}
    >
      <div className={`flex items-start gap-3 p-4 min-w-80 max-w-md ${backgrounds[toast.type]}`}>
        <div className="flex-shrink-0 mt-0.5">
          {icons[toast.type]}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white">
            {toast.title}
          </p>
          {toast.message && (
            <p className="text-xs text-gray-400 mt-1 leading-relaxed">
              {toast.message}
            </p>
          )}
        </div>
        
        <button
          onClick={() => onDismiss(toast.id)}
          className="flex-shrink-0 p-1 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-white/5 transition-all duration-150"
        >
          <X size={14} />
        </button>
      </div>
    </motion.div>
  )
}
