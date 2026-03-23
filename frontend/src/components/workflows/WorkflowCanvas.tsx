'use client'

import { cn } from '@/lib/utils'
import type { Step, StepType } from '@/types/workflow'

interface WorkflowCanvasProps {
  steps: Step[]
  selectedStep: string | null
  isDraggingOver: boolean
  dragPosition: { x: number; y: number }
  draggedStep: string | null
  canvasRef: React.RefObject<HTMLDivElement>
  onDragOver: (e: React.DragEvent) => void
  onDragLeave: () => void
  onDrop: (e: React.DragEvent) => void
  onStepClick: (stepId: string) => void
  getStepIcon: (type: string) => React.ComponentType<any>
  getStepColor: (type: string) => string
  stepTypes: StepType[]
}

export default function WorkflowCanvas({
  steps,
  selectedStep,
  isDraggingOver,
  dragPosition,
  draggedStep,
  canvasRef,
  onDragOver,
  onDragLeave,
  onDrop,
  onStepClick,
  getStepIcon,
  getStepColor,
  stepTypes,
}: WorkflowCanvasProps) {
  return (
    <div className="flex-1 relative">
      <div 
        ref={canvasRef}
        className={`relative h-full bg-gray-700/50 border-2 rounded-lg m-4 transition-colors ${
          isDraggingOver ? 'border-purple-500 bg-purple-500/10' : 'border-gray-600'
        }`}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {steps.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-lg font-medium text-gray-400 mb-2">
                {isDraggingOver ? 'Drop step here' : 'Your workflow canvas'}
              </div>
              <div className="text-sm text-text-primary">
                {isDraggingOver ? 'Release to add this step' : 'Drag step types from the sidebar to start building'}
              </div>
            </div>
          </div>
        )}

        {/* Drag preview */}
        {isDraggingOver && draggedStep && (
          <div 
            className="absolute w-32 h-20 bg-gray-800 border-2 border-purple-500 border-dashed rounded-lg p-3 pointer-events-none opacity-70"
            style={{ left: dragPosition.x - 64, top: dragPosition.y - 40 }}
          >
            <div className="flex items-center space-x-2 mb-2">
              <div className={`w-6 h-6 ${getStepColor(draggedStep)} rounded-full flex items-center justify-center`}>
                {(() => {
                  const Icon = getStepIcon(draggedStep)
                  return <Icon className="w-3 h-3 text-white" />
                })()}
              </div>
              <span className="text-xs font-medium text-text-primary truncate">
                New {stepTypes.find(t => t.type === draggedStep)?.name}
              </span>
            </div>
            <div className="text-xs text-text-secondary">{draggedStep}</div>
          </div>
        )}

        {/* Render steps */}
        {steps.map((step) => {
          const Icon = getStepIcon(step.type)
          const isSelected = selectedStep === step.id
          
          return (
            <div
              key={step.id}
              className={cn(
                'absolute w-32 h-20 bg-gray-800 border-2 rounded-lg p-3 cursor-move transition-colors',
                isSelected ? 'border-purple-500' : 'border-gray-600',
                'hover:border-purple-500'
              )}
              style={{ left: step.position.x, top: step.position.y }}
              onClick={() => onStepClick(step.id)}
            >
              <div className="flex items-center space-x-2 mb-2">
                <div className={`w-6 h-6 ${getStepColor(step.type)} rounded-full flex items-center justify-center`}>
                  <Icon className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-medium text-text-primary truncate">
                  {step.name}
                </span>
              </div>
              <div className="text-xs text-text-secondary">
                {step.type}
              </div>
            </div>
          )
        })}

        {/* Connection lines (simplified) */}
        <svg className="absolute inset-0 pointer-events-none">
          {steps.slice(0, -1).map((step, index) => (
            <line
              key={`line-${step.id}`}
              x1={step.position.x + 128}
              y1={step.position.y + 40}
              x2={steps[index + 1].position.x}
              y2={steps[index + 1].position.y + 40}
              stroke="#6C5CE7"
              strokeWidth="2"
            />
          ))}
        </svg>
      </div>
    </div>
  )
}
