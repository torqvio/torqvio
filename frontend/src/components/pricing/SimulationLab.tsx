'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect } from 'react'
import { Zap, TrendingUp, Clock, Users, Server, Shield, ArrowRight, Play, BarChart3, Target } from 'lucide-react'

interface WorkloadInputs {
  workflows: number
  executionsPerWorkflow: number
  teamSize: number
  dataVolume: 'small' | 'medium' | 'large'
  complexity: 'simple' | 'moderate' | 'complex'
  criticality: 'low' | 'medium' | 'high'
  regions: number
  compliance: boolean
}

interface SimulationResults {
  monthlyExecutions: number
  estimatedValue: number
  timeSaved: number
  performanceTier: 'standard' | 'optimized' | 'priority'
  infrastructure: string
  costRange: {
    min: number
    max: number
    explanation: string
  }
  bottlenecks: string[]
  optimizations: string[]
}

export default function SimulationLab() {
  const [step, setStep] = useState(0)
  const [inputs, setInputs] = useState<WorkloadInputs>({
    workflows: 5,
    executionsPerWorkflow: 1000,
    teamSize: 3,
    dataVolume: 'medium',
    complexity: 'moderate',
    criticality: 'medium',
    regions: 1,
    compliance: false
  })
  const [results, setResults] = useState<SimulationResults | null>(null)
  const [isSimulating, setIsSimulating] = useState(false)

  const steps = [
    { title: 'Describe your workload', icon: BarChart3 },
    { title: 'Team & operations', icon: Users },
    { title: 'Requirements', icon: Shield },
    { title: 'Your simulation results', icon: Target }
  ]

  useEffect(() => {
    if (step === 3) {
      runSimulation()
    }
  }, [step])

  const runSimulation = async () => {
    setIsSimulating(true)
    
    // Simulate complex calculation
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    const monthlyExecutions = inputs.workflows * inputs.executionsPerWorkflow
    
    // Value calculation based on complexity and criticality
    const baseValuePerExecution = {
      simple: 0.5,
      moderate: 2,
      complex: 8
    }[inputs.complexity]
    
    const criticalityMultiplier = {
      low: 1,
      medium: 1.5,
      high: 2.5
    }[inputs.criticality]
    
    const estimatedValue = monthlyExecutions * baseValuePerExecution * criticalityMultiplier
    
    // Time saved calculation
    const timePerExecution = {
      simple: 5, // 5 minutes manual
      moderate: 15,
      complex: 60
    }[inputs.complexity]
    
    const automatedTimePerExecution = 0.1 // 6 seconds automated
    const timeSavedPerExecution = (timePerExecution - automatedTimePerExecution) / 60 // Convert to hours
    const timeSaved = monthlyExecutions * timeSavedPerExecution
    
    // Performance tier determination
    let performanceTier: 'standard' | 'optimized' | 'priority' = 'standard'
    if (inputs.criticality === 'high' || monthlyExecutions > 100000) {
      performanceTier = 'priority'
    } else if (inputs.complexity === 'complex' || monthlyExecutions > 10000) {
      performanceTier = 'optimized'
    }
    
    // Infrastructure recommendation
    const infrastructure = monthlyExecutions > 1000000 ? 'Enterprise Cluster' :
                         monthlyExecutions > 100000 ? 'Professional Pool' :
                         'Shared Infrastructure'
    
    // Cost calculation (the invisible part)
    let baseCost = 0
    let multiplier = 1
    
    if (monthlyExecutions > 1000) baseCost = 3 // Micro-commitment threshold
    if (monthlyExecutions > 10000) baseCost = 25 // Adaptive pricing kicks in
    if (monthlyExecutions > 100000) baseCost = 100 // Scale pricing
    
    // Complexity multiplier
    multiplier *= inputs.complexity === 'complex' ? 2 : inputs.complexity === 'moderate' ? 1.5 : 1
    
    // Criticality multiplier
    multiplier *= inputs.criticality === 'high' ? 1.8 : inputs.criticality === 'medium' ? 1.3 : 1
    
    // Team multiplier
    multiplier *= Math.max(1, inputs.teamSize / 5)
    
    // Region multiplier
    multiplier *= inputs.regions
    
    // Compliance multiplier
    if (inputs.compliance) multiplier *= 1.4
    
    const estimatedCost = baseCost * multiplier
    
    // Generate bottlenecks and optimizations
    const bottlenecks = []
    const optimizations = []
    
    if (inputs.complexity === 'complex' && performanceTier !== 'priority') {
      bottlenecks.push('Complex workflows may experience queue delays')
      optimizations.push('Priority Engine eliminates queue waiting')
    }
    
    if (monthlyExecutions > 50000 && inputs.regions === 1) {
      bottlenecks.push('Single region may cause latency issues')
      optimizations.push('Multi-region deployment improves performance')
    }
    
    if (inputs.criticality === 'high' && !inputs.compliance) {
      bottlenecks.push('Missing compliance frameworks for critical operations')
      optimizations.push('Enterprise compliance ensures audit readiness')
    }
    
    if (timeSaved > 100) {
      optimizations.push('Automated reporting tracks your time savings')
    }
    
    setResults({
      monthlyExecutions,
      estimatedValue,
      timeSaved,
      performanceTier,
      infrastructure,
      costRange: {
        min: Math.round(estimatedCost * 0.8),
        max: Math.round(estimatedCost * 1.3),
        explanation: 'Based on usage patterns and performance requirements'
      },
      bottlenecks,
      optimizations
    })
    
    setIsSimulating(false)
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
    return num.toString()
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
    <div className="max-w-4xl mx-auto bg-[#0d1117] border border-[#1c2333] rounded-xl p-8">
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
        {/* Step 0: Workload Description */}
        {step === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-400 text-sm mb-3">How many workflows?</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={inputs.workflows}
                onChange={(e) => setInputs(prev => ({ ...prev, workflows: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-3 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Executions per workflow (monthly)</label>
              <input
                type="number"
                min="10"
                max="1000000"
                value={inputs.executionsPerWorkflow}
                onChange={(e) => setInputs(prev => ({ ...prev, executionsPerWorkflow: parseInt(e.target.value) || 10 }))}
                className="w-full px-4 py-3 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Workflow complexity</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'simple', name: 'Simple', description: 'Basic data processing' },
                  { id: 'moderate', name: 'Moderate', description: 'Multi-step processes' },
                  { id: 'complex', name: 'Complex', description: 'Advanced logic & integrations' }
                ].map(complexity => (
                  <button
                    key={complexity.id}
                    onClick={() => setInputs(prev => ({ ...prev, complexity: complexity.id as any }))}
                    className={[
                      'p-4 rounded-lg border text-left transition-colors',
                      inputs.complexity === complexity.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white mb-1">{complexity.name}</div>
                    <div className="text-xs text-gray-400">{complexity.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Criticality to business</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'low', name: 'Low', description: 'Nice to have automation' },
                  { id: 'medium', name: 'Medium', description: 'Important operations' },
                  { id: 'high', name: 'High', description: 'Business-critical processes' }
                ].map(criticality => (
                  <button
                    key={criticality.id}
                    onClick={() => setInputs(prev => ({ ...prev, criticality: criticality.id as any }))}
                    className={[
                      'p-4 rounded-lg border text-left transition-colors',
                      inputs.criticality === criticality.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white mb-1">{criticality.name}</div>
                    <div className="text-xs text-gray-400">{criticality.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 1: Team & Operations */}
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-400 text-sm mb-3">Team size</label>
              <input
                type="number"
                min="1"
                max="1000"
                value={inputs.teamSize}
                onChange={(e) => setInputs(prev => ({ ...prev, teamSize: parseInt(e.target.value) || 1 }))}
                className="w-full px-4 py-3 bg-[#1c2333] border border-[#2a3147] rounded-lg text-white focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Data volume</label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'small', name: 'Small', description: '< 1GB processed monthly' },
                  { id: 'medium', name: 'Medium', description: '1-100GB processed monthly' },
                  { id: 'large', name: 'Large', description: '> 100GB processed monthly' }
                ].map(volume => (
                  <button
                    key={volume.id}
                    onClick={() => setInputs(prev => ({ ...prev, dataVolume: volume.id as any }))}
                    className={[
                      'p-4 rounded-lg border text-left transition-colors',
                      inputs.dataVolume === volume.id
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white mb-1">{volume.name}</div>
                    <div className="text-xs text-gray-400">{volume.description}</div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Requirements */}
        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-gray-400 text-sm mb-3">Number of regions</label>
              <div className="grid grid-cols-4 gap-3">
                {[1, 2, 3, 5].map(regions => (
                  <button
                    key={regions}
                    onClick={() => setInputs(prev => ({ ...prev, regions }))}
                    className={[
                      'p-3 rounded-lg border text-center transition-colors',
                      inputs.regions === regions
                        ? 'border-blue-500 bg-blue-500/10'
                        : 'border-[#2a3147] hover:border-gray-500'
                    ].join(' ')}
                  >
                    <div className="font-medium text-white">{regions}</div>
                    <div className="text-xs text-gray-400">
                      {regions === 1 ? 'Single' : regions === 2 ? 'Dual' : 'Multi'} Region
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm mb-3">Compliance requirements</label>
              <button
                onClick={() => setInputs(prev => ({ ...prev, compliance: !prev.compliance }))}
                className={[
                  'w-full p-4 rounded-lg border text-left transition-colors flex items-center justify-between',
                  inputs.compliance
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-[#2a3147] hover:border-gray-500'
                ].join(' ')}
              >
                <div>
                  <div className="font-medium text-white mb-1">Compliance & Audit Ready</div>
                  <div className="text-xs text-gray-400">SOC2, GDPR, HIPAA compliance frameworks</div>
                </div>
                <div className={[
                  'w-12 h-6 rounded-full transition-colors',
                  inputs.compliance ? 'bg-blue-500' : 'bg-gray-600'
                ]}>
                  <div className={[
                    'w-5 h-5 bg-white rounded-full transition-transform mt-0.5',
                    inputs.compliance ? 'translate-x-6' : 'translate-x-0.5'
                  ]} />
                </div>
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Results */}
        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            {isSimulating ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
                <h3 className="text-xl font-bold text-white mb-2">Simulating your workload...</h3>
                <p className="text-gray-400">Analyzing patterns and calculating optimal configuration</p>
              </div>
            ) : results && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-white mb-4">Your Simulation Results</h3>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-full">
                    <Target className="w-5 h-5 text-green-400" />
                    <span className="text-green-300 font-medium">{results.performanceTier} Performance</span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#1c2333] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-blue-400 mb-2">
                      {formatNumber(results.monthlyExecutions)}
                    </div>
                    <div className="text-sm text-gray-400">Monthly Executions</div>
                  </div>
                  
                  <div className="bg-[#1c2333] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      {formatCurrency(results.estimatedValue)}
                    </div>
                    <div className="text-sm text-gray-400">Estimated Value</div>
                  </div>
                  
                  <div className="bg-[#1c2333] rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-purple-400 mb-2">
                      {Math.round(results.timeSaved)}h
                    </div>
                    <div className="text-sm text-gray-400">Time Saved</div>
                  </div>
                </div>

                {/* Cost Estimate */}
                <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
                  <h4 className="font-semibold text-white mb-4">Estimated Monthly Investment</h4>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold text-white">
                        {formatCurrency(results.costRange.min)} - {formatCurrency(results.costRange.max)}
                      </div>
                      <div className="text-sm text-gray-400 mt-1">{results.costRange.explanation}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-400">
                        {Math.round((results.estimatedValue / results.costRange.max) * 100)}x ROI
                      </div>
                      <div className="text-xs text-gray-500">Potential return</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Infrastructure:</span>
                      <span className="text-white ml-2">{results.infrastructure}</span>
                    </div>
                    <div>
                      <span className="text-gray-400">Performance Tier:</span>
                      <span className="text-white ml-2 capitalize">{results.performanceTier}</span>
                    </div>
                  </div>
                </div>

                {/* Bottlenecks & Optimizations */}
                {results.bottlenecks.length > 0 && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-red-400 mb-3">Potential Bottlenecks</h4>
                    <ul className="space-y-2">
                      {results.bottlenecks.map((bottleneck, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-red-400 mt-1">⚠</span>
                          {bottleneck}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {results.optimizations.length > 0 && (
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-400 mb-3">Recommended Optimizations</h4>
                    <ul className="space-y-2">
                      {results.optimizations.map((optimization, index) => (
                        <li key={index} className="text-gray-300 text-sm flex items-start gap-2">
                          <span className="text-green-400 mt-1">✓</span>
                          {optimization}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex justify-center">
                  <button className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors flex items-center gap-2">
                    <Play className="w-5 h-5" />
                    Start Your Free Trial
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
