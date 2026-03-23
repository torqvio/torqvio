import { useState, useRef } from 'react'
import type { Step, StepType } from '@/types/workflow'

const stepTypes: StepType[] = [
  { type: 'http', name: 'HTTP Request', icon: require('lucide-react').Globe, color: 'bg-blue-500', description: 'Make HTTP requests to external APIs' },
  { type: 'delay', name: 'Delay', icon: require('lucide-react').Clock, color: 'bg-yellow-500', description: 'Wait for a specified duration' },
  { type: 'condition', name: 'Condition', icon: require('lucide-react').GitBranch, color: 'bg-green-500', description: 'Branch workflow based on conditions' },
  { type: 'retry', name: 'Retry', icon: require('lucide-react').RefreshCw, color: 'bg-orange-500', description: 'Retry failed operations' },
  { type: 'custom', name: 'Custom Code', icon: require('lucide-react').Code, color: 'bg-purple-500', description: 'Execute custom JavaScript code' },
]

export function useWorkflowBuilder(onStepsChange?: (steps: Step[]) => void) {
  const [steps, setSteps] = useState<Step[]>([])
  const [selectedStep, setSelectedStep] = useState<string | null>(null)
  const [draggedStep, setDraggedStep] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLDivElement>(null)

  const getDefaultConfig = (type: string) => {
    switch (type) {
      case 'http':
        return { url: 'https://api.example.com', method: 'GET' as const }
      case 'delay':
        return { duration: 1000 }
      case 'condition':
        return { condition: 'true' }
      case 'retry':
        return { maxAttempts: 3, backoff: 'exponential' as const }
      case 'custom':
        return { code: '// Your custom code here' }
      default:
        return {}
    }
  }

  const addStep = (type: string, position: { x: number; y: number }) => {
    const stepType = stepTypes.find(t => t.type === type)
    const newStep: Step = {
      id: `step_${Date.now()}`,
      type: type as Step['type'],
      name: `New ${stepType?.name || type} step`,
      config: getDefaultConfig(type),
      position,
    }
    const updatedSteps = [...steps, newStep]
    setSteps(updatedSteps)
    onStepsChange?.(updatedSteps)
  }

  const deleteStep = (stepId: string) => {
    const updatedSteps = steps.filter(step => step.id !== stepId)
    setSteps(updatedSteps)
    setSelectedStep(null)
    onStepsChange?.(updatedSteps)
  }

  const updateStep = (stepId: string, updates: Partial<Step>) => {
    const updatedSteps = steps.map(step => 
      step.id === stepId ? { ...step, ...updates } : step
    )
    setSteps(updatedSteps)
    onStepsChange?.(updatedSteps)
  }

  const handleDragStart = (e: React.DragEvent, stepType: string) => {
    setDraggedStep(stepType)
    e.dataTransfer.effectAllowed = 'copy'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
    setIsDraggingOver(true)
    
    if (canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      setDragPosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }
  }

  const handleDragLeave = () => {
    setIsDraggingOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDraggingOver(false)
    
    if (draggedStep && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left - 64 // Center the step
      const y = e.clientY - rect.top - 40
      
      addStep(draggedStep, { x: Math.max(0, x), y: Math.max(0, y) })
      setDraggedStep(null)
    }
  }

  const getStepIcon = (type: string) => {
    const stepType = stepTypes.find(t => t.type === type)
    return stepType ? stepType.icon : require('lucide-react').Code
  }

  const getStepColor = (type: string) => {
    const stepType = stepTypes.find(t => t.type === type)
    return stepType ? stepType.color : 'bg-gray-500'
  }

  return {
    steps,
    selectedStep,
    draggedStep,
    isDraggingOver,
    dragPosition,
    canvasRef,
    stepTypes,
    addStep,
    deleteStep,
    updateStep,
    handleDragStart,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    getStepIcon,
    getStepColor,
    setSelectedStep,
  }
}
