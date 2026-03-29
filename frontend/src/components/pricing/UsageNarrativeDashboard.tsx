'use client'

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { TrendingUp, Users, Zap, Clock, Target, Award, ArrowRight, BarChart3, Activity } from 'lucide-react'

interface UsageMetrics {
  month: string
  executions: number
  workflows: number
  teamMembers: number
  valueGenerated: number
  timeSaved: number
  errorsPrevented: number
  automationRate: number
}

interface GrowthMilestone {
  month: string
  type: 'first_workflow' | 'first_automation' | 'team_expansion' | 'value_milestone' | 'scaling_point'
  title: string
  description: string
  impact: string
  icon: React.ComponentType<any>
  color: string
}

interface UsageNarrativeDashboardProps {
  tenantId: string
  currentMetrics: UsageMetrics
  historicalData: UsageMetrics[]
}

export default function UsageNarrativeDashboard({ 
  tenantId, 
  currentMetrics, 
  historicalData 
}: UsageNarrativeDashboardProps) {
  const [selectedPeriod, setSelectedPeriod] = useState<'3m' | '6m' | '12m'>('6m')
  const [milestones, setMilestones] = useState<GrowthMilestone[]>([])

  useEffect(() => {
    generateMilestones()
  }, [historicalData])

  const generateMilestones = () => {
    const generated: GrowthMilestone[] = []
    
    if (historicalData.length > 0) {
      const firstMonth = historicalData[0]
      
      // First workflow milestone
      if (firstMonth.workflows >= 1) {
        generated.push({
          month: firstMonth.month,
          type: 'first_workflow',
          title: 'First Workflow Deployed',
          description: 'You automated your first business process',
          impact: 'Started your automation journey',
          icon: Zap,
          color: 'blue'
        })
      }

      // First significant automation
      const automationMonth = historicalData.find(m => m.automationRate >= 25)
      if (automationMonth) {
        generated.push({
          month: automationMonth.month,
          type: 'first_automation',
          title: '25% Operations Automated',
          description: 'Quarter of your processes now run automatically',
          impact: 'Significant time savings achieved',
          icon: Activity,
          color: 'green'
        })
      }

      // Team expansion
      const teamGrowthMonth = historicalData.find(m => m.teamMembers >= 5)
      if (teamGrowthMonth) {
        generated.push({
          month: teamGrowthMonth.month,
          type: 'team_expansion',
          title: 'Team Growth',
          description: 'Your team expanded to 5+ members',
          impact: 'Scaling operations with more people',
          icon: Users,
          color: 'purple'
        })
      }

      // Value milestone
      const valueMilestoneMonth = historicalData.find(m => m.valueGenerated >= 10000)
      if (valueMilestoneMonth) {
        generated.push({
          month: valueMilestoneMonth.month,
          type: 'value_milestone',
          title: '€10k Value Generated',
          description: 'Your workflows created €10,000+ in value',
          impact: 'Clear ROI on automation investment',
          icon: Target,
          color: 'yellow'
        })
      }

      // Scaling point
      const scalingMonth = historicalData.find(m => m.executions >= 100000)
      if (scalingMonth) {
        generated.push({
          month: scalingMonth.month,
          type: 'scaling_point',
          title: '100k Executions',
          description: 'Reached 100,000 workflow executions',
          impact: 'Operating at significant scale',
          icon: TrendingUp,
          color: 'red'
        })
      }
    }

    setMilestones(generated)
  }

  const getGrowthRate = (metric: keyof UsageMetrics) => {
    if (historicalData.length < 2) return 0
    
    const recent = historicalData[historicalData.length - 1]
    const previous = historicalData[0]
    
    if (previous[metric] === 0) return 0
    
    return Math.round(((recent[metric] - previous[metric]) / previous[metric]) * 100)
  }

  const getFilteredData = () => {
    const months = selectedPeriod === '3m' ? 3 : selectedPeriod === '6m' ? 6 : 12
    return historicalData.slice(-months)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const growthMetrics = [
    {
      title: 'Execution Growth',
      value: `${getGrowthRate('executions')}%`,
      subtitle: 'vs. first month',
      icon: BarChart3,
      color: 'blue',
      trend: getGrowthRate('executions')
    },
    {
      title: 'Value Generated',
      value: formatCurrency(currentMetrics.valueGenerated),
      subtitle: 'this month',
      icon: Target,
      color: 'green',
      trend: getGrowthRate('valueGenerated')
    },
    {
      title: 'Time Saved',
      value: `${currentMetrics.timeSaved}h`,
      subtitle: 'this month',
      icon: Clock,
      color: 'purple',
      trend: getGrowthRate('timeSaved')
    },
    {
      title: 'Automation Rate',
      value: `${currentMetrics.automationRate}%`,
      subtitle: 'of operations',
      icon: Activity,
      color: 'yellow',
      trend: getGrowthRate('automationRate')
    }
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Your Growth Story</h2>
        <p className="text-gray-400 max-w-2xl mx-auto">
          Track how Torqvio has transformed your operations over time. Every execution tells a story of efficiency and growth.
        </p>
      </div>

      {/* Period Selector */}
      <div className="flex justify-center">
        <div className="inline-flex bg-[#1c2333] rounded-lg p-1">
          {(['3m', '6m', '12m'] as const).map(period => (
            <button
              key={period}
              onClick={() => setSelectedPeriod(period)}
              className={[
                'px-4 py-2 rounded-md text-sm font-medium transition-colors',
                selectedPeriod === period
                  ? 'bg-blue-500 text-black'
                  : 'text-gray-400 hover:text-white'
              ].join(' ')}
            >
              {period === '3m' ? '3 Months' : period === '6m' ? '6 Months' : '1 Year'}
            </button>
          ))}
        </div>
      </div>

      {/* Growth Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {growthMetrics.map((metric, index) => {
          const Icon = metric.icon
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-[#0d1117] border border-[#1c2333] rounded-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={[
                  'p-2 rounded-lg',
                  metric.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                  metric.color === 'green' ? 'bg-green-500/20 text-green-400' :
                  metric.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                  'bg-yellow-500/20 text-yellow-400'
                ].join(' ')}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={[
                  'flex items-center gap-1 text-xs font-medium',
                  metric.trend > 0 ? 'text-green-400' : metric.trend < 0 ? 'text-red-400' : 'text-gray-400'
                ].join(' ')}>
                  {metric.trend > 0 && <TrendingUp className="w-3 h-3" />}
                  {metric.trend > 0 ? '+' : ''}{metric.trend}%
                </div>
              </div>
              <div className="text-2xl font-bold text-white mb-1">{metric.value}</div>
              <div className="text-sm text-gray-400">{metric.subtitle}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Growth Timeline */}
      <div className="bg-[#0d1117] border border-[#1c2333] rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <Award className="w-6 h-6 text-yellow-500" />
          Growth Milestones
        </h3>
        
        <div className="space-y-4">
          {milestones.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Keep using Torqvio to unlock your first milestone!</p>
            </div>
          ) : (
            milestones.map((milestone, index) => {
              const Icon = milestone.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-lg bg-[#1c2333]/50 hover:bg-[#1c2333] transition-colors"
                >
                  <div className={[
                    'p-2 rounded-lg flex-shrink-0',
                    milestone.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                    milestone.color === 'green' ? 'bg-green-500/20 text-green-400' :
                    milestone.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                    milestone.color === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
                    'bg-red-500/20 text-red-400'
                  ].join(' ')}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-white">{milestone.title}</h4>
                      <span className="text-xs text-gray-500">{milestone.month}</span>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">{milestone.description}</p>
                    <p className="text-gray-500 text-xs">{milestone.impact}</p>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>
      </div>

      {/* Usage Chart */}
      <div className="bg-[#0d1117] border border-[#1c2333] rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-6">Usage Trends</h3>
        
        <div className="space-y-4">
          {getFilteredData().map((month, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-16 text-sm text-gray-400">{month.month}</div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm text-white">{formatNumber(month.executions)}</div>
                  <div className="text-xs text-gray-500">executions</div>
                </div>
                <div className="w-full bg-[#1c2333] rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, (month.executions / Math.max(...getFilteredData().map(m => m.executions))) * 100)}%` }}
                  />
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-sm text-white">{formatCurrency(month.valueGenerated)}</div>
                <div className="text-xs text-gray-500">value</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
        <h3 className="text-xl font-bold text-white mb-4">Your Torqvio Impact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {formatNumber(historicalData.reduce((sum, m) => sum + m.executions, 0))}
            </div>
            <div className="text-sm text-gray-400">Total Executions</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">
              {formatCurrency(historicalData.reduce((sum, m) => sum + m.valueGenerated, 0))}
            </div>
            <div className="text-sm text-gray-400">Total Value Created</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {historicalData.reduce((sum, m) => sum + m.timeSaved, 0)}h
            </div>
            <div className="text-sm text-gray-400">Hours Saved</div>
          </div>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">You've scaled {getGrowthRate('executions')}% with Torqvio</p>
              <p className="text-gray-400 text-sm mt-1">Your automation journey is just getting started</p>
            </div>
            <button className="px-4 py-2 bg-blue-500 text-black font-medium rounded-lg hover:bg-blue-400 transition-colors flex items-center gap-2">
              View Detailed Analytics
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
