'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { SubscriptionModal } from '@/components/SubscriptionModal'
import PricingPlans from '@/components/pricing/PricingPlans'
import PricingFeatures from '@/components/pricing/PricingFeatures'
import PricingBackground from '@/components/pricing/PricingBackground'
import PricingNavbar from '@/components/pricing/PricingNavbar'
import PricingFooter from '@/components/pricing/PricingFooter'
import { billingApi, ApiError } from '@/utils/api'


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

interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

export default function PricingPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [showCalculator, setShowCalculator] = useState(false)
  const [calculatorExecutions, setCalculatorExecutions] = useState(10000)
  const [plans, setPlans] = useState<PricingPlan[]>([])
  const [currentPlan, setCurrentPlan] = useState<CurrentPlan | null>(null)
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null)
  const [subscribing, setSubscribing] = useState(false)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    fetchPlans()
    fetchCurrentPlan()
    fetchAddOns()
  }, [])

  const fetchPlans = async () => {
    try {
      const data = await billingApi.getPlans()
      setPlans(data.plans.sort((a: PricingPlan, b: PricingPlan) => a.position - b.position))
    } catch (error) {
      console.error('Failed to fetch plans:', error)
      // Fallback to mock data if backend is not available
      setMockPlans()
    }
  }

  const fetchCurrentPlan = async () => {
    try {
      const data = await billingApi.getCurrentPlan()
      setCurrentPlan(data)
    } catch (error) {
      console.error('Failed to fetch current plan:', error)
      // Don't show error for unauthenticated users
    } finally {
      setLoading(false)
    }
  }

  const fetchAddOns = async () => {
    try {
      const data = await billingApi.getAddOns()
      setAddOns(data.addOns)
    } catch (error) {
      console.error('Failed to fetch add-ons:', error)
      // Fallback to mock data if backend is not available
      setMockAddOns()
    }
  }

  const setMockPlans = () => {
    const mockPlans: PricingPlan[] = [
      {
        id: 'bulldog',
        name: 'BULLDOG MODE',
        price: 0,
        description: 'Perfect for getting started and personal projects',
        limits: {
          projects: 3,
          workflows: 5,
          executionsPerMonth: 1000,
          concurrency: 2,
          logsRetentionDays: 7,
          retryPolicies: 'basic',
          support: 'community',
          features: ['durable_execution', 'basic_retries', 'webhook_ingestion', 'api_access']
        },
        overageRates: {
          executionRate: 0.001,
          stepRuns: true
        },
        position: 1
      },
      {
        id: 'grubin',
        name: 'GRUBIN MODE',
        price: 49,
        description: 'For growing teams and production workloads',
        limits: {
          projects: 10,
          workflows: 25,
          executionsPerMonth: 10000,
          concurrency: 5,
          logsRetentionDays: 30,
          retryPolicies: 'standard',
          support: 'email',
          features: ['durable_execution', 'advanced_retries', 'webhook_ingestion', 'api_access', 'monitoring', 'alerts']
        },
        overageRates: {
          executionRate: 0.0005,
          stepRuns: true
        },
        position: 2
      },
      {
        id: 'autopilot',
        name: 'AUTOPILOT MODE',
        price: 199,
        description: 'Advanced features for scale and reliability',
        limits: {
          projects: -1,
          workflows: -1,
          executionsPerMonth: 100000,
          concurrency: 20,
          logsRetentionDays: 90,
          retryPolicies: 'advanced',
          support: 'priority',
          features: ['durable_execution', 'advanced_retries', 'webhook_ingestion', 'api_access', 'monitoring', 'alerts', 'sla_guarantee', 'priority_support'],
          sla: '99.9%'
        },
        overageRates: {
          executionRate: 0.0002,
          stepRuns: true
        },
        position: 3
      }
    ]
    setPlans(mockPlans)
  }

  const setMockAddOns = () => {
    const mockAddOns: AddOn[] = [
      {
        id: 'advanced-monitoring',
        name: 'Advanced Monitoring',
        price: 29,
        description: 'Enhanced observability with custom dashboards and alerts',
        features: ['Custom dashboards', 'Advanced alerting', 'Performance analytics', 'Export capabilities']
      },
      {
        id: 'priority-queue',
        name: 'Priority Queue',
        price: 49,
        description: 'Guaranteed execution priority for critical workflows',
        features: ['Priority execution', 'Dedicated resources', 'Faster processing', 'SLA guarantee']
      }
    ]
    setAddOns(mockAddOns)
  }

  const handleSubscribe = (plan: PricingPlan) => {
    if (plan.id === 'enterprise') {
      window.location.href = 'mailto:sales@torqvio.com?subject=Enterprise Plan Inquiry&body=Hi, I\'m interested in the Enterprise plan for Torqvio.'
      return
    }
    
    setSelectedPlan(plan)
    setShowModal(true)
  }

  const handleModalSubscribe = async (userData: { email: string; name: string; company?: string }) => {
    if (!selectedPlan) return
    
    setSubscribing(true)
    
    try {
      console.log('Subscription data:', { plan: selectedPlan.id, ...userData })
      
      // For free plans, just subscribe directly
      if (selectedPlan.price === 0) {
        // TODO: Call API to subscribe to free plan
        console.log('Subscribing to free plan:', selectedPlan.id)
        setShowModal(false)
        setSelectedPlan(null)
        return
      }
      
      // For paid plans, redirect to payment processor
      if (selectedPlan.price && selectedPlan.price > 0) {
        // TODO: Create checkout session and redirect to Stripe/payment processor
        console.log('Redirecting to payment for plan:', selectedPlan.id)
        
        // For now, just show success (in real app, redirect to Stripe Checkout)
        alert(`Would redirect to payment processor for $${selectedPlan.price}/month plan. User: ${userData.email}`)
        setShowModal(false)
        setSelectedPlan(null)
        return
      }
      
      // For custom pricing (null), contact sales
      if (selectedPlan.price === null) {
        window.location.href = `mailto:sales@torqvio.com?subject=Custom Plan Inquiry&body=Hi, I'm interested in a custom plan. Name: ${userData.name}, Email: ${userData.email}, Company: ${userData.company || 'N/A'}`
        setShowModal(false)
        setSelectedPlan(null)
        return
      }
      
    } catch (error) {
      console.error('Subscription error:', error)
      // TODO: Show error message to user
    } finally {
      setSubscribing(false)
    }
  }

  const goToLogin = () => router.push('/login')
  const goToSignup = () => router.push('/login?tab=register')

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center">
        <div className="relative z-10">Loading pricing...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10">
        <PricingNavbar onLogin={goToLogin} onSignup={goToSignup} />
        
        <main className="container mx-auto px-6 pt-32 pb-16 max-w-6xl">
          <PricingPlans
            plans={plans}
            currentPlan={currentPlan}
            selectedPlan={selectedPlan}
            subscribing={subscribing}
            showCalculator={showCalculator}
            calculatorExecutions={calculatorExecutions}
            onSubscribe={handleSubscribe}
            onCalculatorChange={setCalculatorExecutions}
            onToggleCalculator={() => setShowCalculator(!showCalculator)}
          />

          <PricingFeatures addOns={addOns} currentPlan={currentPlan} />

          <div className="text-center border-t border-[#1A1F2E] pt-16">
            <p className="text-sm text-gray-500">
              Questions about pricing?{' '}
              <a href="mailto:sales@torqvio.com" className="text-gray-300 hover:text-white transition-colors underline underline-offset-2">
                Contact our sales team
              </a>
            </p>
          </div>
        </main>
        
        <PricingFooter />
        
        {/* Subscription Modal */}
        {selectedPlan && (
          <SubscriptionModal
            isOpen={showModal}
            onClose={() => {
              setShowModal(false)
              setSelectedPlan(null)
            }}
            plan={selectedPlan}
            onSubscribe={handleModalSubscribe}
            isLoading={subscribing}
          />
        )}
      </div>
    </div>
  )
}
