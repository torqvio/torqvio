'use client'

import { Info, AlertCircle } from 'lucide-react'
import type { StepType } from '@/types/workflow'

interface StepTypeSidebarProps {
  stepTypes: StepType[]
  onDragStart: (e: React.DragEvent, stepType: string) => void
  hasSteps: boolean
}

export default function StepTypeSidebar({ stepTypes, onDragStart, hasSteps }: StepTypeSidebarProps) {
  return (
    <div className="w-80 border-r border-gray-600 p-4">
      <div className="mb-4">
        <h3 className="text-sm font-medium text-gray-400 mb-2">Step Types</h3>
        <div className="flex items-center text-xs text-white">
          <Info className="w-3 h-3 mr-1" />
          Drag to canvas to add steps
        </div>
      </div>
      <div className="space-y-3">
        {stepTypes.map((stepType) => (
          <div
            key={stepType.type}
            className="p-3 rounded-lg border border-gray-600 hover:bg-gray-700 hover:border-purple-500 cursor-move transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, stepType.type)}
          >
            <div className="flex items-start space-x-3">
              <div className={`w-8 h-8 ${stepType.color} rounded-full flex items-center justify-center flex-shrink-0`}>
                <stepType.icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-white">{stepType.name}</div>
                <div className="text-xs text-gray-400 mt-1">{stepType.description}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {!hasSteps && (
        <div className="mt-6 p-4 bg-gray-700 rounded-lg border border-gray-600">
          <div className="flex items-center text-sm text-text-primary">
            <AlertCircle className="w-4 h-4 mr-2 text-yellow-500" />
            Start by dragging a step type to the canvas
          </div>
        </div>
      )}
    </div>
  )
}
