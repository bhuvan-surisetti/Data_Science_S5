import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react'

interface Props {
  onFile: (file: File) => void
  uploading?: boolean
  progress?: number
  error?: string | null
}

export function UploadZone({ onFile, uploading, progress = 0, error }: Props) {
  const [rejected, setRejected] = useState<string | null>(null)

  const onDrop = useCallback((accepted: File[], rejected_files: any[]) => {
    setRejected(null)
    if (rejected_files.length > 0) {
      setRejected('Only CSV and Excel (.xlsx, .xls) files are supported.')
      return
    }
    if (accepted.length > 0) onFile(accepted[0])
  }, [onFile])

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
    disabled: uploading,
  })

  const file = acceptedFiles[0]

  return (
    <div>
      <div
        {...getRootProps()}
        className={`upload-zone${isDragActive ? ' drag-active' : ''}`}
        style={{ padding: '64px 32px', textAlign: 'center', position: 'relative', transition: 'all 0.2s ease' }}
      >
        <input {...getInputProps()} />

        {uploading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Upload size={24} color="var(--color-blue)" className="animate-bounce" />
            </div>
            <p style={{ color: 'var(--color-text)', fontWeight: 600 }}>Uploading…</p>
            <div style={{ width: '100%', maxWidth: 320 }}>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>{progress}%</p>
            </div>
          </div>
        ) : file ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#ecfdf5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircle size={28} color="var(--color-green)" />
            </div>
            <div>
              <p style={{ fontWeight: 600, color: 'var(--color-text)' }}>{file.name}</p>
              <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                {(file.size / 1024).toFixed(1)} KB · Click or drag to change
              </p>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 72, height: 72, borderRadius: '50%',
              background: isDragActive ? 'var(--color-blue)' : 'var(--color-blue-light)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s ease', transform: isDragActive ? 'scale(1.1)' : 'scale(1)',
            }}>
              <Upload size={28} color={isDragActive ? 'white' : 'var(--color-blue)'} />
            </div>
            <div>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--color-text)', marginBottom: 8 }}>
                {isDragActive ? 'Drop your file here' : 'Drag & drop your dataset'}
              </p>
              <p style={{ color: 'var(--color-text-muted)', marginBottom: 16 }}>
                or <span style={{ color: 'var(--color-blue)', fontWeight: 600, cursor: 'pointer' }}>browse to upload</span>
              </p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                {['CSV', 'XLSX', 'XLS'].map(fmt => (
                  <span key={fmt} className="badge badge-gray" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FileText size={10} />{fmt}
                  </span>
                ))}
              </div>
              <p style={{ fontSize: 12, color: 'var(--color-text-subtle)', marginTop: 12 }}>
                Maximum file size: 50 MB · Up to 100,000 rows supported
              </p>
            </div>
          </div>
        )}
      </div>

      {(rejected || error) && (
        <div style={{ marginTop: 12, padding: '12px 16px', borderRadius: 8, background: '#fef2f2', border: '1px solid #fecaca', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
          <AlertCircle size={16} color="var(--color-red)" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ fontSize: 13, color: 'var(--color-red)' }}>{rejected || error}</p>
        </div>
      )}
    </div>
  )
}
