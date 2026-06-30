import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Activity, ArrowRight, BarChart2, Brain, TrendingUp, Zap, FlaskConical } from 'lucide-react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { UploadZone } from '../components/UploadZone'
import { ProgressBar } from '../components/ProgressBar'
import { useAnalysis } from '../context/AnalysisContext'
import { uploadFile, uploadSample, analyzeDataset } from '../services/api'

const FEATURES = [
  { icon: BarChart2, label: 'Interactive Charts', desc: '15+ Plotly visualizations' },
  { icon: Brain, label: 'ML Forecasting', desc: '6 regression models compared' },
  { icon: TrendingUp, label: 'Smart Insights', desc: 'AI-generated business observations' },
  { icon: Zap, label: 'Instant Analysis', desc: 'Results in seconds' },
]

export function Landing() {
  const navigate = useNavigate()
  const { setSessionId, setUploadResult, setAnalysis, setStatus, setError, setProgress, status, progress, progressLabel } = useAnalysis()
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  const isLoading = status === 'uploading' || status === 'analyzing'

  const runAnalysis = async (sessionId: string) => {
    const steps = [
      { pct: 15, label: 'Validating schema…' },
      { pct: 30, label: 'Cleaning data…' },
      { pct: 45, label: 'Engineering features…' },
      { pct: 60, label: 'Running EDA…' },
      { pct: 75, label: 'Training ML models…' },
      { pct: 88, label: 'Generating forecasts…' },
      { pct: 95, label: 'Creating AI insights…' },
    ]

    let stepIdx = 0
    const interval = setInterval(() => {
      if (stepIdx < steps.length) {
        setProgress(steps[stepIdx].pct, steps[stepIdx].label)
        stepIdx++
      }
    }, 800)

    try {
      const res = await analyzeDataset(sessionId)
      clearInterval(interval)
      setProgress(100, 'Analysis complete!')
      setAnalysis(res.data)
      setStatus('done')
      toast.success('Analysis complete! Redirecting to dashboard…')
      setTimeout(() => navigate('/app/dashboard'), 1000)
    } catch (err: any) {
      clearInterval(interval)
      const msg = err?.response?.data?.detail || 'Analysis failed. Please try again.'
      setError(msg)
      setStatus('error')
      toast.error(msg)
    }
  }

  const handleFile = (f: File) => setFile(f)

  const handleAnalyze = async () => {
    if (!file) { toast.error('Please select a file first.'); return }
    setStatus('uploading')
    setError(null)
    setProgress(5, 'Uploading file…')

    try {
      const res = await uploadFile(file, (pct) => setUploadProgress(pct))
      const data = res.data
      if (!data.valid) {
        setStatus('error')
        setError(data.errors?.join('\n') || 'Validation failed.')
        toast.error(data.errors?.[0] || 'Validation failed.')
        return
      }
      setUploadResult(data)
      setSessionId(data.session_id)
      setProgress(10, 'Upload complete. Starting analysis…')
      setStatus('analyzing')
      if (data.warnings?.length) toast(data.warnings[0], { icon: '⚠️' })
      await runAnalysis(data.session_id)
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Upload failed.'
      setError(msg)
      setStatus('error')
      toast.error(msg)
    }
  }

  const handleSample = async () => {
    setStatus('uploading')
    setProgress(8, 'Loading sample dataset…')
    try {
      const res = await uploadSample()
      const data = res.data
      setUploadResult(data)
      setSessionId(data.session_id)
      setProgress(12, 'Sample loaded. Starting analysis…')
      setStatus('analyzing')
      toast.success('Sample dataset loaded!')
      await runAnalysis(data.session_id)
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Failed to load sample.'
      setError(msg)
      setStatus('error')
      toast.error(msg)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column' }}>
      {/* Navbar */}
      <nav style={{ padding: '20px 48px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-border)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg, #2563eb, #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Activity size={16} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: 18, color: 'var(--color-text)' }}>SalesVision <span style={{ color: 'var(--color-blue)' }}>AI</span></span>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-ghost btn-sm" onClick={handleSample} disabled={isLoading}>
            <FlaskConical size={14} /> Try Sample Dataset
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/app/dashboard')}>
            Go to Dashboard <ArrowRight size={14} />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 24px 60px', maxWidth: 800, margin: '0 auto', width: '100%' }}>
        {/* Badge */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <span className="badge badge-blue" style={{ marginBottom: 24, fontSize: 12, padding: '6px 14px' }}>
            <Zap size={11} /> Powered by Machine Learning
          </span>
        </div>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          style={{ fontSize: 'clamp(40px, 6vw, 72px)', fontWeight: 800, color: 'var(--color-text)', textAlign: 'center', letterSpacing: '-0.03em', lineHeight: 1.05, marginBottom: 20 }}
        >
          SalesVision <span style={{ background: 'linear-gradient(135deg, #2563eb, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          style={{ fontSize: 18, color: 'var(--color-text-muted)', textAlign: 'center', maxWidth: 560, lineHeight: 1.7, marginBottom: 48 }}
        >
          Upload your historical sales data and receive <strong>forecasts</strong>, <strong>business insights</strong>, and <strong>interactive analytics</strong> within seconds.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 48 }}
        >
          {FEATURES.map(({ icon: Icon, label }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 99, background: 'var(--color-surface)', border: '1px solid var(--color-border)', fontSize: 12, fontWeight: 500, color: 'var(--color-text-muted)' }}>
              <Icon size={12} color="var(--color-blue)" />{label}
            </div>
          ))}
        </motion.div>

        {/* Upload card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          style={{ width: '100%' }}
        >
          <div className="card" style={{ padding: 32 }}>
            <UploadZone
              onFile={handleFile}
              uploading={status === 'uploading'}
              progress={uploadProgress}
            />

            {isLoading && (
              <div style={{ marginTop: 24 }}>
                <ProgressBar progress={progress} label={progressLabel} status={status} />
              </div>
            )}

            {!isLoading && (
              <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
                <button
                  className="btn btn-primary btn-lg"
                  style={{ flex: 1 }}
                  onClick={handleAnalyze}
                  disabled={!file || isLoading}
                >
                  <BarChart2 size={18} />
                  Analyze Dataset
                  <ArrowRight size={16} />
                </button>
                <button
                  className="btn btn-secondary"
                  onClick={handleSample}
                  disabled={isLoading}
                  title="Use the built-in sample dataset"
                >
                  <FlaskConical size={16} />
                  Try Sample
                </button>
              </div>
            )}
          </div>
        </motion.div>

        {/* Feature grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginTop: 48, width: '100%' }}>
          {FEATURES.map(({ icon: Icon, label, desc }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.08 }}
              className="card-surface"
              style={{ padding: '20px 24px', display: 'flex', alignItems: 'flex-start', gap: 14 }}
            >
              <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--color-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon size={18} color="var(--color-blue)" />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text)', marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{desc}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
