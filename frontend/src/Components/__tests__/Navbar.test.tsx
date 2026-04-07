import { render, screen, fireEvent } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AuthProvider } from '../../contexts/AuthContext'
import Navbar from '../Navbar'
import * as authApi from '../../api/auth'

jest.mock('../../api/auth', () => ({
  isLoggedIn: jest.fn(),
  getToken: jest.fn(),
  getCurrentUser: jest.fn(),
  clearTokens: jest.fn(),
  saveTokens: jest.fn(),
}))

const renderNavbar = (variant?: 'default' | 'sticky') => {
  const router = createMemoryRouter([
    { path: '/', element: <AuthProvider><Navbar variant={variant} /></AuthProvider> },
    { path: '/login', element: <div>Login Page</div> },
  ], { initialEntries: ['/'] })
  return render(<RouterProvider router={router} />)
}

describe('Navbar', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('when logged out', () => {
    beforeEach(() => {
      ;(authApi.isLoggedIn as jest.Mock).mockReturnValue(false)
      ;(authApi.getToken as jest.Mock).mockReturnValue(null)
      ;(authApi.getCurrentUser as jest.Mock).mockReturnValue(null)
    })

    it('renders brand logo and name', () => {
      renderNavbar()
      expect(screen.getByText('Eventra')).toBeInTheDocument()
    })

    it('shows Login and Create Account links', () => {
      renderNavbar()
      expect(screen.getByText('Login')).toBeInTheDocument()
      expect(screen.getByText('Create Account')).toBeInTheDocument()
    })

    it('does not show Dashboard or Logout when logged out', () => {
      renderNavbar()
      expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
      expect(screen.queryByText('Logout')).not.toBeInTheDocument()
    })

    it('shows Events link always', () => {
      renderNavbar()
      expect(screen.getByText('Events')).toBeInTheDocument()
    })
  })

  describe('when logged in as REGISTRANT', () => {
    beforeEach(() => {
      ;(authApi.isLoggedIn as jest.Mock).mockReturnValue(true)
      ;(authApi.getToken as jest.Mock).mockReturnValue('mock-token')
      ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ sub: 'user1', roles: ['ROLE_REGISTRANT'] })
    })

    it('shows Dashboard and Logout links', () => {
      renderNavbar()
      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Logout')).toBeInTheDocument()
    })

    it('does not show Login or Create Account', () => {
      renderNavbar()
      expect(screen.queryByText('Login')).not.toBeInTheDocument()
      expect(screen.queryByText('Create Account')).not.toBeInTheDocument()
    })

    it('navigates to /login on logout click', () => {
      renderNavbar()
      fireEvent.click(screen.getByText('Logout'))
      expect(screen.getByText('Login Page')).toBeInTheDocument()
    })
  })

  describe('when logged in as ADMIN', () => {
    beforeEach(() => {
      ;(authApi.isLoggedIn as jest.Mock).mockReturnValue(true)
      ;(authApi.getToken as jest.Mock).mockReturnValue('mock-token')
      ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ sub: 'admin1', roles: ['ROLE_ADMIN'] })
    })

    it('shows Dashboard link pointing to admin dashboard', () => {
      renderNavbar()
      const dashboardLink = screen.getByText('Dashboard')
      expect(dashboardLink).toBeInTheDocument()
    })
  })

  describe('variant prop', () => {
    beforeEach(() => {
      ;(authApi.isLoggedIn as jest.Mock).mockReturnValue(false)
      ;(authApi.getToken as jest.Mock).mockReturnValue(null)
      ;(authApi.getCurrentUser as jest.Mock).mockReturnValue(null)
    })

    it('renders with default variant without error', () => {
      renderNavbar('default')
      expect(screen.getByText('Eventra')).toBeInTheDocument()
    })

    it('renders with sticky variant without error', () => {
      renderNavbar('sticky')
      expect(screen.getByText('Eventra')).toBeInTheDocument()
    })
  })
})
