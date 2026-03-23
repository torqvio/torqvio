'use client'

import { motion } from 'framer-motion'
import { Github, Star, Users, Zap, Shield, ChevronRight } from 'lucide-react'

interface GitHubHeaderProps {
  stars?: number;
  contributors?: number;
  version?: string;
}

export function GitHubHeader({ stars = 99300, contributors = 150, version = "v2.1.0" }: GitHubHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-3"
      style={{
        background: 'rgba(11, 15, 20, 0.8)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(42, 49, 66, 0.5)',
      }}
    >
      <div className="flex items-center gap-6">
        {/* GitHub Stars Button */}
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
              {stars >= 1000 ? `${(stars / 1000).toFixed(1)}K` : stars}
            </span>
          </span>
        </motion.a>

        {/* Contributors Button */}
        <motion.a
          href="https://github.com/torqvio/torqvio/graphs/contributors"
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative justify-center cursor-pointer items-center space-x-2 text-center font-regular ease-out duration-200 rounded-md outline-none transition-all outline-0 focus-visible:outline-4 focus-visible:outline-offset-1 border hover:bg-surface-300 shadow-none focus-visible:outline-border-strong data-[state=open]:bg-surface-300 data-[state=open]:outline-border-strong border-transparent text-xs px-2.5 py-1 h-[26px] hidden group lg:flex text-foreground-light hover:text-foreground"
        >
          <span className="truncate">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {contributors} contributors
            </span>
          </span>
        </motion.a>

        {/* Version Badge */}
        <div className="flex items-center gap-1 text-xs text-gray-400 bg-surface-100/10 px-2.5 py-1 rounded-md border border-surface-300/20">
          <Shield className="w-3 h-3" />
          {version}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Quick Actions */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors px-3 py-1.5 rounded-md hover:bg-surface-300/20"
        >
          <Zap className="w-3 h-3" />
          Quick Start
          <ChevronRight className="w-3 h-3" />
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="flex items-center gap-2 text-xs text-purple-300 hover:text-purple-200 transition-colors px-3 py-1.5 rounded-md border border-purple-500/30 hover:border-purple-500/50"
        >
          <Star className="w-3 h-3" />
          Star on GitHub
        </motion.button>
      </div>
    </motion.div>
  )
}
