import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useDocuments } from '../context/DocumentContext'
import { api } from '../api/api'

function UploadModal({ onClose, categories }) {
  const { user } = useAuth()
  const { dispatch } = useDocuments()

  const userDepts = (user.department || '').split(',').map(d => d.trim()).filter(Boolean)

  const [form, setForm] = useState({
    title: '',
    category: categories[0]?.name || 'General',
    visibility: 'department',
    department: userDepts[0] || '',
    file: null
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('Title is required'); return }
    if (!form.file) { setError('Please attach a PDF file'); return }
    setLoading(true)
    setError('')

    const formData = new FormData()
    formData.append('title', form.title)
    formData.append('category', form.category)
    formData.append('description', '')
    formData.append('visibility', form.visibility)
    formData.append('department', form.department)
    formData.append('file', form.file)

    const saved = await api.addDocument(formData)
    if (saved.error) { setError(saved.error); setLoading(false); return }
    dispatch({ type: 'ADD_DOCUMENT', payload: saved })
    setLoading(false)
    onClose()
  }

  const inp = {
    width: '100%', padding: '10px 14px',
    border: '1.5px solid #e0e0e0', borderRadius: '8px',
    fontSize: '14px', outline: 'none',
    background: 'white', color: '#1a0a0f',
    boxSizing: 'border-box', fontFamily: 'system-ui'
  }

  const lbl = {
    display: 'block', fontSize: '13px',
    fontWeight: '600', color: '#444', marginBottom: '6px'
  }

  const visibilityOptions = [
    { key: 'public',     label: 'Public',         desc: 'Visible to all users' },
    { key: 'department', label: 'Department only', desc: 'Visible to your department' },
    { key: 'private',    label: 'Private',         desc: 'Only visible to you' },
  ]

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.35)',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', zIndex: 50
      }}>
      <div style={{
        background: 'white', borderRadius: '14px',
        padding: '24px', width: '100%', maxWidth: '400px',
        boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
        border: '1px solid #f0e0e0',
        fontFamily: 'system-ui, sans-serif'
      }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: '700', color: '#1a0a0f', margin: 0 }}>
            Upload Document
          </h2>
          <button onClick={onClose} style={{
            width: '28px', height: '28px', borderRadius: '50%',
            border: '1.5px solid #e0e0e0', background: 'white',
            color: '#888', fontSize: '15px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

          <div>
            <label style={lbl}>Document title *</label>
            <input
              name="title" value={form.title} onChange={handle}
              placeholder="Enter the title of the document"
              style={inp} autoFocus
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={lbl}>Category</label>
              <select name="category" value={form.category} onChange={handle} style={inp}>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Department</label>
              <select name="department" value={form.department} onChange={handle} style={inp}>
                {userDepts.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label style={lbl}>PDF file *</label>
            <input
              type="file" accept=".pdf,.doc,.docx,.xlsx,.txt"
              onChange={e => setForm({ ...form, file: e.target.files[0] })}
              style={{ ...inp, padding: '7px', cursor: 'pointer' }}
            />
            {form.file && (
              <p style={{ fontSize: '12px', color: '#27ae60', margin: '4px 0 0' }}>
                {form.file.name} ({(form.file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          <div>
            <label style={lbl}>Visibility</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
              {visibilityOptions.map(v => (
                <label key={v.key} style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '8px 12px', borderRadius: '8px', cursor: 'pointer',
                  border: form.visibility === v.key ? '1.5px solid #c0392b' : '1.5px solid #e0e0e0',
                  background: form.visibility === v.key ? '#fdf8f8' : 'white',
                }}>
                  <input
                    type="radio" name="visibility" value={v.key}
                    checked={form.visibility === v.key}
                    onChange={handle}
                    style={{ accentColor: '#c0392b', margin: 0, flexShrink: 0 }}
                  />
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#1a0a0f' }}>{v.label}</div>
                    <div style={{ fontSize: '11px', color: '#aaa' }}>{v.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <p style={{ color: '#c0392b', fontSize: '13px', margin: 0, padding: '8px 12px', background: '#fff5f5', borderRadius: '6px', border: '1px solid #fcc' }}>
              {error}
            </p>
          )}

          <div style={{ display: 'flex', gap: '10px', marginTop: '4px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '10px', background: 'white',
              border: '1.5px solid #e0e0e0', borderRadius: '8px',
              fontSize: '14px', color: '#666', fontWeight: '500', cursor: 'pointer'
            }}>Cancel</button>
            <button type="submit" disabled={loading} style={{
              flex: 2, padding: '10px',
              background: loading ? '#e08080' : '#c0392b',
              border: 'none', borderRadius: '8px',
              fontSize: '14px', color: 'white', fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}>
              {loading ? 'Uploading...' : 'Upload Document'}
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

export default UploadModal