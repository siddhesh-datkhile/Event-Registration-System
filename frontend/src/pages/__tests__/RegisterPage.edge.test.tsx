import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from '../../contexts/AuthContext'
import RegisterPage from '../RegisterPage'
import * as authApi from '../../api/auth'
import { toast } from 'react-toastify'

jest.mock('../../api/auth', () => ({
  register: jest.fn(),
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

describe.skip('RegisterPage edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(authApi.register as jest.Mock).mockResolvedValue({ token: 't1', refreshToken: 'r1' })
  })

  it('shows error toast on duplicate email', async () => {
    ;(authApi.register as jest.Mock).mockRejectedValueOnce({ response: { data: { message: 'Email already exists' } } })
    renderWithProviders(<RegisterPage />)
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'duplicate@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'Password123!' } })
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }))
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith('Email already exists'))
  })
})
