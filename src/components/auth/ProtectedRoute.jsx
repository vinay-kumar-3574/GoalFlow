import { useEffect } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { toast } from 'sonner'
import { getDashboardPath } from '../../lib/auth'
import { useAuth } from '../../context/AuthContext'

function AccessDeniedRedirect({ to }) {
  useEffect(() => {
    toast.error('Access denied. Redirecting to your dashboard.')
  }, [])
  return <Navigate to={to} replace />
}

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth()
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <AccessDeniedRedirect to={getDashboardPath(user.role)} />
  }

  return children
}
