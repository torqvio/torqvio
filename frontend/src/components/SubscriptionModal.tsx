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
          className="relative bg-[#1A1F2E] border border-[#2A3142] rounded-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>

          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">
              Subscribe to {plan.name}
            </h2>
            <p className="text-gray-400">
              {plan.price === null ? 'Custom pricing - Contact sales' : `$${plan.price}/month`}
            </p>
            <p className="text-sm text-gray-500 mt-2">{plan.description}</p>
          </div>

          {/* Plan Summary */}
          <div className="bg-[#0B0F14] border border-[#2A3142] rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-400">Plan</span>
              <span className="text-white font-semibold">{plan.name}</span>
            </div>
            {plan.price !== null && (
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Monthly Price</span>
                <span className="text-white font-semibold">${plan.price}</span>
              </div>
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 bg-[#0B0F14] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.email ? 'border-red-500' : 'border-[#2A3142]'
                  }`}
                  placeholder="john@example.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.email}
                </p>
              )}
            </div>

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={`w-full pl-10 pr-3 py-2 bg-[#0B0F14] border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                    errors.name ? 'border-red-500' : 'border-[#2A3142]'
                  }`}
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-400 flex items-center gap-1">
                  <AlertCircle size={14} />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Company (Optional) */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Company (Optional)
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => handleInputChange('company', e.target.value)}
                className="w-full px-3 py-2 bg-[#0B0F14] border border-[#2A3142] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Acme Corp"
                disabled={isLoading}
              />
            </div>

            {/* Payment Method Notice */}
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <CreditCard size={18} className="text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm text-blue-300 font-medium">Payment Information</p>
                  <p className="text-xs text-blue-200 mt-1">
                    You'll be redirected to our secure payment processor to complete your subscription. 
                    No credit card information is stored on our servers.
                  </p>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(135deg, #6C5CE7, #5041c4)' }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Processing...
                </div>
              ) : (
                plan.price === null ? 'Contact Sales' : 'Continue to Payment'
              )}
            </button>

            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-2 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
