import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea, ResponsiveContainer, Brush,
} from 'recharts'
import { NsfrTooltip } from './RatioTooltips'
import { useIsMobile } from '../../hooks'

interface DataPoint { quarter: string; nsfr_ratio: number | null }

interface NsfrTrendChartProps {
  data: DataPoint[]
  rangeYears: number
  showBrush?: boolean
}

export function NsfrTrendChart({ data, rangeYears, showBrush = false }: NsfrTrendChartProps) {
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

  const validValues = data.map(d => d.nsfr_ratio).filter((v): v is number => v != null)
  const dMax = validValues.length ? Math.max(...validValues) : 200

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 280 : 260}>
      <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: showBrush ? 24 : 20 }}>
        <defs>
          <linearGradient id="nsfrFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#2563EB" stopOpacity={0.18} />
            <stop offset="95%" stopColor="#2563EB" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="quarter" ticks={yearTicks} tickFormatter={q => q.slice(0, 4)} tick={{ fontSize: 11 }} />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          domain={[90, 'dataMax + 10']}
          ticks={[100, Math.round(dMax)]}
          tick={{ fontSize: 11 }}
          width={60}
        />
        <Tooltip content={<NsfrTooltip />} />
        <ReferenceLine y={100} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={2} />
        <ReferenceArea x1="2020 Q1" x2="2020 Q3" fill="#FEF9C3" fillOpacity={0.5} />
        <ReferenceLine x="2020 Q1" stroke="#9CA3AF" strokeDasharray="4 3" strokeWidth={1.5} />
        <Area type="monotone" dataKey="nsfr_ratio" stroke="#2563EB" fill="url(#nsfrFill)" strokeWidth={2} dot={false}
          activeDot={{ r: 4, strokeWidth: 0, fill: '#2563EB' }} />
        {showBrush && <Brush dataKey="quarter" height={24} stroke="#2563EB" travellerWidth={8} fill="#EFF6FF" />}
      </AreaChart>
    </ResponsiveContainer>
  )
}
