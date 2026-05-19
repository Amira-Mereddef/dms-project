import { useEffect, useState } from 'react'
import { api } from '../../api/api'

function UserModal({ user, onClose, onSaved }) {
  const [form, setForm] = useState(user || {
    name: '', email: '', password: '', role: 'user', department: '', status: 'active'
  })
  const [loading, setLoading] = useState(false)
  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    const saved = user ? await api.updateUser(user.id, form) : await api.addUser(form)
    onSaved(saved, !!user)
    setLoading(false)
    onClose()
  }

  const overlay = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', zIndex: 50, padding: '24px'
  }
  const card = {
    background: 'white', borderRadius: '16px',
    padding: '32px', width: '100%', maxWidth: '460px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)',
    fontFamily: 'system-ui'
  }
  const lbl = {
    display: 'block', fontSize: '14px',
    fontWeight: '600', color: '#333', marginBottom: '7px'
  }
  const inp = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e0e0e0', borderRadius: '8px',
    fontSize: '15px', outline: 'none',
    background: '#fafafa', color: '#1a0a0f',
    boxSizing: 'border-box'
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a0a0f', margin: 0 }}>
            {user ? 'Edit User' : 'Create New User'}
          </h2>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1.5px solid #e0e0e0', background: '#fafafa',
            color: '#888', fontSize: '18px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>x</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={lbl}>Full name</label>
            <input name="name" value={form.name} onChange={handle} placeholder="Jane Smith" style={inp} required />
          </div>
          <div>
            <label style={lbl}>Email address</label>
            <input name="email" type="email" value={form.email} onChange={handle} placeholder="jane@dms.com" style={inp} required />
          </div>
          <div>
            <label style={lbl}>Password</label>
            <input name="password" value={form.password} onChange={handle} placeholder="Set a password" style={inp} required />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={lbl}>Role</label>
              <select name="role" value={form.role} onChange={handle} style={inp}>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label style={lbl}>Department</label>
              <input name="department" value={form.department} onChange={handle} placeholder="e.g. IT" style={inp} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '12px', background: 'white',
              border: '1.5px solid #e0e0e0', borderRadius: '8px',
              fontSize: '15px', color: '#666', fontWeight: '500', cursor: 'pointer'
            }}>Cancel</button>
            <button type="submit" disabled={loading} style={{
              flex: 1, padding: '12px', background: '#c0392b',
              border: 'none', borderRadius: '8px',
              fontSize: '15px', color: 'white', fontWeight: '600', cursor: 'pointer'
            }}>
              {loading ? 'Saving...' : user ? 'Save changes' : 'Create user'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function CSVImportModal({ onClose, onImported }) {
  const [rows, setRows] = useState([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleFile = (e) => {
    setError(''); setRows([])
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const lines = ev.target.result.trim().split('\n')
      if (lines.length < 2) { setError('File must have a header row and at least one data row.'); return }
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
      if (parsed.length === 0) { setError('No valid rows found in the file.'); return }
      setRows(parsed)
    }
    reader.readAsText(file)
  }

  const handleImport = async () => {
    setLoading(true)
    for (const row of rows) await api.addUser(row)
    setLoading(false)
    setDone(true)
    onImported()
  }

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 50, padding: '24px'
  }
  const card = {
    background: 'white', borderRadius: '16px', padding: '32px',
    width: '100%', maxWidth: '560px',
    boxShadow: '0 8px 40px rgba(0,0,0,0.12)', fontFamily: 'system-ui'
  }

  return (
    <div style={overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 4px' }}>
              Import Users from CSV
            </h2>
            <p style={{ fontSize: '14px', color: '#888', margin: 0 }}>
              Required columns: name, email, password, role, department
            </p>
          </div>
          <button onClick={onClose} style={{
            width: '32px', height: '32px', borderRadius: '50%',
            border: '1.5px solid #e0e0e0', background: '#fafafa',
            color: '#888', fontSize: '18px', cursor: 'pointer'
          }}>x</button>
        </div>

        {done ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#166534', marginBottom: '8px' }}>
              Import complete
            </h3>
            <p style={{ fontSize: '15px', color: '#888', marginBottom: '24px' }}>
              {rows.length} user{rows.length !== 1 ? 's' : ''} added successfully.
            </p>
            <button onClick={onClose} style={{
              padding: '12px 32px', background: '#c0392b', border: 'none',
              borderRadius: '8px', color: 'white', fontSize: '15px',
              fontWeight: '600', cursor: 'pointer'
            }}>Done</button>
          </div>
        ) : (
          <>
            {/* File upload area */}
            <div style={{
              border: '2px dashed #e0e0e0', borderRadius: '12px',
              padding: '32px', textAlign: 'center',
              background: '#fafafa', marginBottom: '20px'
            }}>
              <p style={{ fontSize: '15px', color: '#555', marginBottom: '16px', fontWeight: '500' }}>
                Select your CSV file to import
              </p>
              <label style={{
                padding: '10px 24px', background: '#c0392b',
                borderRadius: '8px', color: 'white',
                fontSize: '14px', fontWeight: '600',
                cursor: 'pointer', display: 'inline-block'
              }}>
                Choose CSV file
                <input type="file" accept=".csv" onChange={handleFile} style={{ display: 'none' }} />
              </label>
              <div style={{ marginTop: '16px', fontSize: '13px', color: '#aaa' }}>
                <strong>Expected format:</strong> name, email, password, role, department
              </div>
            </div>

            {error && (
              <div style={{
                background: '#fff5f5', border: '1px solid #fcc',
                color: '#c0392b', fontSize: '14px',
                borderRadius: '8px', padding: '12px 16px', marginBottom: '16px'
              }}>{error}</div>
            )}

            {rows.length > 0 && (
              <>
                <div style={{
                  border: '1px solid #e0e0e0', borderRadius: '10px',
                  overflow: 'hidden', marginBottom: '20px'
                }}>
                  <div style={{
                    background: '#fafafa', padding: '10px 16px',
                    fontSize: '14px', fontWeight: '600', color: '#555',
                    borderBottom: '1px solid #e0e0e0'
                  }}>
                    Preview — {rows.length} user{rows.length !== 1 ? 's' : ''} found
                  </div>
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
                      <thead>
                        <tr style={{ background: '#f9f9f9' }}>
                          {['Name', 'Email', 'Role', 'Department'].map(h => (
                            <th key={h} style={{
                              padding: '10px 14px', textAlign: 'left',
                              color: '#666', fontWeight: '600', fontSize: '13px'
                            }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map((r, i) => (
                          <tr key={i} style={{ borderTop: '1px solid #f0f0f0' }}>
                            <td style={{ padding: '9px 14px', color: '#1a0a0f', fontWeight: '500' }}>{r.name}</td>
                            <td style={{ padding: '9px 14px', color: '#666' }}>{r.email}</td>
                            <td style={{ padding: '9px 14px' }}>
                              <span style={{
                                background: r.role === 'admin' ? '#fee2e2' : '#dcfce7',
                                color: r.role === 'admin' ? '#991b1b' : '#166534',
                                fontSize: '12px', fontWeight: '600',
                                padding: '2px 8px', borderRadius: '6px'
                              }}>{r.role}</span>
                            </td>
                            <td style={{ padding: '9px 14px', color: '#666' }}>{r.department}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button onClick={onClose} style={{
                    flex: 1, padding: '12px', background: 'white',
                    border: '1.5px solid #e0e0e0', borderRadius: '8px',
                    fontSize: '15px', color: '#666', fontWeight: '500', cursor: 'pointer'
                  }}>Cancel</button>
                  <button onClick={handleImport} disabled={loading} style={{
                    flex: 2, padding: '12px', background: '#c0392b',
                    border: 'none', borderRadius: '8px',
                    fontSize: '15px', color: 'white', fontWeight: '600', cursor: 'pointer'
                  }}>
                    {loading ? 'Importing...' : `Import ${rows.length} users`}
                  </button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

const ITEMS_PER_PAGE = 8

function UsersPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [selected, setSelected] = useState([])
  const [editUser, setEditUser] = useState(null)
  const [showCreate, setShowCreate] = useState(false)
  const [showCSV, setShowCSV] = useState(false)

  const load = () => {
    setLoading(true)
    api.getUsers().then(data => { setUsers(data); setLoading(false) })
  }

  useEffect(() => { load() }, [])

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.department?.toLowerCase().includes(search.toLowerCase())
  )

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const toggleSelect = (id) =>
    setSelected(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id])

  const toggleAll = () =>
    setSelected(selected.length === paginated.length ? [] : paginated.map(u => u.id))

  const handleSuspendSelected = async () => {
    for (const id of selected) await api.updateUser(id, { status: 'suspended' })
    load(); setSelected([])
  }

  const handleExportSelected = () => {
    const toExport = users.filter(u => selected.includes(u.id))
    const header = 'name,email,role,department,status'
    const rows = toExport.map(u => `${u.name},${u.email},${u.role},${u.department},${u.status}`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'users.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const handleSuspendOne = async (u) => {
    const updated = await api.updateUser(u.id, { status: u.status === 'suspended' ? 'active' : 'suspended' })
    setUsers(users.map(x => x.id === u.id ? updated : x))
  }

  const onSaved = (saved, isEdit) => {
    if (isEdit) setUsers(users.map(u => u.id === saved.id ? saved : u))
    else setUsers([...users, saved])
  }

  const statusStyle = (status) => ({
    background: status === 'active' ? '#dcfce7' : '#fee2e2',
    color: status === 'active' ? '#166534' : '#991b1b',
    fontSize: '12px', fontWeight: '600',
    padding: '3px 10px', borderRadius: '6px'
  })

  const roleStyle = (role) => ({
    background: role === 'admin' ? '#fef3c7' : '#dbeafe',
    color: role === 'admin' ? '#92400e' : '#1e40af',
    fontSize: '12px', fontWeight: '600',
    padding: '3px 10px', borderRadius: '6px'
  })

  return (
    <div style={{ padding: '36px 40px', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 6px' }}>Users</h1>
          <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>{users.length} total users in the system</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => setShowCSV(true)} style={{
            padding: '11px 20px', background: 'white',
            border: '1.5px solid #e0e0e0', borderRadius: '10px',
            color: '#555', fontSize: '15px', fontWeight: '500', cursor: 'pointer'
          }}>
            Import CSV
          </button>
          <button onClick={() => setShowCreate(true)} style={{
            padding: '11px 22px', background: '#c0392b', border: 'none',
            borderRadius: '10px', color: 'white', fontSize: '15px',
            fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(192,57,43,0.3)'
          }}>
            New User
          </button>
        </div>
      </div>

      {/* Search + bulk actions */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap' }}>
        <input
          placeholder="Search by name, email or department..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{
            padding: '11px 18px', border: '1.5px solid #e0e0e0',
            borderRadius: '10px', fontSize: '15px',
            background: 'white', outline: 'none', color: '#1a0a0f', width: '300px'
          }}
        />
        {selected.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span style={{ fontSize: '14px', color: '#888' }}>{selected.length} selected</span>
            <button onClick={handleSuspendSelected} style={{
              padding: '9px 16px', background: '#fff5f5',
              border: '1.5px solid #fcc', borderRadius: '8px',
              fontSize: '14px', color: '#c0392b', fontWeight: '600', cursor: 'pointer'
            }}>Suspend selected</button>
            <button onClick={handleExportSelected} style={{
              padding: '9px 16px', background: '#f0fdf4',
              border: '1.5px solid #bbf7d0', borderRadius: '8px',
              fontSize: '14px', color: '#166534', fontWeight: '600', cursor: 'pointer'
            }}>Export selected</button>
          </div>
        )}
      </div>

      {/* Table */}
      <div style={{
        background: 'white', borderRadius: '16px',
        border: '1px solid #f0e0e0', overflow: 'hidden',
        boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
          <thead>
            <tr style={{ background: '#fdf8f8', borderBottom: '1px solid #f0e0e0' }}>
              <th style={{ padding: '14px 20px', width: '40px' }}>
                <input type="checkbox"
                  checked={paginated.length > 0 && selected.length === paginated.length}
                  onChange={toggleAll}
                  style={{ accentColor: '#c0392b', width: '16px', height: '16px', cursor: 'pointer' }}
                />
              </th>
              {['Name', 'Email', 'Role', 'Department', 'Status', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '14px 20px', textAlign: 'left',
                  color: '#555', fontWeight: '600', fontSize: '13px',
                  textTransform: 'uppercase', letterSpacing: '0.04em'
                }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#aaa', fontSize: '15px' }}>
                Loading users...
              </td></tr>
            )}
            {!loading && paginated.map(u => (
              <tr key={u.id} style={{
                borderBottom: '1px solid #fdf0f0',
                background: selected.includes(u.id) ? '#fffafa' : 'white',
                transition: 'background 0.15s'
              }}>
                <td style={{ padding: '14px 20px' }}>
                  <input type="checkbox" checked={selected.includes(u.id)}
                    onChange={() => toggleSelect(u.id)}
                    style={{ accentColor: '#c0392b', width: '16px', height: '16px', cursor: 'pointer' }} />
                </td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px', height: '36px', background: '#c0392b',
                      borderRadius: '50%', display: 'flex', alignItems: 'center',
                      justifyContent: 'center', color: 'white', fontSize: '14px',
                      fontWeight: '700', flexShrink: 0
                    }}>
                      {u.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <span style={{ fontWeight: '600', color: '#1a0a0f', fontSize: '15px' }}>{u.name}</span>
                  </div>
                </td>
                <td style={{ padding: '14px 20px', color: '#666', fontSize: '14px' }}>{u.email}</td>
                <td style={{ padding: '14px 20px' }}><span style={roleStyle(u.role)}>{u.role}</span></td>
                <td style={{ padding: '14px 20px', color: '#666', fontSize: '14px' }}>{u.department || '—'}</td>
                <td style={{ padding: '14px 20px' }}><span style={statusStyle(u.status)}>{u.status}</span></td>
                <td style={{ padding: '14px 20px' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => setEditUser(u)} style={{
                      padding: '6px 14px', background: '#fafafa',
                      border: '1.5px solid #e0e0e0', borderRadius: '6px',
                      fontSize: '13px', color: '#555', cursor: 'pointer', fontWeight: '500'
                    }}>Edit</button>
                    <button onClick={() => handleSuspendOne(u)} style={{
                      padding: '6px 14px',
                      background: u.status === 'suspended' ? '#f0fdf4' : '#fff5f5',
                      border: `1.5px solid ${u.status === 'suspended' ? '#bbf7d0' : '#fcc'}`,
                      borderRadius: '6px', fontSize: '13px',
                      color: u.status === 'suspended' ? '#166534' : '#c0392b',
                      cursor: 'pointer', fontWeight: '500'
                    }}>
                      {u.status === 'suspended' ? 'Activate' : 'Suspend'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && paginated.length === 0 && (
              <tr><td colSpan={7} style={{ padding: '60px', textAlign: 'center', color: '#aaa', fontSize: '15px' }}>
                No users found
              </td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{
              padding: '9px 18px', borderRadius: '8px', fontSize: '14px',
              border: '1.5px solid #e0e0e0', background: 'white',
              color: page === 1 ? '#ccc' : '#c0392b', cursor: page === 1 ? 'default' : 'pointer'
            }}>Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} style={{
              width: '38px', height: '38px', borderRadius: '8px', fontSize: '14px',
              border: page === n ? '1.5px solid #c0392b' : '1.5px solid #e0e0e0',
              background: page === n ? '#fce8ec' : 'white',
              color: page === n ? '#c0392b' : '#888',
              fontWeight: page === n ? '600' : '400', cursor: 'pointer'
            }}>{n}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{
              padding: '9px 18px', borderRadius: '8px', fontSize: '14px',
              border: '1.5px solid #e0e0e0', background: 'white',
              color: page === totalPages ? '#ccc' : '#c0392b',
              cursor: page === totalPages ? 'default' : 'pointer'
            }}>Next</button>
        </div>
      )}

      {showCreate && <UserModal onClose={() => setShowCreate(false)} onSaved={onSaved} />}
      {editUser && <UserModal user={editUser} onClose={() => setEditUser(null)} onSaved={onSaved} />}
      {showCSV && <CSVImportModal onClose={() => setShowCSV(false)} onImported={load} />}
    </div>
  )
}

export default UsersPage