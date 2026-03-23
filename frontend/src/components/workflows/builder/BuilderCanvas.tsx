'use client'

import { useRef, useState, useCallback, useEffect } from 'react'
import StepNode, { NODE_WIDTH, NODE_HEIGHT } from './StepNode'
import EmptyCanvasState from './EmptyCanvasState'
import CanvasControls from './CanvasControls'
import { stepTypeConfig } from './step-config'
import type { WorkflowNode, WorkflowEdge, StepType } from './types'

const DOT_SPACING = 24
const INITIAL_PAN = { x: 120, y: 80 }

interface BuilderCanvasProps {
  nodes: WorkflowNode[]
  edges: WorkflowEdge[]
  selectedNodeId: string | null
  onNodeSelect: (id: string | null) => void
  onNodeAdd: (type: StepType, position: { x: number; y: number }) => void
  onNodeUpdate: (id: string, updates: Partial<WorkflowNode>) => void
}

export default function BuilderCanvas({
  nodes,
  edges,
  selectedNodeId,
  onNodeSelect,
  onNodeAdd,
  onNodeUpdate,
}: BuilderCanvasProps) {
  const outerRef = useRef<HTMLDivElement>(null)

  // Pan + zoom
  const [pan, setPan] = useState(INITIAL_PAN)
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef<{ mouse: { x: number; y: number }; pan: { x: number; y: number } } | null>(null)

  // Space = temporary pan mode
  const [spaceDown, setSpaceDown] = useState(false)

  // Zoom towards a viewport point (cx, cy relative to outer div top-left)
  const zoomTo = useCallback(
    (newZoom: number, cx: number, cy: number) => {
      const clamped = Math.min(2, Math.max(0.15, newZoom))
      setPan((p) => ({
        x: cx - ((cx - p.x) / zoom) * clamped,
        y: cy - ((cy - p.y) / zoom) * clamped,
      }))
      setZoom(clamped)
    },
    [zoom],
  )

  // Fit all nodes into view
  const fitView = useCallback(() => {
    if (nodes.length === 0) {
      setZoom(1)
      setPan(INITIAL_PAN)
      return
    }
    const el = outerRef.current
    if (!el) return
    const vw = el.clientWidth
    const vh = el.clientHeight
    const minX = Math.min(...nodes.map((n) => n.position.x))
    const minY = Math.min(...nodes.map((n) => n.position.y))
    const maxX = Math.max(...nodes.map((n) => n.position.x + NODE_WIDTH))
    const maxY = Math.max(...nodes.map((n) => n.position.y + NODE_HEIGHT))
    const contentW = maxX - minX + 80
    const contentH = maxY - minY + 80
    const newZoom = Math.min(2, Math.max(0.15, Math.min(vw / contentW, vh / contentH)))
    const newPanX = (vw - contentW * newZoom) / 2 - minX * newZoom + 40 * newZoom
    const newPanY = (vh - contentH * newZoom) / 2 - minY * newZoom + 40 * newZoom
    setZoom(newZoom)
    setPan({ x: newPanX, y: newPanY })
  }, [nodes])

  // Convert viewport-relative coords → canvas-world coords
  const toCanvas = useCallback(
    (vx: number, vy: number) => ({ x: (vx - pan.x) / zoom, y: (vy - pan.y) / zoom }),
    [pan, zoom],
  )

  // Ctrl+wheel → zoom; plain wheel → pan
  useEffect(() => {
    const el = outerRef.current
    if (!el) return
    const handler = (e: WheelEvent) => {
      e.preventDefault()
      if (e.ctrlKey || e.metaKey) {
        const rect = el.getBoundingClientRect()
        zoomTo(zoom + (e.deltaY < 0 ? 0.08 : -0.08), e.clientX - rect.left, e.clientY - rect.top)
      } else {
        setPan((p) => ({ x: p.x - e.deltaX, y: p.y - e.deltaY }))
      }
    }
    el.addEventListener('wheel', handler, { passive: false })
    return () => el.removeEventListener('wheel', handler)
  }, [zoom, zoomTo])

  // Keyboard: Ctrl+=/- zoom, Ctrl+0 fit, Space pan mode
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !['INPUT', 'TEXTAREA', 'SELECT'].includes((document.activeElement as HTMLElement)?.tagName ?? '')) {
        e.preventDefault()
        setSpaceDown(true)
      }
      if (!e.ctrlKey && !e.metaKey) return
      const rect = outerRef.current?.getBoundingClientRect()
      const cx = (rect?.width ?? 800) / 2
      const cy = (rect?.height ?? 600) / 2
      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        zoomTo(zoom + 0.1, cx, cy)
      } else if (e.key === '-') {
        e.preventDefault()
        zoomTo(zoom - 0.1, cx, cy)
      } else if (e.key === '0') {
        e.preventDefault()
        fitView()
      }
    }
    const onUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpaceDown(false)
    }
    window.addEventListener('keydown', onDown)
    window.addEventListener('keyup', onUp)
    return () => {
      window.removeEventListener('keydown', onDown)
      window.removeEventListener('keyup', onUp)
    }
  }, [zoom, zoomTo, fitView])

  // ── Background pan ─────────────────────────────────────────────────────────

  const handleBgMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return
    onNodeSelect(null)
    setIsPanning(true)
    panStart.current = { mouse: { x: e.clientX, y: e.clientY }, pan: { ...pan } }

    const onMove = (me: MouseEvent) => {
      if (!panStart.current) return
      setPan({
        x: panStart.current.pan.x + me.clientX - panStart.current.mouse.x,
        y: panStart.current.pan.y + me.clientY - panStart.current.mouse.y,
      })
    }
    const onUp = () => {
      panStart.current = null
      setIsPanning(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ── Palette drop ───────────────────────────────────────────────────────────

  const [isDragOver, setIsDragOver] = useState(false)
  const [ghostPos, setGhostPos] = useState({ x: 0, y: 0 })
  const [dragType, setDragType] = useState<string | null>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDragOver(true)
    const rect = outerRef.current!.getBoundingClientRect()
    const pos = toCanvas(e.clientX - rect.left, e.clientY - rect.top)
    setGhostPos({ x: pos.x - NODE_WIDTH / 2, y: pos.y - NODE_HEIGHT / 2 })
  }

  const handleDragEnter = (e: React.DragEvent) => {
    const t = e.dataTransfer.getData('stepType')
    if (t) setDragType(t)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false)
      setDragType(null)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    setDragType(null)
    const type = e.dataTransfer.getData('stepType') as StepType
    if (!type) return
    const rect = outerRef.current!.getBoundingClientRect()
    const pos = toCanvas(e.clientX - rect.left, e.clientY - rect.top)
    onNodeAdd(type, { x: Math.max(0, pos.x - NODE_WIDTH / 2), y: Math.max(0, pos.y - NODE_HEIGHT / 2) })
  }

  // ── Node move ──────────────────────────────────────────────────────────────

  const nodeDrag = useRef<{
    id: string
    startMouse: { x: number; y: number }
    startPos: { x: number; y: number }
  } | null>(null)

  const handleNodeMouseDown = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      if (spaceDown) return // in pan mode, let background handle it
      e.stopPropagation()
      onNodeSelect(nodeId)
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      nodeDrag.current = {
        id: nodeId,
        startMouse: { x: e.clientX, y: e.clientY },
        startPos: { ...node.position },
      }

      const onMove = (me: MouseEvent) => {
        if (!nodeDrag.current) return
        const dx = (me.clientX - nodeDrag.current.startMouse.x) / zoom
        const dy = (me.clientY - nodeDrag.current.startMouse.y) / zoom
        onNodeUpdate(nodeDrag.current.id, {
          position: {
            x: nodeDrag.current.startPos.x + dx,
            y: nodeDrag.current.startPos.y + dy,
          },
        })
      }
      const onUp = () => {
        nodeDrag.current = null
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
      }
      document.addEventListener('mousemove', onMove)
      document.addEventListener('mouseup', onUp)
    },
    [nodes, zoom, spaceDown, onNodeSelect, onNodeUpdate],
  )

  // ── Dot grid (infinite, follows pan+zoom) ──────────────────────────────────
  const gridSize = DOT_SPACING * zoom
  const gridStyle = {
    backgroundImage: 'radial-gradient(circle, #2A3142 1.2px, transparent 1.2px)',
    backgroundSize: `${gridSize}px ${gridSize}px`,
    backgroundPosition: `${pan.x % gridSize}px ${pan.y % gridSize}px`,
  }

  // ── Edge animation ID (unique per canvas mount) ────────────────────────────
  const animId = useRef(`flow-${Math.random().toString(36).slice(2)}`)

  // ── Render ─────────────────────────────────────────────────────────────────
  const cursorStyle = isPanning || spaceDown ? 'cursor-grabbing' : spaceDown ? 'cursor-grab' : 'cursor-grab'

  return (
    <div
      ref={outerRef}
      className={`flex-1 overflow-hidden relative bg-background select-none ${cursorStyle}`}
      style={gridStyle}
      onMouseDown={handleBgMouseDown}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Canvas world — no fixed size, infinite */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transformOrigin: '0 0',
          willChange: 'transform',
        }}
      >
        {/* Edges SVG — overflow: visible = infinite reach */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            overflow: 'visible',
            pointerEvents: 'none',
          }}
        >
          <defs>
            <marker id={`${animId.current}-arrow`} markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
              <polygon points="0 0, 6 2, 0 4" fill="#6C5CE7" opacity="0.9" />
            </marker>
            {/* Flow animation */}
            <style>{`
              @keyframes flow-dash {
                from { stroke-dashoffset: 24; }
                to   { stroke-dashoffset: 0; }
              }
              .flow-edge {
                stroke-dasharray: 8 6;
                animation: flow-dash 0.6s linear infinite;
              }
            `}</style>
          </defs>

          {edges.map((edge) => {
            const src = nodes.find((n) => n.id === edge.source)
            const tgt = nodes.find((n) => n.id === edge.target)
            if (!src || !tgt) return null

            const x1 = src.position.x + NODE_WIDTH
            const y1 = src.position.y + NODE_HEIGHT / 2
            const x2 = tgt.position.x
            const y2 = tgt.position.y + NODE_HEIGHT / 2
            const offset = Math.abs(x2 - x1) * 0.5 + 40
            const d = `M ${x1},${y1} C ${x1 + offset},${y1} ${x2 - offset},${y2} ${x2},${y2}`

            return (
              <g key={edge.id}>
                {/* Static base line */}
                <path d={d} fill="none" stroke="#6C5CE7" strokeWidth="1.5" strokeOpacity="0.25" />
                {/* Animated flow dashes */}
                <path
                  d={d}
                  fill="none"
                  stroke="#6C5CE7"
                  strokeWidth="1.5"
                  strokeOpacity="0.8"
                  className="flow-edge"
                  markerEnd={`url(#${animId.current}-arrow)`}
                />
              </g>
            )
          })}
        </svg>

        {/* Step nodes */}
        {nodes.map((node) => (
          <StepNode
            key={node.id}
            node={node}
            isSelected={selectedNodeId === node.id}
            onMouseDown={(e) => handleNodeMouseDown(e, node.id)}
          />
        ))}

        {/* Drop ghost */}
        {isDragOver && (
          <DropGhost type={dragType as StepType | null} x={ghostPos.x} y={ghostPos.y} />
        )}
      </div>

      {/* Canvas controls overlay */}
      <CanvasControls
        zoom={zoom}
        onZoomIn={() => {
          const rect = outerRef.current?.getBoundingClientRect()
          zoomTo(zoom + 0.1, (rect?.width ?? 800) / 2, (rect?.height ?? 600) / 2)
        }}
        onZoomOut={() => {
          const rect = outerRef.current?.getBoundingClientRect()
          zoomTo(zoom - 0.1, (rect?.width ?? 800) / 2, (rect?.height ?? 600) / 2)
        }}
        onFitView={fitView}
      />

      {/* Empty state */}
      {nodes.length === 0 && !isDragOver && <EmptyCanvasState />}
    </div>
  )
}

function DropGhost({ type, x, y }: { type: StepType | null; x: number; y: number }) {
  const cfg = type ? stepTypeConfig[type] : null
  const Icon = cfg?.icon
  return (
    <div
      className="absolute border-2 border-dashed border-primary rounded-lg bg-primary/5 pointer-events-none flex items-center justify-center gap-2"
      style={{ left: x, top: y, width: NODE_WIDTH, height: NODE_HEIGHT }}
    >
      {Icon && <Icon className={`w-4 h-4 ${cfg?.iconColor ?? 'text-primary'}`} />}
      <span className="text-xs text-primary font-medium">{cfg?.label ?? 'Drop here'}</span>
    </div>
  )
}
