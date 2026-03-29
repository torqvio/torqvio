'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Server, Shield, Globe, Zap, Users, Clock, TrendingUp, Check, X, ArrowRight, Calculator } from 'lucide-react'

interface SystemConfiguration {
  regions: string[]
  throughput: number
  latency: 'standard' | 'optimized' | 'ultra_low'
  availability: number
  compliance: string[]
  teamSize: number
  support: 'standard' | 'priority' | 'dedicated'
  scaling: 'manual' | 'auto' | 'predictive'
  dataRetention: number
  customIntegrations: number
}

interface PricingCalculation {
  baseInfrastructure: number
  regionalExpansion: number
  performancePremium: number
  complianceCosts: number
  supportCosts: number
  scalingCosts: number
  dataStorageCosts: number
  integrationCosts: number
  total: number
  setupFee: number
  monthlyRecurring: number
  architecture: string
}

export default function EnterpriseSystemDesigner() {
  const [step, setStep] = useState(0)
  const [configuration, setConfiguration] = useState<SystemConfiguration>({
    regions: ['us-east-1'],
    throughput: 100000,
    latency: 'standard',
    availability: 99.9,
    compliance: [],
    teamSize: 10,
    support: 'standard',
    scaling: 'auto',
    dataRetention: 30,
    customIntegrations: 5
  })
  const [pricing, setPricing] = useState<PricingCalculation | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)

  const steps = [
    { title: 'Infrastructure Design', icon: Server },
    { title: 'Performance & Reliability', icon: Zap },
    { title: 'Compliance & Security', icon: Shield },
    { title: 'Team & Support', icon: Users },
    { title: 'Your Enterprise Solution', icon: Calculator }
  ]

  const regions = [
    { id: 'us-east-1', name: 'US East', latency: 'Low', cost: 1 },
    { id: 'us-west-2', name: 'US West', latency: 'Low', cost: 1 },
    { id: 'eu-west-1', name: 'Europe', latency: 'Medium', cost: 1.2 },
    { id: 'ap-southeast-1', name: 'Asia Pacific', latency: 'High', cost: 1.3 },
    { id: 'sa-east-1', name: 'South America', latency: 'High', cost: 1.4 }
  ]

  const complianceOptions = [
    { id: 'soc2', name: 'SOC2 Type II', cost: 2000, description: 'Security controls and reporting' },
    { id: 'gdpr', name: 'GDPR', cost: 1500, description: 'EU data protection compliance' },
    { id: 'hipaa', name: 'HIPAA', cost: 3000, description: 'Healthcare data protection' },
    { id: 'iso27001', name: 'ISO 27001', cost: 2500, description: 'Information security management' },
    { id: 'pci_dss', name: 'PCI DSS', cost: 4000, description: 'Payment card industry standards' }
  ]

  useEffect(() => {
    if (step === 4) {
      calculatePricing()
    }
  }, [step])

  const calculatePricing = async () => {
    setIsCalculating(true)
    
    // Simulate complex calculation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    // Base infrastructure cost
    let baseInfrastructure = 5000 // Starting point
    
    // Throughput scaling
    if (configuration.throughput > 1000000) {
      baseInfrastructure += (configuration.throughput - 1000000) * 0.01
    } else if (configuration.throughput > 100000) {
      baseInfrastructure += (configuration.throughput - 100000) * 0.02
    } else {
      baseInfrastructure += configuration.throughput * 0.05
    }
    
    // Regional expansion costs
    const regionCosts = configuration.regions.map(regionId => {
      const region = regions.find(r => r.id === regionId)
      return region ? region.cost : 1
    })
    const regionalExpansion = regionCosts.reduce((sum, cost) => sum + cost, 0) * 1000
    
    // Performance premium
    const latencyMultipliers = {
      standard: 1,
      optimized: 1.5,
      ultra_low: 2.5
    }
    const performancePremium = baseInfrastructure * (latencyMultipliers[configuration.latency] - 1)
    
    // Availability SLA costs
    const availabilityPremiums = {
      99.5: 0,
      99.9: 0.2,
      99.95: 0.5,
      99.99: 1.2
    }
    const availabilityCost = baseInfrastructure * (availabilityPremiums[configuration.availability as keyof typeof availabilityPremiums] || 0)
    
    // Compliance costs
    const complianceCosts = configuration.compliance.reduce((sum, complianceId) => {
      const option = complianceOptions.find(c => c.id === complianceId)
      return sum + (option ? option.cost : 0)
    }, 0)
    
    // Support costs
    const supportMultipliers = {
      standard: 0.1,
      priority: 0.2,
      dedicated: 0.4
    }
    const supportCosts = baseInfrastructure * supportMultipliers[configuration.support]
    
    // Scaling costs
    const scalingMultipliers = {
      manual: 0,
      auto: 0.1,
      predictive: 0.3
    }
    const scalingCosts = baseInfrastructure * scalingMultipliers[configuration.scaling]
    
    // Data storage costs
    const dataStorageCosts = configuration.dataRetention * 50 // €50 per day of retention
    
    // Integration costs
    const integrationCosts = configuration.customIntegrations * 500
    
    // Calculate totals
    const monthlyRecurring = baseInfrastructure + regionalExpansion + performancePremium + 
                            availabilityCost + complianceCosts + supportCosts + 
                            scalingCosts + dataStorageCosts + integrationCosts
    
    const setupFee = monthlyRecurring * 2 // 2 months setup fee
    
    const total = monthlyRecurring + setupFee
    
    // Determine architecture tier
    let architecture = 'Professional'
    if (configuration.throughput > 1000000 || configuration.availability >= 99.99) {
      architecture = 'Enterprise'
    } else if (configuration.throughput > 100000 || configuration.regions.length > 2) {
      architecture = 'Advanced'
    }
    
    setPricing({
      baseInfrastructure: Math.round(baseInfrastructure),
      regionalExpansion: Math.round(regionalExpansion),
      performancePremium: Math.round(performancePremium),
      complianceCosts: Math.round(complianceCosts),
      supportCosts: Math.round(supportCosts),
      scalingCosts: Math.round(scalingCosts),
      dataStorageCosts: Math.round(dataStorageCosts),
      integrationCosts: Math.round(integrationCosts),
      total: Math.round(total),
      setupFee: Math.round(setupFee),
      monthlyRecurring: Math.round(monthlyRecurring),
      architecture
    })
    
    setIsCalculating(false)
  }

  const toggleRegion = (regionId: string) => {
    setConfiguration(prev => ({
      ...prev,
      regions: prev.regions.includes(regionId)
        ? prev.regions.filter(r => r !== regionId)
        : [...prev.regions, regionId]
    }))
  }

  const toggleCompliance = (complianceId: string) => {
    setConfiguration(prev => ({
      ...prev,
      compliance: prev.compliance.includes(complianceId)
        ? prev.compliance.filter(c => c !== complianceId)
        : [...prev.compliance, complianceId]
    }))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const nextStep = () => setStep(Math.min(step + 1, steps.length - 1))
  const prevStep = () => setStep(Math.max(step - 1, 0))

  return (
    <div className="max-w-5xl mx-auto bg-[#0d1117] border border-[#1c2333] rounded-xl p-8">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          {steps.map((s, index) => {
            const Icon = s.icon
            return (
              <div key={index} className="flex items-center">
                <div className={[
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  index <= step ? 'bg-blue-500 text-black' : 'bg-[#1c2333] text-gray-500'
                ].join(' ')}>
                  <Icon className="w-5 h-5" />
                </div>
                {index < steps.length - 1 && (
                  <div className={[
                    'w-full h-0.5 mx-2 transition-colors',
                    index < step ? 'bg-blue-500' : 'bg-[#1c2333]'
                  ].join(' ')} />
                )}
              </div>
            )
          })}
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-white mb-2">{steps[step].title}</h2>
          <p className="text-gray-400 text-sm">Step {step + 1} of {steps.length}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 0: Infrastructure Design */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-400 text-sm mb-3">Deployment Regions</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {regions.map(region => (
                  <button
                    key={region.id}
                    onClick={() => toggleRegion(region.id)}
                    className={[
                      'p-3 rounded-lg border text-left transition-colors',
                      configuration.regions.includes(region.id)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white mb-1">{region.name}</div>
                    <div className="text-xs text-gray-400">Latency: {region.latency}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">
                Expected Monthly Throughput: {configuration.throughput.toLocaleString()} executions
              </label>
              <input
                type="range"
                min="10000"
                max="10000000"
                step="10000"
                value={configuration.throughput}
                onChange={(e) => setConfiguration(prev => ({ ...prev, throughput: parseInt(e.target.value) }))}
                className="w-full h-2 bg-[#1c2333] rounded-full appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10k</span>
                <span>1M</span>
                <span>10M</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Custom Integrations</label>
              <input
                type="number"
                min="0"
                max="100"
                value={configuration.customIntegrations}
                onChange={(e) => setConfiguration(prev => ({ ...prev, customIntegrations: parseInt(e.target.value) || 0 }))}
                className="w-full px-4 py-3 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>
          </motion.div>
        )}

        {/* Step 1: Performance & Reliability */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-400 text-sm mb-3">Latency Requirements</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'standard', name: 'Standard', description: '< 500ms response time' },
                  { id: 'optimized', name: 'Optimized', description: '< 200ms response time' },
                  { id: 'ultra_low', name: 'Ultra Low', description: '< 50ms response time' }
                ].map(latency => (
                  <button
                    key={latency.id}
                    onClick={() => setConfiguration(prev => ({ ...prev, latency: latency.id as any }))}
                    className={[
                      'p-4 rounded-lg border text-left transition-colors',
                      configuration.latency === latency.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white mb-1">{latency.name}</div>
                    <div className="text-xs text-gray-400">{latency.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">
                Availability SLA: {configuration.availability}%
              </label>
              <input
                type="range"
                min="99.5"
                max="99.99"
                step="0.01"
                value={configuration.availability}
                onChange={(e) => setConfiguration(prev => ({ ...prev, availability: parseFloat(e.target.value) }))}
                className="w-full h-2 bg-[#1c2333] rounded-full appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>99.5%</span>
                <span>99.9%</span>
                <span>99.99%</span>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Scaling Strategy</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'manual', name: 'Manual', description: 'Manual capacity planning' },
                  { id: 'auto', name: 'Auto', description: 'Automatic scaling based on load' },
                  { id: 'predictive', name: 'Predictive', description: 'AI-powered predictive scaling' }
                ].map(scaling => (
                  <button
                    key={scaling.id}
                    onClick={() => setConfiguration(prev => ({ ...prev, scaling: scaling.id as any }))}
                    className={[
                      'p-4 rounded-lg border text-left transition-colors',
                      configuration.scaling === scaling.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white mb-1">{scaling.name}</div>
                    <div className="text-xs text-gray-400">{scaling.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Compliance & Security */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-400 text-sm mb-3">Compliance Requirements</label>
              <div className="space-y-3">
                {complianceOptions.map(option => (
                  <button
                    key={option.id}
                    onClick={() => toggleCompliance(option.id)}
                    className={[
                      'w-full p-4 rounded-lg border text-left transition-colors flex items-center justify-between',
                      configuration.compliance.includes(option.id)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div>
                      <div className="font-medium text-white mb-1">{option.name}</div>
                      <div className="text-xs text-gray-400">{option.description}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-white">{formatCurrency(option.cost)}/mo</div>
                      <div className={[
                        'w-5 h-5 rounded border-2 flex items-center justify-center mt-1',
                        configuration.compliance.includes(option.id)
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-500'
                      ]}>
                        {configuration.compliance.includes(option.id) && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">
                Data Retention: {configuration.dataRetention} days
              </label>
              <input
                type="range"
                min="7"
                max="365"
                step="1"
                value={configuration.dataRetention}
                onChange={(e) => setConfiguration(prev => ({ ...prev, dataRetention: parseInt(e.target.value) }))}
                className="w-full h-2 bg-[#1c2333] rounded-full appearance-none cursor-pointer accent-blue-500"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>7 days</span>
                <span>30 days</span>
                <span>90 days</span>
                <span>365 days</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Team & Support */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-400 text-sm mb-3">Team Size</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={configuration.teamSize}
                onChange={(e) => setConfiguration(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-3 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Support Level</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'standard', name: 'Standard', description: 'Email support, 24h response' },
                  { id: 'priority', name: 'Priority', description: 'Email + chat, 4h response' },
                  { id: 'dedicated', name: 'Dedicated', description: '24/7 phone + dedicated team' }
                ].map(support => (
                  <button
                    key={support.id}
                    onClick={() => setConfiguration(prev => ({ ...prev, support: support.id as any }))}
                    className={[
                      'p-4 rounded-lg border text-left transition-colors',
                      configuration.support === support.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white mb-1">{support.name}</div>
                    <div className="text-xs text-gray-400">{support.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: Results */}
        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {isCalculating ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <h3 className="text-xl font-bold text-white mb-2">Designing your enterprise system...</h3>
                <p className="text-gray-400">Calculating optimal architecture and pricing</p>
              </div>
            ) : pricing && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">Your Enterprise Solution</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full">
                    <Server className="w-5 h-5 text-purple-400" />
                    <span className="text-purple-300 font-medium">{pricing.architecture} Architecture</span>
                  </div>
                </div>

                {/* Pricing Summary */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-4">Investment Summary</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-sm text-gray-400 mb-1">One-time Setup</div>
                      <div className="text-3xl font-bold text-white">{formatCurrency(pricing.setupFee)}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 mb-1">Monthly Recurring</div>
                      <div className="text-3xl font-bold text-green-400">{formatCurrency(pricing.monthlyRecurring)}</div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-400 mb-3">Cost Breakdown:</div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Base Infrastructure</span>
                      <span className="text-white">{formatCurrency(pricing.baseInfrastructure)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Regional Expansion ({configuration.regions.length} regions)</span>
                      <span className="text-white">{formatCurrency(pricing.regionalExpansion)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Performance Premium ({configuration.latency})</span>
                      <span className="text-white">{formatCurrency(pricing.performancePremium)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Availability SLA ({configuration.availability}%)</span>
                      <span className="text-white">{formatCurrency(pricing.availabilityCost)}</span>
                    </div>
                    {pricing.complianceCosts > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Compliance ({configuration.compliance.length} frameworks)</span>
                        <span className="text-white">{formatCurrency(pricing.complianceCosts)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Support ({configuration.support})</span>
                      <span className="text-white">{formatCurrency(pricing.supportCosts)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Scaling ({configuration.scaling})</span>
                      <span className="text-white">{formatCurrency(pricing.scalingCosts)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-300">Data Storage ({configuration.dataRetention} days)</span>
                      <span className="text-white">{formatCurrency(pricing.dataStorageCosts)}</span>
                    </div>
                    {pricing.integrationCosts > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-300">Custom Integrations ({configuration.customIntegrations})</span>
                        <span className="text-white">{formatCurrency(pricing.integrationCosts)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Architecture Preview */}
                <div className="bg-[#1c2333] rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-4">System Architecture</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400 block mb-1">Regions</span>
                      <span className="text-white">{configuration.regions.length}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Throughput</span>
                      <span className="text-white">{(configuration.throughput / 1000000).toFixed(1)}M/mo</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Latency</span>
                      <span className="text-white capitalize">{configuration.latency}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block mb-1">Availability</span>
                      <span className="text-white">{configuration.availability}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <button className="px-6 py-3 bg-[#1c2333] text-gray-300 font-medium rounded-lg border border-[#2a3147] hover:border-gray-500 transition-colors">
                    Download Architecture PDF
                  </button>
                  <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors">
                    Schedule Enterprise Call
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex justify-between mt-8">
        <button
          onClick={prevStep}
          disabled={step === 0}
          className={[
            'px-6 py-2 rounded-lg font-medium transition-colors',
            step === 0
              ? 'bg-[#1c2333] text-gray-600 cursor-not-allowed'
              : 'bg-[#1c2333] text-gray-300 hover:text-white border border-[#2a3147] hover:border-gray-500'
          ].join(' ')}
        >
          Previous
        </button>
        
        {step < 4 && (
          <button
            onClick={nextStep}
            className="px-6 py-2 bg-blue-500 text-black font-medium rounded-lg hover:bg-blue-400 transition-colors"
          >
            Next Step
            <ArrowRight className="w-4 h-4 inline ml-2" />
          </button>
        )}
      </div>
    </div>
  )
}
