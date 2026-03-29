'use client'

import { motion } from 'framer-motion'
import { Check } from 'lucide-react'

interface AddOn {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
}

interface CurrentPlan {
  plan: {
    id: string;
    name: string;
    price: number;
    features: string[];
  };
  addOns: Array<{
    addOnId: string;
    active: boolean;
    subscribedAt?: Date;
  }>;
}

interface PricingFeaturesProps {
  addOns: AddOn[]
  currentPlan: CurrentPlan | null
}

export default function PricingFeatures({ addOns, currentPlan }: PricingFeaturesProps) {
  if (!addOns.length) return null

  function AddOnCard({ addOn, index }: { addOn: AddOn; index: number }) {
    const isSubscribed = currentPlan?.addOns.some(a => a.addOnId === addOn.id && a.active)

    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4, delay: index * 0.06 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        className="group relative rounded-2xl p-6 cursor-default"
        style={{
          background: 'rgba(20, 25, 38, 0.6)',
          border: '1px solid rgba(42, 49, 66, 0.7)',
          backdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ background: 'radial-gradient(circle at 30% 30%, #6C5CE708, transparent 70%)' }}
        />
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-start justify-between mb-4">
            <h4 className="text-sm font-semibold text-white">{addOn.name}</h4>
            {isSubscribed && (
              <span className="text-[10px] text-purple-400 border border-purple-400/30 rounded-full px-3 py-1">
                Active
              </span>
            )}
          </div>
          <p className="text-2xl font-mono font-bold text-white mb-2">
            ${addOn.price}
            <span className="text-sm font-sans font-normal text-gray-500">/month</span>
          </p>
          <p className="text-[13px] text-gray-400 mb-6 leading-relaxed flex-1">{addOn.description}</p>

          <div className="space-y-3 mb-6">
            {addOn.features?.map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <Check className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="text-[12px] text-gray-400">{feature}</span>
              </div>
            ))}
          </div>

          <button
            disabled={isSubscribed}
            whileHover={{ scale: isSubscribed ? 1 : 1.02, boxShadow: isSubscribed ? 'none' : '0 4px 20px rgba(108,92,231,0.3)' }}
            whileTap={{ scale: isSubscribed ? 1 : 0.97 }}
            className="w-full py-3 rounded-xl text-sm font-semibold transition-all"
            style={{
              background: isSubscribed
                ? '#1A1F2E'
                : 'linear-gradient(135deg, #6C5CE7, #5041c4)',
              color: 'white',
              cursor: isSubscribed ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubscribed ? 'Subscribed' : 'Add to Plan'}
          </button>
        </div>
      </motion.div>
    )
  }

  return (
    <div className="mb-20">
      <div className="border-t border-[#1A1F2E] pt-20 mb-12">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">Enhancements</p>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Extend your capabilities
          </h2>
          <p className="text-[13px] text-gray-500 max-w-2xl mx-auto">Add powerful features to your plan as your needs grow.</p>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {addOns.map((addOn, index) => (
          <AddOnCard key={addOn.id} addOn={addOn} index={index} />
        ))}
      </div>
    </div>
  )
}
