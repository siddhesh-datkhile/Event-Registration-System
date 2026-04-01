import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  allowedRoles?: ('ADMIN' | 'ORGANIZER' | 'REGISTRANT')[]
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuth()

  if (!isAuthenticated) {
    // Not logged in -> redirect to login
    return <Navigate to='/login' replace />
  }

  // Check role if allowedRoles is provided
  if (allowedRoles && allowedRoles.length > 0) {
    // The backend puts roles in an array, e.g., ["ROLE_REGISTRANT"]
    // We strip the "ROLE_" prefix for easier checking
    const userRoles = user?.roles?.map((r: string) => r.replace('ROLE_', '')) || []

    const hasAccess = userRoles.some((role: string) =>
      allowedRoles.includes(role as any)
    )

    if (!hasAccess) {
      // Logged in but wrong role
      return <Navigate to='/unauthorized' replace />
    }
  }

  // All checks passed, render the nested routes
  return <Outlet />
}

export default ProtectedRoute
