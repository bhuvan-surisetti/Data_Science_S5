import { createContext, useContext, useState, useCallback } from 'react'
import type { ReactNode } from 'react'

export interface ModelResult {
  model: string
  mae?: number
  mse?: number
  rmse?: number
  r2?: number
  training_time_s?: number
  error?: string
}

export interface AnalysisResult {
  preview: {
    rows: number
    columns: number
    column_names: string[]
    dtypes: Record<string, string>
    memory_usage: string
    date_range: string
  }
  kpis: Record<string, any>
  cleaning: {
    before: Record<string, any>
    after: Record<string, any>
    actions: string[]
  }
  feature_columns: string[]
  summaries: Record<string, any>
  charts: Record<string, any>
  ml: {
    results: ModelResult[]
    best_model_name: string
    best_r2: number
    feature_importance: Array<{ feature: string; importance: number }>
  }
  forecast: {
    horizon_days: number
    forecast_table: Array<{ date: string; forecast: number; lower_ci: number; upper_ci: number }>
    total_forecast: number
    avg_daily_forecast: number
    growth_pct_vs_recent: number
    historical: Array<{ date: string; sales: number }>
  }
  insights: {
    insights: Array<{
      id: string
      type: string
      severity: string
      icon: string
      title: string
      text: string
    }>
    recommendations: string[]
    insight_count: number
    recommendation_count: number
  }
}

export interface UploadResult {
  session_id: string
  valid: boolean
  warnings: string[]
  detected_columns: Record<string, string>
  preview: {
    filename: string
    rows: number
    columns: number
    column_names: string[]
    dtypes: Record<string, string>
    memory_usage: string
    date_range: string
    head: Array<Record<string, string>>
    null_counts: Record<string, number>
  }
}

type AnalysisStatus = 'idle' | 'uploading' | 'analyzing' | 'done' | 'error'

interface AnalysisContextValue {
  sessionId: string | null
  uploadResult: UploadResult | null
  analysis: AnalysisResult | null
  status: AnalysisStatus
  error: string | null
  progress: number
  progressLabel: string
  setSessionId: (id: string) => void
  setUploadResult: (r: UploadResult) => void
  setAnalysis: (a: AnalysisResult) => void
  setStatus: (s: AnalysisStatus) => void
  setError: (e: string | null) => void
  setProgress: (p: number, label?: string) => void
  reset: () => void
}

const AnalysisContext = createContext<AnalysisContextValue | null>(null)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [status, setStatus] = useState<AnalysisStatus>('idle')
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgressState] = useState(0)
  const [progressLabel, setProgressLabel] = useState('')

  const setProgress = useCallback((p: number, label?: string) => {
    setProgressState(p)
    if (label) setProgressLabel(label)
  }, [])

  const reset = useCallback(() => {
    setSessionId(null)
    setUploadResult(null)
    setAnalysis(null)
    setStatus('idle')
    setError(null)
    setProgressState(0)
    setProgressLabel('')
  }, [])

  return (
    <AnalysisContext.Provider value={{
      sessionId, uploadResult, analysis, status, error, progress, progressLabel,
      setSessionId, setUploadResult, setAnalysis, setStatus, setError, setProgress, reset,
    }}>
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysis() {
  const ctx = useContext(AnalysisContext)
  if (!ctx) throw new Error('useAnalysis must be used within AnalysisProvider')
  return ctx
}
