'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, User, CreditCard, Check, AlertCircle } from 'lucide-react'
import { useState } from 'react'

interface SubscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  plan: {
    id: string
    name: string
    price: number | null
    description: string
  }
  onSubscribe: (userData: { email: string; name: string; company?: string }) => void
  isLoading: boolean
}

export function SubscriptionModal({ isOpen, onClose, plan, onSubscribe, isLoading }: SubscriptionModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: ''
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid'
    }
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onSubscribe(formData)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-lg mx-auto"
        >
          <div 
            className="relative rounded-2xl p-6 overflow-hidden bg-[#1A1F2E] border border-[#2A3142]"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-6 h-6 flex items-center justify-center rounded-full bg-[#1A1F2E]/50 border border-[#2A3142] text-gray-400 hover:text-white hover:bg-[#1A1F2E] transition-all z-10"
            >
              <X size={14} />
            </button>

            {/* Header with Impact Framing */}
            <div className="relative z-10 mb-6">
              <h2 className="text-2xl font-bold text-white mb-4">
                Deploy <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #6C5CE7, #a78bfa)' }}>{plan.name}</span>
              </h2>
              
              {/* Impact Comparison */}
              {plan.price !== null && plan.price > 0 && (
                <div className="mb-4 p-3 rounded-lg" style={{ background: 'rgba(0,200,150,0.1)', border: '1px solid rgba(0,200,150,0.3)' }}>
                  <p className="text-[11px] text-gray-400 mb-1">This replaces</p>
                  <p className="text-[18px] font-mono font-bold text-[#00C896] line-through">
                    €{(plan.price * 50).toLocaleString()}/year
                  </p>
                  <p className="text-[11px] text-gray-600">in operational costs</p>
                </div>
              )}
              
              <div className="flex items-center gap-4">
                <span className="text-3xl font-mono font-bold text-white">
                  {plan.price === null ? 'Custom' : plan.price === 0 ? 'Free' : `€${plan.price}`}
                </span>
                {plan.price !== null && plan.price > 0 && (
                  <span className="text-gray-400">/month</span>
                )}
              </div>
              
              {/* ROI Anchor */}
              {plan.price !== null && plan.price > 0 && (
                <p className="text-[12px] text-purple-400 font-medium mt-2">
                  → {(plan.price * 50 / plan.price).toFixed(0)}x return on investment
                </p>
              )}
            </div>


            {/* Form - Compact */}
            <form onSubmit={handleSubmit} className="relative z-10 space-y-4">
              {/* Email & Name - Side by side */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <div className="relative">
                    <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                        errors.email 
                          ? 'bg-red-900/20 border border-red-500/50' 
                          : 'bg-[#1A1F2E]/50 border border-[#2A3142] focus:border-purple-500'
                      }`}
                      placeholder="john@example.com"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name *
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm ${
                        errors.name 
                          ? 'bg-red-900/20 border border-red-500/50' 
                          : 'bg-[#1A1F2E]/50 border border-[#2A3142] focus:border-purple-500'
                      }`}
                      placeholder="John Doe"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle size={12} />
                      {errors.name}
                    </p>
                  )}
                </div>
              </div>

              {/* Company - Optional */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company (optional)
                </label>
                <input
                  type="text"
                  value={formData.company}
                  onChange={(e) => handleInputChange('company', e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1A1F2E]/50 border border-[#2A3142] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-sm"
                  placeholder="Acme Corp"
                  disabled={isLoading}
                />
              </div>

              {/* Operational Gravity Notice */}
              <div className="rounded-lg p-4 border" 
                style={{
                  background: 'rgba(108,92,231,0.1)',
                  border: '1px solid rgba(108,92,231,0.3)',
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle size={16} className="text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-300 font-medium mb-2">
                      Operational System Deployment
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      This creates mission-critical automation that becomes core to your operations. 
                      Switching costs calculated at €2M-€5M plus 6-12 months operational disruption.
                    </p>
                  </div>
                </div>
              </div>

              {/* Switching Cost Analysis */}
              <div className="mt-4 p-3 rounded-lg bg-[#1A1F2E]/30 border border-[#2A3142]/50">
                <p className="text-[10px] text-gray-500 mb-2 text-center">Switching Cost Analysis</p>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-[10px] text-gray-600">Technical</p>
                    <p className="text-[11px] font-mono text-white">€2M+</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600">Operational</p>
                    <p className="text-[11px] font-mono text-white">6-12mo</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-600">Competitive</p>
                    <p className="text-[11px] font-mono text-white">Permanent</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: isLoading ? 1 : 1.02, boxShadow: isLoading ? 'none' : '0 4px 20px rgba(108,92,231,0.45)' }}
                  whileTap={{ scale: isLoading ? 1 : 0.97 }}
                  className="flex-1 py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  style={{ 
                    background: plan.price === 0 
                      ? 'linear-gradient(135deg, #00C896, #00b386)'
                      : 'linear-gradient(135deg, #6C5CE7, #5041c4)',
                  }}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Deploying...
                    </div>
                  ) : (
                    plan.price === null ? 'Schedule Strike Team' : plan.price === 0 ? 'Start Transformation' : 'Deploy Automation'
                  )}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-3 text-gray-400 hover:text-white transition-colors disabled:opacity-50 text-sm border border-[#2A3142] rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
