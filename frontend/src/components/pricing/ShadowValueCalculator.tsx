'use client'

import { motion } from 'framer-motion'
import { TrendingUp, AlertTriangle, Zap, Lock } from 'lucide-react'

interface ShadowValueMetrics {
  currentUsage: number;
  projectedUsage: number;
  basePrice: number;
  scalingMultiplier: number;
  perceivedValue: number;
  extractionRate: number;
  marketPosition: 'emerging' | 'growth' | 'leader' | 'dominant';
}

interface ShadowValueCalculatorProps {
  metrics: ShadowValueMetrics;
  onUpgradeIntent?: () => void;
}

export default function ShadowValueCalculator({ metrics, onUpgradeIntent }: ShadowValueCalculatorProps) {
  const {
    currentUsage,
    projectedUsage,
    basePrice,
    scalingMultiplier,
    perceivedValue,
    extractionRate,
    marketPosition
  } = metrics

  // Calculate shadow pricing curves
  const currentPrice = basePrice * Math.pow(scalingMultiplier, Math.log10(currentUsage / 1000))
  const projectedPrice = basePrice * Math.pow(scalingMultiplier, Math.log10(projectedUsage / 1000))
  const priceGrowthRate = ((projectedPrice - currentPrice) / currentPrice) * 100
  
  // Value capture calculation (hidden from user)
  const actualValueCapture = extractionRate * perceivedValue
  const userPerceivedCapture = priceGrowthRate // What user thinks they're paying
  
  // Market positioning thresholds
  const getNextThreshold = () => {
    switch (marketPosition) {
      case 'emerging':
        return { threshold: 10000, reward: 'Priority Support', icon: Zap }
      case 'growth':
        return { threshold: 100000, reward: 'Dedicated Resources', icon: TrendingUp }
      case 'leader':
        return { threshold: 1000000, reward: 'Performance Contract', icon: Lock }
      default:
        return { threshold: 10000000, reward: 'Strategic Partnership', icon: Crown }
    }
  }

  const nextThreshold = getNextThreshold()
  const ThresholdIcon = nextThreshold.icon
  const progressToNext = (currentUsage / nextThreshold.threshold) * 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl p-6"
      style={{
        background: 'linear-gradient(135deg, rgba(0,200,150,0.08), rgba(108,92,231,0.04))',
        border: '1px solid rgba(0,200,150,0.15)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Growth Opportunity Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Scaling Opportunity</h3>
            <p className="text-gray-500 text-xs">Your growth potential</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-green-400 font-semibold text-sm">{priceGrowthRate.toFixed(1)}%</p>
          <p className="text-gray-600 text-xs">Efficient Growth</p>
        </div>
      </div>

      {/* Usage Projection */}
      <div className="mb-6 p-4 rounded-xl bg-[#1A1F2E]/60 border border-[#2A3142]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-600">Usage Trajectory</span>
          <span className="text-xs text-green-400 font-medium">Efficient Scaling</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 text-xs mb-1">Current Volume</p>
            <p className="text-white font-mono font-semibold">{currentUsage.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600 text-xs mb-1">Projected Volume</p>
            <p className="text-white font-mono font-semibold">{projectedUsage.toLocaleString()}</p>
          </div>
        </div>
        <div className="mt-3 h-2 bg-[#2A3142] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progressToNext, 100)}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-green-500 to-green-400"
          />
        </div>
      </div>

      {/* Shadow Value Proposition */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mb-6 p-4 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.1), rgba(80,65,196,0.05))',
          border: '1px solid rgba(108,92,231,0.2)',
        }}
      >
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-purple-400" />
          <span className="text-sm font-semibold text-white">Growth Multiplier Applied</span>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Base Rate</span>
            <span className="text-white font-mono text-sm">${basePrice}/mo</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Scaling Adjustment</span>
            <span className="text-purple-400 font-mono text-sm">×{scalingMultiplier.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-[#2A3142]">
            <span className="text-xs text-gray-600">Optimized Rate</span>
            <span className="text-green-400 font-mono font-semibold">${projectedPrice.toFixed(0)}/mo</span>
          </div>
        </div>
      </motion.div>

      {/* Next Achievement */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-[#1A1F2E]/60 border border-[#2A3142]"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ThresholdIcon className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-white">Next Achievement</span>
          </div>
          <span className="text-xs text-gray-600">{Math.round(progressToNext)}% Complete</span>
        </div>
        <p className="text-gray-400 text-xs mb-3">
          Reach {nextThreshold.threshold.toLocaleString()} executions to unlock:
        </p>
        <div className="flex items-center gap-3 p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
            <ThresholdIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm">{nextThreshold.reward}</p>
            <p className="text-gray-600 text-xs">Premium tier benefits</p>
          </div>
        </div>
      </motion.div>

      {/* Hidden Value Extraction Notice */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-6 flex items-start gap-3 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20"
      >
        <AlertTriangle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-white font-semibold text-sm mb-1">Value-Based Scaling</p>
          <p className="text-gray-600 text-xs leading-relaxed">
            Your pricing scales with success, not just usage. As you grow, we invest more in your infrastructure 
            and success, ensuring optimal performance at every scale.
          </p>
        </div>
      </motion.div>

      {/* Action Trigger */}
      {onUpgradeIntent && projectedUsage > currentUsage * 1.5 && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          onClick={onUpgradeIntent}
          whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(0,200,150,0.3)' }}
          whileTap={{ scale: 0.98 }}
          className="w-full mt-6 py-3 rounded-xl font-semibold transition-all relative overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #00C896, #00b386)',
            color: 'white',
          }}
        >
          <span className="relative z-10">Enable High Throughput Mode</span>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full hover:translate-x-full transition-transform duration-700" />
        </motion.button>
      )}
    </motion.div>
  )
}
