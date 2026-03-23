'use client'

import { useWorkflowBuilder } from '@/hooks/useWorkflowBuilder'
import StepTypeSidebar from './StepTypeSidebar'
import WorkflowCanvas from './WorkflowCanvas'
import StepConfiguration from './StepConfiguration'
import type { WorkflowBuilderProps } from '@/types/workflow'

export default function WorkflowBuilder({ onStepsChange }: WorkflowBuilderProps) {
  const {
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
  } = useWorkflowBuilder(onStepsChange)

  return (
    <div className="flex h-96">
      <StepTypeSidebar
        stepTypes={stepTypes}
        onDragStart={handleDragStart}
        hasSteps={steps.length > 0}
      />
      
      <WorkflowCanvas
        steps={steps}
        selectedStep={selectedStep}
        isDraggingOver={isDraggingOver}
        dragPosition={dragPosition}
        draggedStep={draggedStep}
        canvasRef={canvasRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onStepClick={setSelectedStep}
        getStepIcon={getStepIcon}
        getStepColor={getStepColor}
        stepTypes={stepTypes}
      />
      
      <StepConfiguration
        selectedStep={selectedStep}
        steps={steps}
        onUpdateStep={updateStep}
        onDeleteStep={deleteStep}
      />
    </div>
  )
}