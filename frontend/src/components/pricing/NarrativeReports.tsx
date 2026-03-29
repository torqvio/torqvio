'use client'

import { motion } from 'framer-motion'
import { Trophy, Target, Zap, Crown, TrendingUp, Users, Rocket, Shield } from 'lucide-react'

interface NarrativeMetric {
  type: 'achievement' | 'comparison' | 'impact' | 'status';
  title: string;
  narrative: string;
  metrics: {
    primary: string;
    secondary: string;
    context: string;
  };
  egoBoost: {
    ranking: string;
    percentile: string;
    achievement: string;
  };
  visual: {
    icon: string;
    color: string;
    trend: 'up' | 'down' | 'stable';
  };
}

interface NarrativeReportsProps {
  metrics: NarrativeMetric[];
  planName: string;
  companyName?: string;
}

export default function NarrativeReports({ metrics, planName, companyName = 'Your Company' }: NarrativeReportsProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'trophy': return Trophy
      case 'target': return Target
      case 'zap': return Zap
      case 'crown': return Crown
      case 'trending': return TrendingUp
      case 'users': return Users
      case 'rocket': return Rocket
      case 'shield': return Shield
      default: return Trophy
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return '📈'
      case 'down': return '📉'
      default: return '➡️'
    }
  }

  return (
    <div className="space-y-8">
      {/* Hero Narrative */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-yellow-500/10 border border-purple-500/20 rounded-full px-4 py-2 text-xs text-purple-300 font-medium mb-6">
          <Crown className="w-3 h-3" />
          PERFORMANCE EXCELLENCE
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #6C5CE7, #f59e0b)' }}
          >
            {companyName} is Transforming
          </span>
        </h2>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Your operational excellence is redefining industry standards. Here's how you're leading the pack.
        </p>
      </motion.div>

      {/* Main Achievement Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="relative rounded-3xl p-8 mb-8 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(245,158,11,0.08))',
          border: '1px solid rgba(108,92,231,0.25)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full -translate-y-16 translate-x-16" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-yellow-500/20 to-transparent rounded-full translate-y-12 -translate-x-12" />
        
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Industry Leader Status</h3>
              <p className="text-gray-400 leading-relaxed">
                {companyName} has achieved operational excellence that places you in the top echelon of 
                Torqvio users, transforming how modern businesses scale their workflows.
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-mono font-bold text-yellow-400">Top 8%</div>
              <p className="text-gray-600 text-sm">of all companies</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 rounded-xl bg-[#1A1F2E]/60 border border-[#2A3142]">
              <Trophy className="w-6 h-6 text-yellow-400 mb-3" />
              <p className="text-white font-semibold mb-1">Performance Champion</p>
              <p className="text-gray-600 text-sm">
                You're outperforming 92% of companies in operational efficiency
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#1A1F2E]/60 border border-[#2A3142]">
              <Rocket className="w-6 h-6 text-purple-400 mb-3" />
              <p className="text-white font-semibold mb-1">Growth Accelerator</p>
              <p className="text-gray-600 text-sm">
                Your scaling velocity is 3.4x faster than industry average
              </p>
            </div>
            <div className="p-4 rounded-xl bg-[#1A1F2E]/60 border border-[#2A3142]">
              <Shield className="w-6 h-6 text-green-400 mb-3" />
              <p className="text-white font-semibold mb-1">Reliability Leader</p>
              <p className="text-gray-600 text-sm">
                99.97% uptime with zero critical failures this quarter
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Narrative Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {metrics.map((metric, index) => {
          const Icon = getIcon(metric.visual.icon)
          
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + index * 0.1 }}
              className="p-6 rounded-2xl bg-[#1A1F2E]/60 border border-[#2A3142] backdrop-filter backdrop-blur-lg"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(135deg, ${metric.visual.color}20, ${metric.visual.color}10)`,
                      border: `1px solid ${metric.visual.color}30`
                    }}
                  >
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: metric.visual.color }} 
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold">{metric.title}</h4>
                    <p className="text-gray-600 text-sm capitalize">{metric.type}</p>
                  </div>
                </div>
                <div className="text-2xl">
                  {getTrendIcon(metric.visual.trend)}
                </div>
              </div>

              {/* Narrative */}
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {metric.narrative}
              </p>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="text-center p-3 rounded-lg bg-[#141926]/60">
                  <p className="text-white font-mono font-semibold text-lg">{metric.metrics.primary}</p>
                  <p className="text-gray-600 text-xs">Primary</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#141926]/60">
                  <p className="text-purple-400 font-mono font-semibold text-lg">{metric.metrics.secondary}</p>
                  <p className="text-gray-600 text-xs">Secondary</p>
                </div>
                <div className="text-center p-3 rounded-lg bg-[#141926]/60">
                  <p className="text-gray-400 font-mono text-sm">{metric.metrics.context}</p>
                  <p className="text-gray-600 text-xs">Context</p>
                </div>
              </div>

              {/* Ego Boost Section */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-purple-500/10 to-yellow-500/10 border border-purple-500/20">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-purple-400 font-semibold text-sm">Your Standing</span>
                  <Crown className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-white font-bold text-lg">{metric.egoBoost.ranking}</p>
                    <p className="text-gray-600 text-xs">Rank</p>
                  </div>
                  <div>
                    <p className="text-yellow-400 font-bold text-lg">{metric.egoBoost.percentile}</p>
                    <p className="text-gray-600 text-xs">Percentile</p>
                  </div>
                  <div>
                    <p className="text-green-400 font-bold text-lg">{metric.egoBoost.achievement}</p>
                    <p className="text-gray-600 text-xs">Score</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Competitive Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="p-6 rounded-2xl bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20"
      >
        <div className="flex items-center gap-3 mb-6">
          <Users className="w-6 h-6 text-green-400" />
          <h3 className="text-xl font-bold text-white">Competitive Excellence</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-white font-semibold mb-3">How You Compare</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1A1F2E]/60">
                <span className="text-gray-400 text-sm">vs Industry Average</span>
                <span className="text-green-400 font-semibold">+247% better</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1A1F2E]/60">
                <span className="text-gray-400 text-sm">vs Similar Companies</span>
                <span className="text-green-400 font-semibold">+89% better</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-[#1A1F2E]/60">
                <span className="text-gray-400 text-sm">vs Top Performers</span>
                <span className="text-yellow-400 font-semibold">-12% behind</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-semibold mb-3">Achievement Highlights</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1F2E]/60">
                <Trophy className="w-4 h-4 text-yellow-400" />
                <div>
                  <p className="text-white font-semibold text-sm">Efficiency Master</p>
                  <p className="text-gray-600 text-xs">Top 5% in resource optimization</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1F2E]/60">
                <Rocket className="w-4 h-4 text-purple-400" />
                <div>
                  <p className="text-white font-semibold text-sm">Growth Champion</p>
                  <p className="text-gray-600 text-xs">3x faster scaling velocity</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1A1F2E]/60">
                <Shield className="w-4 h-4 text-green-400" />
                <div>
                  <p className="text-white font-semibold text-sm">Reliability Expert</p>
                  <p className="text-gray-600 text-xs">Zero downtime for 47 days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Future Potential */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-center p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
      >
        <Target className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-3">The Path to Dominance</h3>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          You're already in the top 8%. With targeted optimizations, you have the potential to reach 
          the top 1% of all companies—transforming from industry leader to market dominator.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          <div className="p-4 rounded-lg bg-[#1A1F2E]/60">
            <p className="text-purple-400 font-bold text-lg mb-1">Top 5%</p>
            <p className="text-gray-600 text-xs">Within 3 months</p>
          </div>
          <div className="p-4 rounded-lg bg-[#1A1F2E]/60">
            <p className="text-purple-400 font-bold text-lg mb-1">Top 2%</p>
            <p className="text-gray-600 text-xs">Within 6 months</p>
          </div>
          <div className="p-4 rounded-lg bg-[#1A1F2E]/60">
            <p className="text-yellow-400 font-bold text-lg mb-1">Top 1%</p>
            <p className="text-gray-600 text-xs">Within 12 months</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
