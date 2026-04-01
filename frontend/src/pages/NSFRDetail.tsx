import { useState, useEffect, useMemo } from 'react'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { fetchNsfr, type NsfrResponse, dateToQuarter } from '../api'

const RANGE_OPTIONS = [
  { label: '3 Y', years: 3 },
  { label: '5 Y', years: 5 },
  { label: 'All', years: 999 },
]

function StatCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{sub}</p>
    </div>
  )
}

function Sparkline({ values, highlightIdx }: { values: number[]; highlightIdx: number }) {
  if (values.length < 2) return null
  const W = 64, H = 22
  const min = Math.min(...values), max = Math.max(...values)
  const range = max - min || 1
  const cx = (i: number) => (i / (values.length - 1)) * W
  const cy = (v: number) => H - 2 - ((v - min) / range) * (H - 4)
  const pts = values.map((v, i) => `${cx(i)},${cy(v)}`).join(' ')
  return (
    <svg width={W} height={H} className="align-middle">
      <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="1.5" strokeOpacity={0.35} />
      <circle cx={cx(highlightIdx)} cy={cy(values[highlightIdx])} r={3} fill="#6366f1" />
    </svg>
  )
}

function NsfrTooltip({ active, payload, label }: { active?: boolean; payload?: {value: number}[]; label?: string }) {
  if (!active || !payload?.length) return null
  const v = payload[0].value
  const interpretation = v >= 130 ? 'Very strong long-term funding structure.'
    : v >= 115 ? 'Comfortable buffer above the 100% minimum.'
    : v >= 100 ? 'Compliant — limited headroom above the floor.'
    : 'BREACH — stable funding deficit.'
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs max-w-[200px]">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      <p className="text-lg font-bold text-indigo-700">{v.toFixed(1)}%</p>
      <p className="text-gray-500 mt-1 leading-snug">{interpretation}</p>
    </div>
  )
}

