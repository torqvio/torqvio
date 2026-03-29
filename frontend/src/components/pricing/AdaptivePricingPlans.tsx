'use client'

import { motion } from 'framer-motion'
import { Check, Zap, TrendingUp, Rocket, Sparkles } from 'lucide-react'

interface AdaptivePlan {
  id: string;
  mode: 'builder' | 'growth' | 'autopilot';
  name: string;
  basePrice: number;
  pricingModel: 'static' | 'adaptive' | 'revenue_share';
  description: string;
  outcome: string;
  limits: {
    revenueGeneratedPerMonth: number;
    workflowsInProduction: number;
    integrations: number;
    teamMembers: number;
    executionsPerMonth: number;
    concurrency: number;
    logsRetentionDays: number;
    retryPolicies: 'basic' | 'standard' | 'advanced';
    support: 'community' | 'email' | 'priority' | 'dedicated';
    features: string[];
    sla?: string;
  };
  scalingRules: {
    executionThresholds: { executions: number; price: number }[];
    valueBasedScaling: boolean;
    revenueShareRate: number;
    minimumMonthlyFee: number;
    impactLimits: {
      maxRevenueGenerated: number;
      maxWorkflowsInProduction: number;
    };
  };
  capabilities: any[];
  position: number;
}

interface CurrentPlan {
  plan: AdaptivePlan;
  mode: 'builder' | 'growth' | 'autopilot';
  status: 'trial' | 'active' | 'canceled' | 'past_due';
  trialEndsAt?: Date;
  currentPeriodEnd?: Date;
  usage: {
    executionsPerMonth: number;
    stepRuns: number;
    projects: number;
    workflows: number;
    concurrency: number;
    apiCalls: number;
    revenueGenerated: number;
    workflowsInProduction: number;
    activeIntegrations: number;
    teamMembers: number;
  };
  outcomes: {
    valueGenerated: number;
    timeSaved: number;
    errorsPrevented: number;
    revenueInfluenced: number;
    automationPercentage: number;
  };
  capabilities: any[];
  billing: {
    baseSubscription: number;
    usageCharges: number;
    outcomeCharges: number;
    revenueShare: number;
    total: number;
    currency: string;
    breakdown: any;
  };
}

interface AdaptivePricingPlansProps {
  plans: AdaptivePlan[]
  currentPlan: CurrentPlan | null
  selectedPlan: AdaptivePlan | null
  subscribing: boolean
  onSubscribe: (plan: AdaptivePlan) => void
  roiInputs: {
    companySize: string;
    industry: string;
    useCase: string;
    expectedWorkflows: number;
    currentManualProcesses: number;
    teamSize: number;
  }
  onROIInputsChange: (inputs: any) => void
  roiPrediction: any
}

