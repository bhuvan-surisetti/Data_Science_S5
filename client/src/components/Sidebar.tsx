import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, Upload, Table2, Sparkles, BarChart2,
  BrainCircuit, TrendingUp, Lightbulb, Download, Settings,
  ChevronLeft, ChevronRight, Activity,
} from 'lucide-react'
import { useAnalysis } from '../context/AnalysisContext'

const NAV_ITEMS = [
  { path: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/app/upload', icon: Upload, label: 'Upload' },
  { path: '/app/preview', icon: Table2, label: 'Dataset Preview' },
  { path: '/app/cleaning', icon: Sparkles, label: 'Cleaning Report' },
  { path: '/app/eda', icon: BarChart2, label: 'EDA & Charts' },
  { path: '/app/ml', icon: BrainCircuit, label: 'Machine Learning' },
  { path: '/app/forecast', icon: TrendingUp, label: 'Forecast' },
  { path: '/app/insights', icon: Lightbulb, label: 'AI Insights' },
  { path: '/app/downloads', icon: Download, label: 'Downloads' },
  { path: '/app/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  collapsed: boolean
  setCollapsed: React.Dispatch<React.SetStateAction<boolean>>
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { analysis, status } = useAnalysis()

  const hasData = !!analysis

  return (
    <aside className={`sidebar ${collapsed ? 'sidebar-collapsed' : 'sidebar-expanded'}`}>
      {/* Logo */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: 'linear-gradient(135deg, var(--color-blue) 0%, #a855f7 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 10px rgba(99, 102, 241, 0.4)',
          }}>
            <Activity size={16} color="white" />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{
                fontWeight: 800,
                fontSize: 15,
                lineHeight: 1.2,
                background: 'linear-gradient(135deg, #ffffff 40%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.3px',
              }}>SalesVision</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 10, fontWeight: 600, letterSpacing: '0.5px', textTransform: 'uppercase' }}>AI Analytics</div>
            </div>
          )}
        </div>
      </div>

      {/* Status pill */}
      {!collapsed && status !== 'idle' && (
        <div style={{ padding: '10px 16px' }}>
          <div style={{
            padding: '6px 10px', borderRadius: 6,
            background: status === 'done' ? 'rgba(16,185,129,0.12)' : status === 'error' ? 'rgba(239,68,68,0.12)' : 'rgba(99,102,241,0.12)',
            color: status === 'done' ? '#10b981' : status === 'error' ? '#ef4444' : '#6366f1',
            fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
            border: '1px solid rgba(255, 255, 255, 0.03)',
          }}>
            <div style={{
              width: 6, height: 6, borderRadius: '50%',
              background: 'currentColor',
              animation: status === 'analyzing' ? 'pulse-ring 1.5s infinite' : 'none',
            }} />
            {status === 'done' ? 'Analysis Complete' : status === 'error' ? 'Error' : status === 'uploading' ? 'Uploading...' : 'Analyzing...'}
          </div>
        </div>
      )}

      {/* Nav */}
      <nav style={{ padding: '8px', flex: 1 }}>
        {NAV_ITEMS.map(({ path, icon: Icon, label }) => {
          const requiresData = !['upload', 'dashboard'].some(s => path.includes(s))
          const disabled = requiresData && !hasData

          return (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `sidebar-nav-item${isActive ? ' active' : ''}${disabled ? ' opacity-40' : ''}`}
              style={{ pointerEvents: disabled ? 'none' : 'auto', marginBottom: 2 }}
              title={collapsed ? label : undefined}
            >
              <Icon size={18} className="nav-icon" style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ fontSize: 13 }}>{label}</span>}
            </NavLink>
          )
        })}
      </nav>

      {/* Collapse toggle */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--color-border)' }}>
        <button
          onClick={() => setCollapsed(c => !c)}
          className="sidebar-nav-item"
          style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer' }}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span style={{ fontSize: 12 }}>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
