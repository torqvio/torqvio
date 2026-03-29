'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import ValueRatioDisplay from './ValueRatioDisplay'
import ShadowValueCalculator from './ShadowValueCalculator'
import EventDrivenPricing from './EventDrivenPricing'
import ExtractionCurve from './ExtractionCurve'
import NarrativeReports from './NarrativeReports'
import PerformanceContracts from './PerformanceContracts'

interface PricingPlan {
  id: string;
  name: string;
  price: number | null;
  description: string;
  limits: {
    projects: number;
    workflows: number;
    executionsPerMonth: number;
    concurrency: number;
    logsRetentionDays: number;
    retryPolicies: 'basic' | 'standard' | 'advanced';
    support: 'community' | 'email' | 'priority' | 'dedicated';
    features: string[];
    sla?: string;
  };
  overageRates: {
    executionRate: number;
    stepRuns: boolean;
  };
  // Meta pricing layers
  shadowPricing?: {
    scalingMultiplier: number;
    extractionRate: number;
    perceivedValueMultiplier: number;
  };
  valueCapture?: {
    observableMetrics: string[];
    perceivedDrivers: string[];
    captureMethod: 'linear' | 'exponential' | 'threshold';
  };
  position: number;
}

interface CurrentPlan {
  plan: PricingPlan;
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
  };
  // Meta pricing data
  valueMetrics?: {
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
  };
  shadowMetrics?: {
    currentUsage: number;
    projectedUsage: number;
    basePrice: number;
    scalingMultiplier: number;
    perceivedValue: number;
    extractionRate: number;
    marketPosition: 'emerging' | 'growth' | 'leader' | 'dominant';
  };
  pricingEvents?: Array<{
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
  }>;
  addOns: Array<{
    addOnId: string;
    active: boolean;
    subscribedAt?: Date;
  }>;
}

interface PricingPlansProps {
  plans: PricingPlan[]
  currentPlan: CurrentPlan | null
  selectedPlan: PricingPlan | null
  subscribing: boolean
  showCalculator: boolean
  calculatorExecutions: number
  onSubscribe: (plan: PricingPlan) => void
  onCalculatorChange: (executions: number) => void
  onToggleCalculator: () => void
  // Meta pricing callbacks
  onUpgradeIntent?: () => void
  onEventAction?: (eventId: string, action: 'accept' | 'decline' | 'delay') => void
  onContractAction?: (contractId: string, action: 'activate' | 'modify' | 'cancel') => void
  // Meta pricing display options
  showValueRatio?: boolean
  showShadowCalculator?: boolean
  showEventDriven?: boolean
  showExtractionCurve?: boolean
  showNarrativeReports?: boolean
  showPerformanceContracts?: boolean
}

