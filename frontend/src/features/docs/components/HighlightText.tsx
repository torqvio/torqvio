'use client'

interface HighlightTextProps {
  text: string
  query: string
  className?: string
}

export function HighlightText({ text, query, className = '' }: HighlightTextProps) {
  if (!query) return <span className={className}>{text}</span>

  const parts = text.split(new RegExp(`(${query})`, 'gi'))
  
  return (
    <span className={className}>
      {parts.map((part, index) => 
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={index} className="bg-purple-500/30 text-purple-300 px-1 rounded">
            {part}
          </mark>
        ) : (
          <span key={index}>{part}</span>
        )
      )}
    </span>
  )
}
