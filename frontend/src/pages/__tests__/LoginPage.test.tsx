import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../contexts/AuthContext'
import LoginPage from '../LoginPage'
import * as authApi from '../../api/auth'
import { toast } from 'react-toastify'

jest.mock('../../api/auth', () => ({
  login: jest.fn(),
  getCurrentUser: jest.fn(),
  isLoggedIn: jest.fn(),
  saveTokens: jest.fn(),
  clearTokens: jest.fn()
}))
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  )
}

describe('LoginPage Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()

      // Default mocks to prevent unhandled rejection spam
      ; (authApi.login as jest.Mock).mockResolvedValue({ token: 't1', refreshToken: 'r1' })
      ; (authApi.getCurrentUser as jest.Mock).mockReturnValue({ sub: 'user', roles: ['REGISTRANT'] })
  })

  it('should render login form correctly', () => {
    renderWithProviders(<LoginPage />)
    expect(screen.getByText('Welcome back')).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
  })

  it('should show validation errors when submitting empty form', async () => {
    renderWithProviders(<LoginPage />)
    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument()
      expect(screen.getByText('Password is required')).toBeInTheDocument()
    })
  })

  it('should call login API and navigate on successful login', async () => {
    renderWithProviders(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'test@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } })

    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({ email: 'test@example.com', password: 'password123' })
      expect(toast.success).toHaveBeenCalledWith('Logged in successfully!')
    })
  })

  it('should show error toast on invalid credentials', async () => {
    ; (authApi.login as jest.Mock).mockRejectedValueOnce({ response: { data: { message: 'Bad credentials' } } })

    renderWithProviders(<LoginPage />)

    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'siddhesh@gmail.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'registrant@123' } })

    fireEvent.click(screen.getByRole('button', { name: /Sign in/i }))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Bad credentials')
    })
  })
})
