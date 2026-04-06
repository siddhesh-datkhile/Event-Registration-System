import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider, createMemoryRouter } from 'react-router'
import { AuthProvider } from '../../contexts/AuthContext'
import UserProfilePage from '../UserProfilePage'
import * as authApi from '../../api/auth'
import { toast } from 'react-toastify'

jest.mock('../../api/auth', () => ({
  fetchUserProfile: jest.fn(),
  updateProfile: jest.fn(),
  getCurrentUser: jest.fn(),
  isLoggedIn: jest.fn()
}))
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

const mockUser = { id: 1, email: 'test@example.com', role: 'ROLE_REGISTRANT' }
const mockProfile = { id: 1, name: 'John Doe', email: 'test@example.com', phone: '1234567890', address: '123 St', dob: '2000-01-01', role: 'ROLE_REGISTRANT' }

describe('UserProfilePage', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue(mockUser)
    ;(authApi.fetchUserProfile as jest.Mock).mockResolvedValue(mockProfile)
  })

  const renderComponent = () => {
    const router = createMemoryRouter([
      { path: '*', element: <AuthProvider><UserProfilePage /></AuthProvider> }
    ], {
      initialEntries: ['/profile'],
    })

    return render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )
  }

  it('should display loading state initially', () => {
    renderComponent()
    expect(screen.getByText('Loading profile...')).toBeInTheDocument()
  })

  it('should display user profile data correctly', async () => {
    renderComponent()
    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument()
      expect(screen.getByText('1234567890')).toBeInTheDocument()
    })
  })

  it('should switch to edit mode when Edit Profile is clicked', async () => {
    renderComponent()
    
    // Wait for load
    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument())
    
    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }))
    await waitFor(() => expect(document.querySelector('input[name="name"]')).toBeInTheDocument())
    
    // Switch back
    fireEvent.click(screen.getByRole('button', { name: /Cancel/i }))
    expect(document.querySelector('input[name="name"]')).not.toBeInTheDocument()
  })

  it('should call update API and show success toast on valid submission', async () => {
    ;(authApi.updateProfile as jest.Mock).mockResolvedValueOnce({})
    renderComponent()

    await waitFor(() => expect(screen.getByText('John Doe')).toBeInTheDocument())
    
    fireEvent.click(screen.getByRole('button', { name: /Edit Profile/i }))
    
    await waitFor(() => expect(document.querySelector('input[name="name"]')).toBeInTheDocument())
    const nameInput = document.querySelector('input[name="name"]') as HTMLInputElement
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } })

    fireEvent.click(screen.getByRole('button', { name: /Save Changes/i }))

    await waitFor(() => {
      expect(authApi.updateProfile).toHaveBeenCalledWith(expect.objectContaining({ name: 'Jane Doe' }))
      expect(toast.success).toHaveBeenCalledWith('Profile updated successfully!')
    })
  })
})
