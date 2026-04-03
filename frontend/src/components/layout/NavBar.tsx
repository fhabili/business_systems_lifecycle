import { Home } from 'lucide-react'

export interface Tab {
  id: string
  label: string
  accent: string
}

interface NavBarProps {
  tabs: Tab[]
  activeTab: string
  menuOpen: boolean
  onNavigate: (id: string) => void
  onToggleMenu: () => void
  onGoHome?: () => void
}

export function NavBar({ tabs, activeTab, menuOpen, onNavigate, onToggleMenu, onGoHome }: NavBarProps) {
  const activeAccent = tabs.find(t => t.id === activeTab)?.accent ?? '#6366f1'

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <button
            onClick={onGoHome}
            className="text-left group flex items-center gap-2 rounded-lg px-2 py-1 -ml-2 transition-all duration-200 hover:bg-gray-100 cursor-pointer"
            title="Back to Home"
          >
            <Home
              className="w-4 h-4 text-gray-400 shrink-0 transition-all duration-200 group-hover:text-blue-500 group-hover:-translate-x-0.5"
              aria-hidden="true"
            />
            <div>
              <h1 className="text-lg font-bold tracking-tight transition-colors duration-200 group-hover:text-blue-600" style={{ color: '#1B2A4A' }}>
                Liquidity Risk Reporting System
              </h1>
              <p className="text-xs font-medium mt-0.5 tracking-wide uppercase" style={{ color: activeAccent }}>
                Basel III Regulatory Intelligence Platform
              </p>
            </div>
          </button>
          <button
            className="md:hidden flex flex-col gap-1.5 p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={onToggleMenu}
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
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className="relative px-6 py-4 text-sm font-medium"
                style={{ color: isActive ? tab.accent : '#6B7280' }}
              >
                {tab.label}
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 w-full h-0.5 rounded-t"
                    style={{ backgroundColor: tab.accent }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </nav>

      {/* mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          {tabs.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onNavigate(tab.id)}
                className="w-full text-left px-6 py-3.5 text-sm font-medium border-b border-gray-100 last:border-0 transition-colors"
                style={{
                  color: isActive ? tab.accent : '#4B5563',
                  backgroundColor: isActive ? `${tab.accent}0D` : 'transparent',
                }}
              >
                {tab.label}
              </button>
            )
          })}
        </div>
      )}
    </>
  )
}
