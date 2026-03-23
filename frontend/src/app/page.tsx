'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/providers/AuthProvider'
import { useEffect } from 'react'
import {
  ArrowRight, Shield, RefreshCw, Webhook,
  Activity, ChevronRight, CheckCircle2, Zap, Github
} from 'lucide-react'
import PublicNavbar from '@/components/layout/PublicNavbar'

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ onSignup }: { onSignup: () => void }) {
  return (
    <section className="relative pt-40 pb-24 px-6 text-center max-w-5xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="inline-flex items-center gap-2 bg-[#1A1F2E] border border-[#2A3142] rounded-full px-4 py-1.5 text-xs text-purple-300 font-medium mb-8"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-[#00C896] animate-pulse" />
        Now in public beta — ship reliable workflows today
        <ChevronRight size={12} className="text-gray-500" />
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight mb-6"
      >
        Never lose a{' '}
        <span
          className="bg-clip-text text-transparent"
          style={{ backgroundImage: 'linear-gradient(135deg, #6C5CE7, #a78bfa)' }}
        >
          workflow
        </span>
        {' '}again
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="text-lg text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed"
      >
        Torqvio gives you durable execution, automatic retries, and deep observability
        for every async task — so your business logic survives failures, restarts, and chaos.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35 }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4"
      >
        <motion.button
          onClick={onSignup}
          whileHover={{ scale: 1.03, boxShadow: '0 8px 32px rgba(108,92,231,0.45)' }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 text-white font-semibold px-7 py-3.5 rounded-xl text-sm"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #5041c4)', boxShadow: '0 4px 20px rgba(108,92,231,0.3)' }}
        >
          Start for free
          <ArrowRight size={16} />
        </motion.button>

        <button className="flex items-center gap-2 text-gray-300 hover:text-white text-sm px-5 py-3 rounded-xl border border-[#2A3142] hover:border-[#3A4152] transition-colors bg-[#141926]/60">
          <Github size={16} />
          View on GitHub
        </button>
      </motion.div>

      {/* Trust badges */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex flex-wrap items-center justify-center gap-6 mt-12 text-xs text-gray-600"
      >
        {['No credit card required', 'SOC 2 compliant', '99.9% uptime SLA', 'Open source core'].map(t => (
          <span key={t} className="flex items-center gap-1.5">
            <CheckCircle2 size={12} className="text-[#00C896]" />
            {t}
          </span>
        ))}
      </motion.div>
    </section>
  )
}

// ─── Features ────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: RefreshCw,
    color: '#6C5CE7',
    title: 'Durable Retries',
    desc: 'Exponential backoff, dead-letter queues, and intelligent retry policies. Your workflows survive any failure.',
  },
  {
    icon: Activity,
    color: '#00C896',
    title: 'Real-time Observability',
    desc: 'Every step, every execution. Full audit trail, live logs, and alerting built in — zero config.',
  },
  {
    icon: Webhook,
    color: '#FF6B35',
    title: 'Webhook Orchestration',
    desc: 'Ingest, validate, and route webhooks with guaranteed delivery. Never lose an incoming event again.',
  },
  {
    icon: Shield,
    color: '#F59E0B',
    title: 'Payment Recovery',
    desc: 'Auto-recover failed Stripe charges, retry with fallback methods, and notify customers — all automatic.',
  },
]

function Features() {
  return (
    <section className="relative py-24 px-6 max-w-6xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <p className="text-sm font-semibold text-purple-400 uppercase tracking-widest mb-3">Platform</p>
        <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight">
          Everything your async stack needs
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.07 }}
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
              style={{ background: `radial-gradient(circle at 30% 30%, ${f.color}08, transparent 70%)` }}
            />
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ background: `${f.color}18`, border: `1px solid ${f.color}30` }}
            >
              <f.icon size={18} style={{ color: f.color }} />
            </div>
            <h3 className="text-white font-semibold mb-2">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

// ─── CTA ──────────────────────────────────────────────────────────────────────

function CTA({ onSignup }: { onSignup: () => void }) {
  return (
    <section className="relative py-24 px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-3xl mx-auto text-center rounded-3xl py-16 px-8 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(108,92,231,0.15), rgba(80,65,196,0.08))',
          border: '1px solid rgba(108,92,231,0.25)',
        }}
      >
        <div className="absolute inset-0 rounded-3xl overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/40 to-transparent" />
        </div>

        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
          Ready to make your workflows bulletproof?
        </h2>
        <p className="text-gray-400 mb-8 max-w-xl mx-auto">
          Join hundreds of teams shipping reliable products with Torqvio. Free tier, no credit card.
        </p>

        <motion.button
          onClick={onSignup}
          whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(108,92,231,0.5)' }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-2 text-white font-semibold px-8 py-4 rounded-xl text-sm"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #5041c4)' }}
        >
          Create free account
          <ArrowRight size={16} />
        </motion.button>
      </motion.div>
    </section>
  )
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-[#1A1F2E] py-8 px-6 text-center text-xs text-gray-600">
      Torqvio © 2026 · Durable Execution Platform · Built for reliability
    </footer>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard')
    }
  }, [isAuthenticated, isLoading, router])

  const goToLogin = () => router.push('/login')
  const goToSignup = () => router.push('/login?tab=register')

  return (
    <div className="min-h-screen text-white">
      <div className="relative z-10">
        <PublicNavbar currentPage="home" onLogin={goToLogin} onSignup={goToSignup} />
        <Hero onSignup={goToSignup} />
        <Features />
        <CTA onSignup={goToSignup} />
        <Footer />
      </div>
    </div>
  )
}
