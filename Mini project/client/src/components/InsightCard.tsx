import {
  TrendingUp, TrendingDown, Star, AlertTriangle, MapPin, Map,
  Tag, BarChart2, Layers, Calendar, Briefcase, Package, Info
} from 'lucide-react'

const ICON_MAP: Record<string, any> = {
  TrendingUp, TrendingDown, Star, AlertTriangle, MapPin, Map,
  Tag, BarChart2, Layers, Calendar, Briefcase, Package, Info
}

interface Insight {
  id: string
  type: 'success' | 'warning' | 'info' | 'trend'
  severity: 'high' | 'medium' | 'low'
  icon: string
  title: string
  text: string
}

interface Props { insight: Insight; delay?: number }

const TYPE_CONFIG = {
  success: { border: 'var(--color-green)', bg: '#ecfdf5', color: '#065f46', badgeBg: '#d1fae5', badge: 'Positive' },
  warning: { border: 'var(--color-amber)', bg: '#fffbeb', color: '#92400e', badgeBg: '#fef3c7', badge: 'Attention' },
  info: { border: 'var(--color-blue)', bg: 'var(--color-blue-light)', color: 'var(--color-blue)', badgeBg: '#dbeafe', badge: 'Info' },
  trend: { border: '#8b5cf6', bg: '#f5f3ff', color: '#4c1d95', badgeBg: '#ede9fe', badge: 'Trend' },
}

const SEVERITY_CONFIG = {
  high: { label: 'High Impact', color: 'var(--color-red)' },
  medium: { label: 'Medium Impact', color: 'var(--color-amber)' },
  low: { label: 'Low Impact', color: 'var(--color-text-muted)' },
}

export function InsightCard({ insight, delay = 0 }: Props) {
  const Icon = ICON_MAP[insight.icon] || Info
  const tc = TYPE_CONFIG[insight.type] || TYPE_CONFIG.info
  const sc = SEVERITY_CONFIG[insight.severity] || SEVERITY_CONFIG.low

  return (
    <div
      className={`insight-card type-${insight.type} animate-fade-in-up`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: tc.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon size={18} color={tc.border} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-text)', margin: 0 }}>{insight.title}</h4>
            <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 99, background: tc.badgeBg, color: tc.color, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {tc.badge}
            </span>
            <span style={{ fontSize: 10, fontWeight: 600, color: sc.color, marginLeft: 'auto' }}>
              {sc.label}
            </span>
          </div>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)', lineHeight: 1.6 }}>{insight.text}</p>
        </div>
      </div>
    </div>
  )
}
