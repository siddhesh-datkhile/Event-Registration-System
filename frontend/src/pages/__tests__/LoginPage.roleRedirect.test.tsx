import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from '../../contexts/AuthContext'
import LoginPage from '../LoginPage'
import * as authApi from '../../api/auth'

// Mock react-router's useNavigate
jest.mock('react-router', () => {
  const actual = jest.requireActual('react-router')
  return {
    ...actual,
    useNavigate: jest.fn(() => mockNavigate),
  }
})

const mockNavigate = jest.fn()

jest.mock('../../api/auth', () => ({
  login: jest.fn(),
  getCurrentUser: jest.fn(),
  isLoggedIn: jest.fn(),
  saveTokens: jest.fn(),
  clearTokens: jest.fn(),
}))

jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginPage role‑based redirection', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(authApi.login as jest.Mock).mockResolvedValue({ token: 't1', refreshToken: 'r1' })
  })

  const fillAndSubmit = async () => {
    renderWithProviders(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    await waitFor(() => expect(authApi.login).toHaveBeenCalled())
  }

  it('navigates to admin dashboard for admin role', async () => {
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ roles: ['ROLE_ADMIN'] })
    await fillAndSubmit()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard'))
  })

  it('navigates to organizer dashboard for organizer role', async () => {
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ roles: ['ROLE_ORGANIZER'] })
    await fillAndSubmit()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/organizer/dashboard'))
  })

  it('navigates to generic dashboard for other roles', async () => {
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ roles: ['REGISTRANT'] })
    await fillAndSubmit()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })
})
