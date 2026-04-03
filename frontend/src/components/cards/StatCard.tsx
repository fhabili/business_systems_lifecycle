interface StatCardProps {
  label: string
  value: string
  sub: string
  highlight?: boolean
}

export function StatCard({ label, value, sub, highlight }: StatCardProps) {
  return (
    <div className={`rounded-xl border p-6 ${highlight ? 'border-blue-200' : 'bg-white border-gray-200'}`}
      style={highlight ? { backgroundColor: '#EFF6FF' } : undefined}>
      <p className={`text-xs uppercase tracking-wide font-semibold ${highlight ? '' : 'text-gray-500'}`}
        style={highlight ? { color: '#2563EB' } : undefined}>
        {label}
      </p>
      <p className={`text-3xl font-bold mt-1 ${highlight ? '' : 'text-gray-900'}`}
        style={highlight ? { color: '#2563EB' } : undefined}>
        {value}
      </p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  )
}
