'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import { BarChart3, TrendingUp, DollarSign, Zap } from 'lucide-react'

interface PricingPlan {
  id: string;
  name: string;
  price: number | null;
  limits: {
    executionsPerMonth: number;
  };
  overageRates: {
    executionRate: number;
    stepRuns?: boolean;
  };
}

interface CalculatorProps {
  plans: PricingPlan[]
}

export default function PricingCalculator({ plans }: CalculatorProps) {
  const [executionsPerMonth, setExecutionsPerMonth] = useState(10000)
  const [stepRunsPerExecution, setStepRunsPerExecution] = useState(5)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])

  const calculateCost = (plan: PricingPlan) => {
    const basePrice = plan.price || 0
    
    // Calculate execution overages
    const includedExecutions = plan.limits.executionsPerMonth === -1 ? Infinity : plan.limits.executionsPerMonth
    const overageExecutions = Math.max(0, executionsPerMonth - includedExecutions)
    const executionOverageCost = overageExecutions * plan.overageRates.executionRate
    
    // Calculate step run overages (for enterprise plans)
    const totalStepRuns = executionsPerMonth * stepRunsPerExecution
    const stepRunOverageCost = plan.id === 'enterprise' && plan.overageRates.stepRuns 
      ? totalStepRuns * plan.overageRates.executionRate * 0.1 
      : 0
    
    return {
      basePrice,
      executionOverageCost,
      stepRunOverageCost,
      totalCost: basePrice + executionOverageCost + stepRunOverageCost,
      overageExecutions,
      costPerExecution: (basePrice + executionOverageCost + stepRunOverageCost) / executionsPerMonth
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  const formatNumber = (num: number) => {
    return num.toLocaleString()
  }

  const getBestValue = () => {
    const costs = plans.map(plan => ({
      plan,
      cost: calculateCost(plan)
    }))
    
    return costs.reduce((best, current) => 
      current.cost.totalCost < best.cost.totalCost ? current : best
    )
  }

  const bestValue = getBestValue()

  return (
    <div className="bg-slate-800/50 rounded-2xl p-8 backdrop-blur-sm border border-slate-700">
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="w-6 h-6 text-purple-400" />
        <h3 className="text-2xl font-bold text-white">Pricing Calculator</h3>
      </div>

      <div className="space-y-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Monthly Executions: {formatNumber(executionsPerMonth)}
          </label>
          <input
            type="range"
            min="1000"
            max="10000000"
            step="1000"
            value={executionsPerMonth}
            onChange={(e) => setExecutionsPerMonth(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1K</span>
            <span>10M</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Average Steps per Execution: {stepRunsPerExecution}
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={stepRunsPerExecution}
            onChange={(e) => setStepRunsPerExecution(Number(e.target.value))}
            className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <Zap className="w-4 h-4" />
              <span>Total Step Runs</span>
            </div>
            <div className="text-white font-semibold">
              {formatNumber(executionsPerMonth * stepRunsPerExecution)}
            </div>
          </div>
          <div className="bg-slate-700/50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-gray-400 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span>Total Executions</span>
            </div>
            <div className="text-white font-semibold">
              {formatNumber(executionsPerMonth)}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-white mb-4">Monthly Cost Breakdown</h4>
        
        {plans.map((plan) => {
          const cost = calculateCost(plan)
          const isBestValue = plan.id === bestValue.plan.id
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`relative rounded-lg p-4 border ${
                isBestValue 
                  ? 'border-emerald-500 bg-emerald-500/10' 
                  : 'border-slate-600 bg-slate-700/30'
              }`}
            >
              {isBestValue && (
                <div className="absolute -top-2 right-4">
                  <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full">
                    Best Value
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h5 className="font-semibold text-white">{plan.name}</h5>
                  {plan.price !== null && (
                    <p className="text-sm text-gray-400">
                      {formatNumber(plan.limits.executionsPerMonth)} executions included
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">
                    {formatCurrency(cost.totalCost)}
                  </div>
                  <div className="text-xs text-gray-400">
                    {formatCurrency(cost.costPerExecution)} per execution
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-sm">
                {cost.basePrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Base Price</span>
                    <span className="text-white">{formatCurrency(cost.basePrice)}</span>
                  </div>
                )}
                
                {cost.executionOverageCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      {formatNumber(cost.overageExecutions)} overage executions
                    </span>
                    <span className="text-white">{formatCurrency(cost.executionOverageCost)}</span>
                  </div>
                )}
                
                {cost.stepRunOverageCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">
                      Step runs ({formatNumber(executionsPerMonth * stepRunsPerExecution)})
                    </span>
                    <span className="text-white">{formatCurrency(cost.stepRunOverageCost)}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-purple-600/20 rounded-lg border border-purple-500/30">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-purple-400" />
          <h4 className="font-semibold text-white">Savings Analysis</h4>
        </div>
        
        <div className="space-y-2 text-sm">
          {plans.filter(p => p.id !== bestValue.plan.id).map((plan) => {
            const cost = calculateCost(plan)
            const savings = cost.totalCost - bestValue.cost.totalCost
            
            if (savings <= 0) return null
            
            return (
              <div key={plan.id} className="flex justify-between text-gray-300">
                <span>vs {plan.name}</span>
                <span className="text-emerald-400">
                  Save {formatCurrency(savings)} ({((savings / cost.totalCost) * 100).toFixed(1)}%)
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
