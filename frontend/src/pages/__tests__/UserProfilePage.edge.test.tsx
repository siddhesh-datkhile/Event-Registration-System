import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from '../../contexts/AuthContext'
import UserProfilePage from '../UserProfilePage'
import * as authApi from '../../api/auth'

jest.mock('../../api/auth', () => ({
  getCurrentUser: jest.fn(),
  updateProfile: jest.fn(),
  saveTokens: jest.fn(),
  clearTokens: jest.fn(),
  isLoggedIn: jest.fn(),
}))
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

let queryClient: QueryClient

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{ui}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe.skip('UserProfilePage edge cases', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ email: 'test@example.com', name: 'Old Name' })
    ;(authApi.updateProfile as jest.Mock).mockResolvedValue({})
  })

  it('handles rapid consecutive saves, keeping last submitted value', async () => {
    renderWithProviders(<UserProfilePage />)
    // enter edit mode
    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }))
    const nameInput = screen.getByLabelText(/Name/i)
    // first change
    fireEvent.change(nameInput, { target: { value: 'First Change' } })
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    // second change before first resolves
    fireEvent.change(nameInput, { target: { value: 'Second Change' } })
    fireEvent.click(screen.getByRole('button', { name: /Save/i }))
    await waitFor(() => expect(authApi.updateProfile).toHaveBeenCalledTimes(2))
    // final UI should reflect second change
    expect(screen.getByText('Second Change')).toBeInTheDocument()
  })
})
