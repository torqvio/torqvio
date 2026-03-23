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
        className="flex flex-col rounded-xl p-6 border border-[#1c2333] bg-[#0d1117] hover:border-[#2a3147] transition-colors"
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="text-sm font-medium text-white">{addOn.name}</h4>
          {isSubscribed && (
            <span className="text-[10px] text-green-500 border border-green-500/30 rounded-full px-2 py-0.5">
              Active
            </span>
          )}
        </div>
        <p className="text-2xl font-mono font-bold text-white mb-1">
          ${addOn.price}
          <span className="text-sm font-sans font-normal text-gray-500">/month</span>
        </p>
        <p className="text-[13px] text-gray-400 mb-5 leading-relaxed">{addOn.description}</p>

        <div className="space-y-2 mb-5 flex-1">
          {addOn.features.map((feature, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <Check className="w-3.5 h-3.5 text-green-500 flex-shrink-0" />
              <span className="text-[12px] text-gray-400">{feature}</span>
            </div>
          ))}
        </div>

        <button
          disabled={isSubscribed}
          className={`w-full py-2 rounded-md text-sm font-medium transition-colors ${
            isSubscribed
              ? 'bg-[#1c2333] text-gray-500 cursor-not-allowed'
              : 'border border-[#2a3147] text-gray-300 hover:border-gray-500 hover:text-white'
          }`}
        >
          {isSubscribed ? 'Subscribed' : 'Add to Plan'}
        </button>
      </motion.div>
    )
  }

  return (
    <div className="mb-16">
      <div className="border-t border-[#1c2333] pt-16 mb-10">
        <h2 className="text-2xl font-bold text-white mb-2">Add-ons</h2>
        <p className="text-[13px] text-gray-500">Extend your plan with additional capabilities.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {addOns.map((addOn, index) => (
          <AddOnCard key={addOn.id} addOn={addOn} index={index} />
        ))}
      </div>
    </div>
  )
}
