export function Sparkline({ values, highlightIdx, color = '#10b981' }: {
  values: number[]
  highlightIdx: number
  color?: string
}) {
  if (values.length < 2) return null
  const W = 80, H = 28
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const cx = (i: number) => (i / (values.length - 1)) * W
  const cy = (v: number) => H - 3 - ((v - min) / range) * (H - 6)
  const pts = values.map((v, i) => `${cx(i)},${cy(v)}`).join(' ')
  return (
    <svg width={W} height={H} className="align-middle">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeOpacity={0.35} />
      <circle cx={cx(highlightIdx)} cy={cy(values[highlightIdx])} r={3} fill={color} />
    </svg>
  )
}
