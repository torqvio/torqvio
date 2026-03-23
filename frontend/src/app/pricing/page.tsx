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
      const response = await fetch('/api/v1/billing/plans')
      if (response.ok) {
        const data = await response.json()
        setPlans(data.plans.sort((a: PricingPlan, b: PricingPlan) => a.position - b.position))
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
    }
  }

  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      const response = await fetch('/api/v1/billing/current', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentPlan(data)
      }
    } catch (error) {
      console.error('Failed to fetch current plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchAddOns = async () => {
    try {
      const response = await fetch('/api/v1/billing/addons')
      if (response.ok) {
        const data = await response.json()
        setAddOns(data.addOns)
      }
    } catch (error) {
      console.error('Failed to fetch add-ons:', error)
    }
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
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setShowModal(false)
      setSelectedPlan(null)
      
    } catch (error) {
      console.error('Subscription error:', error)
    } finally {
      setSubscribing(false)
    }
  }

  const goToLogin = () => router.push('/login')
  const goToSignup = () => router.push('/login?tab=register')

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F14] text-white flex items-center justify-center">
        <PricingBackground />
        <div className="relative z-10">Loading pricing...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0B0F14] text-white">
      <PricingBackground />
      <div className="relative z-10">
        <PricingNavbar onLogin={goToLogin} onSignup={goToSignup} />
        
        <main className="container mx-auto px-4 pt-24 pb-16">
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

          <div className="text-center border-t border-[#1c2333] pt-12">
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
