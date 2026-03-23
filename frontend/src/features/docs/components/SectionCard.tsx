'use client'

import { motion } from 'framer-motion'
import { DocSection } from '../types'
import { DocCard } from './DocCard'
import { Book, Code2, Terminal, Users, Shield, Database, Server, Clock } from 'lucide-react'

interface SectionCardProps {
  section: DocSection
  index: number
  searchQuery?: string
}

const iconMap = {
  Book,
  Code2,
  Terminal,
  Users,
  Shield,
  Database,
  Server,
  Clock
}

export function SectionCard({ section, index, searchQuery }: SectionCardProps) {
  const IconComponent = iconMap[section.icon as keyof typeof iconMap]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="mb-16"
    >
      <div className="flex items-center gap-4 mb-8">
        <div 
          className="p-3 rounded-xl"
          style={{ backgroundColor: `${section.color}20` }}
        >
          <IconComponent className="w-6 h-6" style={{ color: section.color }} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">{section.title}</h2>
          <p className="text-gray-400">{section.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {section.docs.map((doc, docIndex) => (
          <DocCard key={doc.title} doc={doc} index={docIndex} searchQuery={searchQuery} />
        ))}
      </div>
    </motion.div>
  )
}
