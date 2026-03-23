'use client'

import { ZoomIn, ZoomOut, Maximize2 } from 'lucide-react'

interface CanvasControlsProps {
  zoom: number
  onZoomIn: () => void
  onZoomOut: () => void
  onFitView: () => void
}

export default function CanvasControls({ zoom, onZoomIn, onZoomOut, onFitView }: CanvasControlsProps) {
  return (
    <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-surface border border-border rounded-lg px-1 py-1 shadow-lg z-10">
      <CtrlBtn onClick={onZoomOut} title="Zoom out (Ctrl+-)">
        <ZoomOut className="w-3.5 h-3.5" />
      </CtrlBtn>

      <span className="text-[11px] font-mono text-text-muted w-10 text-center select-none">
        {Math.round(zoom * 100)}%
      </span>

      <CtrlBtn onClick={onZoomIn} title="Zoom in (Ctrl++)">
        <ZoomIn className="w-3.5 h-3.5" />
      </CtrlBtn>

      <div className="w-px h-4 bg-border mx-0.5" />

      <CtrlBtn onClick={onFitView} title="Fit view (Ctrl+0)">
        <Maximize2 className="w-3.5 h-3.5" />
      </CtrlBtn>
    </div>
  )
}

function CtrlBtn({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      title={title}
      className="w-7 h-7 flex items-center justify-center rounded text-text-muted hover:text-text-primary hover:bg-surface-light transition-colors"
    >
      {children}
    </button>
  )
}
