import { Shield, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useIsMobile } from '../hooks'

export default function Home({ onEnter }: { onEnter: () => void }) {
  const isMobile = useIsMobile()
  const pages = isMobile
    ? ALL_CARDS.map(c => [c])
    : [ALL_CARDS.slice(0, 3), ALL_CARDS.slice(3, 6)]
  const totalPages = pages.length

  const [pageIdx, setPageIdx] = useState(0)

  // Reset to first page when layout mode changes
  useEffect(() => { setPageIdx(0) }, [isMobile])

  // Auto-advance — fresh closure each time totalPages changes
  useEffect(() => {
    const id = setInterval(() => setPageIdx(p => (p + 1) % totalPages), 4000)
    return () => clearInterval(id)
  }, [totalPages])

  function goTo(i: number) {
    setPageIdx(((i % totalPages) + totalPages) % totalPages)
  }

  const visibleCards = pages[pageIdx] ?? pages[0]
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-16 pb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] mb-5" style={{ color: '#1B2A4A' }}>
          Basel III Regulatory Intelligence
        </p>
        <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight" style={{ color: '#1B2A4A' }}>
          Risk. Intelligence. Control.
        </h1>
        <p className="mt-5 text-base md:text-lg leading-relaxed max-w-2xl mx-auto" style={{ color: '#4B5563' }}>
          A Basel III regulatory reporting system built on real ECB and Bundesbank data
          — covering 1 million+ records across the EU banking sector.
        </p>

        {/* subtle icon divider */}
        <div className="flex items-center justify-center gap-4 mt-8 mb-8">
          <div className="h-px w-20 bg-gray-200" />
          <Shield className="w-4 h-4" style={{ color: '#CBD5E1' }} />
          <div className="h-px w-20 bg-gray-200" />
        </div>

        <button
          onClick={onEnter}
          className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ backgroundColor: '#1B2A4A' }}
          onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.2)')}
          onMouseLeave={e => (e.currentTarget.style.filter = '')}
        >
          Enter Dashboard
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </section>

      {/* Divider */}
      <div className="max-w-4xl mx-auto px-6">
        <div className="border-t border-gray-100" />
      </div>

      {/* Unified carousel — 6 cards */}
      <section className="max-w-4xl mx-auto px-6 py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] mb-8" style={{ color: '#9CA3AF' }}>
          What This System Does
        </p>

        <div className="relative">
          {/* Cards — 3-column grid on desktop, single column on mobile */}
          <div
            key={pageIdx}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            style={{ animation: 'fadeSlide 0.35s ease' }}
          >
            {visibleCards.map(card => (
              <div
                key={card.label}
                className="rounded-xl border p-6 flex flex-col gap-3"
                style={{ borderColor: '#E2E8F0' }}
              >
                <span
                  className="self-start text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: card.tagBg, color: card.tagColor }}
                >
                  {card.tag}
                </span>
                <h3 className="text-base font-bold" style={{ color: '#1B2A4A' }}>{card.label}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#6B7280' }}>{card.body}</p>
              </div>
            ))}
          </div>

          {/* Prev / Next */}
          <div className="flex items-center justify-between mt-5">
            <button
              onClick={() => goTo(pageIdx - 1)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            {/* Dots */}
            <div className="flex gap-1.5">
              {pages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goTo(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width:  i === pageIdx ? 20 : 6,
                    height: 6,
                    backgroundColor: i === pageIdx ? '#1B2A4A' : '#E2E8F0',
                  }}
                  aria-label={`Go to page ${i + 1}`}
                />
              ))}
            </div>

            <button
              onClick={() => goTo(pageIdx + 1)}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-400 hover:text-gray-700 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto px-6 pb-12 text-center">
        <p className="text-xs" style={{ color: '#9CA3AF' }}>
          Data Source: ECB Statistical Data Warehouse &amp; Deutsche Bundesbank BISTA.
        </p>
      </footer>
    </div>
  )
}

const ALL_CARDS = [
  {
    tag: 'System Capability', tagBg: '#EFF6FF', tagColor: '#3B72C4',
    label: 'Strategic Compliance',
    body: 'Execute forward-looking LCR and NSFR simulations. Transition from static historical reporting to dynamic liquidity forecasting using a high-performance Pro-Forma engine.',
  },
  {
    tag: 'System Capability', tagBg: '#EFF6FF', tagColor: '#3B72C4',
    label: 'Governance & Integrity',
    body: 'Eliminate silent data corruption with an automated validation layer. Monitor real-time data health scores and audit failed records directly within the Governance terminal.',
  },
  {
    tag: 'System Capability', tagBg: '#EFF6FF', tagColor: '#3B72C4',
    label: 'End-to-End Lineage',
    body: 'Establish absolute data certainty. Achieve 1:1 traceability from raw ECB/BISTA source files through every transformation stage to the final executive metric.',
  },
  {
    tag: 'Who Is This For', tagBg: '#F0FDF4', tagColor: '#2D8A6A',
    label: 'For Risk Leaders',
    body: 'Modernize the reporting pipeline by replacing manual extraction with automated, auditable workflows that ensure Basel III compliance at scale.',
  },
  {
    tag: 'Who Is This For', tagBg: '#F0FDF4', tagColor: '#2D8A6A',
    label: 'For Compliance Analysts',
    body: 'Instantly respond to regulatory inquiries with drill-down transparency, bridging the gap between aggregate metrics and raw source data.',
  },
  {
    tag: 'Who Is This For', tagBg: '#F0FDF4', tagColor: '#2D8A6A',
    label: 'For Systems Architects',
    body: 'Deploy a robust full-stack architecture featuring SQL-driven validation, Python processing, and a high-performance React intelligence layer.',
  },
]
