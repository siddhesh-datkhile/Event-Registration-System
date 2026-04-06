import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from '../../contexts/AuthContext'
import LoginPage from '../LoginPage'
import * as authApi from '../../api/auth'
import { toast } from 'react-toastify'

// Mock navigation
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

describe('LoginPage edge cases', () => {
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

  it('shows generic error toast on network failure', async () => {
    ;(authApi.login as jest.Mock).mockRejectedValueOnce(new Error('Network error'))
    renderWithProviders(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Login failed. Please check your credentials.'))
  })

  it('prioritises admin role when multiple roles present', async () => {
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ roles: ['ROLE_ADMIN', 'ROLE_ORGANIZER'] })
    await fillAndSubmit()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/admin/dashboard'))
  })

  it('navigates to generic dashboard when no roles', async () => {
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({})
    await fillAndSubmit()
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard'))
  })

  it('disables submit button while login is pending', async () => {
    const pendingPromise = new Promise((resolve) => {
      setTimeout(() => resolve({ token: 't1', refreshToken: 'r1' }), 0)
    })
    ;(authApi.login as jest.Mock).mockReturnValue(pendingPromise)
    renderWithProviders(<LoginPage />)
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })
    const button = screen.getByRole('button', { name: /Sign in/i })
    fireEvent.click(button)
    // button should be disabled immediately after click
    expect(button).toBeDisabled()
    // wait for promise to resolve and button to be enabled again
    await waitFor(() => expect(button).not.toBeDisabled())
  })
})
