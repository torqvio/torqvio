'use client'

import { motion } from 'framer-motion'
import GithubIcon from '@/components/ui/GithubIcon'

const GoogleIcon = ({ size }: { size?: number }) => (
  <svg viewBox="0 0 24 24" width={size ?? 16} height={size ?? 16}>
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

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
          <GithubIcon size={16} />
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
          <GoogleIcon size={16} />
          Google
        </motion.button>
      </div>
    </>
  )
}