export default function NSFRDetail() {
  const [data, setData] = useState<NsfrResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rangeYears, setRangeYears] = useState(999)
  const [showFull, setShowFull] = useState(false)

  useEffect(() => {
    fetchNsfr().then(setData).catch((e: Error) => setError(e.message))
  }, [])

  // API returns newest-first; reverse for chrono charts
  const chronological = useMemo(() => data ? [...data.banks].reverse() : [], [data])
  const latest = data?.banks[0] ?? null

  // Apply date range filter
  const filtered = useMemo(() => {
    if (rangeYears >= 999) return chronological
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - rangeYears)
    return chronological.filter(b => b.reference_date && new Date(b.reference_date) >= cutoff)
  }, [chronological, rangeYears])

  const summary8 = useMemo(() => [...filtered].reverse().slice(0, 8), [filtered])
  const sparkValues = useMemo(() => summary8.slice().reverse().map(b => b.nsfr_ratio ?? 0), [summary8])

  // Data for NSFR ratio trend
  const ratioTrend = filtered.map(b => ({
    quarter: b.reference_date ? dateToQuarter(b.reference_date) : '',
    nsfr_ratio: b.nsfr_ratio,
  }))

  // Data for ASF vs RSF grouped bars (last 12 quarters of filtered set)
  const fundingData = filtered.slice(-12).map(b => ({
    quarter: b.reference_date ? dateToQuarter(b.reference_date) : '',
    asf: b.asf_amount,
    rsf: b.rsf_amount,
  }))

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">NSFR Detail</h1>
        <p className="text-sm text-gray-500 mt-1">Net Stable Funding Ratio — EU Banking Sector (ECB Aggregate, quarterly)</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <span className="font-semibold">⚠ Could not load data:</span> {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="NSFR Ratio"
          value={latest?.nsfr_ratio != null ? `${latest.nsfr_ratio.toFixed(1)}%` : '—'}
          sub={`Latest: ${latest?.reference_date ? dateToQuarter(latest.reference_date) : '…'} | Min required: 100%`}
        />
        <StatCard
          label="Available Stable Funding (ASF)"
          value={latest?.asf_amount != null ? latest.asf_amount.toFixed(1) : '—'}
          sub="ECB published index value"
        />
        <StatCard
          label="Required Stable Funding (RSF)"
          value={latest?.rsf_amount != null ? latest.rsf_amount.toFixed(1) : '—'}
          sub="ECB published index value"
        />
      </div>

      {/* NSFR ratio trend */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">NSFR Ratio — Quarterly Trend</h2>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map(opt => (
              <button
                key={opt.label}
                onClick={() => setRangeYears(opt.years)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${
                  rangeYears === opt.years
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                }`}
              >{opt.label}</button>
            ))}
          </div>
        </div>
        {ratioTrend.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={ratioTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" tick={{ fontSize: 10 }} interval={Math.max(0, Math.floor(ratioTrend.length / 8) - 1)} />
              <YAxis domain={['auto', 'auto']} tick={{ fontSize: 12 }} unit="%" />
              <Tooltip content={<NsfrTooltip />} />
              <ReferenceLine y={100} stroke="#f59e0b" strokeDasharray="4 4" label={{ value: '100% min', position: 'insideTopRight', fontSize: 10 }} />
              {/* macro-event annotations */}
              <ReferenceLine x="Q1 2020" stroke="#6366f1" strokeDasharray="3 3"
                label={{ value: 'COVID-19 Relief', position: 'insideTopLeft', fontSize: 9, fill: '#6366f1' }} />
              <ReferenceLine x="Q1 2022" stroke="#f97316" strokeDasharray="3 3"
                label={{ value: 'Ukraine / Wholesale Cost ↑', position: 'insideTopLeft', fontSize: 9, fill: '#f97316' }} />
              <Line type="monotone" dataKey="nsfr_ratio" stroke="#6366f1" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-400 text-center py-10">{data ? 'No data available.' : 'Loading…'}</p>
        )}
        <p className="mt-3 text-xs text-gray-400">Source: ECB Supervisory Banking Statistics. Vertical markers indicate macro-economic events that materially affected funding conditions.</p>
        <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1.5"><span className="inline-block w-4 border-t-2 border-dashed border-indigo-400" />Q1 2020: COVID-19 ECB Regulatory Relief</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-4 border-t-2 border-dashed border-orange-400" />Q1 2022: Ukraine Conflict — Wholesale Funding Cost ↑</span>
          <span className="flex items-center gap-1.5"><span className="inline-block w-4 border-t-2 border-dashed border-amber-400" />100% regulatory floor (CRR2 Art. 428)</span>
        </div>
      </div>

      {/* ASF vs RSF by quarter */}
      {fundingData.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">ASF vs RSF — Last 12 Quarters</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fundingData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Bar dataKey="asf" name="Available Stable Funding" fill="#6366f1" radius={[4, 4, 0, 0]} />
              <Bar dataKey="rsf" name="Required Stable Funding" fill="#e0e7ff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2 text-xs text-gray-400">Source: ECB Supervisory Banking Statistics. Values are ECB published indices.</p>
        </div>
      )}

      {/* Data table */}
      {filtered.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">Last 8 Quarters</h2>
            <button
              onClick={() => setShowFull(f => !f)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {showFull ? 'Hide full data ▴' : `Show full data (${filtered.length} rows) ▾`}
            </button>
          </div>
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="pb-2 font-semibold text-gray-600">Quarter</th>
                <th className="pb-2 font-semibold text-gray-600 text-right">ASF</th>
                <th className="pb-2 font-semibold text-gray-600 text-right">RSF</th>
                <th className="pb-2 font-semibold text-gray-600 text-right">NSFR Ratio</th>
                <th className="pb-2 font-semibold text-gray-600 text-right">Trend</th>
              </tr>
            </thead>
            <tbody>
              {summary8.map((b, rowIdx) => (
                <tr key={b.reference_date} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="py-2 px-1 text-gray-700">{b.reference_date ? dateToQuarter(b.reference_date) : '—'}</td>
                  <td className="py-2 px-1 text-gray-500 text-right">{b.asf_amount?.toFixed(1) ?? '—'}</td>
                  <td className="py-2 px-1 text-gray-500 text-right">{b.rsf_amount?.toFixed(1) ?? '—'}</td>
                  <td className={`py-2 px-1 font-semibold text-right ${b.nsfr_ratio != null && b.nsfr_ratio >= 100 ? 'text-indigo-700' : 'text-red-600'}`}>
                    {b.nsfr_ratio?.toFixed(1) ?? '—'}%
                  </td>
                  <td className="py-2 px-1 text-right">
                    <Sparkline values={sparkValues} highlightIdx={sparkValues.length - 1 - rowIdx} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {showFull && (
            <div className="mt-6 border-t border-gray-100 pt-4">
              <p className="text-xs text-gray-400 mb-3">All {filtered.length} observations — newest first</p>
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="pb-2 font-semibold text-gray-600">Quarter</th>
                    <th className="pb-2 font-semibold text-gray-600 text-right">ASF</th>
                    <th className="pb-2 font-semibold text-gray-600 text-right">RSF</th>
                    <th className="pb-2 font-semibold text-gray-600 text-right">NSFR Ratio</th>
                  </tr>
                </thead>
                <tbody>
                  {[...filtered].reverse().map((b, i) => (
                    <tr key={b.reference_date} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="py-1.5 px-1 text-gray-700">{b.reference_date ? dateToQuarter(b.reference_date) : '—'}</td>
                      <td className="py-1.5 px-1 text-gray-500 text-right">{b.asf_amount?.toFixed(1) ?? '—'}</td>
                      <td className="py-1.5 px-1 text-gray-500 text-right">{b.rsf_amount?.toFixed(1) ?? '—'}</td>
                      <td className={`py-1.5 px-1 font-semibold text-right ${b.nsfr_ratio != null && b.nsfr_ratio >= 100 ? 'text-indigo-700' : 'text-red-600'}`}>
                        {b.nsfr_ratio?.toFixed(1) ?? '—'}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
