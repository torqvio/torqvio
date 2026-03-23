'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import BuilderToolbar from '@/components/workflows/builder/BuilderToolbar'
import StepPalette from '@/components/workflows/builder/StepPalette'
import BuilderCanvas from '@/components/workflows/builder/BuilderCanvas'
import StepConfigPanel from '@/components/workflows/builder/StepConfigPanel'
import WorkflowSettingsDrawer, {
  type WorkflowSettings,
} from '@/components/workflows/builder/WorkflowSettingsDrawer'
import { getDefaultName, getDefaultConfig } from '@/components/workflows/builder/step-config'
import type { WorkflowNode, WorkflowEdge, StepType } from '@/components/workflows/builder/types'

type HistoryEntry = { nodes: WorkflowNode[]; edges: WorkflowEdge[] }

export default function NewWorkflowPage() {
  const router = useRouter()

  // ── Workflow settings ──────────────────────────────────────────────────────
  const [settings, setSettings] = useState<WorkflowSettings>({
    name: 'Untitled Workflow',
    description: '',
    trigger: 'webhook',
    retryPolicy: 'default',
    timeout: 300,
    tags: '',
  })
  const [settingsOpen, setSettingsOpen] = useState(false)

  // ── Canvas state ───────────────────────────────────────────────────────────
  const [nodes, setNodes] = useState<WorkflowNode[]>([])
  const [edges, setEdges] = useState<WorkflowEdge[]>([])
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)

  // ── Save state ─────────────────────────────────────────────────────────────
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Undo / redo ────────────────────────────────────────────────────────────
  const [history, setHistory] = useState<HistoryEntry[]>([{ nodes: [], edges: [] }])
  const [historyIndex, setHistoryIndex] = useState(0)

  const pushHistory = useCallback(
    (newNodes: WorkflowNode[], newEdges: WorkflowEdge[]) => {
      setHistory((prev) => [...prev.slice(0, historyIndex + 1), { nodes: newNodes, edges: newEdges }])
      setHistoryIndex((i) => i + 1)
    },
    [historyIndex],
  )

  const undo = useCallback(() => {
    if (historyIndex <= 0) return
    const idx = historyIndex - 1
    const entry = history[idx]
    setNodes(entry.nodes)
    setEdges(entry.edges)
    setHistoryIndex(idx)
    setSelectedNodeId(null)
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1) return
    const idx = historyIndex + 1
    const entry = history[idx]
    setNodes(entry.nodes)
    setEdges(entry.edges)
    setHistoryIndex(idx)
    setSelectedNodeId(null)
  }, [history, historyIndex])

  // ── Auto-save on change ────────────────────────────────────────────────────
  useEffect(() => {
    if (nodes.length === 0 && !lastSaved) return // don't auto-save empty canvas
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(async () => {
      setSaveStatus('saving')
      try {
        await new Promise((r) => setTimeout(r, 500))
        setSaveStatus('saved')
        setLastSaved(new Date())
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('error')
      }
    }, 1500)
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    }
  }, [nodes, edges, settings.name, lastSaved])

  // ── Node mutations ─────────────────────────────────────────────────────────

  const addNode = useCallback(
    (type: StepType, position: { x: number; y: number }) => {
      const newNode: WorkflowNode = {
        id: `node_${Date.now()}`,
        type,
        name: getDefaultName(type),
        config: getDefaultConfig(type),
        position,
      }
      const newNodes = [...nodes, newNode]
      const newEdges =
        nodes.length > 0
          ? [
              ...edges,
              {
                id: `edge_${nodes[nodes.length - 1].id}_${newNode.id}`,
                source: nodes[nodes.length - 1].id,
                target: newNode.id,
              },
            ]
          : [...edges]

      setNodes(newNodes)
      setEdges(newEdges)
      setSelectedNodeId(newNode.id)
      pushHistory(newNodes, newEdges)
    },
    [nodes, edges, pushHistory],
  )

  const updateNode = useCallback(
    (nodeId: string, updates: Partial<WorkflowNode>) => {
      const newNodes = nodes.map((n) => (n.id === nodeId ? { ...n, ...updates } : n))
      setNodes(newNodes)
      if (!updates.position) pushHistory(newNodes, edges)
    },
    [nodes, edges, pushHistory],
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      const newNodes = nodes.filter((n) => n.id !== nodeId)
      const newEdges = edges.filter((e) => e.source !== nodeId && e.target !== nodeId)
      setNodes(newNodes)
      setEdges(newEdges)
      setSelectedNodeId(null)
      pushHistory(newNodes, newEdges)
    },
    [nodes, edges, pushHistory],
  )

  const duplicateNode = useCallback(
    (nodeId: string) => {
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return
      const newNode: WorkflowNode = {
        ...node,
        id: `node_${Date.now()}`,
        name: `${node.name} (copy)`,
        position: { x: node.position.x + 30, y: node.position.y + 30 },
      }
      const newNodes = [...nodes, newNode]
      setNodes(newNodes)
      setSelectedNodeId(newNode.id)
      pushHistory(newNodes, edges)
    },
    [nodes, edges, pushHistory],
  )

  // ── Save / deploy ──────────────────────────────────────────────────────────

  const handleSave = useCallback(async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setSaveStatus('saving')
    try {
      await new Promise((r) => setTimeout(r, 700))
      setSaveStatus('saved')
      setLastSaved(new Date())
      setTimeout(() => setSaveStatus('idle'), 2500)
    } catch {
      setSaveStatus('error')
    }
  }, [])

  const handleDeploy = useCallback(async () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    setSaveStatus('saving')
    try {
      await new Promise((r) => setTimeout(r, 1200))
      setSaveStatus('saved')
      setLastSaved(new Date())
      setTimeout(() => router.push('/dashboard/workflows'), 800)
    } catch {
      setSaveStatus('error')
    }
  }, [router])

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT'

      if (e.key === 'Escape') {
        setSelectedNodeId(null)
        setSettingsOpen(false)
        return
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedNodeId && !isTyping) {
        deleteNode(selectedNodeId)
        return
      }

      if (e.ctrlKey || e.metaKey) {
        if (e.key === 's' && !e.shiftKey) { e.preventDefault(); handleSave(); return }
        if (e.key === 'S' && e.shiftKey)  { e.preventDefault(); handleDeploy(); return }
        if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return }
        if (e.key === 'Z' && e.shiftKey)  { e.preventDefault(); redo(); return }
        if (e.key === 'd' && selectedNodeId) { e.preventDefault(); duplicateNode(selectedNodeId); return }
        // Ctrl+= / Ctrl+- / Ctrl+0 handled in BuilderCanvas to avoid browser zoom
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [selectedNodeId, deleteNode, handleSave, handleDeploy, undo, redo, duplicateNode])

  // ── Render ─────────────────────────────────────────────────────────────────

  const selectedNode = nodes.find((n) => n.id === selectedNodeId) ?? null

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <BuilderToolbar
        workflowName={settings.name}
        onNameChange={(name) => setSettings((s) => ({ ...s, name }))}
        saveStatus={saveStatus}
        lastSaved={lastSaved}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={undo}
        onRedo={redo}
        onSave={handleSave}
        onDeploy={handleDeploy}
        onBack={() => router.push('/dashboard/workflows')}
        onSettings={() => setSettingsOpen(true)}
      />

      <div className="flex flex-1 overflow-hidden">
        <StepPalette />

        <BuilderCanvas
          nodes={nodes}
          edges={edges}
          selectedNodeId={selectedNodeId}
          onNodeSelect={setSelectedNodeId}
          onNodeAdd={addNode}
          onNodeUpdate={updateNode}
        />

        <AnimatePresence>
          {selectedNode && (
            <motion.div
              key={selectedNode.id}
              initial={{ x: 320, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 320, opacity: 0 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              style={{ display: 'flex', flexShrink: 0 }}
            >
              <StepConfigPanel
                node={selectedNode}
                onUpdate={(updates) => updateNode(selectedNode.id, updates)}
                onDelete={() => deleteNode(selectedNode.id)}
                onClose={() => setSelectedNodeId(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <WorkflowSettingsDrawer
        open={settingsOpen}
        settings={settings}
        onSettingsChange={setSettings}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  )
}
