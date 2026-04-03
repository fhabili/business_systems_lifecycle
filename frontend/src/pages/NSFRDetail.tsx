import { useState, useEffect, useMemo } from 'react'
import { fetchNsfr, type NsfrResponse, dateToQuarter } from '../api'
import { StatCard } from '../components/cards/StatCard'
import { Sparkline } from '../components/charts/Sparkline'
import { NsfrTrendChart } from '../components/charts/NsfrTrendChart'
import { AsfRsfBarChart } from '../components/charts/AsfRsfBarChart'

const RANGE_OPTIONS = [
  { label: '3 Y', years: 3 },
  { label: '5 Y', years: 5 },
  { label: 'All', years: 999 },
]

export default function NSFRDetail() {
  const [data, setData]             = useState<NsfrResponse | null>(null)
  const [error, setError]           = useState<string | null>(null)
  const [rangeYears, setRangeYears] = useState(999)
  const [showFull, setShowFull]     = useState(false)

  useEffect(() => {
    fetchNsfr().then(setData).catch((e: Error) => setError(e.message))
  }, [])

  function load() {
    setError(null)
    fetchNsfr().then(setData).catch((e: Error) => setError(e.message))
  }

  const chronological = useMemo(() => data ? [...data.banks].reverse() : [], [data])
  const latest = data?.banks[0] ?? null

  const filtered = useMemo(() => {
    if (rangeYears >= 999) return chronological
    const cutoff = new Date()
    cutoff.setFullYear(cutoff.getFullYear() - rangeYears)
    return chronological.filter(b => b.reference_date && new Date(b.reference_date) >= cutoff)
  }, [chronological, rangeYears])

  const summary8    = useMemo(() => [...filtered].reverse().slice(0, 8), [filtered])
  const sparkValues = useMemo(() => filtered.map(b => b.nsfr_ratio ?? 0), [filtered])

  const ratioTrend = filtered.map(b => ({
    quarter: b.reference_date ? dateToQuarter(b.reference_date) : '',
    nsfr_ratio: b.nsfr_ratio,
  }))

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
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center justify-between gap-4">
          <span><span className="font-semibold">Could not load data:</span> {error}</span>
          <button onClick={load} className="shrink-0 px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-xs font-semibold transition-colors">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard label="NSFR Ratio"
          value={latest?.nsfr_ratio != null ? `${latest.nsfr_ratio.toFixed(1)}%` : '—'}
          sub={`Latest: ${latest?.reference_date ? dateToQuarter(latest.reference_date) : '…'}`}
          highlight />
        <StatCard label="Available Stable Funding (ASF)"
          value={latest?.asf_amount != null ? `€${latest.asf_amount.toFixed(1)}B` : '—'}
          sub="ECB published index value" />
        <StatCard label="Required Stable Funding (RSF)"
          value={latest?.rsf_amount != null ? `€${latest.rsf_amount.toFixed(1)}B` : '—'}
          sub="ECB published index value" />
      </div>

      {/* Trend chart */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-800">NSFR Ratio — Quarterly Trend</h2>
          <div className="flex gap-1">
            {RANGE_OPTIONS.map(opt => (
              <button key={opt.label} onClick={() => setRangeYears(opt.years)}
                className={`px-3 py-1 text-xs rounded-md font-medium transition-colors ${rangeYears === opt.years ? 'text-white' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}
                style={rangeYears === opt.years ? { backgroundColor: '#2563EB' } : undefined}
              >{opt.label}</button>
            ))}
          </div>
        </div>
        {ratioTrend.length > 0
          ? <NsfrTrendChart data={ratioTrend} rangeYears={rangeYears} showBrush={true} />
          : <p className="text-sm text-gray-400 text-center py-10">{data ? 'No data available.' : 'Loading…'}</p>
        }
        <p className="mt-3 text-xs text-gray-400">Source: ECB Supervisory Banking Statistics. Annotations mark macro-economic events (COVID-19 Impact Q1 2020; Geopolitical Shock Q1 2022).</p>
      </div>

      {/* ASF vs RSF */}
      {fundingData.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-base font-semibold text-gray-800 mb-4">ASF vs RSF — Last 12 Quarters</h2>
          <AsfRsfBarChart data={fundingData} />
          <p className="mt-2 text-xs text-gray-400">Source: ECB Supervisory Banking Statistics. Values are ECB published indices.</p>
        </div>
      )}

      {/* Data table */}
      {filtered.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              {showFull ? `All ${filtered.length} Quarters` : 'Last 8 Quarters'}
            </h2>
            <button onClick={() => setShowFull(f => !f)} className="text-xs font-medium" style={{ color: '#2563EB' }}>
              {showFull ? 'Show less ▴' : `Show full data (${filtered.length} rows) ▾`}
            </button>
          </div>
          <div className={showFull ? 'overflow-y-auto max-h-[520px]' : ''}>
            <table className="w-full text-sm text-left">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-gray-100">
                  <th className="pb-2 font-semibold text-gray-600">Quarter</th>
                  <th className="pb-2 font-semibold text-gray-600 text-right">ASF</th>
                  <th className="pb-2 font-semibold text-gray-600 text-right">RSF</th>
                  <th className="pb-2 font-semibold text-gray-600 text-right">NSFR Ratio</th>
                  {!showFull && <th className="pb-2 font-semibold text-gray-600 text-right">Trend</th>}
                </tr>
              </thead>
              <tbody>
                {(showFull ? [...filtered].reverse() : summary8).map((b, rowIdx) => (
                  <tr key={b.reference_date} className={rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="py-2 px-1 text-gray-700">{b.reference_date ? dateToQuarter(b.reference_date) : '—'}</td>
                    <td className="py-2 px-1 text-gray-500 text-right">{b.asf_amount != null ? `€${b.asf_amount.toFixed(1)}B` : '—'}</td>
                    <td className="py-2 px-1 text-gray-500 text-right">{b.rsf_amount != null ? `€${b.rsf_amount.toFixed(1)}B` : '—'}</td>
                    <td className={`py-2 px-1 font-semibold text-right ${b.nsfr_ratio != null && b.nsfr_ratio >= 100 ? '' : 'text-red-600'}`}
                      style={b.nsfr_ratio != null && b.nsfr_ratio >= 100 ? { color: '#2563EB' } : undefined}>
                      {b.nsfr_ratio?.toFixed(1) ?? '—'}%
                    </td>
                    {!showFull && (
                      <td className="py-2 px-1" style={{ width: '9rem', minWidth: '9rem' }}>
                        <div className="flex items-center justify-end gap-2">
                          <Sparkline values={sparkValues} highlightIdx={filtered.length - 1 - rowIdx} color="#2563EB" />
                          {(() => {
                            const prev = filtered[filtered.length - 2 - rowIdx]
                            const delta = b.nsfr_ratio != null && prev?.nsfr_ratio != null ? b.nsfr_ratio - prev.nsfr_ratio : null
                            if (delta == null) return null
                            return (
                              <span className="text-xs font-semibold tabular-nums" style={{ width: '3rem', textAlign: 'right', color: delta >= 0 ? '#2563EB' : '#EF4444' }}>
                                {delta >= 0 ? '+' : ''}{delta.toFixed(1)}pp
                              </span>
                            )
                          })()}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
