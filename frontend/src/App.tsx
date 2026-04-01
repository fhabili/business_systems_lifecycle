import { useState } from 'react'
import ExecutiveSummary from './pages/ExecutiveSummary'
import LCRDetail from './pages/LCRDetail'
import NSFRDetail from './pages/NSFRDetail'
import DataQuality from './pages/DataQuality'
import DataLineage from './pages/DataLineage'
import SystemArchitecture from './pages/SystemArchitecture'

const tabs = [
  { id: 'summary', label: 'Executive Summary' },
  { id: 'lcr', label: 'LCR Detail' },
  { id: 'nsfr', label: 'NSFR Detail' },
  { id: 'quality', label: 'Data Quality' },
  { id: 'lineage', label: 'Data Lineage' },
  { id: 'architecture', label: 'System Architecture' },
]

function App() {
  const [activeTab, setActiveTab] = useState('summary')
  const [menuOpen, setMenuOpen] = useState(false)

  function navigate(id: string) {
    setActiveTab(id)
    setMenuOpen(false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-lg font-bold text-gray-900 tracking-tight">
              Liquidity Risk Reporting System
            </h1>
            <p className="text-xs text-indigo-500 font-medium mt-0.5 tracking-wide uppercase">
              Basel III Regulatory Intelligence Platform
            </p>
          </div>
          {/* hamburger — mobile only */}
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Toggle navigation"
          >
            <span className={`block w-5 h-0.5 bg-gray-700 transition-transform duration-200 ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 transition-opacity duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-gray-700 transition-transform duration-200 ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </header>

      {/* desktop nav */}
      <nav className="hidden md:block bg-white border-b border-gray-200">
        <div className="flex justify-center gap-0 max-w-6xl mx-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`relative px-5 py-4 text-sm font-medium transition-all duration-200 group ${
                activeTab === tab.id
                  ? 'text-indigo-600'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              {tab.label}
              <span
                className={`absolute bottom-0 left-0 w-full h-0.5 rounded-t transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-indigo-600 scale-x-100'
                    : 'bg-indigo-300 scale-x-0 group-hover:scale-x-75'
                }`}
              />
            </button>
          ))}
        </div>
      </nav>

      {/* mobile dropdown nav */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => navigate(tab.id)}
              className={`w-full text-left px-6 py-3.5 text-sm font-medium border-b border-gray-100 last:border-0 transition-colors ${
                activeTab === tab.id
                  ? 'text-indigo-600 bg-indigo-50'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      )}

      <main className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8">
        {activeTab === 'summary' && <ExecutiveSummary />}
        {activeTab === 'lcr' && <LCRDetail />}
        {activeTab === 'nsfr' && <NSFRDetail />}
        {activeTab === 'quality' && <DataQuality />}
        {activeTab === 'lineage' && <DataLineage />}
        {activeTab === 'architecture' && <SystemArchitecture />}
      </main>

      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-400">
            Liquidity Risk Reporting System · Basel III Regulatory Intelligence Platform · Built by Fatjon Habili
          </p>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
              System Status: Mobile Optimized
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold px-3 py-1">
              AI: Groq llama-3.3-70b
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
