'use client'

import { motion } from 'framer-motion'
import { TrendingUp, Zap, Shield, Crown } from 'lucide-react'

interface ValueMetrics {
  observable: {
    timeSavedHours: number;
    costSavings: number;
    executionsCompleted: number;
    errorRateReduction: number;
  };
  perceived: {
    teamProductivityGain: number;
    businessImpactScore: number;
    competitiveAdvantage: number;
    scalingConfidence: number;
  };
  captured: {
    currentPrice: number;
    projectedPrice: number;
    valueRatio: number;
    marketPosition: 'leader' | 'growth' | 'emerging';
  };
}

interface ValueRatioDisplayProps {
  metrics: ValueMetrics;
  planName: string;
  isEnterprise?: boolean;
}

export default function ValueRatioDisplay({ metrics, planName, isEnterprise = false }: ValueRatioDisplayProps) {
  const { observable, perceived, captured } = metrics
  
  // Calculate narrative metrics
  const employeesReplaced = Math.round(observable.timeSavedHours / 160) // 160 hours/month
  const valueGenerated = observable.costSavings + (employeesReplaced * 8000) // Avg salary assumption
  const roi = captured.valueRatio
  
  // Market positioning badge
  const getMarketBadge = () => {
    switch (captured.marketPosition) {
      case 'leader':
        return { icon: Crown, text: 'Top 12%', color: 'text-purple-400' }
      case 'growth':
        return { icon: TrendingUp, text: 'High Growth', color: 'text-green-400' }
      default:
        return { icon: Zap, text: 'Emerging', color: 'text-blue-400' }
    }
  }
  
  const badge = getMarketBadge()
  const BadgeIcon = badge.icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative rounded-2xl p-6 mb-6"
      style={{
        background: 'linear-gradient(135deg, rgba(108,92,231,0.08), rgba(80,65,196,0.04))',
        border: '1px solid rgba(108,92,231,0.15)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">Your Impact Dashboard</h3>
            <p className="text-gray-500 text-xs">{planName} Performance</p>
          </div>
        </div>
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${badge.color} border-current/20`}>
          <BadgeIcon className="w-3 h-3" />
          <span className="text-xs font-medium">{badge.text}</span>
        </div>
      </div>

      {/* Hero ROI Display */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-center mb-8 p-6 rounded-xl"
        style={{
          background: 'linear-gradient(135deg, rgba(0,200,150,0.1), rgba(108,92,231,0.05))',
          border: '1px solid rgba(0,200,150,0.2)',
        }}
      >
        <div className="text-5xl font-mono font-bold text-white mb-2">
          {roi}x
        </div>
        <p className="text-gray-400 text-sm mb-4">Return on Investment</p>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Value Generated</p>
            <p className="text-white font-mono font-semibold">${valueGenerated.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-gray-600">Your Cost</p>
            <p className="text-white font-mono font-semibold">${captured.currentPrice}</p>
          </div>
        </div>
      </motion.div>

      {/* Narrative Impact Statements */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-[#1A1F2E]/60 border border-[#2A3142]"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-500">Operational Impact</span>
          </div>
          <p className="text-white font-semibold text-lg mb-1">
            {employeesReplaced > 0 ? `${employeesReplaced} FTEs` : 'Partial FTE'}
          </p>
          <p className="text-gray-600 text-xs">
            {employeesReplaced > 0 
              ? `Torqvio replaced ${employeesReplaced} full-time employees this month`
              : 'Significant operational efficiency gains'
            }
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-[#1A1F2E]/60 border border-[#2A3142]"
        >
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-500">Execution Excellence</span>
          </div>
          <p className="text-white font-semibold text-lg mb-1">
            {observable.executionsCompleted.toLocaleString()}
          </p>
          <p className="text-gray-600 text-xs">
            Workflows processed with {observable.errorRateReduction}% error reduction
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 rounded-xl bg-[#1A1F2E]/60 border border-[#2A3142]"
        >
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-500">Business Velocity</span>
          </div>
          <p className="text-white font-semibold text-lg mb-1">
            {perceived.businessImpactScore}%
          </p>
          <p className="text-gray-600 text-xs">
            Scaling confidence and competitive advantage achieved
          </p>
        </motion.div>
      </div>

      {/* Perceived Value Indicators */}
      <div className="border-t border-[#2A3142] pt-4">
        <p className="text-xs text-gray-600 mb-3 text-center">Perceived Value Drivers</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/10 flex items-center justify-center">
              <span className="text-green-400 font-bold text-sm">{perceived.teamProductivityGain}%</span>
            </div>
            <p className="text-xs text-gray-600">Team Productivity</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
              <span className="text-purple-400 font-bold text-sm">{perceived.scalingConfidence}%</span>
            </div>
            <p className="text-xs text-gray-600">Scaling Confidence</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center">
              <span className="text-blue-400 font-bold text-sm">{perceived.competitiveAdvantage}%</span>
            </div>
            <p className="text-xs text-gray-600">Competitive Edge</p>
          </div>
        </div>
      </div>

      {/* Enterprise Performance Contract Hint */}
      {isEnterprise && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
        >
          <div className="flex items-center gap-3">
            <Crown className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-white font-semibold text-sm">Performance Contract Active</p>
              <p className="text-gray-600 text-xs">
                Guaranteed outcomes with SLA-backed pricing
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
