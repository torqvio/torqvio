'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { ArrowRight, Building2, Users, Zap, TrendingUp, Sparkles, Check, X, ChevronRight } from 'lucide-react'

interface DealRoomInputs {
  companySize: 'solo' | 'small' | 'medium' | 'large' | 'enterprise'
  industry: 'ecommerce' | 'saas' | 'finance' | 'healthcare' | 'manufacturing' | 'consulting' | 'other'
  useCase: 'automation' | 'integration' | 'monitoring' | 'reporting' | 'ai_workflows' | 'other'
  currentPain: string[]
  expectedWorkflows: number
  teamSize: number
  currentTools: string[]
  budget: 'under_500' | '500_2000' | '2000_10000' | 'over_10000'
  timeline: 'immediate' | '1_month' | '3_months' | '6_months'
}

interface PersonalizedRecommendation {
  recommendedMode: 'builder' | 'growth' | 'autopilot'
  confidence: number
  reasoning: string[]
  projectedROI: number
  breakEvenDays: number
  implementationComplexity: 'low' | 'medium' | 'high'
  nextSteps: string[]
  objections: string[]
  incentives: string[]
}

interface InteractiveDealRoomProps {
  onRecommendation: (recommendation: PersonalizedRecommendation) => void
}

export default function InteractiveDealRoom({ onRecommendation }: InteractiveDealRoomProps) {
  const [step, setStep] = useState(0)
  const [inputs, setInputs] = useState<DealRoomInputs>({
    companySize: 'small',
    industry: 'other',
    useCase: 'automation',
    currentPain: [],
    expectedWorkflows: 5,
    teamSize: 3,
    currentTools: [],
    budget: '500_2000',
    timeline: '1_month'
  })
  const [recommendation, setRecommendation] = useState<PersonalizedRecommendation | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const steps = [
    { title: 'What are you building?', icon: Building2 },
    { title: 'How big are you?', icon: Users },
    { title: 'What\'s your pain?', icon: Zap },
    { title: 'Your personalized solution', icon: Sparkles }
  ]

  const industries = [
    { id: 'ecommerce', name: 'E-commerce', multiplier: 1.5, description: 'Order processing, inventory, customer service' },
    { id: 'saas', name: 'SaaS', multiplier: 1.3, description: 'User onboarding, billing, analytics' },
    { id: 'finance', name: 'Financial Services', multiplier: 1.8, description: 'Compliance, reporting, risk management' },
    { id: 'healthcare', name: 'Healthcare', multiplier: 1.2, description: 'Patient scheduling, billing, compliance' },
    { id: 'manufacturing', name: 'Manufacturing', multiplier: 1.4, description: 'Supply chain, quality control, inventory' },
    { id: 'consulting', name: 'Consulting', multiplier: 1.1, description: 'Client reporting, project management' },
    { id: 'other', name: 'Other', multiplier: 1.0, description: 'Custom workflows and processes' }
  ]

  const painPoints = [
    { id: 'manual_repetitive', name: 'Manual repetitive tasks', value: 3 },
    { id: 'data_silos', name: 'Data silos everywhere', value: 2 },
    { id: 'human_errors', name: 'Constant human errors', value: 4 },
    { id: 'slow_processes', name: 'Everything takes too long', value: 3 },
    { id: 'no_visibility', name: 'No process visibility', value: 2 },
    { id: 'scaling_issues', name: 'Can\'t scale operations', value: 4 },
    { id: 'high_costs', name: 'High operational costs', value: 3 },
    { id: 'customer_complaints', name: 'Customer complaints about delays', value: 4 }
  ]

  const currentTools = [
    { id: 'zapier', name: 'Zapier', category: 'automation' },
    { id: 'make', name: 'Make (Integromat)', category: 'automation' },
    { id: 'n8n', name: 'n8n', category: 'automation' },
    { id: 'custom_scripts', name: 'Custom scripts', category: 'development' },
    { id: 'excel', name: 'Excel/Google Sheets', category: 'manual' },
    { id: 'email', name: 'Email & Slack', category: 'manual' },
    { id: 'none', name: 'Nothing automated yet', category: 'none' }
  ]

  useEffect(() => {
    if (step === 3) {
      generateRecommendation()
    }
  }, [step])

  const generateRecommendation = async () => {
    setIsAnalyzing(true)
    
    // Simulate AI analysis
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const painScore = inputs.currentPain.reduce((acc, pain) => {
      const point = painPoints.find(p => p.id === pain)
      return acc + (point?.value || 0)
    }, 0)

    const complexityScore = inputs.expectedWorkflows * 0.5 + inputs.teamSize * 0.3
    const hasAdvancedTools = inputs.currentTools.some(tool => ['zapier', 'make', 'n8n'].includes(tool))
    
    let recommendedMode: 'builder' | 'growth' | 'autopilot' = 'builder'
    let confidence = 0.7
    let reasoning: string[] = []
    let projectedROI = 150
    let breakEvenDays = 45
    let implementationComplexity: 'low' | 'medium' | 'high' = 'low'
    
    // Decision logic
    if (inputs.companySize === 'solo' && inputs.expectedWorkflows <= 5) {
      recommendedMode = 'builder'
      confidence = 0.9
      reasoning = [
        'Small team with simple needs',
        'Perfect for getting started with automation',
        'Unlimited experimentation at no cost'
      ]
      projectedROI = 120
      breakEvenDays = 30
      implementationComplexity = 'low'
    } else if (painScore >= 10 || inputs.expectedWorkflows >= 10 || hasAdvancedTools) {
      recommendedMode = 'growth'
      confidence = 0.85
      reasoning = [
        'Significant pain points indicate readiness for advanced automation',
        'Your workflow complexity requires adaptive scaling',
        'You\'ll benefit from value-based pricing'
      ]
      projectedROI = 280
      breakEvenDays = 21
      implementationComplexity = 'medium'
    } else if (inputs.companySize === 'enterprise' || inputs.budget === 'over_10000') {
      recommendedMode = 'autopilot'
      confidence = 0.8
      reasoning = [
        'Enterprise scale requires maximum automation',
        'Revenue share model aligns with your success',
        'Zero upfront cost with guaranteed outcomes'
      ]
      projectedROI = 450
      breakEvenDays = 14
      implementationComplexity = 'high'
    } else {
      recommendedMode = 'growth'
      confidence = 0.75
      reasoning = [
        'Growth mode provides the best balance of features and cost',
        'Adaptive pricing will scale with your success',
        'Includes AI optimization capabilities'
      ]
      projectedROI = 220
      breakEvenDays = 28
      implementationComplexity = 'medium'
    }

    const industry = industries.find(i => i.id === inputs.industry)
    if (industry) {
      projectedROI *= industry.multiplier
      reasoning.push(`${industry.name} industry shows ${Math.round((industry.multiplier - 1) * 100)}% higher ROI with automation`)
    }

    const rec: PersonalizedRecommendation = {
      recommendedMode,
      confidence,
      reasoning,
      projectedROI: Math.round(projectedROI),
      breakEvenDays,
      implementationComplexity,
      nextSteps: [
        'Schedule 30-min discovery call',
        'Get personalized demo',
        'Receive custom implementation plan',
        'Start with pilot workflow'
      ],
      objections: [
        'We already have tools',
        'Too complex to implement',
        'Team resistance to change',
        'Budget constraints'
      ],
      incentives: [
        'First month free',
        'Free migration assistance',
        'Dedicated onboarding specialist',
        '30-day money-back guarantee'
      ]
    }

    setRecommendation(rec)
    setIsAnalyzing(false)
    onRecommendation(rec)
  }

  const nextStep = () => setStep(Math.min(step + 1, steps.length - 1))
  const prevStep = () => setStep(Math.max(step - 1, 0))

  const updateInputs = (key: keyof DealRoomInputs, value: any) => {
    setInputs(prev => ({ ...prev, [key]: value }))
  }

  const togglePainPoint = (painId: string) => {
    setInputs(prev => ({
      ...prev,
      currentPain: prev.currentPain.includes(painId)
        ? prev.currentPain.filter(p => p !== painId)
        : [...prev.currentPain, painId]
    }))
  }

  const toggleTool = (toolId: string) => {
    setInputs(prev => ({
      ...prev,
      currentTools: prev.currentTools.includes(toolId)
        ? prev.currentTools.filter(t => t !== toolId)
        : [...prev.currentTools, toolId]
    }))
  }

  return (
    <div className="max-w-4xl mx-auto bg-[#0d1117] border border-[#1c2333] rounded-xl p-8">
      {/* Progress Bar */}
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
        {/* Step 0: What are you building? */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-400 text-sm mb-3">Primary Industry</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {industries.map(industry => (
                  <button
                    key={industry.id}
                    onClick={() => updateInputs('industry', industry.id as any)}
                    className={[
                      'p-4 rounded-lg border text-left transition-colors',
                      inputs.industry === industry.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white mb-1">{industry.name}</div>
                    <div className="text-xs text-gray-400">{industry.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Main Use Case</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {[
                  { id: 'automation', name: 'Business Automation', icon: Zap },
                  { id: 'integration', name: 'System Integration', icon: Building2 },
                  { id: 'monitoring', name: 'Monitoring & Alerting', icon: TrendingUp },
                  { id: 'reporting', name: 'Reporting & Analytics', icon: TrendingUp },
                  { id: 'ai_workflows', name: 'AI Workflows', icon: Sparkles },
                  { id: 'other', name: 'Other', icon: Building2 }
                ].map(useCase => (
                  <button
                    key={useCase.id}
                    onClick={() => updateInputs('useCase', useCase.id as any)}
                    className={[
                      'p-3 rounded-lg border flex flex-col items-center gap-2 transition-colors',
                      inputs.useCase === useCase.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <useCase.icon className="w-6 h-6 text-blue-400" />
                    <span className="text-sm text-white">{useCase.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-2">Expected Workflows</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={inputs.expectedWorkflows}
                  onChange={(e) => updateInputs('expectedWorkflows', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-2">Team Size</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={inputs.teamSize}
                  onChange={(e) => updateInputs('teamSize', parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1: How big are you? */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-400 text-sm mb-3">Company Size</label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: 'solo', name: 'Solo', description: 'Just me', range: '1 person' },
                  { id: 'small', name: 'Small', description: 'Small team', range: '2-10 people' },
                  { id: 'medium', name: 'Medium', description: 'Growing business', range: '11-50 people' },
                  { id: 'large', name: 'Large', description: 'Established company', range: '51-200 people' },
                  { id: 'enterprise', name: 'Enterprise', description: 'Large organization', range: '200+ people' }
                ].map(size => (
                  <button
                    key={size.id}
                    onClick={() => updateInputs('companySize', size.id as any)}
                    className={[
                      'p-4 rounded-lg border text-left transition-colors',
                      inputs.companySize === size.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white mb-1">{size.name}</div>
                    <div className="text-xs text-gray-400 mb-1">{size.description}</div>
                    <div className="text-xs text-gray-500">{size.range}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Monthly Budget</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'under_500', name: 'Under $500', range: '<$500/mo' },
                  { id: '500_2000', name: 'Moderate', range: '$500-$2k/mo' },
                  { id: '2000_10000', name: 'Significant', range: '$2k-$10k/mo' },
                  { id: 'over_10000', name: 'Enterprise', range: '>$10k/mo' }
                ].map(budget => (
                  <button
                    key={budget.id}
                    onClick={() => updateInputs('budget', budget.id as any)}
                    className={[
                      'p-3 rounded-lg border text-center transition-colors',
                      inputs.budget === budget.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white">{budget.name}</div>
                    <div className="text-xs text-gray-400">{budget.range}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Implementation Timeline</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { id: 'immediate', name: 'ASAP', description: 'This week' },
                  { id: '1_month', name: '1 Month', description: 'Next month' },
                  { id: '3_months', name: '3 Months', description: 'This quarter' },
                  { id: '6_months', name: '6 Months', description: 'This half' }
                ].map(timeline => (
                  <button
                    key={timeline.id}
                    onClick={() => updateInputs('timeline', timeline.id as any)}
                    className={[
                      'p-3 rounded-lg border text-center transition-colors',
                      inputs.timeline === timeline.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white">{timeline.name}</div>
                    <div className="text-xs text-gray-400">{timeline.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: What's your pain? */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-400 text-sm mb-3">What are your biggest pain points? (Select all that apply)</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {painPoints.map(pain => (
                  <button
                    key={pain.id}
                    onClick={() => togglePainPoint(pain.id)}
                    className={[
                      'p-3 rounded-lg border text-left transition-colors flex items-center gap-3',
                      inputs.currentPain.includes(pain.id)
                        ? 'border-red-500 bg-red-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className={[
                      'w-5 h-5 rounded border-2 flex items-center justify-center',
                      inputs.currentPain.includes(pain.id)
                        ? 'border-red-500 bg-red-500'
                        : 'border-gray-500'
                    ]}>
                      {inputs.currentPain.includes(pain.id) && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div>
                      <div className="font-medium text-white">{pain.name}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">What tools are you currently using?</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {currentTools.map(tool => (
                  <button
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={[
                      'p-3 rounded-lg border text-center transition-colors',
                      inputs.currentTools.includes(tool.id)
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white text-sm">{tool.name}</div>
                    <div className="text-xs text-gray-500 capitalize">{tool.category}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Recommendation */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {isAnalyzing ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <h3 className="text-xl font-bold text-white mb-2">Analyzing your needs...</h3>
                <p className="text-gray-400">Our AI is building your personalized automation strategy</p>
              </div>
            ) : recommendation && (
              <div className="space-y-6">
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 rounded-full mb-4">
                    <Sparkles className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-300 font-medium">
                      {recommendation.recommendedMode === 'builder' ? 'Builder Mode' :
                       recommendation.recommendedMode === 'growth' ? 'Growth Mode' : 'Autopilot Mode'} Recommended
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Your Personalized Solution</h3>
                  <div className="flex items-center justify-center gap-4 text-sm text-gray-400">
                    <span>{Math.round(recommendation.confidence * 100)}% confidence</span>
                    <span>•</span>
                    <span>{recommendation.projectedROI}% projected ROI</span>
                    <span>•</span>
                    <span>{recommendation.breakEvenDays} days to break even</span>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 border border-green-500/20 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Why this recommendation?</h4>
                  <ul className="space-y-2">
                    {recommendation.reasoning.map((reason, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-300 text-sm">{reason}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-[#1c2333] rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <ChevronRight className="w-4 h-4 text-blue-400" />
                      Next Steps
                    </h4>
                    <ul className="space-y-2">
                      {recommendation.nextSteps.map((step, index) => (
                        <li key={index} className="text-gray-400 text-sm flex items-start gap-2">
                          <span className="text-blue-400 mt-1">•</span>
                          {step}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#1c2333] rounded-lg p-4">
                    <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-yellow-400" />
                      Special Incentives
                    </h4>
                    <ul className="space-y-2">
                      {recommendation.incentives.map((incentive, index) => (
                        <li key={index} className="text-gray-400 text-sm flex items-start gap-2">
                          <span className="text-yellow-400 mt-1">✦</span>
                          {incentive}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-[#1c2333] rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-3">Potential Concerns</h4>
                  <div className="space-y-3">
                    {recommendation.objections.map((objection, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-gray-300 text-sm mb-1">{objection}</p>
                          <p className="text-gray-500 text-xs">We have solutions for this - let's discuss on the call</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-center">
                  <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors">
                    Schedule Your Strategy Call
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
        
        {step < 3 && (
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
