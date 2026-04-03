import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts'

interface DataPoint { quarter: string; hqla: number | null; outflow: number | null }

export function HqlaBarChart({ data }: { data: DataPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} barCategoryGap="30%">
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="quarter" tick={{ fontSize: 10 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip
          formatter={(value: number, name: string) => [`€${value.toFixed(1)}B`, name]}
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e5e7eb', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
          labelStyle={{ fontWeight: 600, color: '#374151', marginBottom: 4 }}
        />
        <Legend />
        <Bar dataKey="hqla" name="HQLA Buffer" fill="#1B2A4A" radius={[4, 4, 0, 0]} />
        <Bar dataKey="outflow" name="Net Outflow" fill="#64748B" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
