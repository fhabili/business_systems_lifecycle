import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ReferenceArea,
  ResponsiveContainer, Brush,
} from 'recharts'
import { LcrTooltip } from '../charts/RatioTooltips'
import { useIsMobile } from '../../hooks'

interface DataPoint { period: string; lcr_ratio: number }

interface ExecutiveLcrChartProps {
  data: DataPoint[]
  showBrush: boolean
}

export function ExecutiveLcrChart({ data, showBrush }: ExecutiveLcrChartProps) {
  const isMobile = useIsMobile()
  if (!data.length) return null

  // Compute one tick per year: first Q1 (or first data point of each year) for clean annual labels
  const yearSeen = new Set<string>()
  const yearTicks = data
    .filter(d => {
      const year = d.period.slice(0, 4)
      if (yearSeen.has(year)) return false
      yearSeen.add(year)
      return true
    })
    .map(d => d.period)

  const validValues = data.map(d => d.lcr_ratio).filter((v): v is number => v != null)
  const dMax = validValues.length ? Math.max(...validValues) : 200

  return (
    <ResponsiveContainer width="100%" height={isMobile ? 280 : 380}>
      <AreaChart
        data={data}
        margin={{ top: 20, right: 0, left: 12, bottom: showBrush ? 44 : 20 }}
      >
        <defs>
          <linearGradient id="lcrFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="period"
          ticks={yearTicks}
          tickFormatter={p => p.slice(0, 4)}
          tick={{ fontSize: 11 }}
        />
        <YAxis
          tickFormatter={(v) => `${v}%`}
          domain={[90, 'dataMax + 10']}
          ticks={[100, Math.round(dMax)]}
          tick={{ fontSize: 11 }}
          width={60}
        />
        <Tooltip content={<LcrTooltip />} />
        <ReferenceLine y={100} stroke="#EF4444" strokeDasharray="3 3" strokeWidth={2}
          label={{ value: '100% min', position: 'right', fontSize: 9, fill: '#EF4444' }} />
        <ReferenceArea x1="2020Q1" x2="2020Q3" fill="#FEF9C3" fillOpacity={0.5}
          label={({ viewBox }: any) => (
            <text x={viewBox.x + 4} y={viewBox.y + 10} fontSize={9} fill="#92400E">
              <tspan x={viewBox.x + 4} dy="0">COVID-19</tspan>
              <tspan x={viewBox.x + 4} dy="12">Impact</tspan>
            </text>
          )} />
        <ReferenceArea x1="2022Q1" x2="2022Q3" fill="#FEE2E2" fillOpacity={0.45}
          label={({ viewBox }: any) => (
            <text x={viewBox.x + 4} y={viewBox.y + 10} fontSize={9} fill="#6B7280">
              <tspan x={viewBox.x + 4} dy="0">Geopolitical</tspan>
              <tspan x={viewBox.x + 4} dy="12">Shock</tspan>
            </text>
          )} />
        <Area
          type="monotone"
          dataKey="lcr_ratio"
          stroke="#10b981"
          fill="url(#lcrFill)"
          strokeWidth={3}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 0 }}
        />
        {showBrush && (
          <Brush dataKey="period" height={24} stroke="#10b981" travellerWidth={8} fill="#f0fdf4" />
        )}
      </AreaChart>
    </ResponsiveContainer>
  )
}
