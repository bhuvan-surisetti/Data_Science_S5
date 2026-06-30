import { useNavigate } from 'react-router-dom'
import { Table2, Database } from 'lucide-react'
import { useAnalysis } from '../context/AnalysisContext'
import { dtypeLabel, dtypeColor } from '../utils/formatters'

export function DatasetPreview() {
  const { uploadResult } = useAnalysis()
  const navigate = useNavigate()

  const prev = uploadResult?.preview
  if (!prev) {
    return (
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Table2 size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: 12 }}>No Dataset Loaded</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Upload Dataset</button>
        </div>
      </main>
    )
  }


  const head = prev.head || []
  const cols = prev.column_names || []

  return (
    <main className="main-content" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Dataset Preview</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{prev.filename}</p>
      </div>

      <div className="page-body">
        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
          {[
            { label: 'Total Rows', value: prev.rows.toLocaleString(), icon: Database },
            { label: 'Columns', value: prev.columns.toString(), icon: Table2 },
            { label: 'Memory', value: prev.memory_usage, icon: Database },
            { label: 'Date Range', value: prev.date_range, icon: Database },
          ].map(({ label, value }) => (
            <div key={label} className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--color-text)', marginBottom: 4 }}>{value}</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 500 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Column types */}
        <div className="card" style={{ marginBottom: 24, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Column Schema</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {cols.map((col: string) => {
              const dtype = prev.dtypes?.[col] || 'object'
              const nulls = prev.null_counts?.[col] || 0
              return (
                <div key={col} style={{ padding: '8px 14px', borderRadius: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text)' }}>{col}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-text-subtle)', marginTop: 2 }}>
                      {nulls > 0 && <span style={{ color: 'var(--color-amber)' }}>{nulls} nulls</span>}
                    </div>
                  </div>
                  <span className={`badge ${dtypeColor(dtype)}`}>{dtypeLabel(dtype)}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Data table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h3 style={{ fontSize: 15, fontWeight: 700 }}>First 15 Rows</h3>
            <span className="badge badge-gray">Raw Data</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ minWidth: 40 }}>#</th>
                  {cols.map((c: string) => <th key={c} style={{ minWidth: 120 }}>{c}</th>)}
                </tr>
              </thead>
              <tbody>
                {head.map((row: any, i: number) => (
                  <tr key={i}>
                    <td style={{ color: 'var(--color-text-subtle)', fontSize: 11 }}>{i + 1}</td>
                    {cols.map((c: string) => (
                      <td key={c} style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {row[c] ?? '—'}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  )
}
