import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AuthProvider } from '../../contexts/AuthContext'
import ProtectedRoute from '../ProtectedRoute'
import * as authApi from '../../api/auth'

jest.mock('../../api/auth', () => ({
  isLoggedIn: jest.fn(),
  getToken: jest.fn(),
  getCurrentUser: jest.fn(),
  clearTokens: jest.fn(),
  saveTokens: jest.fn(),
}))

const renderProtected = (allowedRoles?: ('ADMIN' | 'ORGANIZER' | 'REGISTRANT')[]) => {
  const router = createMemoryRouter([
    {
      path: '/',
      element: <ProtectedRoute allowedRoles={allowedRoles} />,
      children: [{ index: true, element: <div>Protected Content</div> }],
    },
    { path: '/login', element: <div>Login Page</div> },
    { path: '/unauthorized', element: <div>Unauthorized Page</div> },
  ])
  return render(
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => jest.clearAllMocks())

  it('redirects to /login when not authenticated', async () => {
    ;(authApi.isLoggedIn as jest.Mock).mockReturnValue(false)
    ;(authApi.getToken as jest.Mock).mockReturnValue(null)
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue(null)

    renderProtected()
    expect(screen.getByText('Login Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when authenticated with no role restriction', () => {
    ;(authApi.isLoggedIn as jest.Mock).mockReturnValue(true)
    ;(authApi.getToken as jest.Mock).mockReturnValue('mock-token')
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ sub: 'user1', roles: ['ROLE_REGISTRANT'] })

    renderProtected()
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('renders children when user has matching role', () => {
    ;(authApi.isLoggedIn as jest.Mock).mockReturnValue(true)
    ;(authApi.getToken as jest.Mock).mockReturnValue('mock-token')
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ sub: 'admin1', roles: ['ROLE_ADMIN'] })

    renderProtected(['ADMIN'])
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /unauthorized when user has wrong role', () => {
    ;(authApi.isLoggedIn as jest.Mock).mockReturnValue(true)
    ;(authApi.getToken as jest.Mock).mockReturnValue('mock-token')
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ sub: 'user1', roles: ['ROLE_REGISTRANT'] })

    renderProtected(['ADMIN'])
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument()
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument()
  })

  it('renders children when user has one of multiple allowed roles', () => {
    ;(authApi.isLoggedIn as jest.Mock).mockReturnValue(true)
    ;(authApi.getToken as jest.Mock).mockReturnValue('mock-token')
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ sub: 'org1', roles: ['ROLE_ORGANIZER'] })

    renderProtected(['ADMIN', 'ORGANIZER'])
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })

  it('redirects to /unauthorized when user has no roles', () => {
    ;(authApi.isLoggedIn as jest.Mock).mockReturnValue(true)
    ;(authApi.getToken as jest.Mock).mockReturnValue('mock-token')
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ sub: 'user1', roles: [] })

    renderProtected(['ADMIN'])
    expect(screen.getByText('Unauthorized Page')).toBeInTheDocument()
  })
})
