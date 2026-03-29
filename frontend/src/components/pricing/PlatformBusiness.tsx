'use client'

import { motion } from 'framer-motion'
import { Building2, Users, TrendingUp, Shield, ArrowRight, Check, Star } from 'lucide-react'

interface PartnerTier {
  id: string
  name: string
  description: string
  investment: number
  revenueShare: number
  features: string[]
  benefits: string[]
  recommended?: boolean
}

interface PlatformBusinessProps {
  onPartnerAction?: (tierId: string, action: 'apply' | 'learn') => void
}

export default function PlatformBusiness({ onPartnerAction }: PlatformBusinessProps) {
  const partnerTiers: PartnerTier[] = [
    {
      id: 'infrastructure',
      name: 'Infrastructure Partner',
      description: 'Build complete SaaS solutions on Torqvio infrastructure',
      investment: 50000,
      revenueShare: 30,
      features: [
        'Full platform access',
        'Infrastructure management',
        'Unlimited scaling',
        'White-label branding',
        'API access',
        'Technical support'
      ],
      benefits: [
        '70% revenue share',
        'Build your own SaaS',
        'Torqvio handles scaling',
        'Partner branding',
        'Market access'
      ],
      recommended: true
    },
    {
      id: 'solution',
      name: 'Solution Partner',
      description: 'Resell specific automation modules to your clients',
      investment: 25000,
      revenueShare: 40,
      features: [
        'Module resale rights',
        'Implementation support',
        'Strike team backup',
        'Training program',
        'Marketing materials',
        'Lead sharing'
      ],
      benefits: [
        '60% revenue share',
        'Proven modules',
        'Shared success',
        'Partner enablement',
        'Client ownership'
      ]
    },
    {
      id: 'referral',
      name: 'Referral Partner',
      description: 'Generate leads and earn commissions',
      investment: 0,
      revenueShare: 20,
      features: [
        'Lead generation only',
        'Referral tracking',
        'Marketing support',
        'Commission tracking',
        'Monthly payments',
        'No technical work'
      ],
      benefits: [
        '20% first-year commission',
        '10% renewal commission',
        'No setup cost',
        'Simple process',
        'Passive income'
      ]
    }
  ]

  const successMetrics = [
    {
      metric: '500%',
      description: 'Average partner ROI',
      icon: TrendingUp
    },
    {
      metric: '50+',
      description: 'Active partners',
      icon: Building2
    },
    {
      metric: '€2.5M',
      description: 'Partner revenue generated',
      icon: Users
    },
    {
      metric: '95%',
      description: 'Partner satisfaction',
      icon: Star
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-6 py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-20"
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="inline-flex items-center gap-2 bg-[#1A1F2E] border border-[#2A3142] rounded-full px-4 py-1.5 text-xs text-purple-300 font-medium mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
          Platform-as-a-Business Partner Program
        </motion.div>

        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #6C5CE7, #a78bfa)' }}
          >
            Build your business
          </span>
          {' '}on our infrastructure
        </h1>
        <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
          Become the invisible engine behind multiple companies. Build SaaS solutions, 
          resell automation, or generate referrals—we handle the infrastructure, you own the customer relationship.
        </p>
      </motion.div>

      {/* Success Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-20"
      >
        {successMetrics.map((metric, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="text-center p-6 rounded-2xl bg-[#1A1F2E]/30 border border-[#2A3142]/50"
          >
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <metric.icon className="w-6 h-6 text-purple-400" />
            </div>
            <p className="text-2xl font-mono font-bold text-white mb-2">{metric.metric}</p>
            <p className="text-xs text-gray-400">{metric.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Partner Tiers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
        {partnerTiers.map((tier, index) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            whileHover={{ y: -8 }}
            className={`relative rounded-3xl p-8 cursor-pointer transition-all ${
              tier.recommended 
                ? 'bg-gradient-to-b from-purple-500/10 to-transparent border-2 border-purple-500/30' 
                : 'bg-[#1A1F2E]/30 border border-[#2A3142]/50'
            }`}
          >
            {tier.recommended && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wide px-4 py-1.5 rounded-full shadow-lg shadow-purple-500/25">
                  Most Popular
                </span>
              </div>
            )}

            <div className="mb-6">
              <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
              <p className="text-sm text-gray-400 mb-4">{tier.description}</p>
              
              <div className="mb-4">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-3xl font-mono font-bold text-white">
                    {tier.investment === 0 ? 'Free' : `€${tier.investment.toLocaleString()}`}
                  </span>
                  {tier.investment > 0 && (
                    <span className="text-sm text-gray-500">setup</span>
                  )}
                </div>
                <p className="text-sm text-purple-400 font-medium">
                  You keep {100 - tier.revenueShare}% of revenue
                </p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <p className="text-xs text-gray-500 mb-2">What you get:</p>
                <div className="space-y-2">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-purple-400 flex-shrink-0" />
                      <span className="text-xs text-gray-300">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-xs text-gray-500 mb-2">Key benefits:</p>
                <div className="space-y-2">
                  {tier.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" />
                      <span className="text-xs text-gray-300">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => onPartnerAction?.(tier.id, 'apply')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background: tier.recommended 
                    ? 'linear-gradient(135deg, #6C5CE7, #5041c4)'
                    : 'linear-gradient(135deg, #00C896, #00b386)',
                  color: 'white',
                  boxShadow: tier.recommended 
                    ? '0 4px 20px rgba(108,92,231,0.3)'
                    : '0 4px 20px rgba(0,200,150,0.3)'
                }}
              >
                Apply Now
              </button>
              
              <button
                onClick={() => onPartnerAction?.(tier.id, 'learn')}
                className="w-full py-2 text-xs text-gray-400 hover:text-white transition-colors border border-[#2A3142] rounded-xl"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Partner Ecosystem */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="text-center"
      >
        <div className="max-w-4xl mx-auto p-8 rounded-3xl bg-gradient-to-b from-purple-500/10 to-transparent border border-purple-500/20">
          <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">
            Become the Invisible Engine
          </h2>
          <p className="text-gray-400 mb-6 leading-relaxed">
            Join partners who are building the next generation of automation companies. 
            We provide the infrastructure, you provide the innovation and customer relationships.
          </p>
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={() => onPartnerAction?.('infrastructure', 'apply')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
              style={{
                background: 'linear-gradient(135deg, #6C5CE7, #5041c4)',
                color: 'white'
              }}
            >
              Start Building
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
