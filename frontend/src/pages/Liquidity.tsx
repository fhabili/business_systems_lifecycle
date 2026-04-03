import { useState } from 'react'
import LCRDetail from './LCRDetail'
import NSFRDetail from './NSFRDetail'

const ACCENT = '#2563EB'

const SUB_TABS = [
  { id: 'lcr', label: 'LCR' },
  { id: 'nsfr', label: 'NSFR' },
] as const

type SubTab = (typeof SUB_TABS)[number]['id']

export default function Liquidity() {
  const [sub, setSub] = useState<SubTab>('lcr')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1B2A4A' }}>Liquidity</h1>
        <p className="text-sm text-gray-500 mt-1">Basel III liquidity ratios — LCR and NSFR</p>
      </div>

      {/* sub-tabs */}
      <div className="flex gap-1 border-b border-gray-200">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className="relative px-5 py-2.5 text-sm font-medium transition-colors"
            style={{ color: sub === t.id ? ACCENT : '#6B7280' }}
          >
            {t.label}
            <span
              className="absolute bottom-0 left-0 w-full h-0.5 rounded-t transition-transform duration-200 origin-center"
              style={{
                backgroundColor: ACCENT,
                transform: sub === t.id ? 'scaleX(1)' : 'scaleX(0)',
              }}
            />
          </button>
        ))}
      </div>

      {sub === 'lcr' && <LCRDetail />}
      {sub === 'nsfr' && <NSFRDetail />}
    </div>
  )
}
