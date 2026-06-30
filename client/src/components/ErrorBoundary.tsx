import { Component } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle } from 'lucide-react'

interface Props { children: ReactNode }
interface State { hasError: boolean; error: Error | null }

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap:16, padding:32, textAlign:'center' }}>
          <div style={{ width:64, height:64, borderRadius:'50%', background:'#fef2f2', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <AlertTriangle size={28} color="#ef4444" />
          </div>
          <h2 style={{ fontSize:22, fontWeight:700, color:'var(--color-text)' }}>Something went wrong</h2>
          <p style={{ color:'var(--color-text-muted)', maxWidth:480 }}>{this.state.error?.message || 'An unexpected error occurred.'}</p>
          <button className="btn btn-primary" onClick={() => { this.setState({ hasError: false, error: null }); window.location.href = '/' }}>
            Go Home
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
