import { Navigate } from 'react-router-dom'
import { ROLES } from '../lib/auth'
import { useAuth } from '../context/AuthContext'

/** Legacy route handler — all roles use dedicated portals */
export default function DashboardPage({ role }) {
  const { user } = useAuth()

  if (role === ROLES.employee || user?.role === ROLES.employee) {
    return <Navigate to="/employee" replace />
  }
  if (role === ROLES.manager || user?.role === ROLES.manager) {
    return <Navigate to="/manager" replace />
  }
  if (role === ROLES.admin || user?.role === ROLES.admin) {
    return <Navigate to="/admin" replace />
  }

  return <Navigate to="/login" replace />
}
