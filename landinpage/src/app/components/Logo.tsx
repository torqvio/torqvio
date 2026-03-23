import { cn } from '@/lib/utils'

interface LogoMarkProps {
  className?: string
  size?: number
}

export function LogoMark({ className, size = 32 }: LogoMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Rounded square background */}
      <rect width="40" height="40" rx="10" fill="currentColor" />

      {/* Flow mark: three horizontal streams curving right — white on primary */}
      {/* Top stream */}
      <path
        d="M9 13 L20 13 Q28 13 31 20"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.45"
      />
      {/* Middle stream — the hero line */}
      <path
        d="M9 20 L24 20 Q31 20 31 20"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Bottom stream */}
      <path
        d="M9 27 L20 27 Q28 27 31 20"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.45"
      />

      {/* Arrow head on the right */}
      <path
        d="M28 17 L32 20 L28 23"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

interface LogoFullProps {
  className?: string
  iconSize?: number
}

export function LogoFull({ className, iconSize = 32 }: LogoFullProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <LogoMark size={iconSize} className="text-purple flex-shrink-0" />
      <div className="min-w-0">
        <p className="text-sm font-bold text-txt leading-none tracking-tight">Torqvio</p>
        <p className="text-[10px] text-txt3 leading-none mt-1">Durable Execution Engine</p>
      </div>
    </div>
  )
}
