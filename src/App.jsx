import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { DocumentProvider } from './context/DocumentContext'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/LoginPage'
import UserLayout from './layouts/UserLayout'
import AdminLayout from './layouts/AdminLayout'
import DocumentListPage from './pages/user/DocumentListPage'
import DocumentDetailPage from './pages/user/DocumentDetailPage'
import UsersPage from './pages/admin/UsersPage'
import DepartmentsPage from './pages/admin/DepartmentsPage'
import CategoriesPage from './pages/admin/CategoriesPage'
import ActivityLogPage from './pages/admin/ActivityLogPage'


function App() {
  return (
    <AuthProvider>
      <DocumentProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />

          <Route path="/user" element={
            <ProtectedRoute role="user"><UserLayout /></ProtectedRoute>
          }>
            <Route path="documents" element={<DocumentListPage />} />
            <Route path="documents/:id" element={<DocumentDetailPage />} />
          </Route>

          <Route path="/admin" element={
            <ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>
          }>
            <Route path="users" element={<UsersPage />} />
            <Route path="departments" element={<DepartmentsPage />} />
            <Route path="categories" element={<CategoriesPage />} />
            <Route path="activity" element={<ActivityLogPage />} />

          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </DocumentProvider>
    </AuthProvider>
  )
}

export default App