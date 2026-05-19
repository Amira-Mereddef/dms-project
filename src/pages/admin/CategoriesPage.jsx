import { useEffect, useState } from 'react'
import { api } from '../../api/api'

function CategoriesPage() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editCat, setEditCat] = useState(null)
  const [form, setForm] = useState({ name: '' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    api.getCategories().then(data => { setCategories(data); setLoading(false) })
  }, [])

  const resetForm = () => {
    setForm({ name: '' })
    setEditCat(null)
    setShowForm(false)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError('')
    try {
      if (editCat) {
        const updated = await api.updateCategory(editCat.id, { name: form.name })
        setCategories(categories.map(c => c.id === updated.id ? updated : c))
      } else {
        const saved = await api.addCategory({ name: form.name })
        if (saved.error) { setError(saved.error); setSaving(false); return }
        setCategories([...categories, saved])
      }
      resetForm()
    } catch (err) {
      setError('Something went wrong')
    }
    setSaving(false)
  }

  const handleDelete = async (id) => {
    await api.deleteCategory(id)
    setCategories(categories.filter(c => c.id !== id))
  }

  const startEdit = (cat) => {
    setEditCat(cat)
    setForm({ name: cat.name })
    setShowForm(true)
  }

  const inp = {
    width: '100%', padding: '11px 14px',
    border: '1.5px solid #e0e0e0', borderRadius: '8px',
    fontSize: '15px', outline: 'none',
    background: 'white', color: '#1a0a0f', boxSizing: 'border-box'
  }

  return (
    <div style={{ padding: '36px 40px', fontFamily: 'system-ui, sans-serif' }}>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 6px' }}>
            Categories
          </h1>
          <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>
            Manage document categories
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true) }}
          style={{
            padding: '11px 22px', background: '#c0392b', border: 'none',
            borderRadius: '10px', color: 'white', fontSize: '15px',
            fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(192,57,43,0.3)'
          }}>
          New Category
        </button>
      </div>

      {showForm && (
        <div style={{
          background: 'white', borderRadius: '14px',
          border: '1.5px solid #f0e0e0', padding: '24px',
          marginBottom: '28px', boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 20px' }}>
            {editCat ? 'Edit category' : 'New category'}
          </h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '600', color: '#333', marginBottom: '8px' }}>
                Category name
              </label>
              <input
                value={form.name}
                onChange={e => setForm({ name: e.target.value })}
                placeholder="e.g. General, Administrative, Training"
                style={inp}
                autoFocus
              />
              {error && <p style={{ color: '#c0392b', fontSize: '13px', margin: '6px 0 0' }}>{error}</p>}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" onClick={resetForm} style={{
                flex: 1, padding: '12px', background: 'white',
                border: '1.5px solid #e0e0e0', borderRadius: '8px',
                fontSize: '15px', color: '#666', cursor: 'pointer', fontWeight: '500'
              }}>Cancel</button>
              <button type="submit" disabled={saving} style={{
                flex: 2, padding: '12px', background: saving ? '#e08080' : '#c0392b',
                border: 'none', borderRadius: '8px',
                fontSize: '15px', color: 'white', fontWeight: '600',
                cursor: saving ? 'not-allowed' : 'pointer'
              }}>
                {saving ? 'Saving...' : editCat ? 'Save changes' : 'Create category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#aaa', fontSize: '15px' }}>
          Loading categories...
        </div>
      ) : (
        <div style={{
          background: 'white', borderRadius: '14px',
          border: '1px solid #f0e0e0', overflow: 'hidden',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)'
        }}>
          {categories.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px' }}>
              <p style={{ color: '#aaa', fontSize: '16px', margin: 0 }}>
                No categories yet. Create one to get started.
              </p>
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
              <thead>
                <tr style={{ background: '#fdf8f8', borderBottom: '1px solid #f0e0e0' }}>
                  {['Name', 'Actions'].map(h => (
                    <th key={h} style={{
                      padding: '14px 20px', textAlign: 'left',
                      color: '#555', fontWeight: '600', fontSize: '13px',
                      textTransform: 'uppercase', letterSpacing: '0.04em'
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => (
                  <tr key={cat.id} style={{
                    borderBottom: i < categories.length - 1 ? '1px solid #fdf0f0' : 'none'
                  }}>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{
                        fontWeight: '600', color: '#1a0a0f', fontSize: '15px'
                      }}>{cat.name}</span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={() => startEdit(cat)} style={{
                          padding: '7px 16px', background: 'white',
                          border: '1.5px solid #e0e0e0', borderRadius: '6px',
                          fontSize: '13px', color: '#555', cursor: 'pointer', fontWeight: '500'
                        }}>Edit</button>
                        <button onClick={() => handleDelete(cat.id)} style={{
                          padding: '7px 16px', background: '#fff5f5',
                          border: '1.5px solid #fcc', borderRadius: '6px',
                          fontSize: '13px', color: '#c0392b', cursor: 'pointer', fontWeight: '500'
                        }}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default CategoriesPage