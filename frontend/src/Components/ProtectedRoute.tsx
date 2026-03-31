import { Navigate, Outlet } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
  sub: string
  roles: string[]
  iat: number
  exp: number
  userId: number
}

interface ProtectedRouteProps {
  allowedRoles?: ('ADMIN' | 'ORGANIZER' | 'REGISTRANT')[]
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const token = localStorage.getItem('token')

  if (!token) {
    // Not logged in -> redirect to login
    return <Navigate to='/login' replace />
  }

  try {
    const decoded = jwtDecode<JwtPayload>(token)

    // Check role if allowedRoles is provided
    if (allowedRoles && allowedRoles.length > 0) {
      // The backend puts roles in an array, e.g., ["ROLE_REGISTRANT"]
      // We strip the "ROLE_" prefix for easier checking
      const userRoles = decoded.roles.map((r) => r.replace('ROLE_', ''))

      const hasAccess = userRoles.some((role) =>
        allowedRoles.includes(role as any)
      )

      if (!hasAccess) {
        // Logged in but wrong role
        return <Navigate to='/unauthorized' replace />
      }

    }

    // All checks passed, render the nested routes
    return <Outlet />

  } catch (error) {
    // Invalid token format
    localStorage.removeItem('token')
    return <Navigate to='/login' replace />
  }
}

export default ProtectedRoute
