import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { AuthProvider } from '../../contexts/AuthContext'
import EventDetailPage from '../EventDetailPage'
import * as eventsApi from '../../api/events'
import * as registrationsApi from '../../api/registrations'
import * as authApi from '../../api/auth'
import { toast } from 'react-toastify'

jest.mock('../../api/events', () => ({ getEventById: jest.fn() }))
jest.mock('../../api/registrations', () => ({
  createRegistration: jest.fn(),
  getMyRegistrations: jest.fn(),
}))
jest.mock('../../api/payments', () => ({ createPaymentOrder: jest.fn() }))
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() } }))
jest.mock('../../api/auth', () => ({
  isLoggedIn: jest.fn(),
  getToken: jest.fn(),
  getCurrentUser: jest.fn(),
  clearTokens: jest.fn(),
  saveTokens: jest.fn(),
}))

const mockEvent = {
  id: 1,
  title: 'React Conference',
  description: 'A great React conference.',
  eventDate: '2026-06-01T10:00:00',
  entryFee: 0,
  capacity: 100,
  availableSeats: 80,
  status: 'OPEN',
  organizerId: 1,
  venueId: 1,
}

const renderPage = (eventId = '1', loggedIn = false) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

  if (loggedIn) {
    ;(authApi.isLoggedIn as jest.Mock).mockReturnValue(true)
    ;(authApi.getToken as jest.Mock).mockReturnValue('mock-token')
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ sub: 'user', roles: ['ROLE_REGISTRANT'] })
  } else {
    ;(authApi.isLoggedIn as jest.Mock).mockReturnValue(false)
    ;(authApi.getToken as jest.Mock).mockReturnValue(null)
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue(null)
  }

  const router = createMemoryRouter([
    { path: '/events/:id', element: <AuthProvider><EventDetailPage /></AuthProvider> },
    { path: '/login', element: <div>Login Page</div> },
    { path: '/dashboard/registrations', element: <div>My Registrations</div> },
  ], { initialEntries: [`/events/${eventId}`] })

  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

describe('EventDetailPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders event title after loading', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockResolvedValue(mockEvent)
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([])
    renderPage('1', true)

    await waitFor(() => expect(screen.getByText('React Conference')).toBeInTheDocument())
  })

  it('renders event description', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockResolvedValue(mockEvent)
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([])
    renderPage('1', true)

    await waitFor(() => expect(screen.getByText('A great React conference.')).toBeInTheDocument())
  })

  it('shows Free when entry fee is 0', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockResolvedValue({ ...mockEvent, entryFee: 0 })
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([])
    renderPage('1', true)

    await waitFor(() => {
      const freeEls = screen.getAllByText('Free')
      expect(freeEls.length).toBeGreaterThan(0)
    })
  })

  it('shows entry fee in ₹ for paid events', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockResolvedValue({ ...mockEvent, entryFee: 500 })
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([])
    renderPage('1', true)

    await waitFor(() => {
      const feeEls = screen.getAllByText('₹500')
      expect(feeEls.length).toBeGreaterThan(0)
    })
  })

  it('shows error message when event fails to load', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockRejectedValue(new Error('Not Found'))
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([])
    renderPage('1', true)

    await waitFor(() => expect(screen.getByText('Could not load event')).toBeInTheDocument())
  })

  it('shows Register button for unauthenticated user on open event', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockResolvedValue(mockEvent)
    renderPage('1', false)

    await waitFor(() => expect(screen.getByText('Register for this Event')).toBeInTheDocument())
  })

  it('redirects to /login when unauthenticated user clicks Register', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockResolvedValue(mockEvent)
    renderPage('1', false)

    await waitFor(() => fireEvent.click(screen.getByText('Register for this Event')))
    await waitFor(() => {
      expect(toast.info).toHaveBeenCalledWith('Please log in to register for this event.')
    })
  })

  it('shows "You are already registered!" when user has existing registration', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockResolvedValue(mockEvent)
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([
      { id: 10, eventId: 1, status: 'CONFIRMED', registrationDate: '2026-05-01' },
    ])
    renderPage('1', true)

    await waitFor(() =>
      expect(screen.getByText('You are already registered!')).toBeInTheDocument()
    )
  })

  it('shows "This event is closed." for CLOSED events', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockResolvedValue({ ...mockEvent, status: 'CLOSED' })
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([])
    renderPage('1', true)

    await waitFor(() =>
      expect(screen.getByText('This event is closed.')).toBeInTheDocument()
    )
  })

  it('shows "Tickets Sold Out" when availableSeats is 0', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockResolvedValue({ ...mockEvent, availableSeats: 0 })
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([])
    renderPage('1', true)

    await waitFor(() => expect(screen.getByText('Tickets Sold Out')).toBeInTheDocument())
  })

  it('calls createRegistration and shows success toast for free event', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockResolvedValue(mockEvent)
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([])
    ;(registrationsApi.createRegistration as jest.Mock).mockResolvedValue({ id: 99, eventId: 1, status: 'CONFIRMED', registrationDate: '2026-05-01' })
    renderPage('1', true)

    await waitFor(() => fireEvent.click(screen.getByText('Register for this Event')))

    await waitFor(() => {
      expect(registrationsApi.createRegistration).toHaveBeenCalledWith(1)
      expect(toast.success).toHaveBeenCalledWith('Successfully registered for the free event!')
    })
  })

  it('shows already registered error on 409 conflict', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockResolvedValue(mockEvent)
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([])
    ;(registrationsApi.createRegistration as jest.Mock).mockRejectedValue({ response: { status: 409 } })
    renderPage('1', true)

    await waitFor(() => fireEvent.click(screen.getByText('Register for this Event')))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('You are already registered for this event.')
    })
  })

  it('shows View My Tickets button when already registered', async () => {
    ;(eventsApi.getEventById as jest.Mock).mockResolvedValue(mockEvent)
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([
      { id: 10, eventId: 1, status: 'PENDING', registrationDate: '2026-05-01' },
    ])
    renderPage('1', true)

    await waitFor(() => expect(screen.getByText('View My Tickets')).toBeInTheDocument())
  })
})
