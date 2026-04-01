'use client'

import { useState, useEffect, Suspense } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/providers/AuthProvider'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuthState } from '@/hooks/useAuthState'
import LoginForm from '@/components/auth/LoginForm'
import RegisterForm from '@/components/auth/RegisterForm'
import OAuthButtons from '@/components/auth/OAuthButtons'
import { Rocket, Shield, Activity, Webhook, CheckCircle2, ArrowRight, Zap, BarChart3, Lock } from 'lucide-react'

// Component that uses useSearchParams
function LoginContent() {
  const { login, register, loginWithGithub, loginWithGoogle, isAuthenticated } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'login' | 'register'>(
    searchParams.get('tab') === 'register' ? 'register' : 'login'
  )
  const { success, setSuccess, setError: setServerError, serverError } = useAuthState()

  useEffect(() => {
    if (isAuthenticated) router.replace('/dashboard')
  }, [isAuthenticated, router])


  const handleLogin = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password)
      setSuccess(true)
    } catch (e: Error | unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
      setServerError(errorMessage || 'Please check your credentials and try again.')
    }
  }

  const handleRegister = async (data: { name: string; email: string; password: string; confirm: string }) => {
    try {
      await register(data.email, data.password, data.name)
      setSuccess(true)
    } catch (e: Error | unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
      setServerError(errorMessage || 'Unable to create account. Please try again.')
    }
  }

  const handleSocialLogin = async (provider: 'github' | 'google') => {
    try {
      if (provider === 'github') {
        await loginWithGithub()
      } else {
        await loginWithGoogle()
      }
    } catch (e: Error | unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred'
      setServerError(errorMessage || `Unable to sign in with ${provider}. Please try again.`)
    }
  }

  const switchMode = (next: 'login' | 'register') => {
    setMode(next)
    setServerError('')
  }

  return (
    <div className="min-h-screen flex relative overflow-hidden">

      {/* Left Column - Login Form */}
      <div className="relative z-10 w-full lg:w-1/2 flex items-center justify-center p-2 lg:p-4 overflow-y-auto">
        <div className="w-full max-w-md">
          {/* Logo / Brand */}
          <motion.div
            initial={{ opacity: 0, y: -24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="text-center mb-4"
          >
            <div className="inline-flex items-center justify-center mb-4">
              <motion.div
                className="relative"
                animate={{ rotate: [0, 5, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              >
                <img src="/favicon-purple.svg" alt="Torqvio" className="w-14 h-14 rounded-2xl shadow-lg shadow-purple-900/40" />
                <motion.div
                  className="absolute inset-0 rounded-2xl bg-[#6C5CE7]"
                  animate={{ opacity: [0.4, 0.8, 0.4], scale: [1, 1.15, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ filter: 'blur(10px)', zIndex: -1 }}
                />
              </motion.div>
            </div>

            <h1 className="text-2xl font-bold text-white tracking-tight">Torqvio</h1>
            <p className="text-sm text-gray-500 mt-1">Durable execution, reliably delivered</p>
          </motion.div>

        {/* Card - Supabase-inspired glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="relative rounded-2xl overflow-hidden"
          style={{
            background: 'rgba(13, 17, 23, 0.75)',
            backdropFilter: 'blur(24px) saturate(180%)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            boxShadow: '0 32px 64px rgba(0,0,0,0.4), 0 0 0 1px rgba(0, 217, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
          }}
        >
          {/* Top accent line - Dashboard style */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-400/30 to-transparent" />

          <div className="p-4">
            {/* Tab switcher - Supabase style */}
            <div className="flex bg-[#252B3D]/40 rounded-xl p-1 mb-4 relative backdrop-blur-sm">
              <motion.div
                className="absolute top-1 bottom-1 rounded-lg bg-white/8 backdrop-blur-md"
                layout
                style={{
                  width: 'calc(50% - 4px)',
                  left: mode === 'login' ? 4 : 'calc(50%)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                }}
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
              {(['login', 'register'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => switchMode(m)}
                  className={`relative z-10 flex-1 text-sm font-medium py-2.5 rounded-lg transition-all duration-200 ${
                    mode === m ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            {/* Form */}
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <div key="login" className="space-y-2">
                  <LoginForm 
                    onSubmit={handleLogin}
                    loading={false}
                    success={success}
                    serverError={serverError || ''}
                  />
                  <OAuthButtons onSocialLogin={handleSocialLogin} />
                </div>
              ) : (
                <div key="register" className="space-y-2">
                  <RegisterForm 
                    onSubmit={handleRegister}
                    loading={false}
                    success={success}
                    serverError={serverError || ''}
                  />
                  <OAuthButtons onSocialLogin={handleSocialLogin} />
                </div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-gray-600 mt-8"
        >
          Torqvio © 2026 · Durable Execution Platform
        </motion.p>
        </div>
      </div>

      {/* Right Column - Enhanced Visual Content */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 items-center justify-center p-16">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <motion.div
            className="absolute rounded-full blur-[120px] opacity-20"
            style={{ background: '#6C5CE7', width: 400, height: 400, top: '20%', right: '10%' }}
            animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full blur-[100px] opacity-15"
            style={{ background: '#00C896', width: 300, height: 300, bottom: '20%', left: '15%' }}
            animate={{ x: [0, -25, 0], y: [0, 25, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          />
        </div>

        <motion.div
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="max-w-xl text-center relative z-10"
        >
          {/* Hero badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 backdrop-blur-sm mb-8"
          >
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-sm text-purple-300">Production-grade reliability</span>
          </motion.div>

          {/* Main headline */}
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="text-6xl font-bold mb-6 leading-tight"
          >
            <span className="text-white">Never lose a</span>{' '}
            <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              workflow
            </span>{' '}
            <span className="text-white">again</span>
          </motion.h2>
          
          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl text-gray-300 mb-16 leading-relaxed"
          >
            Build resilient async systems that survive failures, restarts, and chaos. 
            Your business logic deserves bulletproof execution.
          </motion.p>

          {/* Key features - simplified */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="space-y-8 mb-16"
          >
            <div className="flex items-center justify-center gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.9 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-gray-300 font-medium">Durable execution</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.0 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 rounded-full bg-emerald-400" />
                <span className="text-gray-300 font-medium">Automatic retries</span>
              </motion.div>
            </div>
            <div className="flex items-center justify-center gap-12">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-gray-300 font-medium">Real-time monitoring</span>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1.2 }}
                className="flex items-center gap-3"
              >
                <div className="w-3 h-3 rounded-full bg-orange-400" />
                <span className="text-gray-300 font-medium">Webhook guarantee</span>
              </motion.div>
            </div>
          </motion.div>

          {/* CTA button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.4 }}
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => switchMode('register')}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-semibold text-lg shadow-2xl shadow-purple-500/25 hover:shadow-purple-500/40 transition-all"
            >
              Start building now
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">
      <div className="text-white">Loading...</div>
    </div>}>
      <LoginContent />
    </Suspense>
  )
}
