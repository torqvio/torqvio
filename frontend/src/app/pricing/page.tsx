'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import AdaptivePricingPlans from '@/components/pricing/AdaptivePricingPlans'
import PricingFeatures from '@/components/pricing/PricingFeatures'
import PricingNavbar from '@/components/pricing/PricingNavbar'
import PricingFooter from '@/components/pricing/PricingFooter'
import { billingApi, ApiError } from '@/utils/api'
import type { AdaptivePlan, TenantPlan } from '@/types/billing'

const MOCK_PLANS: AdaptivePlan[] = [
  {
    id: 'builder',
    mode: 'builder',
    name: 'Builder Mode',
    basePrice: 0,
    pricingModel: 'static',
    description: 'For devs and indie hackers. Unlimited experimentation, hard limits on impact.',
    outcome: 'Build and test workflows without friction',
    limits: {
      revenueGeneratedPerMonth: 1000,
      workflowsInProduction: 3,
      integrations: 5,
      teamMembers: 2,
      executionsPerMonth: 10000,
      concurrency: 5,
      logsRetentionDays: 7,
      retryPolicies: 'basic',
      support: 'community',
      features: ['basic_retries', 'community_support', 'webhooks', 'scheduler'],
    },
    scalingRules: {
      executionThresholds: [],
      valueBasedScaling: false,
      revenueShareRate: 0,
      minimumMonthlyFee: 0,
      impactLimits: { maxRevenueGenerated: 1000, maxWorkflowsInProduction: 3 },
    },
    capabilities: [],
    position: 1,
  },
  {
    id: 'growth',
    mode: 'growth',
    name: 'Growth Mode',
    basePrice: 29,
    pricingModel: 'adaptive',
    description: 'Auto-scaling pricing based on your success. Pay as you grow.',
    outcome: 'Scale your business with automated workflows',
    limits: {
      revenueGeneratedPerMonth: -1,
      workflowsInProduction: -1,
      integrations: -1,
      teamMembers: -1,
      executionsPerMonth: -1,
      concurrency: -1,
      logsRetentionDays: 30,
      retryPolicies: 'standard',
      support: 'email',
      features: ['standard_retries', 'email_support', 'webhooks', 'scheduler', 'priority_queue'],
    },
    scalingRules: {
      executionThresholds: [
        { executions: 10000, price: 29 },
        { executions: 100000, price: 79 },
        { executions: 1000000, price: 249 },
      ],
      valueBasedScaling: true,
      revenueShareRate: 0,
      minimumMonthlyFee: 29,
      impactLimits: { maxRevenueGenerated: -1, maxWorkflowsInProduction: -1 },
    },
    capabilities: [],
    position: 2,
  },
  {
    id: 'autopilot',
    mode: 'autopilot',
    name: 'Autopilot Mode',
    basePrice: 0,
    pricingModel: 'revenue_share',
    description: 'We take 2-5% of the value we generate. Zero upfront cost.',
    outcome: 'Guaranteed outcomes powered by execution',
    limits: {
      revenueGeneratedPerMonth: -1,
      workflowsInProduction: -1,
      integrations: -1,
      teamMembers: -1,
      executionsPerMonth: -1,
      concurrency: -1,
      logsRetentionDays: -1,
      retryPolicies: 'advanced',
      support: 'dedicated',
      features: ['all_features', 'ai_optimization', 'priority_support', 'custom_integrations'],
    },
    scalingRules: {
      executionThresholds: [],
      valueBasedScaling: true,
      revenueShareRate: 0.03,
      minimumMonthlyFee: 0,
      impactLimits: { maxRevenueGenerated: -1, maxWorkflowsInProduction: -1 },
    },
    capabilities: [],
    position: 3,
  },
]

export default function PricingPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()
  const [plans, setPlans] = useState<AdaptivePlan[]>([])
  const [currentPlan, setCurrentPlan] = useState<TenantPlan | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<AdaptivePlan | null>(null)
  const [subscribing, setSubscribing] = useState(false)

  useEffect(() => {
    Promise.all([fetchPlans(), fetchCurrentPlan()]).finally(() => setLoading(false))
  }, [])

  const fetchPlans = async () => {
    try {
      const data = await billingApi.getPlans()
      const sorted = (data.plans as AdaptivePlan[]).sort((a, b) => a.position - b.position)
      setPlans(sorted)
    } catch {
      setPlans(MOCK_PLANS)
    }
  }

  const fetchCurrentPlan = async () => {
    try {
      const data = await billingApi.getCurrentPlan()
      setCurrentPlan(data as TenantPlan)
    } catch {
      // Unauthenticated users have no current plan — that's fine
    }
  }

  const handleSubscribe = async (plan: AdaptivePlan) => {
    if (plan.pricingModel === 'static') {
      // Free plan — send to register/login
      router.push('/login?tab=register')
      return
    }

    if (plan.pricingModel === 'revenue_share') {
      // Autopilot requires qualification — contact sales
      window.location.href = `mailto:sales@aetherflow.dev?subject=Autopilot Mode Application&body=Hi, I'd like to apply for Autopilot Mode.`
      return
    }

    // Growth — create Stripe checkout session
    if (!isAuthenticated) {
      router.push(`/login?tab=register&plan=${plan.id}`)
      return
    }

    setSelectedPlan(plan)
    setSubscribing(true)
    try {
      const data = await billingApi.subscribe(plan.id) as { checkoutUrl?: string }
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl
      }
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setSubscribing(false)
      setSelectedPlan(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center">
        <div className="relative z-10 text-gray-500 text-sm">Loading pricing...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10">
        <PricingNavbar
          onLogin={() => router.push('/login')}
          onSignup={() => router.push('/login?tab=register')}
        />

        <main className="container mx-auto px-6 pt-32 pb-16 max-w-6xl">
          <AdaptivePricingPlans
            plans={plans}
            currentPlan={currentPlan}
            selectedPlan={selectedPlan}
            subscribing={subscribing}
            onSubscribe={handleSubscribe}
          />

          <PricingFeatures addOns={[]} currentPlan={null} />

          <div className="text-center border-t border-[#1A1F2E] pt-16">
            <p className="text-sm text-gray-500">
              Questions about pricing?{' '}
              <a
                href="mailto:sales@aetherflow.dev"
                className="text-gray-300 hover:text-white transition-colors underline underline-offset-2"
              >
                Contact our sales team
              </a>
            </p>
          </div>
        </main>

        <PricingFooter />
      </div>
    </div>
  )
}
