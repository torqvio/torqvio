'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Github, ArrowLeft } from 'lucide-react'
import { useState, useEffect } from 'react'

interface PublicNavbarProps {
  currentPage: 'home' | 'features' | 'docs' | 'pricing'
  onLogin?: () => void
  onSignup?: () => void
}

export default function PublicNavbar({ currentPage, onLogin, onSignup }: PublicNavbarProps) {
  const router = useRouter()
  const [githubStars, setGithubStars] = useState<number | null>(null)

  // Fetch real-time GitHub stats from backend cache
  useEffect(() => {
    const fetchGithubStats = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/github-stats`)
        if (response.ok) {
          const data = await response.json()
          setGithubStars(data.stars)
        }
      } catch (error) {
        console.error('Failed to fetch GitHub stats:', error)
        // Fallback to 0 if API fails
        setGithubStars(0)
      }
    }

    fetchGithubStats()
    // Refresh stats every 5 minutes (backend will handle caching)
    const interval = setInterval(fetchGithubStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleLogin = onLogin ?? (() => router.push('/login'))
  const handleSignup = onSignup ?? (() => router.push('/login?tab=register'))

  const navLink = (label: string, page: typeof currentPage, path: string) => {
    if (currentPage === page) {
      return <span className="text-white font-medium">{label}</span>
    }
    return (
      <button onClick={() => router.push(path)} className="hover:text-white transition-colors">
        {label}
      </button>
    )
  }

  return (
    <motion.nav
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4"
      style={{
        background: 'rgba(11, 15, 20, 0.7)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(42, 49, 66, 0.5)',
      }}
    >
      <div className="max-w-6xl mx-auto flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
        {currentPage === 'home' ? (
          <>
            <img src="/favicon-purple.svg" alt="Torqvio" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-white text-lg tracking-tight">Torqvio</span>
          </>
        ) : (
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-4 h-4 text-gray-400" />
            <img src="/favicon-purple.svg" alt="Torqvio" className="w-8 h-8 rounded-lg" />
            <span className="font-bold text-white text-lg tracking-tight">Torqvio</span>
          </button>
        )}
      </div>

      <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
        {navLink('Features', 'features', '/features')}
        {navLink('Docs', 'docs', '/docs')}
        {navLink('Pricing', 'pricing', '/pricing')}
      </div>

      <div className="flex items-center gap-3">
        <motion.a
          href="https://github.com/torqvio/torqvio"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative justify-center cursor-pointer items-center space-x-2 text-center font-regular ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border hover:bg-surface-300 shadow-none focus-visible:outline-border-strong data-[state=open]:bg-surface-300 data-[state=open]:outline-border-strong border-transparent text-xs px-2.5 py-1 h-[26px] hidden group lg:flex text-foreground-light hover:text-foreground"
        >
          <span className="truncate">
            <span className="flex items-center gap-1">
              <Github className="w-4 h-4" />
              {githubStars === null ? (
                <span className="animate-pulse">...</span>
              ) : (
                githubStars
              )}
            </span>
          </span>
        </motion.a>
        <button
          onClick={handleLogin}
          className="text-sm text-gray-300 hover:text-white transition-colors px-3 py-1.5"
        >
          Sign in
        </button>
        <motion.button
          onClick={handleSignup}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="text-sm font-semibold text-white px-4 py-2 rounded-lg"
          style={{ background: 'linear-gradient(135deg, #6C5CE7, #5041c4)' }}
        >
          Get started
        </motion.button>
      </div>
      </div>
    </motion.nav>
  )
}
