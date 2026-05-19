import { useEffect, useState } from 'react'
import { api } from '../../api/api'

function DepartmentsPage() {
  const [departments, setDepartments] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [assignModal, setAssignModal] = useState(null)
  const [selectedUser, setSelectedUser] = useState('')
  const [assigning, setAssigning] = useState(false)

  const load = () => {
    setLoading(true)
    Promise.all([api.getDepartments(), api.getUsers()]).then(([d, u]) => {
      setDepartments(d)
      setUsers(u)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    const dept = await api.addDepartment({ name: newName, head: '' })
    setDepartments([...departments, dept])
    setNewName('')
    setShowForm(false)
    setCreating(false)
  }

  const handleAssign = async () => {
    if (!selectedUser) return
    setAssigning(true)
    const user = users.find(u => String(u.id) === String(selectedUser))
    if (!user) return
    await api.updateUser(user.id, { department: assignModal.name })
    load()
    setAssignModal(null)
    setSelectedUser('')
    setAssigning(false)
  }

  const handleDelete = async (id) => {
    await api.deleteDepartment(id)
    setDepartments(departments.filter(d => d.id !== id))
  }

  const card = {
    background: 'white', borderRadius: '14px',
    border: '1px solid #f0e0e0', padding: '24px',
    boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
  }

  const inp = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e0e0e0', borderRadius: '8px',
    fontSize: '15px', outline: 'none',
    background: '#fafafa', color: '#1a0a0f', boxSizing: 'border-box'
  }

  return (
    <div style={{ padding: '36px 40px', fontFamily: 'system-ui, sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 6px' }}>
            Departments
          </h1>
          <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>
            {departments.length} department{departments.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: '11px 22px', background: '#c0392b', border: 'none',
            borderRadius: '10px', color: 'white', fontSize: '15px',
            fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(192,57,43,0.3)'
          }}>
          New Department
        </button>
      </div>

      {showForm && (
        <div style={{ ...card, marginBottom: '24px', background: '#fdf8f8', border: '1.5px solid #f0e0e0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 16px' }}>
            Create department
          </h3>
          <form onSubmit={handleCreate} style={{ display: 'flex', gap: '12px' }}>
            <input
              value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="Department name, e.g. Finance"
              style={{ ...inp, flex: 1 }}
            />
            <button type="submit" disabled={creating} style={{
              padding: '11px 24px', background: '#c0392b', border: 'none',
              borderRadius: '8px', color: 'white', fontSize: '15px',
              fontWeight: '600', cursor: 'pointer'
            }}>
              {creating ? 'Creating...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} style={{
              padding: '11px 20px', background: 'white',
              border: '1.5px solid #e0e0e0', borderRadius: '8px',
              fontSize: '15px', color: '#666', cursor: 'pointer'
            }}>
              Cancel
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#aaa', fontSize: '15px' }}>
          Loading departments...
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '18px' }}>
          {departments.map(dept => {
            const members = users.filter(u => u.department === dept.name)
            return (
              <div key={dept.id} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '18px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 4px' }}>
                      {dept.name}
                    </h3>
                    <p style={{ fontSize: '13px', color: '#aaa', margin: 0 }}>
                      {members.length} member{members.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => setAssignModal(dept)}
                      style={{
                        padding: '7px 14px', background: '#fdf8f8',
                        border: '1.5px solid #e0e0e0', borderRadius: '8px',
                        fontSize: '13px', color: '#555', cursor: 'pointer', fontWeight: '500'
                      }}>
                      Assign user
                    </button>
                    <button
                      onClick={() => handleDelete(dept.id)}
                      style={{
                        padding: '7px 14px', background: '#fff5f5',
                        border: '1.5px solid #fcc', borderRadius: '8px',
                        fontSize: '13px', color: '#c0392b', cursor: 'pointer', fontWeight: '500'
                      }}>
                      Delete
                    </button>
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #fdf0f0', paddingTop: '14px' }}>
                  <p style={{ fontSize: '13px', fontWeight: '600', color: '#666', marginBottom: '10px' }}>
                    Members
                  </p>
                  {members.length === 0 ? (
                    <p style={{ fontSize: '14px', color: '#bbb' }}>No members assigned yet</p>
                  ) : (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {members.map(m => (
                        <span key={m.id} style={{
                          background: '#fdf8f8', border: '1px solid #f0e0e0',
                          color: '#555', fontSize: '13px', fontWeight: '500',
                          padding: '4px 12px', borderRadius: '6px'
                        }}>
                          {m.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )
          })}
          {departments.length === 0 && (
            <div style={{
              gridColumn: '1/-1', textAlign: 'center', padding: '80px',
              background: 'white', borderRadius: '14px', border: '1px solid #f0e0e0'
            }}>
              <p style={{ color: '#aaa', fontSize: '16px', margin: 0 }}>
                No departments yet. Create one to get started.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Assign modal */}
      {assignModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 50, padding: '24px'
        }} onClick={e => e.target === e.currentTarget && setAssignModal(null)}>
          <div style={{
            background: 'white', borderRadius: '16px', padding: '32px',
            width: '100%', maxWidth: '400px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12)', fontFamily: 'system-ui'
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 6px' }}>
              Assign user to {assignModal.name}
            </h3>
            <p style={{ fontSize: '14px', color: '#888', margin: '0 0 20px' }}>
              Select a user to add to this department
            </p>
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              style={{ ...inp, marginBottom: '20px' }}>
              <option value="">Select a user...</option>
              {users.filter(u => u.department !== assignModal.name).map(u => (
                <option key={u.id} value={u.id}>{u.name} — {u.department || 'No department'}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setAssignModal(null)} style={{
                flex: 1, padding: '12px', background: 'white',
                border: '1.5px solid #e0e0e0', borderRadius: '8px',
                fontSize: '15px', color: '#666', cursor: 'pointer'
              }}>Cancel</button>
              <button onClick={handleAssign} disabled={assigning} style={{
                flex: 1, padding: '12px', background: '#c0392b',
                border: 'none', borderRadius: '8px',
                fontSize: '15px', color: 'white', fontWeight: '600', cursor: 'pointer'
              }}>
                {assigning ? 'Assigning...' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DepartmentsPage