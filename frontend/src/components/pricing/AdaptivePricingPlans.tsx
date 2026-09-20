'use client'

import { motion } from 'framer-motion'
import { Check, TrendingUp, Rocket, Sparkles } from 'lucide-react'
import type { AdaptivePlan, TenantPlan } from '@/types/billing'

interface AdaptivePricingPlansProps {
  plans: AdaptivePlan[]
  currentPlan: TenantPlan | null
  selectedPlan: AdaptivePlan | null
  subscribing: boolean
  onSubscribe: (plan: AdaptivePlan) => void
}

export default function AdaptivePricingPlans({
  plans,
  currentPlan,
  selectedPlan,
  subscribing,
  onSubscribe,
}: AdaptivePricingPlansProps) {
  const isCurrentPlan = (planId: string) => currentPlan?.plan.id === planId

  const formatNumber = (num: number) => {
    if (num === -1) return 'Unlimited'
    return num.toLocaleString()
  }

  const formatCurrency = (amount: number, currency = 'EUR') =>
    new Intl.NumberFormat('de-DE', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount)

  function PlanCard({ plan, index }: { plan: AdaptivePlan; index: number }) {
    const isCurrent = isCurrentPlan(plan.id)
    const isSubscribingToPlan = subscribing && selectedPlan?.id === plan.id

    const modeColor = {
      builder: { border: 'border-blue-500/30', bg: 'bg-blue-500/10', text: 'text-blue-400', badge: 'bg-blue-500', cta: 'border border-[#2a3147] text-gray-300 hover:border-gray-500 hover:text-white bg-transparent' },
      growth:  { border: 'border-green-500/30',  bg: 'bg-green-500/10',  text: 'text-green-400',  badge: 'bg-green-500',  cta: 'bg-green-500 hover:bg-green-400 text-black font-semibold' },
      autopilot: { border: 'border-purple-500/30', bg: 'bg-purple-500/10', text: 'text-purple-400', badge: 'bg-purple-500', cta: 'bg-purple-500 hover:bg-purple-400 text-white font-semibold' },
    }[plan.mode]

    const icon = {
      builder: <Rocket className="w-5 h-5" />,
      growth: <TrendingUp className="w-5 h-5" />,
      autopilot: <Sparkles className="w-5 h-5" />,
    }[plan.mode]

    const ctaLabel = isSubscribingToPlan
      ? 'Processing...'
      : isCurrent
      ? 'Current Mode'
      : plan.mode === 'autopilot'
      ? 'Apply for Autopilot'
      : plan.mode === 'growth'
      ? 'Start Growing'
      : 'Start Building'

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        className={`relative flex flex-col p-6 rounded-xl border transition-all duration-300 bg-[#0d1117] ${modeColor.border}`}
      >
        {/* Badge */}
        {!isCurrent && plan.mode === 'growth' && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className={`${modeColor.badge} text-black text-[10px] font-bold uppercase tracking-wide px-3 py-0.5 rounded-full flex items-center gap-1`}>
              <TrendingUp className="w-3 h-3" /> Most Popular
            </span>
          </div>
        )}
        {!isCurrent && plan.mode === 'autopilot' && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <span className={`${modeColor.badge} text-white text-[10px] font-bold uppercase tracking-wide px-3 py-0.5 rounded-full flex items-center gap-1`}>
              <Sparkles className="w-3 h-3" /> No Upfront Cost
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${modeColor.bg} ${modeColor.text}`}>{icon}</div>
          <div>
            <p className="text-[11px] font-mono uppercase tracking-widest text-gray-500">{plan.mode} mode</p>
            <h3 className="text-xl font-bold text-white">{plan.name}</h3>
          </div>
        </div>

        {/* Outcome */}
        <div className={`mb-4 p-3 rounded-lg border ${modeColor.bg} ${modeColor.border}`}>
          <p className={`text-xs font-medium mb-1 ${modeColor.text}`}>Delivers</p>
          <p className="text-white text-sm">{plan.outcome}</p>
        </div>

        {/* Pricing */}
        <div className="pb-5 mb-5 border-b border-[#1c2333]">
          <div className="flex items-baseline gap-2 mb-2">
            {plan.pricingModel === 'revenue_share' ? (
              <>
                <span className="text-3xl font-mono font-bold text-white">
                  {plan.scalingRules.revenueShareRate * 100}%
                </span>
                <span className="text-sm text-gray-500">of value generated</span>
              </>
            ) : plan.basePrice === 0 ? (
              <span className="text-4xl font-mono font-bold text-white">Free</span>
            ) : (
              <>
                <span className="text-4xl font-mono font-bold text-white">
                  {formatCurrency(plan.basePrice)}
                </span>
                <span className="text-sm text-gray-500">/month</span>
              </>
            )}
          </div>
          <p className="text-[13px] text-gray-400 leading-relaxed">{plan.description}</p>

          {plan.pricingModel === 'adaptive' && plan.scalingRules.executionThresholds.length > 0 && (
            <div className="mt-3 text-xs text-gray-500 space-y-1">
              <p className="text-gray-600">Scales with usage:</p>
              {plan.scalingRules.executionThresholds.map((t, i) => (
                <div key={i} className="flex justify-between">
                  <span>{formatNumber(t.executions)} executions</span>
                  <span className="text-white">{formatCurrency(t.price)}/mo</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* CTA */}
        <button
          onClick={() => !isCurrent && onSubscribe(plan)}
          disabled={isCurrent || isSubscribingToPlan}
          className={`w-full py-2.5 rounded-md text-sm font-medium transition-colors mb-5 ${
            isCurrent ? 'bg-[#1c2333] text-gray-500 cursor-not-allowed' : modeColor.cta
          }`}
        >
          {ctaLabel}
        </button>

        {/* Limits grid */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 pb-4 mb-4 border-b border-[#1c2333] text-[12px]">
          <div>
            <span className="text-gray-600 block mb-0.5">Projects</span>
            <span className="text-white font-medium">{formatNumber(plan.limits.workflowsInProduction)}</span>
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
              <Check className={`w-3.5 h-3.5 flex-shrink-0 ${modeColor.text}`} />
              <span className="text-[12px] text-gray-400 capitalize">{feature.replace(/_/g, ' ')}</span>
            </div>
          ))}
          {plan.limits.sla && (
            <div className="flex items-center gap-2.5">
              <Check className={`w-3.5 h-3.5 flex-shrink-0 ${modeColor.text}`} />
              <span className="text-[12px] text-gray-400">{plan.limits.sla} SLA</span>
            </div>
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
          Simple, outcome-based pricing
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Start free. Scale with usage. Or let us take a cut of what we generate for you.
        </p>
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
    </>
  )
}
