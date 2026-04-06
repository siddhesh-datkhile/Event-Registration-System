import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { RouterProvider, createMemoryRouter } from 'react-router'
import RegisterPage from '../RegisterPage'
import * as authApi from '../../api/auth'
import { toast } from 'react-toastify'

jest.mock('../../api/auth', () => ({ register: jest.fn() }))
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

describe('RegisterPage Component', () => {
  const renderWithRouter = () => {
    const router = createMemoryRouter([
      { path: '/register', element: <RegisterPage /> },
      { path: '/login', element: <div>Login</div> },
    ], {
      initialEntries: ['/register'],
    })

    return render(<RouterProvider router={router} />)
  }

  beforeEach(() => { jest.clearAllMocks() })

  it('should render register form fields correctly', () => {
    renderWithRouter()
    expect(screen.getByLabelText(/Full name/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument()
  })

  it('should show Zod validation errors on invalid inputs', async () => {
    renderWithRouter()
    fireEvent.click(screen.getByRole('button', { name: /Create account/i }))

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument()
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument()
    })
  })

  it('should successfully submit and show success toast', async () => {
    ;(authApi.register as jest.Mock).mockResolvedValueOnce({})

    renderWithRouter()

    fireEvent.change(screen.getByLabelText(/Full name/i), { target: { value: 'Jane Doe' } })
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } })
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'securepass' } })
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '1234567890' } })
    fireEvent.change(screen.getByLabelText(/Address/i), { target: { value: '123 Mars' } })
    fireEvent.change(screen.getByLabelText(/Date of birth/i), { target: { value: '2000-01-01' } })

    fireEvent.click(screen.getByRole('button', { name: /Create account/i }))

    await waitFor(() => {
      expect(authApi.register).toHaveBeenCalledWith({
        name: 'Jane Doe', email: 'jane@example.com', password: 'securepass',
        phone: '1234567890', address: '123 Mars', dob: '2000-01-01', role: 'REGISTRANT'
      })
      expect(toast.success).toHaveBeenCalledWith('Account created! Please sign in.')
    })
  })
})
