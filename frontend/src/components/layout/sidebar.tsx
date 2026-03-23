'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Workflow, 
  Activity, 
  Webhook, 
  BarChart3, 
  Settings,
  Plus,
  TrendingUp,
  Package
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Workflows', href: '/dashboard/workflows', icon: Workflow },
  { name: 'Executions', href: '/dashboard/executions', icon: Activity },
  { name: 'Webhooks', href: '/dashboard/webhooks', icon: Webhook },
  { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3 },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 h-full bg-surface border-r border-border flex flex-col">
      <div className="p-6 border-b border-border">
        <h1 className="text-xl font-bold text-text-primary">Torqvio</h1>
        <p className="text-sm text-text-secondary mt-1">Durable Execution Engine</p>
      </div>
      
      <nav className="flex-1 px-3 py-4">
        <Link 
          href="/dashboard/workflows/new"
          className="w-full bg-primary hover:bg-primary/90 text-white px-4 py-2.5 rounded-lg flex items-center justify-center font-medium transition-all duration-200 shadow-sm hover:shadow-md mb-6"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Flow
        </Link>
        
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary border-l-2 border-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-light'
                )}
              >
                <item.icon className="w-4 h-4 mr-3 flex-shrink-0" />
                {item.name}
              </Link>
            )
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t border-border">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-surface-light rounded-lg flex items-center justify-center text-text-primary text-sm font-medium border border-border">
            N
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">User</p>
            <p className="text-xs text-text-secondary">Online</p>
          </div>
        </div>
      </div>
    </div>
  )
}
