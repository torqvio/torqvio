'use client'

import { motion } from 'framer-motion'
import { Shield, Target, Award, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'

interface PerformanceGuarantee {
  id: string;
  category: 'throughput' | 'latency' | 'reliability' | 'cost' | 'scaling';
  title: string;
  description: string;
  guarantee: {
    metric: string;
    target: string;
    current: string;
    unit: string;
  };
  pricing: {
    base: number;
    guarantee: number;
    premium: number;
    total: number;
  };
  status: 'active' | 'pending' | 'achieved' | 'breached';
  sla: {
    uptime: number;
    responseTime: string;
    compensation: string;
  };
}

interface PerformanceContractsProps {
  contracts: PerformanceGuarantee[];
  onContractAction?: (contractId: string, action: 'activate' | 'modify' | 'cancel') => void;
}

export default function PerformanceContracts({ contracts, onContractAction }: PerformanceContractsProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 border-green-400/30 bg-green-400/10'
      case 'achieved': return 'text-blue-400 border-blue-400/30 bg-blue-400/10'
      case 'breached': return 'text-red-400 border-red-400/30 bg-red-400/10'
      default: return 'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'throughput': return TrendingUp
      case 'latency': return Target
      case 'reliability': return Shield
      case 'cost': return Award
      default: return CheckCircle
    }
  }

  const calculateROI = (contract: PerformanceGuarantee) => {
    const value = parseFloat(contract.guarantee.target) - parseFloat(contract.guarantee.current)
    const cost = contract.pricing.total
    return value > 0 ? (value / cost).toFixed(1) : '0'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 rounded-full px-4 py-2 text-xs text-purple-300 font-medium mb-6">
          <Shield className="w-3 h-3" />
          ENTERPRISE GRADE
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          <span
            className="bg-clip-text text-transparent"
            style={{ backgroundImage: 'linear-gradient(135deg, #6C5CE7, #a78bfa)' }}
          >
            Performance Contracts
          </span>
        </h2>
        <p className="text-lg text-gray-400 max-w-3xl mx-auto leading-relaxed">
          Don't just pay for software—pay for guaranteed outcomes. We back our promises with 
          financial commitments and SLA-based compensation.
        </p>
      </motion.div>

      {/* Contracts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {contracts.map((contract, index) => {
          const CategoryIcon = getCategoryIcon(contract.category)
          const statusClass = getStatusColor(contract.status)
          const roi = calculateROI(contract)

          return (
            <motion.div
              key={contract.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="relative rounded-2xl p-6 border"
              style={{
                background: contract.status === 'active' 
                  ? 'linear-gradient(135deg, rgba(0,200,150,0.08), rgba(108,92,231,0.04))'
                  : 'rgba(20, 25, 38, 0.6)',
                border: contract.status === 'active' 
                  ? '1px solid rgba(0,200,150,0.25)'
                  : '1px solid rgba(42, 49, 66, 0.7)',
                backdropFilter: 'blur(8px)',
              }}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                <span className={`text-xs font-medium px-2 py-1 rounded-full border ${statusClass}`}>
                  {contract.status.toUpperCase()}
                </span>
              </div>

              {/* Contract Header */}
              <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                  <CategoryIcon className="w-6 h-6 text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-semibold text-lg mb-2">{contract.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{contract.description}</p>
                </div>
              </div>

              {/* Performance Guarantee */}
              <div className="mb-6 p-4 rounded-xl bg-[#1A1F2E]/60 border border-[#2A3142]">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Performance Guarantee</span>
                  <Target className="w-4 h-4 text-purple-400" />
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Current</p>
                    <p className="text-white font-mono font-semibold">{contract.guarantee.current}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Target</p>
                    <p className="text-green-400 font-mono font-semibold">{contract.guarantee.target}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 text-xs mb-1">Unit</p>
                    <p className="text-gray-400 font-mono text-sm">{contract.guarantee.unit}</p>
                  </div>
                </div>
              </div>

              {/* Pricing Structure */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs text-gray-600 font-medium uppercase tracking-wider">Investment Structure</span>
                  <Award className="w-4 h-4 text-yellow-400" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#1A1F2E]/40">
                    <span className="text-gray-400 text-sm">Base Service</span>
                    <span className="text-white font-mono font-semibold">${contract.pricing.base}/mo</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                    <span className="text-purple-400 text-sm font-medium">Guarantee Premium</span>
                    <span className="text-purple-400 font-mono font-semibold">${contract.pricing.guarantee}/mo</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <span className="text-green-400 text-sm font-medium">Expected ROI</span>
                    <span className="text-green-400 font-mono font-semibold">{roi}x</span>
                  </div>
                </div>
              </div>

              {/* SLA Terms */}
              <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-blue-400" />
                  <span className="text-sm font-semibold text-white">SLA Protection</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600 mb-1">Uptime</p>
                    <p className="text-white font-semibold">{contract.sla.uptime}%</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Response</p>
                    <p className="text-white font-semibold">{contract.sla.responseTime}</p>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Compensation</p>
                    <p className="text-white font-semibold">{contract.sla.compensation}</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {contract.status === 'pending' && (
                  <>
                    <button
                      onClick={() => onContractAction?.(contract.id, 'activate')}
                      whileHover={{ scale: 1.02, boxShadow: '0 4px 20px rgba(0,200,150,0.3)' }}
                      whileTap={{ scale: 0.98 }}
                      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all"
                      style={{
                        background: 'linear-gradient(135deg, #00C896, #00b386)',
                        color: 'white',
                      }}
                    >
                      Activate Guarantee
                    </button>
                    <button
                      onClick={() => onContractAction?.(contract.id, 'modify')}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="px-4 py-2.5 rounded-xl text-sm font-semibold border border-[#2A3142] bg-[#1A1F2E]/60 text-gray-400 transition-all"
                    >
                      Customize
                    </button>
                  </>
                )}
                
                {contract.status === 'active' && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <CheckCircle className="w-4 h-4 text-green-400" />
                    <p className="text-green-400 text-xs font-medium">
                      Contract active and monitoring performance
                    </p>
                  </div>
                )}

                {contract.status === 'breached' && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                    <AlertCircle className="w-4 h-4 text-red-400" />
                    <p className="text-red-400 text-xs font-medium">
                      SLA breach detected - compensation applied
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Enterprise CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="text-center p-8 rounded-2xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20"
      >
        <Shield className="w-12 h-12 text-purple-400 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-white mb-3">Ready for Outcome-Based Pricing?</h3>
        <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
          Move from usage-based to outcome-based pricing. Pay for results, not resources.
        </p>
        <button
          whileHover={{ scale: 1.02, boxShadow: '0 8px 32px rgba(108,92,231,0.3)' }}
          whileTap={{ scale: 0.98 }}
          className="px-8 py-3 rounded-xl font-semibold transition-all"
          style={{
            background: 'linear-gradient(135deg, #6C5CE7, #5041c4)',
            color: 'white',
          }}
        >
          Discuss Performance Contracts
        </button>
      </motion.div>
    </div>
  )
}
