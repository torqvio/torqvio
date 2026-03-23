'use client'

import { ArrowLeft } from 'lucide-react'

export default function EmptyCanvasState() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <div className="text-center">
        {/* Dashed placeholder node */}
        <div className="mx-auto mb-6 w-44 h-16 rounded-lg border-2 border-dashed border-border flex items-center justify-center">
          <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
            Drop a step here
          </span>
        </div>

        <h3 className="text-sm font-medium text-text-secondary mb-1">
          Start building your workflow
        </h3>
        <p className="text-xs text-text-muted flex items-center justify-center gap-1">
          <ArrowLeft className="w-3 h-3" />
          Drag a step from the left panel to get started
        </p>
      </div>
    </div>
  )
}
