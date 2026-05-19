import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDocuments } from '../../context/DocumentContext'
import { api } from '../../api/api'
import { visibilityConfig } from '../../utils/accessControl'

function DocumentDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { dispatch } = useDocuments()
  const navigate = useNavigate()

  const [doc, setDoc] = useState(null)
  const [comments, setComments] = useState([])
  const [versions, setVersions] = useState([])
  const [newComment, setNewComment] = useState('')
  const [loading, setLoading] = useState(true)
  const [changingVisibility, setChangingVisibility] = useState(false)
  const [downloading, setDownloading] = useState(false)

  // New version form state
  const [showVersionForm, setShowVersionForm] = useState(false)
  const [versionNote, setVersionNote] = useState('')
  const [versionFile, setVersionFile] = useState(null)
  const [addingVersion, setAddingVersion] = useState(false)
  const [versionError, setVersionError] = useState('')

  useEffect(() => {
    Promise.all([
      api.getDocument(id),
      api.getComments(id),
      api.getVersions(id)
    ]).then(([d, c, v]) => {
      setDoc(d)
      setComments(Array.isArray(c) ? c : [])
      setVersions(Array.isArray(v) ? v.sort((a, b) => b.version - a.version) : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!newComment.trim()) return
    try {
      const saved = await api.addComment(id, newComment)
      setComments([...comments, {
        comment_id: saved.comment_id,
        author: saved.author,
        text: saved.text,
        created_at: saved.created_at,
      }])
      setNewComment('')
    } catch (err) {
      console.error('Comment error:', err)
    }
  }

const handleNewVersion = async () => {
  if (!versionFile) { setVersionError('Please attach a file for the new version'); return }
  if (!versionNote.trim()) { setVersionError('Please describe what changed'); return }
  setAddingVersion(true)
  setVersionError('')
  try {
    const formData = new FormData()
    formData.append('note', versionNote)
    formData.append('file', versionFile)

    const res = await fetch(`http://localhost:4000/api/documents/${id}/versions`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('dms_token')}` },
      body: formData
    })

    if (!res.ok) {
      const err = await res.json()
      setVersionError(err.error || 'Upload failed')
      setAddingVersion(false)
      return
    }

    const saved = await res.json()

    // Refresh versions list from backend
    const updatedVersions = await api.getVersions(id)
    setVersions(Array.isArray(updatedVersions) ? updatedVersions.sort((a, b) => b.version - a.version) : [])

    // Update document state
    setDoc(prev => ({
      ...prev,
      version: saved.newVersion,
      file_key: saved.fileKey,
      file_size: saved.fileSize
    }))
    dispatch({ type: 'UPDATE_DOCUMENT', payload: { ...doc, version: saved.newVersion } })

    setVersionNote('')
    setVersionFile(null)
    setShowVersionForm(false)
  } catch (err) {
    setVersionError('Failed to save version. Check your connection.')
    console.error(err)
  }
  setAddingVersion(false)
}

  const handleVisibilityChange = async (newVisibility) => {
    await api.updateDocument(id, { visibility: newVisibility })
    setDoc({ ...doc, visibility: newVisibility })
    setChangingVisibility(false)
  }

  const handleDownload = async () => {
    if (!doc.file_key) return
    setDownloading(true)
    try {
      const { url } = await api.getDownloadUrl(doc.id)
      window.open(url, '_blank')
    } catch (err) {
      console.error('Download failed', err)
    }
    setDownloading(false)
  }

  const handleVersionDownload = async (v) => {
    try {
      const res = await fetch(`http://localhost:4000/api/documents/${id}/versions/${v.id}/download`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('dms_token')}` }
      })
      const { url } = await res.json()
      window.open(url, '_blank')
    } catch (err) {
      console.error('Version download failed', err)
    }
  }

  const s = {
    card: {
      background: 'white', borderRadius: '14px',
      border: '1px solid #f0e0e0', padding: '24px',
      boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
    },
    label: { fontSize: '13px', color: '#888', fontWeight: '500' },
    value: { fontSize: '14px', color: '#1a0a0f', fontWeight: '600' },
    row: {
      display: 'flex', justifyContent: 'space-between',
      padding: '9px 0', borderBottom: '1px solid #fdf0f0', fontSize: '14px'
    }
  }

  if (loading) return (
    <div style={{ padding: '80px', textAlign: 'center', color: '#aaa', fontFamily: 'system-ui', fontSize: '15px' }}>
      Loading document...
    </div>
  )

  if (!doc || doc.error) return (
    <div style={{ padding: '80px', textAlign: 'center', color: '#aaa', fontFamily: 'system-ui', fontSize: '15px' }}>
      Document not found.
    </div>
  )

  const ownerName = doc.owner_name || doc.owner || 'Unknown'
  const docDate = doc.created_at ? doc.created_at.split('T')[0] : ''

  return (
    <div style={{ padding: '36px 40px', fontFamily: 'system-ui, sans-serif', maxWidth: '960px' }}>

      <button onClick={() => navigate('/user/documents')} style={{
        background: 'none', border: 'none', color: '#c0392b',
        fontSize: '14px', cursor: 'pointer', marginBottom: '24px',
        padding: 0, fontWeight: '500'
      }}>
        Back to documents
      </button>

      {/* Title card */}
      <div style={{
        background: 'white', borderRadius: '14px',
        border: '1px solid #f0e0e0', padding: '24px 28px',
        marginBottom: '20px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: '22px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 6px' }}>
              {doc.title}
            </h1>
            {doc.translated_title && (
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                background: '#fdf8f8', border: '1px solid #f0e0e0',
                borderRadius: '8px', padding: '5px 12px', marginTop: '6px'
              }}>
                <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '600', textTransform: 'uppercase' }}>AR</span>
                <span style={{ fontSize: '15px', color: '#c0392b', fontWeight: '600', direction: 'rtl' }}>
                  {doc.translated_title}
                </span>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginLeft: '20px' }}>
            <span style={{
              background: '#fdf8f8', color: '#c0392b',
              border: '1px solid #f0e0e0', fontSize: '13px',
              fontWeight: '600', padding: '6px 14px', borderRadius: '8px'
            }}>v{doc.version || 1}</span>
            {doc.file_key && (
              <button onClick={handleDownload} disabled={downloading} style={{
                padding: '10px 20px',
                background: downloading ? '#e08080' : '#c0392b',
                border: 'none', borderRadius: '8px', color: 'white',
                fontSize: '14px', fontWeight: '600',
                cursor: downloading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 8px rgba(192,57,43,0.3)'
              }}>
                {downloading ? 'Preparing...' : 'Download file'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>

        {/* Metadata */}
        <div style={s.card}>
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 16px' }}>
            Document details
          </h2>
          {[
            ['Category', doc.category],
            ['Owner', ownerName],
            ['Department', doc.department || '—'],
            ['Size', doc.file_size || '—'],
            ['Status', doc.status || 'active'],
            ['Version', `v${doc.version || 1}`],
            ['Created', docDate],
          ].map(([k, v]) => (
            <div key={k} style={s.row}>
              <span style={s.label}>{k}</span>
              <span style={s.value}>{v}</span>
            </div>
          ))}

          {/* Visibility */}
          <div style={{ paddingTop: '14px', marginTop: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <span style={s.label}>Access level</span>
              {doc.owner_id === user.id && (
                <button onClick={() => setChangingVisibility(!changingVisibility)} style={{
                  fontSize: '13px', color: '#c0392b',
                  background: '#fdf8f8', border: '1px solid #f0e0e0',
                  borderRadius: '6px', padding: '4px 12px',
                  cursor: 'pointer', fontWeight: '500'
                }}>
                  {changingVisibility ? 'Cancel' : 'Change'}
                </button>
              )}
            </div>
            {!changingVisibility ? (
              <div>
                <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a0a0f' }}>
                  {visibilityConfig[doc.visibility]?.label || 'Public'}
                </div>
                <div style={{ fontSize: '13px', color: '#aaa', marginTop: '2px' }}>
                  {visibilityConfig[doc.visibility]?.description || 'Visible to all users'}
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {Object.entries(visibilityConfig).map(([key, config]) => (
                  <button key={key} onClick={() => handleVisibilityChange(key)} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                    border: doc.visibility === key ? '1.5px solid #c0392b' : '1.5px solid #e0e0e0',
                    background: doc.visibility === key ? '#fdf8f8' : 'white',
                    textAlign: 'left', width: '100%'
                  }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1a0a0f' }}>{config.label}</div>
                      <div style={{ fontSize: '12px', color: '#aaa' }}>{config.description}</div>
                    </div>
                    {doc.visibility === key && (
                      <span style={{ color: '#c0392b', fontSize: '14px', fontWeight: '600' }}>Active</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Version history */}
        <div style={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a0a0f', margin: 0 }}>
              Version history
            </h2>
            {doc.owner_id === user.id && (
              <button onClick={() => { setShowVersionForm(!showVersionForm); setVersionError('') }} style={{
                padding: '7px 14px', background: showVersionForm ? 'white' : '#fdf8f8',
                border: '1.5px solid #e0e0e0', borderRadius: '8px',
                fontSize: '13px', color: '#555', fontWeight: '500', cursor: 'pointer'
              }}>
                {showVersionForm ? 'Cancel' : 'Upload new version'}
              </button>
            )}
          </div>

          {showVersionForm && (
            <div style={{
              marginBottom: '16px', background: '#fdf8f8',
              borderRadius: '10px', padding: '14px',
              border: '1px solid #f0e0e0'
            }}>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '5px' }}>
                  New PDF file *
                </label>
                <input
                  type="file" accept=".pdf,.doc,.docx,.xlsx,.txt"
                  onChange={e => setVersionFile(e.target.files[0])}
                  style={{
                    width: '100%', padding: '7px',
                    border: '1.5px solid #e0e0e0', borderRadius: '6px',
                    fontSize: '13px', background: 'white',
                    boxSizing: 'border-box', cursor: 'pointer'
                  }}
                />
                {versionFile && (
                  <p style={{ fontSize: '11px', color: '#27ae60', margin: '4px 0 0' }}>
                    {versionFile.name} ({(versionFile.size / 1024 / 1024).toFixed(2)} MB)
                  </p>
                )}
              </div>
              <div style={{ marginBottom: '10px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#555', marginBottom: '5px' }}>
                  Change description *
                </label>
                <input
                  value={versionNote}
                  onChange={e => setVersionNote(e.target.value)}
                  placeholder="What changed in this version?"
                  style={{
                    width: '100%', padding: '9px 12px',
                    border: '1.5px solid #e0e0e0', borderRadius: '6px',
                    fontSize: '13px', background: 'white',
                    color: '#1a0a0f', outline: 'none', boxSizing: 'border-box'
                  }}
                />
              </div>
              {versionError && (
                <p style={{ color: '#c0392b', fontSize: '12px', margin: '0 0 8px' }}>{versionError}</p>
              )}
              <button onClick={handleNewVersion} disabled={addingVersion} style={{
                width: '100%', padding: '10px',
                background: addingVersion ? '#e08080' : '#c0392b',
                border: 'none', borderRadius: '6px', color: 'white',
                fontSize: '13px', fontWeight: '600',
                cursor: addingVersion ? 'not-allowed' : 'pointer'
              }}>
                {addingVersion ? 'Uploading...' : 'Save new version'}
              </button>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '300px', overflowY: 'auto' }}>
            {versions.length === 0 ? (
              <p style={{ fontSize: '14px', color: '#aaa', textAlign: 'center', padding: '24px 0' }}>
                No versions recorded yet
              </p>
            ) : versions.map((v, i) => (
              <div key={v.id || i} style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                padding: '12px', background: i === 0 ? '#fdf8f8' : 'white',
                borderRadius: '8px',
                border: i === 0 ? '1.5px solid #f0d0d0' : '1px solid #f0e0e0'
              }}>
                <div style={{
                  width: '30px', height: '30px', background: i === 0 ? '#c0392b' : '#ddd',
                  borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontSize: '11px', fontWeight: '700', flexShrink: 0
                }}>v{v.version}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <p style={{ fontSize: '13px', color: '#1a0a0f', fontWeight: '600', margin: '0 0 2px' }}>
                        {v.note}
                        {i === 0 && <span style={{ marginLeft: '6px', fontSize: '11px', color: '#c0392b', fontWeight: '700' }}>LATEST</span>}
                      </p>
                      <p style={{ fontSize: '12px', color: '#aaa', margin: 0 }}>
                        {v.author} · {v.created_at ? v.created_at.split('T')[0] : ''} · {v.file_size || '—'}
                      </p>
                    </div>
                    {v.file_key && (
                      <button
                        onClick={() => handleVersionDownload(v)}
                        style={{
                          padding: '4px 10px', background: 'white',
                          border: '1px solid #e0e0e0', borderRadius: '6px',
                          fontSize: '12px', color: '#555', cursor: 'pointer',
                          fontWeight: '500', flexShrink: 0, marginLeft: '8px'
                        }}>
                        Download
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Comments */}
      <div style={s.card}>
        <h2 style={{ fontSize: '16px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 20px' }}>
          Comments ({comments.length})
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
          {comments.length === 0 && (
            <p style={{ fontSize: '14px', color: '#aaa', textAlign: 'center', padding: '24px 0' }}>
              No comments yet. Be the first to comment.
            </p>
          )}
          {comments.map((c, index) => (
            <div key={c.comment_id || c.id || index} style={{
              display: 'flex', gap: '14px',
              padding: '14px 16px', background: '#fdf8f8',
              borderRadius: '10px', border: '1px solid #f0e0e0'
            }}>
              <div style={{
                width: '36px', height: '36px', background: '#c0392b',
                borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: '14px', fontWeight: '700'
              }}>
                {c.author?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '600', color: '#1a0a0f' }}>{c.author}</span>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>
                    {c.created_at ? new Date(c.created_at).toISOString().split('T')[0] : ''}
                  </span>
                </div>
                <p style={{ fontSize: '14px', color: '#333', margin: 0, lineHeight: 1.6 }}>{c.text}</p>
              </div>
            </div>
          ))}
        </div>
        <form onSubmit={handleAddComment} style={{ display: 'flex', gap: '12px' }}>
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Write a comment..."
            style={{
              flex: 1, padding: '12px 16px',
              border: '1.5px solid #e0e0e0', borderRadius: '8px',
              fontSize: '15px', background: 'white',
              color: '#1a0a0f', outline: 'none'
            }}
          />
          <button type="submit" style={{
            padding: '12px 24px', background: '#c0392b',
            border: 'none', borderRadius: '8px',
            color: 'white', fontSize: '15px',
            fontWeight: '600', cursor: 'pointer'
          }}>Post</button>
        </form>
      </div>
    </div>
  )
}

export default DocumentDetailPage