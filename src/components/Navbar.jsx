import { useState } from 'react';

/**
 * Navbar — Top navigation bar with tab switching.
 * Tabs: Dashboard | Pomodoro Timer
 */
export default function Navbar({ activeTab, setActiveTab }) {
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: '📋' },
    { id: 'pomodoro', label: 'Pomodoro', icon: '⏱️' },
  ];

  return (
    <nav className="sticky top-0 z-50 glass-card rounded-none border-x-0 border-t-0 px-4 sm:px-6 py-3">
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-purple-600 flex items-center justify-center text-lg shadow-lg shadow-primary-500/20">
            🎓
          </div>
          <div>
            <h1 className="text-base font-bold text-white leading-tight tracking-tight">
              Smart Student Reminder
            </h1>
            <p className="text-[0.65rem] text-surface-200/60 font-medium tracking-wider uppercase">
              Stay focused · Stay ahead
            </p>
          </div>
        </div>

        {/* Desktop Tabs */}
        <div className="hidden sm:flex items-center gap-1 bg-surface-900/60 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 cursor-pointer ${activeTab === tab.id
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'text-surface-200/70 hover:text-white hover:bg-white/5'
                }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Mobile menu button */}
        <button
          id="mobile-menu-toggle"
          className="sm:hidden text-surface-200 hover:text-white transition p-2 cursor-pointer"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden mt-3 flex flex-col gap-1 animate-fade-in">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setMenuOpen(false);
              }}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${activeTab === tab.id
                ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30'
                : 'text-surface-200/70 hover:bg-white/5'
                }`}
            >
              <span className="text-lg">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
