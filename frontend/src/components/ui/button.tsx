import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'outline'
  size?: 'default' | 'sm' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background'
    
    const variants = {
      default: 'bg-purple-600 text-white hover:bg-purple-700',
      primary: 'bg-purple-600 text-white hover:bg-purple-700',
      secondary: 'bg-surface-light text-text-secondary hover:bg-surface hover:text-text-primary border border-border',
      ghost: 'text-text-muted hover:text-text-secondary hover:bg-surface-light',
      outline: 'border border-border text-text-secondary hover:bg-surface-light hover:text-text-primary'
    }

    const sizes = {
      default: 'h-9 py-2 px-4 text-sm',
      sm: 'h-7 px-2 text-xs',
      lg: 'h-11 px-8 text-sm'
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = 'Button'

export { Button }
