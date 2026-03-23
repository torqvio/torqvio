'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useRef } from 'react'
import { motion, AnimatePresence, type Variants } from 'framer-motion'
import {
  LayoutDashboard,
  GitBranch,
  Play,
  Clock,
  Webhook,
  Zap,
  List,
  BookOpen,
  FlaskConical,
  Bot,
  Settings,
  ChevronDown,
  Pin,
  Plus,
  BarChart3,
  AlertTriangle,
  Bell,
  Key,
  Lock,
  Users,
  Terminal,
  Package,
  Boxes,
  CreditCard,
  Activity,
  Database,
  ShoppingBag,
  Layers,
  MessageSquare,
  FileCode,
  Cpu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { LogoFull, LogoMark } from '@/components/logo'

type NavItem = {
  name: string
  href: string
  icon: React.ElementType
  badge?: boolean | string
}

type NavGroup = {
  title: string
  items: NavItem[]
  defaultOpen?: boolean
}

const navigationGroups: NavGroup[] = [
  {
    title: 'Core',
    defaultOpen: true,
    items: [
      { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Workflows', href: '/dashboard/workflows', icon: GitBranch },
      { name: 'Executions', href: '/dashboard/executions', icon: Play },
      { name: 'Scheduler', href: '/dashboard/scheduler', icon: Clock },
    ]
  },
  {
    title: 'Events',
    defaultOpen: true,
    items: [
      { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
      { name: 'Event Bus', href: '/dashboard/events', icon: Zap },
      { name: 'Queues', href: '/dashboard/queues', icon: List },
    ]
  },
  {
    title: 'Observability',
    defaultOpen: true,
    items: [
      { name: 'Logs', href: '/dashboard/logs', icon: FileCode },
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
      { name: 'Errors', href: '/dashboard/errors', icon: AlertTriangle, badge: true },
      { name: 'Alerts', href: '/dashboard/alerts', icon: Bell },
    ]
  },
  {
    title: 'Developers',
    defaultOpen: false,
    items: [
      { name: 'Playground', href: '/dashboard/playground', icon: FlaskConical },
      { name: 'API Keys', href: '/dashboard/api-keys', icon: Key },
      { name: 'SDKs', href: '/dashboard/sdks', icon: Package },
      { name: 'CLI', href: '/dashboard/cli', icon: Terminal },
      { name: 'Docs', href: '/dashboard/docs', icon: BookOpen },
    ]
  },
  {
    title: 'Agents',
    defaultOpen: false,
    items: [
      { name: 'Agent Hub', href: '/dashboard/agents', icon: Bot },
      { name: 'Skills', href: '/dashboard/skills', icon: Cpu },
      { name: 'Integrations', href: '/dashboard/integrations', icon: Boxes },
      { name: 'Marketplace', href: '/dashboard/marketplace', icon: ShoppingBag },
    ]
  },
  {
    title: 'Platform',
    defaultOpen: false,
    items: [
      { name: 'Access Control', href: '/dashboard/access', icon: Users },
      { name: 'Env Variables', href: '/dashboard/env', icon: MessageSquare },
      { name: 'Deployments', href: '/dashboard/deployments', icon: Layers },
      { name: 'Usage', href: '/dashboard/usage', icon: Activity },
      { name: 'Billing', href: '/dashboard/billing', icon: CreditCard },
      { name: 'Settings', href: '/dashboard/settings', icon: Settings },
    ]
  },
]

const textVariants: Variants = {
  hidden: { opacity: 0, width: 0 },
  visible: {
    opacity: 1,
    width: 'auto',
    transition: { duration: 0.2, ease: 'easeOut' as const }
  },
  exit: {
    opacity: 0,
    width: 0,
    transition: { duration: 0.15, ease: 'easeIn' as const }
  },
}

function SidebarItem({ item, isActive, isOpen }: { item: NavItem; isActive: boolean; isOpen: boolean }) {
  return (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150',
        isActive
          ? 'bg-primary/10 text-primary border-l-2 border-primary'
          : 'text-text-secondary hover:text-text-primary hover:bg-surface-light',
        !isOpen && 'justify-center px-2'
      )}
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.span
            key="label"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="truncate overflow-hidden whitespace-nowrap flex items-center gap-2 flex-1"
          >
            {item.name}
            {item.badge && (
              <span className="ml-auto w-2 h-2 bg-error rounded-full flex-shrink-0" />
            )}
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}

function NavigationGroup({ group, pathname, isOpen }: { group: NavGroup; pathname: string; isOpen: boolean }) {
  const [isExpanded, setIsExpanded] = useState(group.defaultOpen ?? true)

  return (
    <div className="space-y-0.5">
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.button
            key="group-header"
            variants={textVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 w-full px-3 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary transition-colors overflow-hidden whitespace-nowrap uppercase tracking-wider"
          >
            <motion.span
              animate={{ rotate: isExpanded ? 0 : -90 }}
              transition={{ duration: 0.2, ease: 'easeInOut' as const }}
              className="flex-shrink-0"
            >
              <ChevronDown className="h-3 w-3" />
            </motion.span>
            {group.title}
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="group-items"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1, transition: { duration: 0.22, ease: 'easeOut' as const } }}
            exit={{ height: 0, opacity: 0, transition: { duration: 0.18, ease: 'easeIn' as const } }}
            className="space-y-0.5 overflow-hidden"
          >
            {group.items.map((item) => (
              <SidebarItem
                key={item.name}
                item={item}
                isActive={item.href === '/dashboard' ? pathname === item.href : pathname === item.href || pathname.startsWith(item.href + '/')}
                isOpen={isOpen}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function ModernSidebar() {
  const pathname = usePathname()
  const [isPinned, setIsPinned] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const leaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const isOpen = isPinned || isHovered

  function handleMouseEnter() {
    if (leaveTimer.current) clearTimeout(leaveTimer.current)
    setIsHovered(true)
  }

  function handleMouseLeave() {
    leaveTimer.current = setTimeout(() => setIsHovered(false), 150)
  }

  return (
    <motion.div
      animate={{ width: isPinned ? 256 : 64 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      className="relative flex-shrink-0 h-full"
      style={{ zIndex: isHovered && !isPinned ? 50 : 'auto' }}
    >
    <motion.div
      animate={{ width: isOpen ? 256 : 64 }}
      transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={cn(
        'bg-surface border-r border-border flex flex-col overflow-hidden h-full',
        isHovered && !isPinned ? 'absolute inset-y-0 left-0 shadow-2xl' : 'relative'
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between gap-2 min-h-[40px]">
          <AnimatePresence mode="wait" initial={false}>
            {isOpen ? (
              <motion.div
                key="expanded-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.18, delay: 0.08 } }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                className="min-w-0"
              >
                <LogoFull iconSize={24} />
              </motion.div>
            ) : (
              <motion.div
                key="collapsed-header"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, transition: { duration: 0.18, delay: 0.08 } }}
                exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.1 } }}
                className="flex-shrink-0"
              >
                <LogoMark size={28} className="text-primary" />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.button
                key="pin-btn"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                onClick={() => setIsPinned(!isPinned)}
                className={cn(
                  'p-1.5 rounded transition-colors flex-shrink-0 overflow-hidden',
                  isPinned
                    ? 'text-primary bg-primary/10 hover:bg-primary/20'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                )}
                title={isPinned ? 'Unpin sidebar' : 'Pin sidebar open'}
              >
                <motion.div
                  animate={{ rotate: isPinned ? 45 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Pin className="h-3.5 w-3.5" />
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Create Button */}
      <div className="px-3 py-3 border-b border-border">
        <Link
          href="/dashboard/workflows/new"
          className={cn(
            'flex items-center justify-center gap-2 w-full bg-primary hover:bg-primary/90 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-150 shadow-sm',
            !isOpen && 'px-2'
          )}
        >
          <Plus className="h-4 w-4 flex-shrink-0" />
          <AnimatePresence initial={false}>
            {isOpen && (
              <motion.span
                key="create-label"
                variants={textVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="overflow-hidden whitespace-nowrap"
              >
                New Workflow
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-4 overflow-y-auto overflow-x-hidden">
        {navigationGroups.map((group, index) => (
          <NavigationGroup
            key={group.title || index}
            group={group}
            pathname={pathname}
            isOpen={isOpen}
          />
        ))}
      </nav>

    </motion.div>
    </motion.div>
  )
}
