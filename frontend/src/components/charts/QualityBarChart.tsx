import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'

interface BarDataPoint { name: string; passRate: number; severity: string }

export function QualityBarChart({ data }: { data: BarDataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 32, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
        <XAxis type="number" domain={[98, 100.5]} tick={{ fontSize: 11 }} unit="%" />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={52} />
        <RechartsTooltip
          formatter={(v: number) => [`${v.toFixed(2)}%`, 'Pass rate']}
          contentStyle={{ fontSize: 12, borderRadius: 8 }}
        />
        <Bar dataKey="passRate" radius={[0, 6, 6, 0]} maxBarSize={22} fill="#D97706" />
      </BarChart>
    </ResponsiveContainer>
  )
}
