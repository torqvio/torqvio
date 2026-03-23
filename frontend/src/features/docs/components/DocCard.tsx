'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { DocItem } from '../types'
import { HighlightText } from './HighlightText'

interface DocCardProps {
  doc: DocItem
  index: number
  searchQuery?: string
}

export function DocCard({ doc, index, searchQuery }: DocCardProps) {
  const [copied, setCopied] = useState(false)
  const router = useRouter()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.origin + '/docs' + doc.url)
      setCopied(true)
      timerRef.current = setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  const handleClick = () => {
    // Navigate to the docs page with the specific path
    router.push('/docs' + doc.url)
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
      intermediate: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      advanced: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
    }
    return colors[difficulty as keyof typeof colors] || 'bg-gray-500/20 text-gray-300 border-gray-500/40'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ 
        y: -8, 
        scale: 1.02,
        transition: { duration: 0.2, ease: "easeOut" }
      }}
      className="group relative rounded-3xl p-8 cursor-pointer h-full overflow-hidden"
      style={{
        background: `linear-gradient(135deg, rgba(88, 28, 135, 0.1) 0%, rgba(20, 25, 38, 0.8) 100%)`,
        borderTopColor: 'rgba(139, 92, 246, 0.2)',
        borderRightColor: 'rgba(139, 92, 246, 0.2)',
        borderBottomColor: 'rgba(139, 92, 246, 0.2)',
        borderLeftColor: 'rgba(139, 92, 246, 0.2)',
        borderWidth: '1px',
        borderStyle: 'solid',
        backdropFilter: 'blur(16px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
      }}
      onClick={handleClick}
    >
      {/* Gradient overlay effect */}
      <div 
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.15) 0%, rgba(217, 70, 239, 0.1) 100%)',
        }}
      />
      
      {/* Top decorative accent */}
      <div 
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: 'linear-gradient(90deg, #8b5cf6 0%, #d946ef 50%, #ec4899 100%)',
        }}
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <div 
                className="w-2 h-2 rounded-full"
                style={{
                  background: 'linear-gradient(135deg, #8b5cf6 0%, #d946ef 100%)',
                }}
              />
              <h3 className="text-xl font-bold text-white group-hover:text-purple-300 transition-all duration-300">
                <HighlightText text={doc.title} query={searchQuery || ''} />
              </h3>
            </div>
            <p className="text-gray-300 text-base leading-relaxed mb-4 font-medium">
              <HighlightText text={doc.description} query={searchQuery || ''} className="text-gray-300" />
            </p>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              handleCopy()
            }}
            className="p-3 rounded-xl text-gray-400 hover:text-white hover:bg-purple-500/20 transition-all duration-300"
            style={{
              borderTopColor: 'rgba(139, 92, 246, 0.2)',
              borderRightColor: 'rgba(139, 92, 246, 0.2)',
              borderBottomColor: 'rgba(139, 92, 246, 0.2)',
              borderLeftColor: 'rgba(139, 92, 246, 0.2)',
              borderWidth: '1px',
              borderStyle: 'solid',
            }}
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex items-center gap-4 mb-4">
          <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${getDifficultyColor(doc.difficulty)}`}>
            {doc.difficulty}
          </span>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <div className="w-4 h-4 rounded-full bg-purple-500/20 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-purple-400" />
            </div>
            {doc.estimatedTime}
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {doc.tags.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1.5 bg-purple-500/10 text-purple-300 text-sm rounded-lg font-medium"
              style={{
                borderTopColor: 'rgba(139, 92, 246, 0.2)',
                borderRightColor: 'rgba(139, 92, 246, 0.2)',
                borderBottomColor: 'rgba(139, 92, 246, 0.2)',
                borderLeftColor: 'rgba(139, 92, 246, 0.2)',
                borderWidth: '1px',
                borderStyle: 'solid',
              }}
            >
              <HighlightText text={tag} query={searchQuery || ''} className="text-purple-300" />
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
