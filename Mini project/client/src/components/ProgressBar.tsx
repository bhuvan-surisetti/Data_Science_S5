import { CheckCircle, Clock, Loader, XCircle } from 'lucide-react'

type StepStatus = 'pending' | 'active' | 'done' | 'error'

const STEPS = [
  'Uploading File',
  'Validating Schema',
  'Cleaning Data',
  'Engineering Features',
  'Running EDA',
  'Training ML Models',
  'Generating Forecasts',
  'Creating Insights',
]

interface Props {
  progress: number  // 0-100
  label: string
  status: 'idle' | 'uploading' | 'analyzing' | 'done' | 'error'
}

export function ProgressBar({ progress, label, status }: Props) {
  const activeStep = Math.min(Math.floor((progress / 100) * STEPS.length), STEPS.length - 1)

  const getStepStatus = (i: number): StepStatus => {
    if (status === 'error' && i === activeStep) return 'error'
    if (status === 'done') return 'done'
    if (i < activeStep) return 'done'
    if (i === activeStep) return 'active'
    return 'pending'
  }

  return (
    <div style={{ padding: '24px 0' }}>
      {/* Overall progress bar */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-text)' }}>{label}</span>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-blue)' }}>{progress}%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Step indicators */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        {STEPS.map((step, i) => {
          const s = getStepStatus(i)
          return (
            <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 10px', borderRadius: 8, background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}>
              <StepIcon status={s} />
              <span style={{ fontSize: 11, fontWeight: 500, color: s === 'pending' ? 'var(--color-text-subtle)' : 'var(--color-text)', lineHeight: 1.3 }}>
                {step}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StepIcon({ status }: { status: StepStatus }) {
  if (status === 'done') return <CheckCircle size={14} color="var(--color-green)" style={{ flexShrink: 0 }} />
  if (status === 'active') return <Loader size={14} color="var(--color-blue)" className="animate-spin" style={{ flexShrink: 0 }} />
  if (status === 'error') return <XCircle size={14} color="var(--color-red)" style={{ flexShrink: 0 }} />
  return <Clock size={14} color="var(--color-text-subtle)" style={{ flexShrink: 0 }} />
}
