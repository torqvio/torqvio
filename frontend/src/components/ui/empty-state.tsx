import * as React from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description: string
  actionText?: string
  actionHref?: string
  icon?: React.ReactNode
  className?: string
}

export default function EmptyState({
  title,
  description,
  actionText,
  actionHref,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="mx-auto w-24 h-24 bg-surface-light rounded-full flex items-center justify-center mb-6">
        {icon || <Plus className="w-8 h-8 text-text-muted" />}
      </div>
      
      <h3 className="text-lg font-medium text-text-primary mb-2">{title}</h3>
      <p className="text-text-secondary mb-6 max-w-md mx-auto">{description}</p>
      
      {actionText && actionHref && (
        <Link href={actionHref}>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            {actionText}
          </Button>
        </Link>
      )}
    </div>
  )
}
