'use client'

import { motion } from 'framer-motion'
import { Zap, Shield, Clock, TrendingUp, AlertCircle, ArrowRight } from 'lucide-react'

interface PricingEvent {
  id: string;
  type: 'usage_spike' | 'production_deploy' | 'failure_recovery' | 'scaling_threshold' | 'performance_optimization';
  title: string;
  description: string;
  impact: {
    currentPrice: number;
    suggestedPrice: number;
    valueGenerated: number;
    roi: number;
  };
  triggers: string[];
  urgency: 'low' | 'medium' | 'high' | 'immediate';
  actionRequired: boolean;
}

interface EventDrivenPricingProps {
  events: PricingEvent[];
  onEventAction?: (eventId: string, action: 'accept' | 'decline' | 'delay') => void;
}

export default function EventDrivenPricing({ events, onEventAction }: EventDrivenPricingProps) {
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'immediate': return 'text-red-400 border-red-400/30 bg-red-400/10'
      case 'high': return 'text-orange-400 border-orange-400/30 bg-orange-400/10'
      case 'medium': return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
      default: return 'text-blue-400 border-blue-400/30 bg-blue-400/10'
    }
  }

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'usage_spike': return TrendingUp
      case 'production_deploy': return Zap
      case 'failure_recovery': return Shield
      case 'scaling_threshold': return ArrowRight
      default: return AlertCircle
    }
  }

  const formatPrice = (price: number) => {
    if (price < 100) return `$${price}`
    if (price < 1000) return `$${(price / 100).toFixed(1)}h`
    return `$${(price / 1000).toFixed(1)}k`
  }

  return (
    <div className="space-y-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-6"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Growth Opportunities</h3>
            <p className="text-gray-500 text-xs">Real-time optimization suggestions</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-gray-600" />
          <span className="text-xs text-gray-600">Live monitoring</span>
        </div>
      </motion.div>

      {events.map((event, index) => {
        const EventIcon = getEventIcon(event.type)
        const urgencyClass = getUrgencyColor(event.urgency)
        const priceIncrease = ((event.impact.suggestedPrice - event.impact.currentPrice) / event.impact.currentPrice) * 100

        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="relative rounded-2xl p-6 border"
            style={{
              background: event.actionRequired 
                ? 'linear-gradient(135deg, rgba(108,92,231,0.08), rgba(80,65,196,0.04))'
                : 'rgba(20, 25, 38, 0.6)',
              border: event.actionRequired 
                ? '1px solid rgba(108,92,231,0.25)'
                : '1px solid rgba(42, 49, 66, 0.7)',
              backdropFilter: 'blur(8px)',
            }}
          >
            {/* Urgency Badge */}
            <div className="absolute top-4 right-4">
              <span className={`text-xs font-medium px-2 py-1 rounded-full border ${urgencyClass}`}>
                {event.urgency.toUpperCase()}
              </span>
            </div>

            {/* Event Header */}
            <div className="flex items-start gap-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                <EventIcon className="w-5 h-5 text-purple-400" />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold mb-1">{event.title}</h4>
                <p className="text-gray-400 text-sm leading-relaxed">{event.description}</p>
              </div>
            </div>

            {/* Impact Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="p-3 rounded-lg bg-[#1A1F2E]/60 border border-[#2A3142]">
                <p className="text-gray-600 text-xs mb-1">Current Cost</p>
                <p className="text-white font-mono font-semibold">{formatPrice(event.impact.currentPrice)}/mo</p>
              </div>
              <div className="p-3 rounded-lg bg-[#1A1F2E]/60 border border-[#2A3142]">
                <p className="text-gray-600 text-xs mb-1">Optimized Cost</p>
                <p className="text-green-400 font-mono font-semibold">{formatPrice(event.impact.suggestedPrice)}/mo</p>
              </div>
              <div className="p-3 rounded-lg bg-[#1A1F2E]/60 border border-[#2A3142]">
                <p className="text-gray-600 text-xs mb-1">Value Generated</p>
                <p className="text-purple-400 font-mono font-semibold">{formatPrice(event.impact.valueGenerated)}</p>
              </div>
              <div className="p-3 rounded-lg bg-[#1A1F2E]/60 border border-[#2A3142]">
                <p className="text-gray-600 text-xs mb-1">ROI Impact</p>
                <p className="text-blue-400 font-mono font-semibold">{event.impact.roi}x</p>
              </div>
            </div>

            {/* Triggers */}
            <div className="mb-4">
              <p className="text-gray-600 text-xs mb-2">Triggered by:</p>
              <div className="flex flex-wrap gap-2">
                {event.triggers.map((trigger, i) => (
                  <span
                    key={i}
                    className="text-xs px-2 py-1 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400"
                  >
                    {trigger}
                  </span>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            {event.actionRequired && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex gap-3"
              >
                <button
                  onClick={() => onEventAction?.(event.id, 'accept')}
                  whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(0,200,150,0.3)' }}
                  whileTap={{ scale: 0.98 }}
                  className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #00C896, #00b386)',
                    color: 'white',
                  }}
                >
                  Enable Optimization
                </button>
                <button
                  onClick={() => onEventAction?.(event.id, 'delay')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[#2A3142] bg-[#1A1F2E]/60 text-gray-400 transition-all"
                >
                  Review Later
                </button>
              </motion.div>
            )}

            {/* Passive Events Info */}
            {!event.actionRequired && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                <Shield className="w-4 h-4 text-green-400" />
                <p className="text-green-400 text-xs">
                  This optimization is automatically applied for optimal performance
                </p>
              </div>
            )}
          </motion.div>
        )
      })}

      {/* Empty State */}
      {events.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-gray-500/20 to-gray-600/10 flex items-center justify-center">
            <Clock className="w-8 h-8 text-gray-600" />
          </div>
          <p className="text-gray-600 text-sm mb-2">No optimization opportunities</p>
          <p className="text-gray-700 text-xs">We're monitoring your usage for growth opportunities</p>
        </motion.div>
      )}
    </div>
  )
}
