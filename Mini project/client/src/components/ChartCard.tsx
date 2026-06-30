import { useState } from 'react'
import type { ReactNode } from 'react'
import { Info, ChevronDown, ChevronUp } from 'lucide-react'

interface Props {
  title: string
  description?: string
  interpretation?: string
  children: ReactNode
  delay?: number
}

export function ChartCard({ title, description, interpretation, children, delay = 0 }: Props) {
  const [showInterp, setShowInterp] = useState(false)

  return (
    <div className="chart-card animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="chart-header">
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-text)', marginBottom: 4 }}>{title}</h3>
            {description && (
              <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{description}</p>
            )}
          </div>
        </div>

        {interpretation && (
          <button
            onClick={() => setShowInterp(s => !s)}
            style={{ display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-blue)', fontSize: 12, fontWeight: 500, padding: '4px 8px', borderRadius: 6, marginTop: 8 }}
          >
            <Info size={13} />
            Business Insight
            {showInterp ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>
        )}

        {showInterp && interpretation && (
          <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--color-blue-light)', borderRadius: 8, fontSize: 12, color: 'var(--color-blue)', lineHeight: 1.6 }}>
            {interpretation}
          </div>
        )}
      </div>
      <div className="chart-body">
        {children}
      </div>
    </div>
  )
}
