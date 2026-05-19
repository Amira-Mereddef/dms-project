import { useEffect, useState } from 'react'
import { api } from '../../api/api'

function ActivityLogPage() {
  const [log, setLog] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getActivityLog().then(data => { setLog(data); setLoading(false) })
  }, [])

  const actionColor = (action) => {
    if (!action) return { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' }
    if (action.includes('Login'))    return { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' }
    if (action.includes('Upload') || action.includes('Created'))
                                     return { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' }
    if (action.includes('Delete'))   return { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' }
    if (action.includes('Suspend'))  return { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' }
    return                                  { bg: '#f3e8ff', color: '#7e22ce', border: '#e9d5ff' }
  }

  return (
    <div style={{ padding: '36px 40px', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 6px' }}>
          Activity Log
        </h1>
        <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>
          All system actions recorded in real time
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#aaa', fontSize: '15px' }}>
          Loading...
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: '16px',
          border: '1px solid #f0e0e0', overflow: 'hidden',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
            <thead>
              <tr style={{ background: '#fdf8f8', borderBottom: '1px solid #f0e0e0' }}>
                {['User', 'Action', 'Target', 'Date'].map(h => (
                  <th key={h} style={{
                    padding: '14px 20px', textAlign: 'left',
                    color: '#555', fontWeight: '600', fontSize: '13px',
                    textTransform: 'uppercase', letterSpacing: '0.04em'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {log.map((entry, i) => {
                const c = actionColor(entry.action)
                return (
                  <tr key={entry.id || i} style={{ borderBottom: '1px solid #fdf0f0' }}>
                    <td style={{ padding: '14px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', background: '#c0392b',
                          borderRadius: '50%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: 'white', fontSize: '13px', fontWeight: '700'
                        }}>
                          {entry.user?.charAt(0)?.toUpperCase()}
                        </div>
                        <span style={{ fontWeight: '600', color: '#1a0a0f' }}>{entry.user}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 20px' }}>
                      <span style={{
                        background: c.bg, color: c.color,
                        border: `1px solid ${c.border}`,
                        fontSize: '12px', fontWeight: '600',
                        padding: '4px 12px', borderRadius: '6px'
                      }}>
                        {entry.action}
                      </span>
                    </td>
                    <td style={{ padding: '14px 20px', color: '#666', fontSize: '14px' }}>
                      {entry.target}
                    </td>
                    <td style={{ padding: '14px 20px', color: '#aaa', fontSize: '14px' }}>
                      {entry.date}
                    </td>
                  </tr>
                )
              })}
              {log.length === 0 && (
                <tr>
                  <td colSpan={4} style={{
                    padding: '60px', textAlign: 'center',
                    color: '#aaa', fontSize: '15px'
                  }}>
                    No activity recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default ActivityLogPage