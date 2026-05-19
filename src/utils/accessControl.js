export function canUserAccessDocument(doc, user) {
  if (!user) return false
  if (user.role === 'admin') return true
  if (doc.owner_id === user.id) return true  

  switch (doc.visibility) {
    case 'public':
      return true
    case 'department': {
      const userDepts = (user.department || '').split(',').map(d => d.trim())
      return userDepts.includes(doc.department)
    }
    case 'private':
      return doc.owner_id === user.id
    default:
      return false
  }
}

export const visibilityConfig = {
  public: {
    label: 'Public',
    icon: '',
    description: 'Visible to all users',
    bg: '#f0fdf4', color: '#16a34a', border: '#bbf7d0'
  },
  department: {
    label: 'Department only',
    icon: '',
    description: 'Visible to your department',
    bg: '#eff6ff', color: '#3b82f6', border: '#bfdbfe'
  },
  private: {
    label: 'Private',
    icon: '',
    description: 'Only visible to you',
    bg: '#fff1f2', color: '#e11d48', border: '#fecdd3'
  }
}