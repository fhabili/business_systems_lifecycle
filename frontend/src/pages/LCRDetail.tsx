import { useState, useEffect } from 'react'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { fetchLcr, type LcrResponse, dateToQuarter } from '../api'

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-6 ${highlight ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'}`}>
      <p className={`text-xs uppercase tracking-wide font-semibold ${highlight ? 'text-emerald-700' : 'text-gray-500'}`}>{label}</p>
      <p className={`text-3xl font-bold mt-1 ${highlight ? 'text-emerald-700' : 'text-gray-900'}`}>{value}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  )
}

export default function LCRDetail() {
  const [data, setData] = useState<LcrResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchLcr().then(setData).catch((e: Error) => setError(e.message))
  }, [])

  // API returns rows newest-first; reverse for chronological charts
  const chronological = data ? [...data.banks].reverse() : []
  const latest = data?.banks[0] ?? null

  // Chart data for trend line
  const trendData = chronological.map(b => ({
    quarter: b.reference_date ? dateToQuarter(b.reference_date) : '',
    lcr_ratio: b.lcr_ratio,
  }))

  // Chart data for HQLA buffer vs net outflow (last 12 quarters)
  const bufferData = chronological.slice(-12).map(b => ({
    quarter: b.reference_date ? dateToQuarter(b.reference_date) : '',
    hqla: b.hqla_amount,
    outflow: b.net_outflow,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">LCR Detail</h1>
        <p className="text-sm text-gray-500 mt-1">Liquidity Coverage Ratio — EU Banking Sector (ECB Aggregate, quarterly)</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span className="font-semibold">⚠ Could not load data:</span> {error}
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 text-center">
        <StatCard
          label="Total HQLA Buffer"
          value={latest?.hqla_amount != null ? latest.hqla_amount.toFixed(1) : '—'}
          sub={`Latest: ${latest?.reference_date ? dateToQuarter(latest.reference_date) : '…'}`}
        />
        <StatCard
          label="Net Cash Outflow"
          value={latest?.net_outflow != null ? latest.net_outflow.toFixed(1) : '—'}
          sub="ECB published index value"
        />
        <StatCard
          label="LCR Ratio"
          value={latest?.lcr_ratio != null ? `${latest.lcr_ratio.toFixed(1)}%` : '—'}
          sub="Min required: 100%"
          highlight
        />
      </div>

      {/* LCR ratio trend */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-4">LCR Ratio — Quarterly Trend</h2>
        {trendData.length > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="lcrFill2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" tick={{ fontSize: 10 }} interval={3} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} unit="%" />
              <Tooltip formatter={(v) => [`${Number(v).toFixed(1)}%`, 'LCR']} />
              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '100% min', position: 'insideTopRight', fontSize: 10 }} />
              <Area type="monotone" dataKey="lcr_ratio" stroke="#10b981" fill="url(#lcrFill2)" strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">{data ? 'No data available.' : 'Loading…'}</p>
        )}
      </div>

      {/* HQLA buffer vs outflow */}
      {bufferData.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">HQLA Buffer vs Net Outflow — Last 12 Quarters</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={bufferData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="hqla" name="HQLA Buffer" fill="#10b981" radius={[4, 4, 0, 0]} />
              <Bar dataKey="outflow" name="Net Outflow" fill="#f43f5e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-gray-400">Source: ECB Supervisory Banking Statistics. Values are ECB published indices.</p>
        </div>
      )}

      {/* Data table */}
      {chronological.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 overflow-x-auto">
          <h2 className="text-base font-semibold text-gray-800 mb-4">All Quarterly Observations</h2>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 font-semibold text-gray-600">Quarter</th>
                <th className="pb-2 font-semibold text-gray-600 text-right">HQLA Buffer</th>
                <th className="pb-2 font-semibold text-gray-600 text-right">Net Outflow</th>
                <th className="pb-2 font-semibold text-gray-600 text-right">LCR Ratio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...chronological].reverse().map(b => (
                <tr key={b.reference_date}>
                  <td className="py-2 text-gray-700">{b.reference_date ? dateToQuarter(b.reference_date) : '—'}</td>
                  <td className="py-2 text-gray-500 text-right">{b.hqla_amount?.toFixed(1) ?? '—'}</td>
                  <td className="py-2 text-gray-500 text-right">{b.net_outflow?.toFixed(1) ?? '—'}</td>
                  <td className={`py-2 font-semibold text-right ${b.lcr_ratio != null && b.lcr_ratio >= 100 ? 'text-emerald-700' : 'text-red-600'}`}>
                    {b.lcr_ratio?.toFixed(1) ?? '—'}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