export default function AdaptivePricingPlans({
  plans,
  currentPlan,
  selectedPlan,
  subscribing,
  onSubscribe,
  roiInputs,
  onROIInputsChange,
  roiPrediction
}: AdaptivePricingPlansProps) {
  const isCurrentPlan = (planId: string) => currentPlan?.plan.id === planId

  const formatNumber = (num: number) => {
    if (num === -1) return 'Unlimited'
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  function PlanCard({ plan, index }: { plan: AdaptivePlan; index: number }) {
    const isCurrent = isCurrentPlan(plan.id)
    const isGrowth = plan.mode === 'growth'
    const isAutopilot = plan.mode === 'autopilot'
    const isSubscribingToPlan = subscribing && selectedPlan?.id === plan.id

    const getModeIcon = () => {
      switch (plan.mode) {
        case 'builder':
          return <Rocket className="w-5 h-5" />
        case 'growth':
          return <TrendingUp className="w-5 h-5" />
        case 'autopilot':
          return <Sparkles className="w-5 h-5" />
      }
    }

    const getModeColor = () => {
      switch (plan.mode) {
        case 'builder':
          return 'border-blue-500 bg-blue-500/10'
        case 'growth':
          return 'border-green-500 bg-green-500/10'
        case 'autopilot':
          return 'border-purple-500 bg-purple-500/10'
      }
    }

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        className={[
          'relative flex flex-col p-6 rounded-xl border transition-all duration-300',
          'bg-[#0d1117] hover:border-opacity-80',
          isCurrent ? 'border-opacity-100 shadow-lg' : 'border-opacity-50',
          getModeColor()
        ].join(' ')}
      >
        {isGrowth && !isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-green-500 text-black text-[10px] font-bold uppercase tracking-wide px-3 py-0.5 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Most Popular
            </span>
          </div>
        )}
        {isAutopilot && !isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-purple-500 text-black text-[10px] font-bold uppercase tracking-wide px-3 py-0.5 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Nuclear Option
            </span>
          </div>
        )}
        {isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-[#1c2333] text-gray-300 text-[10px] font-medium px-3 py-0.5 rounded-full border border-[#2a3147]">
              Current Mode
            </span>
          </div>
        )}

        {/* Mode header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={[
            'p-2 rounded-lg',
            plan.mode === 'builder' ? 'bg-blue-500/20 text-blue-400' :
            plan.mode === 'growth' ? 'bg-green-500/20 text-green-400' :
            'bg-purple-500/20 text-purple-400'
          ].join(' ')}>
            {getModeIcon()}
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500 mb-1">
              {plan.mode} Mode
            </p>
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
          </div>
        </div>

        {/* Outcome */}
        <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
          <p className="text-sm font-medium text-blue-300 mb-1">Delivers</p>
          <p className="text-white text-sm">{plan.outcome}</p>
        </div>

        {/* Pricing */}
        <div className="pb-5 mb-5 border-b border-[#1c2333] min-h-[110px]">
          <div className="flex items-baseline gap-1 mb-2">
            {plan.pricingModel === 'revenue_share' ? (
              <>
                <span className="text-3xl font-mono font-bold text-white">
                  {plan.scalingRules.revenueShareRate * 100}%
                </span>
                <span className="text-sm text-gray-500">of value generated</span>
              </>
            ) : (
              <>
                <span className="text-4xl font-mono font-bold text-white">
                  {plan.basePrice === 0 ? '$0' : formatCurrency(plan.basePrice)}
                </span>
                {plan.basePrice > 0 && (
                  <span className="text-sm text-gray-500">/month</span>
                )}
              </>
            )}
          </div>
          <p className="text-[13px] text-gray-400 leading-relaxed">{plan.description}</p>
          
          {plan.pricingModel === 'adaptive' && (
            <div className="mt-2 text-xs text-gray-500">
              <p>Auto-scales with your success:</p>
              <div className="mt-1 space-y-1">
                {plan.scalingRules.executionThresholds.slice(0, 3).map((threshold, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{formatNumber(threshold.executions)} executions</span>
                    <span className="text-white">{formatCurrency(threshold.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => !isCurrent && onSubscribe(plan)}
          disabled={isCurrent || isSubscribingToPlan}
          className={[
            'w-full py-2 rounded-md text-sm font-medium transition-colors mb-5',
            isCurrent
              ? 'bg-[#1c2333] text-gray-500 cursor-not-allowed'
              : plan.mode === 'growth'
              ? 'bg-green-500 hover:bg-green-400 text-black font-semibold'
              : plan.mode === 'autopilot'
              ? 'bg-purple-500 hover:bg-purple-400 text-white font-semibold'
              : 'border border-[#2a3147] text-gray-300 hover:border-gray-500 hover:text-white bg-transparent',
          ].join(' ')}
        >
          {isSubscribingToPlan
            ? 'Processing...'
            : isCurrent
            ? 'Current Mode'
            : plan.mode === 'autopilot'
            ? 'Activate Autopilot'
            : plan.mode === 'growth'
            ? 'Start Growing'
            : 'Start Building'}
        </button>

        {/* Impact Limits */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 pb-4 mb-4 border-b border-[#1c2333] text-[12px]">
          <div>
            <span className="text-gray-600 block mb-0.5">Revenue/month</span>
            <span className="text-white font-medium">
              {plan.limits.revenueGeneratedPerMonth === -1 ? 'Unlimited' : formatCurrency(plan.limits.revenueGeneratedPerMonth)}
            </span>
          </div>
          <div>
            <span className="text-gray-600 block mb-0.5">Production workflows</span>
            <span className="text-white font-medium">{formatNumber(plan.limits.workflowsInProduction)}</span>
          </div>
          <div>
            <span className="text-gray-600 block mb-0.5">Team members</span>
            <span className="text-white font-medium">{formatNumber(plan.limits.teamMembers)}</span>
          </div>
          <div>
            <span className="text-gray-600 block mb-0.5">Integrations</span>
            <span className="text-white font-medium">{formatNumber(plan.limits.integrations)}</span>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2.5 flex-1">
          {plan.limits.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-[12px] text-gray-400 capitalize">{feature.replace(/_/g, ' ')}</span>
            </div>
          ))}
          {plan.limits.sla && (
            <div className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-[12px] text-gray-400">{plan.limits.sla} SLA</span>
            </div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <>
      {/* ROI Calculator Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Adaptive Monetization Intelligence
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed mb-8">
          From static plans to dynamic revenue engines that grow with your success.
        </p>

        {/* ROI Calculator */}
        <div className="max-w-4xl mx-auto bg-[#0d1117] border border-[#1c2333] rounded-xl p-6 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <Zap className="w-6 h-6 text-yellow-500" />
            Predict My ROI
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-gray-400 text-sm mb-2">Company Size</label>
              <select
                value={roiInputs.companySize}
                onChange={(e) => onROIInputsChange({ ...roiInputs, companySize: e.target.value })}
                className="w-full px-3 py-2 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="solo">Solo</option>
                <option value="small">Small (2-10)</option>
                <option value="medium">Medium (11-50)</option>
                <option value="large">Large (51-200)</option>
                <option value="enterprise">Enterprise (200+)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Industry</label>
              <select
                value={roiInputs.industry}
                onChange={(e) => onROIInputsChange({ ...roiInputs, industry: e.target.value })}
                className="w-full px-3 py-2 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="ecommerce">E-commerce</option>
                <option value="saas">SaaS</option>
                <option value="finance">Finance</option>
                <option value="healthcare">Healthcare</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="consulting">Consulting</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Primary Use Case</label>
              <select
                value={roiInputs.useCase}
                onChange={(e) => onROIInputsChange({ ...roiInputs, useCase: e.target.value })}
                className="w-full px-3 py-2 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                <option value="automation">Business Automation</option>
                <option value="integration">System Integration</option>
                <option value="monitoring">Monitoring & Alerting</option>
                <option value="reporting">Reporting & Analytics</option>
                <option value="ai_workflows">AI-Powered Workflows</option>
                <option value="other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Expected Workflows</label>
              <input
                type="number"
                min="1"
                max="100"
                value={roiInputs.expectedWorkflows}
                onChange={(e) => onROIInputsChange({ ...roiInputs, expectedWorkflows: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Manual Processes</label>
              <input
                type="number"
                min="0"
                max="100"
                value={roiInputs.currentManualProcesses}
                onChange={(e) => onROIInputsChange({ ...roiInputs, currentManualProcesses: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div>
              <label className="block text-gray-400 text-sm mb-2">Team Size</label>
              <input
                type="number"
                min="1"
                max="100"
                value={roiInputs.teamSize}
                onChange={(e) => onROIInputsChange({ ...roiInputs, teamSize: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* ROI Prediction Results */}
          {roiPrediction && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4"
            >
              <h3 className="text-lg font-semibold text-white mb-3">Your Predicted Outcomes</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Monthly Savings</p>
                  <p className="text-2xl font-bold text-green-400">{formatCurrency(roiPrediction.predictedMonthlySavings)}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Time Saved</p>
                  <p className="text-2xl font-bold text-blue-400">{roiPrediction.predictedTimeSaved}h/month</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Automation Rate</p>
                  <p className="text-2xl font-bold text-purple-400">{roiPrediction.predictedAutomationRate}%</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Break Even</p>
                  <p className="text-2xl font-bold text-yellow-400">{roiPrediction.breakEvenDays} days</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center justify-between">
                  <p className="text-gray-400 text-sm">Annual ROI</p>
                  <p className="text-xl font-bold text-green-400">{roiPrediction.annualROI}%</p>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-gray-400 text-sm">Confidence</p>
                  <p className="text-sm text-gray-300">{Math.round(roiPrediction.confidence * 100)}%</p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Adaptive Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-24">
        {plans.length === 0 ? (
          <div className="col-span-full text-center text-gray-600 py-16 text-sm">
            Loading adaptive plans...
          </div>
        ) : (
          plans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))
        )}
      </div>
    </>
  )
}
