import type { ReactNode } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency, formatNumber } from '../utils/formatters'

interface Props {
  label: string
  value: number | string
  icon: ReactNode
  format?: 'currency' | 'number' | 'pct' | 'string'
  trend?: number
  description?: string
  color?: string
  delay?: number
}

export function KPICard({ label, value, icon, format = 'string', trend, description, color = 'var(--color-blue)', delay = 0 }: Props) {
  const displayValue = () => {
    if (typeof value === 'string') return value
    if (format === 'currency') return formatCurrency(value)
    if (format === 'number') return formatNumber(value)
    if (format === 'pct') return `${value.toFixed(1)}%`
    return value.toString()
  }

  const TrendIcon = trend === undefined ? null : trend > 0 ? TrendingUp : trend < 0 ? TrendingDown : Minus
  const trendColor = trend === undefined ? '' : trend > 0 ? 'var(--color-green)' : trend < 0 ? 'var(--color-red)' : 'var(--color-text-muted)'

  return (
    <div className="kpi-card animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10,
          background: `${color}18`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: color,
        }}>
          {icon}
        </div>
        {TrendIcon && trend !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: trendColor, fontSize: 12, fontWeight: 600 }}>
            <TrendIcon size={13} />
            {Math.abs(trend).toFixed(1)}%
          </div>
        )}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--color-text)', letterSpacing: '-0.02em', lineHeight: 1 }}>
        {displayValue()}
      </div>
      <div style={{ marginTop: 6, fontSize: 13, fontWeight: 500, color: 'var(--color-text-muted)' }}>{label}</div>
      {description && (
        <div style={{ marginTop: 4, fontSize: 11, color: 'var(--color-text-subtle)' }}>{description}</div>
      )}
    </div>
  )
}
