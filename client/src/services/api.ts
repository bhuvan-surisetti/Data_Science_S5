import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 300_000, // 5 minutes for large datasets
})

export const uploadFile = (file: File, onProgress?: (pct: number) => void) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100))
    },
  })
}

export const uploadSample = () => api.post('/upload/sample')

export const analyzeDataset = (sessionId: string) => api.post(`/analyze/${sessionId}`)

export const runForecast = (sessionId: string, horizonDays: number) =>
  api.post(`/forecast/${sessionId}`, { horizon_days: horizonDays })

export const getDownloadUrl = (sessionId: string, type: 'cleaned-csv' | 'forecast-csv' | 'pdf') =>
  `/api/download/${sessionId}/${type}`

export const checkHealth = () => api.get('/health')

export default api
