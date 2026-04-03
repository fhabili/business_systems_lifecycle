export type RatioStatus = 'pass' | 'warn' | 'fail'

export function statusFor(value: number | null, min = 100): RatioStatus {
  if (value === null) return 'warn'
  if (value >= min + 10) return 'pass'
  if (value >= min) return 'warn'
  return 'fail'
}

interface MetricCardProps {
  label: string
  value: string
  unit: string
  status: RatioStatus
}

const ACCENT = { pass: '#10B981', warn: '#D97706', fail: '#DC2626' }
const BG     = { pass: '#F0FDF4', warn: '#FFFBEB', fail: '#FEF2F2' }
const LABEL  = { pass: 'Compliant', warn: 'Watch', fail: 'Breach' }

export function MetricCard({ label, value, unit, status }: MetricCardProps) {
  return (
    <div
      className="rounded-xl border p-6 h-full flex flex-col"
      style={{ backgroundColor: BG[status], borderColor: ACCENT[status] }}
    >
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-4xl font-bold flex-1" style={{ color: ACCENT[status] }}>
        {value}<span className="text-lg font-normal ml-1 text-gray-500">{unit}</span>
      </p>
      <p className="mt-3 text-xs uppercase tracking-widest font-semibold" style={{ color: ACCENT[status] }}>
        {LABEL[status]}
      </p>
    </div>
  )
}
