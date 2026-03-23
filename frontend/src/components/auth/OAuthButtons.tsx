'use client'

import { motion } from 'framer-motion'
import { Github, Chrome } from 'lucide-react'

interface OAuthButtonsProps {
  onSocialLogin: (provider: 'github' | 'google') => void
}

export default function OAuthButtons({ onSocialLogin }: OAuthButtonsProps) {
  return (
    <>
      {/* Social auth divider */}
      <div className="relative my-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-800" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-[#0B0F14]/60 px-2 text-gray-500 backdrop-blur-sm">Or continue with</span>
        </div>
      </div>

      {/* Social buttons */}
      <div className="flex gap-3">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSocialLogin('github')}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-700/50 text-sm text-gray-300 transition-all duration-200"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <Github size={16} />
          GitHub
        </motion.button>
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, backgroundColor: 'rgba(255,255,255,0.08)' }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onSocialLogin('google')}
          className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border border-gray-700/50 text-sm text-gray-300 transition-all duration-200"
          style={{ backdropFilter: 'blur(8px)' }}
        >
          <Chrome size={16} />
          Google
        </motion.button>
      </div>
    </>
  )
}
