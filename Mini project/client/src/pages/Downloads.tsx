import { useNavigate } from 'react-router-dom'
import { Download, FileText, Table2, FileBarChart2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useAnalysis } from '../context/AnalysisContext'
import { getDownloadUrl } from '../services/api'

interface DownloadItemProps {
  title: string
  description: string
  icon: any
  buttonLabel: string
  color: string
  onClick: () => void
  disabled?: boolean
}

function DownloadItem({ title, description, icon: Icon, buttonLabel, color, onClick, disabled }: DownloadItemProps) {
  return (
    <div className="card" style={{ padding: '28px 32px', display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ width: 56, height: 56, borderRadius: 14, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        <Icon size={24} color={color} />
      </div>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--color-text)', marginBottom: 4 }}>{title}</div>
        <div style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{description}</div>
      </div>
      <button
        className="btn btn-primary"
        onClick={onClick}
        disabled={disabled}
        style={{ background: color }}
      >
        <Download size={15} />
        {buttonLabel}
      </button>
    </div>
  )
}

export function Downloads() {
  const { analysis, sessionId } = useAnalysis()
  const navigate = useNavigate()

  if (!analysis || !sessionId) {
    return (
      <main className="main-content" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <Download size={48} color="var(--color-text-muted)" style={{ margin: '0 auto 16px' }} />
          <h2 style={{ marginBottom: 12 }}>No Downloads Available</h2>
          <button className="btn btn-primary" onClick={() => navigate('/')}>Upload Dataset</button>
        </div>
      </main>
    )
  }

  const download = (type: 'cleaned-csv' | 'forecast-csv' | 'pdf', label: string) => {
    const url = getDownloadUrl(sessionId, type)
    const a = document.createElement('a')
    a.href = url
    a.download = ''
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    toast.success(`${label} download started!`)
  }

  return (
    <main className="main-content" style={{ paddingBottom: 48 }}>
      <div className="page-header">
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Downloads</h1>
        <p style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>Export your analysis results and reports</p>
      </div>
      <div className="page-body">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 720 }}>
          <DownloadItem
            title="Cleaned Dataset"
            description="The fully cleaned and processed dataset in CSV format, ready for use in other tools."
            icon={Table2}
            buttonLabel="Download CSV"
            color="var(--color-green)"
            onClick={() => download('cleaned-csv', 'Cleaned dataset')}
          />
          <DownloadItem
            title="Forecast Data"
            description={`${analysis.forecast?.forecast_table?.length ?? 30}-day sales forecast with confidence intervals in CSV format.`}
            icon={FileText}
            buttonLabel="Download CSV"
            color="var(--color-blue)"
            onClick={() => download('forecast-csv', 'Forecast data')}
          />
          <DownloadItem
            title="Full PDF Report"
            description="Professional analytics report including KPIs, cleaning summary, ML comparison, forecasts, and AI insights."
            icon={FileBarChart2}
            buttonLabel="Download PDF"
            color="#8b5cf6"
            onClick={() => download('pdf', 'PDF report')}
          />
        </div>

        {/* What's included */}
        <div className="card" style={{ marginTop: 32, maxWidth: 720, padding: 28 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>What's Included in the PDF Report</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              'Cover page with session info',
              'Dataset summary & date range',
              'Data cleaning report',
              'Key performance indicators (KPIs)',
              'ML model comparison table',
              'Best model selection rationale',
              `${analysis.forecast?.horizon_days ?? 30}-day forecast table`,
              'Growth projections',
              'AI business insights',
              'Strategic recommendations',
              'Professional ReportLab formatting',
              'Session ID watermark',
            ].map(item => (
              <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle size={13} color="var(--color-green)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
