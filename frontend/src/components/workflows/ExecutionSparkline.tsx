'use client'

interface ExecutionSparklineProps {
  data: number[]
  width?: number
  height?: number
}

export function ExecutionSparkline({ data, width = 40, height = 16 }: ExecutionSparklineProps) {
  if (!data || data.length < 2) return <div style={{ width, height }} />

  const W = width
  const H = height
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1

  const pts = data.map((v, i): [number, number] => [
    (i / (data.length - 1)) * W,
    H - 2 - ((v - min) / range) * (H - 4),
  ])

  const linePoints = pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ')
  const areaPath = [
    `M ${pts[0][0].toFixed(1)},${H}`,
    ...pts.map(([x, y]) => `L ${x.toFixed(1)},${y.toFixed(1)}`),
    `L ${pts[pts.length - 1][0].toFixed(1)},${H}`,
    'Z',
  ].join(' ')

  return (
    <svg
      width={W}
      height={H}
      viewBox={`0 0 ${W} ${H}`}
      className="text-primary overflow-visible flex-shrink-0"
      aria-hidden
    >
      <path d={areaPath} fill="currentColor" fillOpacity={0.12} />
      <polyline
        points={linePoints}
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  )
}
