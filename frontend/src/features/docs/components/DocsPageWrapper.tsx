'use client'

import { ReactNode } from 'react'
import { CopyForAIButton } from './CopyForAIButton'

interface DocsPageWrapperProps {
  children: ReactNode
  copyForAIContent?: string
}

export function DocsPageWrapper({ children, copyForAIContent }: DocsPageWrapperProps) {
  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      {copyForAIContent && (
        <div className="flex justify-end mb-6">
          <CopyForAIButton content={copyForAIContent} />
        </div>
      )}
      {children}
    </div>
  )
}
