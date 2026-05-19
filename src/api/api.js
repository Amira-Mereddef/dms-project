const BASE = 'http://localhost:4000/api'

const getToken = () => localStorage.getItem('dms_token')

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
})

export const api = {
  login: async (email, password) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error)
    localStorage.setItem('dms_token', data.token)
    return data.user
  },

  getDocuments: async () => {
    const res = await fetch(`${BASE}/documents`, { headers: authHeaders() })
    const data = await res.json()
    return data.data || []
  },

  getDocument: async (id) => {
    const res = await fetch(`${BASE}/documents/${id}`, { headers: authHeaders() })
    return res.json()
  },

  addDocument: async (formData) => {
    const res = await fetch(`${BASE}/documents`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${getToken()}` },
      body: formData
    })
    return res.json()
  },

  updateDocument: async (id, data) => {
    const res = await fetch(`${BASE}/documents/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  },

  getDownloadUrl: async (id) => {
    const res = await fetch(`${BASE}/documents/${id}/download`, { headers: authHeaders() })
    return res.json()
  },

  getVersions: async (docId) => {
    const res = await fetch(`${BASE}/documents/${docId}/versions`, { headers: authHeaders() })
    return res.json()
  },

  addVersion: async (docId, note, author) => {
    const res = await fetch(`${BASE}/documents/${docId}/versions`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ note, author })
    })
    return res.json()
  },

  getComments: async (docId) => {
    const res = await fetch(`${BASE}/comments/${docId}`, { headers: authHeaders() })
    return res.json()
  },

  addComment: async (docId, text) => {
    const res = await fetch(`${BASE}/comments/${docId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ text })
    })
    return res.json()
  },

  getUsers: async () => {
  const res = await fetch(`${BASE}/users`, { headers: authHeaders() })
  const data = await res.json()
  return Array.isArray(data) ? data : []
},

  addUser: async (user) => {
    const res = await fetch(`${BASE}/users`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(user)
    })
    return res.json()
  },

  updateUser: async (id, data) => {
    const res = await fetch(`${BASE}/users/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  },

  deleteUser: async (id) => {
    const res = await fetch(`${BASE}/users/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    return res.json()
  },

  getDepartments: async () => {
  const res = await fetch(`${BASE}/departments`, { headers: authHeaders() })
  const data = await res.json()
  return Array.isArray(data) ? data : []
},

  addDepartment: async (dept) => {
    const res = await fetch(`${BASE}/departments`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(dept)
    })
    return res.json()
  },

  updateDepartment: async (id, data) => {
    const res = await fetch(`${BASE}/departments/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  },

  deleteDepartment: async (id) => {
    const res = await fetch(`${BASE}/departments/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    return res.json()
  },

  getCategories: async () => {
  const res = await fetch(`${BASE}/categories`, { headers: authHeaders() })
  const data = await res.json()
  return Array.isArray(data) ? data : []
},

  addCategory: async (cat) => {
    const res = await fetch(`${BASE}/categories`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(cat)
    })
    return res.json()
  },

  updateCategory: async (id, data) => {
    const res = await fetch(`${BASE}/categories/${id}`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: JSON.stringify(data)
    })
    return res.json()
  },

  deleteCategory: async (id) => {
    const res = await fetch(`${BASE}/categories/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    return res.json()
  },

  getActivityLog: async () => {
    const res = await fetch(`${BASE}/activity`, { headers: authHeaders() })
    return res.json()
  },
}