import { useState } from 'react'
import { api } from '../api/api'

const STEPS = ['Upload CSV', 'Preview Data', 'Confirm Import']

function CSVImportWizard({ onClose, onImported }) {
  const [step, setStep] = useState(0)
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleFile = (e) => {
    setError('')
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = ev.target.result.trim().split('\n')
      if (lines.length < 2) { setError('CSV must have a header row and at least one data row.'); return }
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      const required = ['name', 'email', 'password', 'role', 'department']
      const missing = required.filter(r => !headers.includes(r))
      if (missing.length > 0) { setError(`Missing columns: ${missing.join(', ')}`); return }
      const parsed = lines.slice(1).map(line => {
        const vals = line.split(',').map(v => v.trim())
        return {
          name: vals[headers.indexOf('name')] || '',
          email: vals[headers.indexOf('email')] || '',
          password: vals[headers.indexOf('password')] || '',
          role: vals[headers.indexOf('role')] || 'user',
          department: vals[headers.indexOf('department')] || '',
          status: 'active'
        }
      }).filter(r => r.name && r.email)
      if (parsed.length === 0) { setError('No valid rows found.'); return }
      setRows(parsed)
      setStep(1)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setLoading(true)
    for (const row of rows) {
      await api.addUser(row)
    }
    setLoading(false)
    setDone(true)
    setStep(2)
    onImported()
  }

  const overlay = {
    position: 'fixed', inset: 0,
    background: 'rgba(136,19,55,0.15)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 50, padding: '24px'
  }
  const card = {
    background: 'white', borderRadius: '24px',
    padding: '32px', width: '100%', maxWidth: '580px',
    boxShadow: '0 8px 40px rgba(251,113,133,0.2)',
    border: '1px solid #ffe4e6', fontFamily: 'system-ui'
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: '#881337', margin: '0 0 4px' }}>
              Import Users from CSV 
            </h2>
            <p style={{ fontSize: '13px', color: '#fda4af', margin: 0 }}>
              Step {step + 1} of 3 — {STEPS[step]}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1.5px solid #fecdd3', background: '#fff1f2',
            color: '#fb7185', fontSize: '16px', cursor: 'pointer'
          }}>×</button>
        </div>

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {STEPS.map((s, i) => (
            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: i <= step ? '#fb7185' : '#ffe4e6',
                color: i <= step ? 'white' : '#fda4af',
                fontSize: '12px', fontWeight: '700',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>{i + 1}</div>
              <span style={{ fontSize: '11px', color: i <= step ? '#e11d48' : '#fda4af', fontWeight: i === step ? '600' : '400' }}>{s}</span>
            </div>
          ))}
        </div>

        {/* Step 0 — Upload */}
        {step === 0 && (
          <div>
            <div style={{
              border: '2px dashed #fecdd3', borderRadius: '16px',
              padding: '40px', textAlign: 'center',
              background: '#fff1f2', marginBottom: '16px'
            }}>
              <div style={{ fontSize: '32px', marginBottom: '12px' }}></div>
              <p style={{ fontSize: '14px', color: '#881337', fontWeight: '600', marginBottom: '6px' }}>
                Drop your CSV file here
              </p>
              <p style={{ fontSize: '12px', color: '#fda4af', marginBottom: '16px' }}>
                Required columns: name, email, password, role, department
              </p>
              <label style={{
                padding: '10px 20px', background: '#fb7185',
                borderRadius: '12px', color: 'white',
                fontSize: '13px', fontWeight: '600',
                cursor: 'pointer', display: 'inline-block'
              }}>
                Choose file
                <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
              </label>
            </div>

            {/* Sample CSV hint */}
            <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '12px 16px', border: '1px solid #e2e8f0' }}>
              <p style={{ fontSize: '12px', color: '#64748b', margin: '0 0 6px', fontWeight: '600' }}>Sample CSV format:</p>
              <code style={{ fontSize: '11px', color: '#475569', display: 'block', lineHeight: 1.8 }}>
                name,email,password,role,department<br />
                Jane Smith,jane@dms.com,pass123,user,HR<br />
                John Doe,john@dms.com,pass456,admin,IT
              </code>
            </div>

            {error && (
              <div style={{ marginTop: '12px', background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48', fontSize: '13px', borderRadius: '10px', padding: '10px 14px' }}>
                {error}
              </div>
            )}
          </div>
        )}

        {/* Step 1 — Preview */}
        {step === 1 && (
          <div>
            <p style={{ fontSize: '13px', color: '#fda4af', marginBottom: '14px' }}>
              {rows.length} user{rows.length !== 1 ? 's' : ''} ready to import:
            </p>
            <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid #ffe4e6', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#fff1f2' }}>
                    {['Name', 'Email', 'Role', 'Department'].map(h => (
                      <th key={h} style={{ padding: '10px 12px', textAlign: 'left', color: '#9f1239', fontWeight: '600', fontSize: '12px' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r, i) => (
                    <tr key={i} style={{ borderTop: '1px solid #fff1f2' }}>
                      <td style={{ padding: '9px 12px', color: '#881337', fontWeight: '500' }}>{r.name}</td>
                      <td style={{ padding: '9px 12px', color: '#fda4af' }}>{r.email}</td>
                      <td style={{ padding: '9px 12px' }}>
                        <span style={{
                          background: r.role === 'admin' ? '#fff1f2' : '#f0fdf4',
                          color: r.role === 'admin' ? '#e11d48' : '#16a34a',
                          border: `1px solid ${r.role === 'admin' ? '#fecdd3' : '#bbf7d0'}`,
                          fontSize: '11px', fontWeight: '600',
                          padding: '2px 8px', borderRadius: '20px'
                        }}>{r.role}</span>
                      </td>
                      <td style={{ padding: '9px 12px', color: '#fda4af' }}>{r.department}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setStep(0)} style={{
                flex: 1, padding: '11px', background: 'white',
                border: '1.5px solid #fecdd3', borderRadius: '12px',
                fontSize: '14px', color: '#fb7185', fontWeight: '500', cursor: 'pointer'
              }}>← Back</button>
              <button onClick={handleImport} disabled={loading} style={{
                flex: 2, padding: '11px', background: '#fb7185',
                border: 'none', borderRadius: '12px',
                fontSize: '14px', color: 'white', fontWeight: '600', cursor: 'pointer'
              }}>
                {loading ? 'Importing...' : `Import ${rows.length} users →`}
              </button>
            </div>
          </div>
        )}

        {/* Step 2 — Done */}
        {step === 2 && (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}></div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#881337', marginBottom: '8px' }}>
              Import complete!
            </h3>
            <p style={{ fontSize: '14px', color: '#fda4af', marginBottom: '24px' }}>
              {rows.length} user{rows.length !== 1 ? 's' : ''} added successfully.
            </p>
            <button onClick={onClose} style={{
              padding: '12px 32px', background: '#fb7185',
              border: 'none', borderRadius: '12px',
              color: 'white', fontSize: '14px',
              fontWeight: '600', cursor: 'pointer'
            }}>Done </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default CSVImportWizard