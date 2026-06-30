import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnalysisProvider } from './context/AnalysisContext'
import { Sidebar } from './components/Sidebar'
import { Landing } from './pages/Landing'
import { Dashboard } from './pages/Dashboard'
import { DatasetPreview } from './pages/DatasetPreview'
import { CleaningReport } from './pages/CleaningReport'
import { EDA } from './pages/EDA'
import { MachineLearning } from './pages/MachineLearning'
import { ForecastPage } from './pages/ForecastPage'
import { Insights } from './pages/Insights'
import { Downloads } from './pages/Downloads'
import { Settings } from './pages/Settings'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useDarkMode } from './hooks/useDarkMode'

export default function App() {
  const { dark } = useDarkMode()

  return (
    <div className={dark ? 'dark' : ''}>
      <AnalysisProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/app/*" element={<AppLayout />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </ErrorBoundary>
        </BrowserRouter>
      </AnalysisProvider>
    </div>
  )
}

function AppLayout() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="main-layout">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`main-content ${collapsed ? 'content-collapsed' : 'content-expanded'}`}>
        <Routes>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="upload" element={<Landing />} />
          <Route path="preview" element={<DatasetPreview />} />
          <Route path="cleaning" element={<CleaningReport />} />
          <Route path="eda" element={<EDA />} />
          <Route path="ml" element={<MachineLearning />} />
          <Route path="forecast" element={<ForecastPage />} />
          <Route path="insights" element={<Insights />} />
          <Route path="downloads" element={<Downloads />} />
          <Route path="settings" element={<Settings />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Routes>
      </div>
    </div>
  )
}
