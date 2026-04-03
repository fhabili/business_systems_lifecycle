import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine,
  ResponsiveContainer, Brush,
} from 'recharts'
import { LcrTooltip } from './RatioTooltips'
import { useIsMobile } from '../../hooks'

interface DataPoint { quarter: string; lcr_ratio: number | null }

interface LcrTrendChartProps {
  data: DataPoint[]
  showBrush: boolean
  rangeYears?: number
}

export function LcrTrendChart({ data, showBrush, rangeYears }: LcrTrendChartProps) {
  const isMobile = useIsMobile()
  void rangeYears

  const yearSeen = new Set<string>()
  const yearTicks = data
    .filter(d => {
      const year = d.quarter.slice(0, 4)
      if (yearSeen.has(year)) return false
      yearSeen.add(year)
      return true
    })
    .map(d => d.quarter)

  const validValues = data.map(d => d.lcr_ratio).filter((v): v is number => v != null)
  const dMax = validValues.length ? Math.max(...validValues) : 200

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 280 : 260}>
      <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: showBrush ? 24 : 20 }}>
        <defs>
          <linearGradient id="lcrFill2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2563EB" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="quarter" ticks={yearTicks} tickFormatter={q => q.slice(0, 4)} tick={{ fontSize: 11 }} />
        <YAxis domain={[90, 'dataMax + 10']} ticks={[100, Math.round(dMax)]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} />
        <Tooltip content={<LcrTooltip />} />
        <ReferenceLine y={100} stroke="#EF4444" strokeDasharray="5 3" strokeWidth={2} />
        <ReferenceLine x="Q1 2020" stroke="#9CA3AF" strokeDasharray="4 3" strokeWidth={1.5}
          label={{ value: 'COVID-19 Relief', position: 'insideTopRight', fontSize: 8, fill: '#6B7280' }} />
        <ReferenceLine x="Q1 2022" stroke="#9CA3AF" strokeDasharray="4 3" strokeWidth={1.5} />
        <Area type="monotone" dataKey="lcr_ratio" stroke="#2563EB" fill="url(#lcrFill2)" strokeWidth={2} dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: '#2563EB' }} />
        {showBrush && <Brush dataKey="quarter" height={24} stroke="#2563EB" travellerWidth={8} fill="#EFF6FF" />}
      </AreaChart>
    </ResponsiveContainer>
  )
}