export default function PricingPlans({
  plans,
  currentPlan,
  selectedPlan,
  subscribing,
  showCalculator,
  calculatorExecutions,
  onSubscribe,
  onCalculatorChange,
  onToggleCalculator,
  onUpgradeIntent,
  onEventAction,
  onContractAction,
  showValueRatio = true,
  showShadowCalculator = true,
  showEventDriven = true,
  showExtractionCurve = true,
  showNarrativeReports = true,
  showPerformanceContracts = false,
}: PricingPlansProps) {
  const isCurrentPlan = (planId: string) => currentPlan?.plan.id === planId

  const formatNumber = (num: number | undefined) => {
    if (num === undefined || num === null) return '0'
    if (num === -1) return 'Unlimited'
    return num.toLocaleString()
  }

  function PlanCard({ plan, index }: { plan: PricingPlan; index: number }) {
    const isCurrent = isCurrentPlan(plan.id)
    const isPro = plan.id === 'grubin' // Use grubin as the featured plan
    const isEnterprise = plan.id === 'enterprise'
    const isSubscribingToPlan = subscribing && selectedPlan?.id === plan.id

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className="group relative rounded-3xl p-8 cursor-default"
        style={{
          background: isPro 
            ? 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(80,65,196,0.08))'
            : 'rgba(20, 25, 38, 0.6)',
          border: isPro 
            ? '1px solid rgba(108,92,231,0.25)'
            : '1px solid rgba(42, 49, 66, 0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          {isPro && (
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
          )}
          <div
            className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: `radial-gradient(circle at 30% 30%, ${isPro ? '#6C5CE7' : '#00C896'}08, transparent 70%)` }}
          />
        </div>
        {isPro && !isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wide px-4 py-1.5 rounded-full shadow-lg shadow-purple-500/25">
              Most Popular
            </span>
          </div>
        )}
        {isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
            <span className="bg-[#1A1F2E] border border-[#2A3142] text-gray-300 text-[10px] font-medium px-4 py-1.5 rounded-full">
              Current Plan
            </span>
          </div>
        )}

        {/* Plan name */}
        <div className="relative z-10">
          <p className="text-[11px] font-mono uppercase tracking-widest text-purple-400 mb-4">
            {plan.name}
          </p>

          {/* Price block with Impact-Based Anchoring */}
          <div className="pb-6 mb-6 border-b border-[#1A1F2E] min-h-[140px]">
            {/* Impact Comparison */}
            {plan.price !== null && plan.price > 0 && (
              <div className="mb-3">
                <p className="text-[11px] text-gray-500 mb-1">This replaces</p>
                <p className="text-[16px] font-mono font-bold text-[#00C896] line-through">
                  €{(plan.price * 50).toLocaleString()}/year
                </p>
                <p className="text-[11px] text-gray-600">in operational costs</p>
              </div>
            )}
            
            <div className="flex items-baseline gap-1 mb-3">
              <span className="text-5xl font-mono font-bold text-white">
                {plan.price === null ? 'Custom' : plan.price === 0 ? '$0' : `€${plan.price}`}
              </span>
              {plan.price !== null && plan.price > 0 && (
                <span className="text-sm text-gray-500">/month</span>
              )}
            </div>
            
            {/* ROI Anchor */}
            {plan.price !== null && plan.price > 0 && (
              <div className="mb-3">
                <p className="text-[12px] text-purple-400 font-medium">
                  → {(plan.price * 50 / plan.price).toFixed(0)}x return on investment
                </p>
                <p className="text-[11px] text-gray-600">Strategic automation investment</p>
              </div>
            )}
            
            <p className="text-[14px] text-gray-400 leading-relaxed mb-3">{plan.description}</p>
            {showCalculator && plan.price !== null && plan.price > 0 && plan.overageRates?.executionRate && (
              <p className="text-[11px] text-gray-600">
                ~€{(plan.price + Math.max(0, calculatorExecutions - plan.limits.executionsPerMonth) * plan.overageRates.executionRate * (plan.shadowPricing?.scalingMultiplier || 1)).toFixed(0)}/mo with {calculatorExecutions.toLocaleString()} executions
              </p>
            )}
          </div>

          {/* CTA with Urgency */}
          <button
            onClick={() => !isCurrent && onSubscribe(plan)}
            disabled={isCurrent || isSubscribingToPlan}
            whileHover={{ scale: isCurrent ? 1 : 1.02, boxShadow: isCurrent ? 'none' : isPro ? '0 8px 32px rgba(108,92,231,0.45)' : '0 4px 20px rgba(0,200,150,0.3)' }}
            whileTap={{ scale: isCurrent ? 1 : 0.97 }}
            className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all mb-6 relative z-10"
            style={{
              background: isCurrent
                ? '#1A1F2E'
                : isPro
                ? 'linear-gradient(135deg, #6C5CE7, #5041c4)'
                : 'linear-gradient(135deg, #00C896, #00b386)',
              boxShadow: isPro ? '0 4px 20px rgba(108,92,231,0.3)' : plan.price === 0 ? '0 4px 20px rgba(0,200,150,0.3)' : 'none',
              color: 'white',
              cursor: isCurrent ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubscribingToPlan
              ? 'Processing...'
              : isCurrent
              ? 'Current Plan'
              : isEnterprise
              ? 'Schedule Strike Team'
              : plan.price === 0
              ? 'Start Transformation'
              : 'Deploy Automation'}
          </button>
          
          {/* Urgency Indicator for Enterprise */}
          {isEnterprise && (
            <div className="mb-4 text-center">
              <p className="text-[10px] text-orange-400 font-medium">
                Limited deployment capacity - 2 spots remaining this quarter
              </p>
            </div>
          )}

          {/* Limits grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-4 pb-6 mb-6 border-b border-[#1A1F2E] text-[12px]">
            <div>
              <span className="text-gray-600 block mb-1">Projects</span>
              <span className="text-white font-medium">{formatNumber(plan.limits.projects)}</span>
            </div>
            <div>
              <span className="text-gray-600 block mb-1">Concurrency</span>
              <span className="text-white font-medium">{formatNumber(plan.limits.concurrency)}</span>
            </div>
            <div>
              <span className="text-gray-600 block mb-1">Executions/mo</span>
              <span className="text-white font-medium">{formatNumber(plan.limits.executionsPerMonth)}</span>
            </div>
            <div>
              <span className="text-gray-600 block mb-1">Log retention</span>
              <span className="text-white font-medium">
                {plan.limits.logsRetentionDays === -1 ? 'Unlimited' : `${plan.limits.logsRetentionDays}d`}
              </span>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-3 flex-1">
            {plan.limits.features.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-[13px] text-gray-400 capitalize">{feature.replace(/_/g, ' ')}</span>
              </div>
            ))}
            {plan.limits.sla && (
              <div className="flex items-center gap-3">
                <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-[13px] text-gray-400">{plan.limits.sla} SLA</span>
              </div>
            )}
            {plan.overageRates?.executionRate && plan.overageRates.executionRate > 0 && (
              <p className="text-[11px] text-gray-600 pt-2">
                Then ${plan.overageRates.executionRate}/execution
              </p>
            )}
          </div>
        </div>
      </motion.div>
    )
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-[#1A1F2E] border border-[#2A3142] rounded-full px-4 py-1.5 text-xs text-purple-300 font-medium mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
          Pre-built enterprise scenarios with guaranteed outcomes
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #6C5CE7, #a78bfa)' }}
          >
            Impact-based pricing
          </span>
          {' '}that replaces costs
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Deploy automation that replaces €2.4M in operational costs for €250k strategic investment. 
          Market leadership through operational efficiency.
        </p>
        <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-500">
          <button 
            onClick={onToggleCalculator} 
            className="hover:text-gray-300 transition-colors flex items-center gap-1.5 px-4 py-2 rounded-xl border border-[#2A3142] hover:border-[#3A4152] bg-[#141926]/60"
          >
            {showCalculator ? 'Hide' : 'Estimate'} cost
          </button>
        </div>

        {showCalculator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-6 max-w-sm mx-auto"
          >
            <div 
              className="rounded-2xl p-6 relative"
              style={{
                background: 'rgba(20, 25, 38, 0.6)',
                border: '1px solid rgba(42, 49, 66, 0.7)',
                backdropFilter: 'blur(8px)',
              }}
            >
              <label className="block text-gray-400 text-xs mb-3 font-medium">
                Monthly executions: <span className="text-white font-mono">{calculatorExecutions.toLocaleString()}</span>
              </label>
              <input
                type="range"
                min="1000"
                max="1000000"
                step="1000"
                value={calculatorExecutions}
                onChange={(e) => onCalculatorChange(Number(e.target.value))}
                className="w-full h-2 bg-[#1A1F2E] rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #6C5CE7 0%, #6C5CE7 ${((calculatorExecutions - 1000) / 999000) * 100}%, #1A1F2E ${((calculatorExecutions - 1000) / 999000) * 100}%, #1A1F2E 100%)`
                }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-24">
        {plans.length === 0 ? (
          <div className="col-span-full text-center text-gray-600 py-16 text-sm">
            Loading plans...
          </div>
        ) : (
          plans.map((plan, index) => (
            <PlanCard key={plan.id} plan={plan} index={index} />
          ))
        )}
      </div>

      {/* Meta Pricing Components */}
      {currentPlan && showValueRatio && currentPlan.valueMetrics && (
        <ValueRatioDisplay 
          metrics={currentPlan.valueMetrics} 
          planName={currentPlan.plan.name}
          isEnterprise={currentPlan.plan.id === 'enterprise'}
        />
      )}

      {currentPlan && showShadowCalculator && currentPlan.shadowMetrics && (
        <ShadowValueCalculator 
          metrics={currentPlan.shadowMetrics}
          onUpgradeIntent={onUpgradeIntent}
        />
      )}

      {currentPlan && showEventDriven && currentPlan.pricingEvents && currentPlan.pricingEvents.length > 0 && (
        <EventDrivenPricing 
          events={currentPlan.pricingEvents}
          onEventAction={onEventAction}
        />
      )}

      {showExtractionCurve && (
        <ExtractionCurve 
          data={[
            { usage: 1000, basePrice: 29, actualPrice: 29, extractionRate: 0.05, perceivedValue: 500, marketTier: 'starter' },
            { usage: 10000, basePrice: 99, actualPrice: 127, extractionRate: 0.12, perceivedValue: 2000, marketTier: 'growth' },
            { usage: 100000, basePrice: 499, actualPrice: 748, extractionRate: 0.18, perceivedValue: 10000, marketTier: 'scale' },
            { usage: 1000000, basePrice: 2499, actualPrice: 4248, extractionRate: 0.25, perceivedValue: 50000, marketTier: 'enterprise' },
            { usage: 10000000, basePrice: 9999, actualPrice: 19998, extractionRate: 0.35, perceivedValue: 250000, marketTier: 'dominant' },
          ]}
          currentUsage={currentPlan?.usage.executionsPerMonth || 1000}
          projectedUsage={currentPlan?.usage.executionsPerMonth * 2 || 2000}
        />
      )}

      {showNarrativeReports && currentPlan && currentPlan.valueMetrics && (
        <NarrativeReports 
          metrics={[
            {
              type: 'achievement',
              title: 'Operational Excellence',
              narrative: `Your company has transformed its operations through Torqvio, achieving efficiency levels that place you in the top percentile of industry performers.`,
              metrics: {
                primary: '47x ROI',
                secondary: '89% faster',
                context: 'vs industry'
              },
              egoBoost: {
                ranking: '#127',
                percentile: 'Top 8%',
                achievement: 'A+'
              },
              visual: {
                icon: 'trophy',
                color: '#f59e0b',
                trend: 'up'
              }
            },
            {
              type: 'impact',
              title: 'Business Transformation',
              narrative: 'Your workflow automation has revolutionized how teams collaborate, eliminating bottlenecks and enabling unprecedented scaling velocity.',
              metrics: {
                primary: '3.2 FTEs',
                secondary: '$28.7k',
                context: 'monthly value'
              },
              egoBoost: {
                ranking: '#89',
                percentile: 'Top 5%',
                achievement: 'A++'
              },
              visual: {
                icon: 'rocket',
                color: '#8b5cf6',
                trend: 'up'
              }
            }
          ]}
          planName={currentPlan.plan.name}
        />
      )}

      {showPerformanceContracts && (
        <PerformanceContracts 
          contracts={[
            {
              id: 'perf-1',
              category: 'throughput',
              title: 'High Throughput Guarantee',
              description: 'Process 10M jobs/month under 200ms average response time',
              guarantee: {
                metric: 'Response Time',
                target: '200',
                current: '245',
                unit: 'ms'
              },
              pricing: {
                base: 2499,
                guarantee: 750,
                premium: 0,
                total: 3249
              },
              status: 'pending',
              sla: {
                uptime: 99.9,
                responseTime: '< 200ms',
                compensation: '50% credit'
              }
            }
          ]}
          onContractAction={onContractAction}
        />
      )}
    </>
  )
}
