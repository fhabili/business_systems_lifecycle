export function HealthGauge({ score }: { score: number }) {
  const color  = score >= 97 ? '#10B981' : score >= 90 ? '#f59e0b' : '#ef4444'
  const status = score >= 97 ? 'Excellent' : score >= 90 ? 'Good' : 'Needs Attention'
  const r            = 70
  const circumference = 2 * Math.PI * r
  const passLength   = (score / 100) * circumference
  return (
    <div className="flex flex-col items-center">
      <svg width={200} height={200} viewBox="0 0 200 200">
        {/* Fail ring — muted rose */}
        <circle cx="100" cy="100" r={r} fill="none" stroke="#FDA4AF" strokeWidth="20" />
        {/* Pass arc — emerald, starts at 12 o'clock */}
        <circle
          cx="100" cy="100" r={r}
          fill="none"
          stroke="#10B981"
          strokeWidth="20"
          strokeLinecap="round"
          strokeDasharray={`${passLength} ${circumference}`}
          transform="rotate(-90 100 100)"
        />
        {/* Center labels */}
        <text x="100" y="92" textAnchor="middle" style={{ font: 'bold 28px sans-serif', fill: '#1B2A4A' }}>
          {score.toFixed(1)}%
        </text>
        <text x="100" y="112" textAnchor="middle" style={{ font: '11px sans-serif', fill: '#6b7280' }}>
          Health Score
        </text>
        <text x="100" y="128" textAnchor="middle" style={{ font: 'bold 11px sans-serif', fill: color }}>
          {status}
        </text>
      </svg>
    </div>
  )
}
