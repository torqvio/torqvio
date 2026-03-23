'use client'

import { motion } from 'framer-motion'

export default function AnimatedBackground() {
  return (
    <>
      <Orbs />
      <Particles />
    </>
  )
}

function Orbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Primary orb - Purple accent to match dashboard */}
      <motion.div
        className="absolute rounded-full blur-[140px] opacity-25"
        style={{ background: 'linear-gradient(135deg, #6C5CE7, #5041c4)', width: 700, height: 700, top: '-20%', left: '-15%' }}
        animate={{ x: [0, 50, 0], y: [0, 40, 0], scale: [1, 1.05, 1] }}
        transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
      />
      {/* Secondary orb - Dark purple accent */}
      <motion.div
        className="absolute rounded-full blur-[110px] opacity-18"
        style={{ background: '#252B3D', width: 550, height: 550, bottom: '-15%', right: '-10%' }}
        animate={{ x: [0, -35, 0], y: [0, -45, 0], scale: [1, 1.08, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      {/* Tertiary orb - Subtle purple accent */}
      <motion.div
        className="absolute rounded-full blur-[90px] opacity-12"
        style={{ background: '#2A3142', width: 350, height: 350, top: '35%', right: '25%' }}
        animate={{ x: [0, 25, -25, 0], y: [0, -30, 25, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: 'easeInOut', delay: 5 }}
      />

      {/* Subtle grid overlay - Supabase style */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(108, 92, 231, 0.3) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(108, 92, 231, 0.3) 1px, transparent 1px)`,
          backgroundSize: '80px 80px',
        }}
      />
    </div>
  )
}

function Particles() {
  // Use deterministic seed for particles to avoid hydration mismatch
  const particles = Array.from({ length: 12 }, (_, i) => {
    // Use a simple hash of the index to create deterministic values
    const hash = (i * 9301 + 49297) % 233280
    const random = hash / 233280
    
    return {
      id: i,
      x: (random * 70 + 15) % 100, // Keep particles in visible area
      y: ((random * 50 + 25) * (i + 1)) % 100,
      size: (random * 2 + 1) % 4 + 1,
      duration: random * 6 + 8,
      delay: random * 4,
    }
  })

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-purple-400"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size, opacity: 0.3 }}
          animate={{ y: [-20, 20, -20], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}
    </div>
  )
}
