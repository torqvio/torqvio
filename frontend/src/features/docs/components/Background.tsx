'use client'

import { motion } from 'framer-motion'

export function Background() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute rounded-full blur-[160px] opacity-15"
        style={{ background: '#6C5CE7', width: 800, height: 800, top: '-20%', left: '-15%' }}
        animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute rounded-full blur-[120px] opacity-10"
        style={{ background: '#00C896', width: 600, height: 600, bottom: '-10%', right: '-10%' }}
        animate={{ x: [0, -40, 0], y: [0, -50, 0] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
      />
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(#6C5CE7 1px, transparent 1px),
                            linear-gradient(90deg, #6C5CE7 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />
    </div>
  )
}
