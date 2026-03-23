'use client'

import ThreeZoneLayout from './ThreeZoneLayout'

interface InteractiveDocsPageProps {
  children: React.ReactNode
  tryItEndpoint?: string
  title?: string
  description?: string
}

export default function InteractiveDocsPage({ 
  children, 
  tryItEndpoint,
  title,
  description 
}: InteractiveDocsPageProps) {
  return (
    <ThreeZoneLayout 
      tryItEndpoint={tryItEndpoint}
      title={title}
      description={description}
    >
      {children}
    </ThreeZoneLayout>
  )
}
