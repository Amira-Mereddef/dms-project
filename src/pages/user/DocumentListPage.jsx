import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDocuments } from '../../context/DocumentContext'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../api/api'
import UploadModal from '../../components/UploadModal'
import { canUserAccessDocument, visibilityConfig } from '../../utils/accessControl'

const ITEMS_PER_PAGE = 6

const categoryColors = {
  Finance:        { bg: '#fef3c7', color: '#92400e', border: '#fde68a' },
  HR:             { bg: '#ede9fe', color: '#5b21b6', border: '#ddd6fe' },
  IT:             { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
  General:        { bg: '#e0f2fe', color: '#075985', border: '#bae6fd' },
  Administrative: { bg: '#fce7f3', color: '#9d174d', border: '#fbcfe8' },
  Training:       { bg: '#fff7ed', color: '#9a3412', border: '#fed7aa' },
  Legal:          { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' },
}

function CategoryBadge({ name }) {
  const c = categoryColors[name] || { bg: '#f1f5f9', color: '#334155', border: '#cbd5e1' }
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '6px'
    }}>{name}</span>
  )
}

function VisibilityBadge({ visibility }) {
  const config = visibilityConfig[visibility] || visibilityConfig.public
  const colors = {
    public:     { bg: '#dcfce7', color: '#166534', border: '#bbf7d0' },
    department: { bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' },
    private:    { bg: '#fee2e2', color: '#991b1b', border: '#fecaca' },
  }
  const c = colors[visibility] || colors.public
  return (
    <span style={{
      background: c.bg, color: c.color, border: `1px solid ${c.border}`,
      fontSize: '12px', fontWeight: '500', padding: '3px 10px', borderRadius: '6px'
    }}>{config.label}</span>
  )
}

function DocumentListPage() {
  const { state, dispatch } = useDocuments()
  const { user } = useAuth()
  const [categories, setCategories] = useState([])
  const [search, setSearch] = useState('')
  const [filterCat, setFilterCat] = useState('All')
  const [filterVisibility, setFilterVisibility] = useState('All')
  const [page, setPage] = useState(1)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    dispatch({ type: 'SET_LOADING', payload: true })
    Promise.all([api.getDocuments(), api.getCategories()]).then(([docs, cats]) => {
      dispatch({ type: 'SET_DOCUMENTS', payload: docs })
      setCategories(cats)
    })
  }, [])

  const accessible = state.documents.filter(d => canUserAccessDocument(d, user))

  const filtered = accessible.filter(d => {
    const matchSearch = d.title?.toLowerCase().includes(search.toLowerCase()) ||
      d.owner_name?.toLowerCase().includes(search.toLowerCase()) ||
      d.owner?.toLowerCase().includes(search.toLowerCase())
    const matchCat = filterCat === 'All' || d.category === filterCat
    const matchVis = filterVisibility === 'All' || d.visibility === filterVisibility
    return matchSearch && matchCat && matchVis
  })

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)

  const filterBtnStyle = (active) => ({
    padding: '7px 16px', borderRadius: '8px', fontSize: '14px',
    fontWeight: active ? '600' : '400', cursor: 'pointer',
    border: active ? '1.5px solid #c0392b' : '1.5px solid #e8d0d0',
    background: active ? '#fce8ec' : 'white',
    color: active ? '#c0392b' : '#888',
    transition: 'all 0.15s'
  })

  return (
    <div style={{ padding: '36px 40px', fontFamily: 'system-ui, sans-serif', maxWidth: '1200px' }}>

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: '700', color: '#1a0a0f', margin: '0 0 6px' }}>
            Documents
          </h1>
          <p style={{ fontSize: '15px', color: '#888', margin: 0 }}>
            {filtered.length} document{filtered.length !== 1 ? 's' : ''} accessible to you
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            padding: '12px 24px', background: '#c0392b', border: 'none',
            borderRadius: '10px', color: 'white', fontSize: '15px',
            fontWeight: '600', cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(192,57,43,0.3)'
          }}>
          Upload Document
        </button>
      </div>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          placeholder="Search by title or owner..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1) }}
          style={{
            padding: '12px 18px', border: '1.5px solid #e8d0d0',
            borderRadius: '10px', fontSize: '15px',
            background: 'white', outline: 'none',
            color: '#1a0a0f', width: '320px', boxSizing: 'border-box'
          }}
        />
      </div>

      {/* Category filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '10px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#888', marginRight: '4px' }}>Category:</span>
        {['All', ...categories.map(c => c.name)].map(cat => (
          <button key={cat} style={filterBtnStyle(filterCat === cat)}
            onClick={() => { setFilterCat(cat); setPage(1) }}>
            {cat}
          </button>
        ))}
      </div>

      {/* Visibility filters */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', color: '#888', marginRight: '4px' }}>Access:</span>
        {[
          { key: 'All', label: 'All' },
          { key: 'public', label: 'Public' },
          { key: 'department', label: 'Department only' },
          { key: 'private', label: 'Private' },
        ].map(v => (
          <button key={v.key} style={filterBtnStyle(filterVisibility === v.key)}
            onClick={() => { setFilterVisibility(v.key); setPage(1) }}>
            {v.label}
          </button>
        ))}
      </div>

      {/* Loading state */}
      {state.loading && (
        <div style={{ textAlign: 'center', padding: '80px', color: '#aaa', fontSize: '15px' }}>
          Loading documents...
        </div>
      )}

      {/* Empty state */}
      {!state.loading && paginated.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '80px',
          background: 'white', borderRadius: '16px',
          border: '1px solid #f0e0e0'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.3 }}>[ ]</div>
          <p style={{ color: '#aaa', fontSize: '16px', margin: 0 }}>No documents found</p>
          <p style={{ color: '#bbb', fontSize: '14px', margin: '8px 0 0' }}>
            Try adjusting your search or filters
          </p>
        </div>
      )}

      {/* Document table */}
      {!state.loading && paginated.length > 0 && (
        <div style={{
          background: 'white', borderRadius: '16px',
          border: '1px solid #f0e0e0', overflow: 'hidden',
          boxShadow: '0 1px 8px rgba(0,0,0,0.04)', marginBottom: '24px'
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '15px' }}>
            <thead>
              <tr style={{ background: '#fdf8f8', borderBottom: '1px solid #f0e0e0' }}>
                {['Title', 'Category', 'Owner', 'Access', 'Version', 'Date'].map(h => (
                  <th key={h} style={{
                    padding: '14px 20px', textAlign: 'left',
                    color: '#555', fontWeight: '600', fontSize: '13px',
                    textTransform: 'uppercase', letterSpacing: '0.04em'
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map(doc => (
                <tr key={doc.id}
                  onClick={() => navigate(`/user/documents/${doc.id}`)}
                  style={{ borderBottom: '1px solid #fdf0f0', cursor: 'pointer', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#fffafa'}
                  onMouseLeave={e => e.currentTarget.style.background = 'white'}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ fontWeight: '600', color: '#1a0a0f', marginBottom: '3px' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '13px', color: '#aaa' }}>
                      {doc.description || 'No description'}
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <CategoryBadge name={doc.category} />
                  </td>
                  <td style={{ padding: '16px 20px', color: '#555', fontSize: '14px' }}>
                    {doc.owner_name || doc.owner}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    <VisibilityBadge visibility={doc.visibility} />
                  </td>
                  <td style={{ padding: '16px 20px', color: '#888', fontSize: '14px' }}>
                    v{doc.version}
                  </td>
                  <td style={{ padding: '16px 20px', color: '#aaa', fontSize: '14px' }}>
                    {doc.date || (doc.created_at ? doc.created_at.split('T')[0] : '')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            style={{
              padding: '9px 18px', borderRadius: '8px', fontSize: '14px',
              border: '1.5px solid #e8d0d0', background: 'white',
              color: page === 1 ? '#ccc' : '#c0392b', cursor: page === 1 ? 'default' : 'pointer'
            }}>Previous</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
            <button key={n} onClick={() => setPage(n)} style={{
              width: '38px', height: '38px', borderRadius: '8px', fontSize: '14px',
              border: page === n ? '1.5px solid #c0392b' : '1.5px solid #e8d0d0',
              background: page === n ? '#fce8ec' : 'white',
              color: page === n ? '#c0392b' : '#888',
              fontWeight: page === n ? '600' : '400', cursor: 'pointer'
            }}>{n}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            style={{
              padding: '9px 18px', borderRadius: '8px', fontSize: '14px',
              border: '1.5px solid #e8d0d0', background: 'white',
              color: page === totalPages ? '#ccc' : '#c0392b',
              cursor: page === totalPages ? 'default' : 'pointer'
            }}>Next</button>
        </div>
      )}

      {showModal && <UploadModal onClose={() => setShowModal(false)} categories={categories} />}
    </div>
  )
}

export default DocumentListPage