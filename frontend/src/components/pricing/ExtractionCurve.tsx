'use client'

import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
import { TrendingUp, Zap, Shield, Crown } from 'lucide-react'

interface ExtractionPoint {
  usage: number;
  basePrice: number;
  actualPrice: number;
  extractionRate: number;
  perceivedValue: number;
  marketTier: 'starter' | 'growth' | 'scale' | 'enterprise' | 'dominant';
}

interface ExtractionCurveProps {
  data: ExtractionPoint[];
  currentUsage: number;
  projectedUsage: number;
  onTierUpgrade?: (tier: string) => void;
}

export default function ExtractionCurve({ data, currentUsage, projectedUsage, onTierUpgrade }: ExtractionCurveProps) {
  const getCurrentTier = () => {
    const current = data.find(d => d.usage >= currentUsage)
    return current?.marketTier || 'starter'
  }

  const getProjectedTier = () => {
    const projected = data.find(d => d.usage >= projectedUsage)
    return projected?.marketTier || 'starter'
  }

  const currentTier = getCurrentTier()
  const projectedTier = getProjectedTier()
  
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'starter': return '#10B981'
      case 'growth': return '#3B82F6'
      case 'scale': return '#8B5CF6'
      case 'enterprise': return '#F59E0B'
      case 'dominant': return '#EF4444'
      default: return '#6B7280'
    }
  }

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'starter': return Zap
      case 'growth': return TrendingUp
      case 'scale': return Shield
      case 'enterprise': return Crown
      case 'dominant': return Crown
      default: return Zap
    }
  }

  const formatUsage = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(0)}K`
    return value.toString()
  }

  const formatPrice = (value: number) => {
    if (value >= 1000) return `$${(value / 1000).toFixed(1)}k`
    return `$${value.toFixed(0)}`
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const TierIcon = getTierIcon(data.marketTier)
      
      return (
        <div className="p-4 rounded-xl bg-[#1A1F2E] border border-[#2A3142] backdrop-filter backdrop-blur-lg">
          <div className="flex items-center gap-2 mb-3">
            <TierIcon className="w-4 h-4" style={{ color: getTierColor(data.marketTier) }} />
            <span className="text-white font-semibold capitalize">{data.marketTier}</span>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Usage:</span>
              <span className="text-white font-mono">{formatUsage(label)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Base Price:</span>
              <span className="text-gray-400 font-mono">{formatPrice(data.basePrice)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Actual Price:</span>
              <span className="text-purple-400 font-mono font-semibold">{formatPrice(data.actualPrice)}</span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-gray-600">Extraction:</span>
              <span className="text-yellow-400 font-mono">{(data.extractionRate * 100).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h3 className="text-2xl font-bold text-white mb-3">Intelligent Scaling Curve</h3>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Your pricing adapts to your success trajectory. As you grow, we invest more in your infrastructure 
          and capture a small percentage of the value we help create.
        </p>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="p-6 rounded-2xl bg-[#1A1F2E]/60 border border-[#2A3142] backdrop-filter backdrop-blur-lg"
      >
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="baseGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A3142" />
              <XAxis 
                dataKey="usage" 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={formatUsage}
              />
              <YAxis 
                stroke="#6B7280"
                fontSize={12}
                tickFormatter={formatPrice}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="basePrice"
                stroke="#10B981"
                strokeWidth={2}
                fill="url(#baseGradient)"
                name="Base Price"
              />
              <Area
                type="monotone"
                dataKey="actualPrice"
                stroke="#8B5CF6"
                strokeWidth={3}
                fill="url(#actualGradient)"
                name="Optimized Price"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Current Position Indicator */}
        <div className="mt-6 flex items-center justify-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-400 text-sm">Base Pricing</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-purple-500" />
            <span className="text-gray-400 text-sm">Value-Based Pricing</span>
          </div>
        </div>
      </motion.div>

      {/* Tier Progression */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Current Tier */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 rounded-2xl bg-[#1A1F2E]/60 border border-[#2A3142]"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 text-sm font-medium">Current Position</span>
            <div 
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: getTierColor(currentTier) }}
            />
          </div>
          <div className="flex items-center gap-3 mb-4">
            {(() => {
              const CurrentIcon = getTierIcon(currentTier)
              return <CurrentIcon className="w-6 h-6" style={{ color: getTierColor(currentTier) }} />
            })()}
            <div>
              <h4 className="text-white font-semibold text-lg capitalize">{currentTier}</h4>
              <p className="text-gray-500 text-sm">{formatUsage(currentUsage)} executions</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Current Rate</span>
              <span className="text-white font-mono font-semibold">
                {formatPrice(data.find(d => d.usage >= currentUsage)?.actualPrice || 0)}/mo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Efficiency</span>
              <span className="text-green-400 font-mono text-sm">Optimal</span>
            </div>
          </div>
        </motion.div>

        {/* Projected Tier */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/20"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-gray-600 text-sm font-medium">Projected Position</span>
            <div 
              className="w-3 h-3 rounded-full animate-pulse"
              style={{ backgroundColor: getTierColor(projectedTier) }}
            />
          </div>
          <div className="flex items-center gap-3 mb-4">
            {(() => {
              const ProjectedIcon = getTierIcon(projectedTier)
              return <ProjectedIcon className="w-6 h-6" style={{ color: getTierColor(projectedTier) }} />
            })()}
            <div>
              <h4 className="text-white font-semibold text-lg capitalize">{projectedTier}</h4>
              <p className="text-gray-500 text-sm">{formatUsage(projectedUsage)} executions</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Projected Rate</span>
              <span className="text-purple-400 font-mono font-semibold">
                {formatPrice(data.find(d => d.usage >= projectedUsage)?.actualPrice || 0)}/mo
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 text-sm">Growth Efficiency</span>
              <span className="text-purple-400 font-mono text-sm">High</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Extraction Explanation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20"
      >
        <div className="flex items-start gap-4">
          <Zap className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-1" />
          <div>
            <h4 className="text-white font-semibold mb-2">How Value Extraction Works</h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              As your usage grows, our pricing curve adapts to capture a small percentage of the increasing value 
              you receive. This isn't about charging more—it's about aligning our success with yours. The more value 
              you create, the more we invest in infrastructure, support, and innovation to help you scale further.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-[#1A1F2E]/60">
                <p className="text-yellow-400 font-semibold text-sm mb-1">Small Users</p>
                <p className="text-gray-600 text-xs">Minimal extraction, maximum support for growth</p>
              </div>
              <div className="p-3 rounded-lg bg-[#1A1F2E]/60">
                <p className="text-purple-400 font-semibold text-sm mb-1">Growing Teams</p>
                <p className="text-gray-600 text-xs">Linear scaling with predictable value capture</p>
              </div>
              <div className="p-3 rounded-lg bg-[#1A1F2E]/60">
                <p className="text-red-400 font-semibold text-sm mb-1">Enterprise Scale</p>
                <p className="text-gray-600 text-xs">Premium service with value-aligned pricing</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
