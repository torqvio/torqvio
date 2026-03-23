'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

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
}: PricingPlansProps) {
  const isCurrentPlan = (planId: string) => currentPlan?.plan.id === planId

  const formatNumber = (num: number) => {
    if (num === -1) return 'Unlimited'
    return num.toLocaleString()
  }

  function PlanCard({ plan, index }: { plan: PricingPlan; index: number }) {
    const isCurrent = isCurrentPlan(plan.id)
    const isPro = plan.id === 'pro'
    const isEnterprise = plan.id === 'enterprise'
    const isSubscribingToPlan = subscribing && selectedPlan?.id === plan.id

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        className={[
          'relative flex flex-col p-6',
          'rounded-xl xl:rounded-none xl:first:rounded-l-xl xl:last:rounded-r-xl',
          'border transition-colors',
          isPro
            ? 'border-green-500 border-2 bg-[#0d1117] xl:-my-8 xl:z-10'
            : isCurrent
            ? 'border-green-500/50 bg-[#0d1117]'
            : 'border-[#1c2333] bg-[#0d1117] hover:border-[#2a3147]',
        ].join(' ')}
      >
        {isPro && !isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-green-500 text-black text-[10px] font-bold uppercase tracking-wide px-3 py-0.5 rounded-full">
              Most Popular
            </span>
          </div>
        )}
        {isCurrent && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className="bg-[#1c2333] text-gray-300 text-[10px] font-medium px-3 py-0.5 rounded-full border border-[#2a3147]">
              Current Plan
            </span>
          </div>
        )}

        {/* Plan name */}
        <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500 mb-4">
          {plan.name}
        </p>

        {/* Price block */}
        <div className="pb-5 mb-5 border-b border-[#1c2333] min-h-[110px]">
          <div className="flex items-baseline gap-1 mb-2">
            <span className="text-4xl font-mono font-bold text-white">
              {plan.price === null ? 'Custom' : plan.price === 0 ? '$0' : `$${plan.price}`}
            </span>
            {plan.price !== null && plan.price > 0 && (
              <span className="text-sm text-gray-500">/month</span>
            )}
          </div>
          <p className="text-[13px] text-gray-400 leading-relaxed">{plan.description}</p>
          {showCalculator && plan.price !== null && plan.price > 0 && (
            <p className="text-[11px] text-gray-600 mt-1">
              ~${(plan.price + Math.max(0, calculatorExecutions - plan.limits.executionsPerMonth) * plan.overageRates.executionRate).toFixed(0)}/mo with {calculatorExecutions.toLocaleString()} executions
            </p>
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
              : isPro
              ? 'bg-green-500 hover:bg-green-400 text-black font-semibold'
              : 'border border-[#2a3147] text-gray-300 hover:border-gray-500 hover:text-white bg-transparent',
          ].join(' ')}
        >
          {isSubscribingToPlan
            ? 'Processing...'
            : isCurrent
            ? 'Current Plan'
            : isEnterprise
            ? 'Contact Us'
            : plan.price === 0
            ? 'Start for Free'
            : 'Get Started'}
        </button>

        {/* Limits grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 pb-4 mb-4 border-b border-[#1c2333] text-[12px]">
          <div>
            <span className="text-gray-600 block mb-0.5">Projects</span>
            <span className="text-white font-medium">{formatNumber(plan.limits.projects)}</span>
          </div>
          <div>
            <span className="text-gray-600 block mb-0.5">Concurrency</span>
            <span className="text-white font-medium">{formatNumber(plan.limits.concurrency)}</span>
          </div>
          <div>
            <span className="text-gray-600 block mb-0.5">Executions/mo</span>
            <span className="text-white font-medium">{formatNumber(plan.limits.executionsPerMonth)}</span>
          </div>
          <div>
            <span className="text-gray-600 block mb-0.5">Log retention</span>
            <span className="text-white font-medium">
              {plan.limits.logsRetentionDays === -1 ? 'Unlimited' : `${plan.limits.logsRetentionDays}d`}
            </span>
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
          {plan.overageRates.executionRate > 0 && (
            <p className="text-[11px] text-gray-600 pt-1">
              Then ${plan.overageRates.executionRate}/execution
            </p>
          )}
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
        className="text-center mb-16"
      >
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
          Predictable pricing, designed to scale
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Start building for free, collaborate with your team, then scale to millions of executions.
        </p>
        <div className="mt-6 flex items-center justify-center gap-6 text-sm text-gray-500">
          <button onClick={onToggleCalculator} className="hover:text-gray-300 transition-colors flex items-center gap-1.5">
            {showCalculator ? 'Hide' : 'Estimate'} cost
          </button>
        </div>

        {showCalculator && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mt-4 max-w-sm mx-auto"
          >
            <label className="block text-gray-400 text-xs mb-2">
              Monthly executions: <span className="text-white font-mono">{calculatorExecutions.toLocaleString()}</span>
            </label>
            <input
              type="range"
              min="1000"
              max="1000000"
              step="1000"
              value={calculatorExecutions}
              onChange={(e) => onCalculatorChange(Number(e.target.value))}
              className="w-full h-1 bg-[#1c2333] rounded-full appearance-none cursor-pointer accent-green-500"
            />
          </motion.div>
        )}
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-0 xl:py-8 mb-24">
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
    </>
  )
}
