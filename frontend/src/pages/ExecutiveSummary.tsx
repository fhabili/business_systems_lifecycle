import { useState, useEffect } from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { fetchSummary, type SummaryResponse } from '../api'

function statusFor(value: number | null, min = 100): 'pass' | 'warn' | 'fail' {
  if (value === null) return 'warn'
  if (value >= min + 10) return 'pass'
  if (value >= min) return 'warn'
  return 'fail'
}

function MetricCard({ label, value, unit, status }: { label: string; value: string; unit: string; status: 'pass' | 'warn' | 'fail' }) {
  const colors = { pass: 'bg-emerald-50 border-emerald-200 text-emerald-700', warn: 'bg-amber-50 border-amber-200 text-amber-700', fail: 'bg-red-50 border-red-200 text-red-700' }
  return (
    <div className={`rounded-xl border p-6 ${colors[status]}`}>
      <p className="text-sm font-medium opacity-70">{label}</p>
      <p className="mt-1 text-4xl font-bold">{value}<span className="text-lg font-normal ml-1">{unit}</span></p>
      <p className="mt-2 text-xs uppercase tracking-wide font-semibold">{status === 'pass' ? '✓ Compliant' : status === 'warn' ? '⚠ Watch' : '✗ Breach'}</p>
    </div>
  )
}

export default function ExecutiveSummary() {
  const [data, setData] = useState<SummaryResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSummary().then(setData).catch((e: Error) => setError(e.message))
  }, [])

  const lcr = data?.lcr_ratio ?? null
  const nsfr = data?.nsfr_ratio ?? null
  const lcrLabel = lcr != null ? `${lcr.toFixed(1)}%` : '—'
  const nsfrLabel = nsfr != null ? `${nsfr.toFixed(1)}%` : '—'
  const asOf = data?.as_of_date ?? '…'

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Executive Summary</h1>
        <p className="text-sm text-gray-500 mt-1">Regulatory snapshot — as of {asOf}</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span className="font-semibold">⚠ Could not load data:</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricCard label="Liquidity Coverage Ratio (LCR)" value={lcrLabel} unit="min 100%" status={statusFor(lcr)} />
        <MetricCard label="Net Stable Funding Ratio (NSFR)" value={nsfrLabel} unit="min 100%" status={statusFor(nsfr)} />
        <MetricCard label="Data Quality Score" value="—" unit="records passing" status="warn" />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">LCR Trend — EU Banking Sector (ECB Aggregate)</h2>
        {data && data.lcr_trend.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={data.lcr_trend}>
              <defs>
                <linearGradient id="lcrFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="period" tick={{ fontSize: 10 }} interval={3} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} unit="%" />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, 'LCR']} />
              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="lcr_ratio" stroke="#10b981" fill="url(#lcrFill)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">{data ? 'No trend data available.' : 'Loading…'}</p>
        )}
        <p className="mt-2 text-xs text-gray-400">Source: ECB Supervisory Banking Statistics | Dashed line = 100% regulatory minimum</p>
      </div>

      {data && data.active_alerts.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 space-y-1">
          <p className="font-semibold">⚠ Active Alerts ({data.active_alerts.length})</p>
          {data.active_alerts.map((a, i) => <p key={i}>{a}</p>)}
        </div>
      )}
    </div>
  )
}
