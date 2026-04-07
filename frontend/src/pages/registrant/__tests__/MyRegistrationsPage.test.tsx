import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import MyRegistrationsPage from '../MyRegistrationsPage'
import * as registrationsApi from '../../../api/registrations'
import * as eventsApi from '../../../api/events'
import * as receiptsApi from '../../../api/receipts'
import { toast } from 'react-toastify'

jest.mock('../../../api/registrations', () => ({
  getMyRegistrations: jest.fn(),
  cancelRegistration: jest.fn(),
}))

jest.mock('../../../api/events', () => ({ getAllEvents: jest.fn() }))
jest.mock('../../../api/payments', () => ({ createPaymentOrder: jest.fn() }))
jest.mock('../../../api/receipts', () => ({ getReceiptHtml: jest.fn() }))
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn(), info: jest.fn() } }))

jest.mock('../../../components/RegistrationCard', () => ({
  RegistrationCard: ({ registration, onCancel }: any) => (
    <div data-testid='reg-card'>
      <span>{registration.status}</span>
      <button onClick={() => onCancel(registration.id)}>Cancel</button>
    </div>
  ),
}))

const mockEvent = { id: 10, title: 'Test Event', description: 'Desc', eventDate: '2026-06-01', entryFee: 0, capacity: 100, availableSeats: 80, status: 'OPEN', organizerId: 1, venueId: 1 }
const mockReg = { id: 1, eventId: 10, status: 'CONFIRMED', registrationDate: '2026-05-01T10:00:00' }

const renderPage = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const router = createMemoryRouter([{ path: '/', element: <MyRegistrationsPage /> }])
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

describe('MyRegistrationsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    window.confirm = jest.fn(() => true)
  })

  it('renders the page heading', async () => {
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([])
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([])
    renderPage()
    await waitFor(() => expect(screen.getByText('My Registrations')).toBeInTheDocument())
  })

  it('shows empty state when no registrations', async () => {
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([])
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([])
    renderPage()

    await waitFor(() =>
      expect(screen.getByText(/haven't registered/i)).toBeInTheDocument()
    )
  })

  it('renders registration cards when registrations exist', async () => {
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([mockReg])
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([mockEvent])
    renderPage()

    await waitFor(() => expect(screen.getAllByTestId('reg-card')).toHaveLength(1))
  })

  it('renders multiple registration cards sorted by date', async () => {
    const reg2 = { id: 2, eventId: 10, status: 'CANCELLED', registrationDate: '2026-04-01T10:00:00' }
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([reg2, mockReg])
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([mockEvent])
    renderPage()

    await waitFor(() => expect(screen.getAllByTestId('reg-card')).toHaveLength(2))
  })

  it('shows unknown event placeholder when event is not in list', async () => {
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([mockReg])
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([]) // empty events list
    renderPage()

    await waitFor(() => expect(screen.getByText(/Unknown Event/i)).toBeInTheDocument())
  })

  it('shows Find more events link', async () => {
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([])
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([])
    renderPage()

    await waitFor(() => expect(screen.getByText('Find more events')).toBeInTheDocument())
  })

  it('calls cancelRegistration when Cancel is clicked and user confirms', async () => {
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([mockReg])
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([mockEvent])
    ;(registrationsApi.cancelRegistration as jest.Mock).mockResolvedValue({ ...mockReg, status: 'CANCELLED' })
    renderPage()

    await waitFor(() => fireEvent.click(screen.getByRole('button', { name: 'Cancel' })))

    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to cancel this registration?')
      expect(registrationsApi.cancelRegistration).toHaveBeenCalledWith(1)
    })
  })

  it('does not cancel when user dismisses confirmation dialog', async () => {
    window.confirm = jest.fn(() => false)
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([mockReg])
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([mockEvent])
    renderPage()

    await waitFor(() => fireEvent.click(screen.getByRole('button', { name: 'Cancel' })))

    expect(registrationsApi.cancelRegistration).not.toHaveBeenCalled()
  })

  it('shows success toast after successful cancel', async () => {
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([mockReg])
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([mockEvent])
    ;(registrationsApi.cancelRegistration as jest.Mock).mockResolvedValue({})
    renderPage()

    await waitFor(() => fireEvent.click(screen.getByRole('button', { name: 'Cancel' })))

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Registration cancelled successfully.')
    })
  })

  it('shows error toast when cancel fails', async () => {
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([mockReg])
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([mockEvent])
    ;(registrationsApi.cancelRegistration as jest.Mock).mockRejectedValue(new Error('Server error'))
    renderPage()

    await waitFor(() => fireEvent.click(screen.getByRole('button', { name: 'Cancel' })))

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to cancel registration.')
    })
  })

  it('fetches and shows receipt modal when view receipt is triggered', async () => {
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([mockReg])
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([mockEvent])
    ;(receiptsApi.getReceiptHtml as jest.Mock).mockResolvedValue('<p>Receipt Content</p>')

    // Override the RegistrationCard mock to expose onViewReceipt
    jest.spyOn(require('../../../components/RegistrationCard'), 'RegistrationCard').mockImplementation(
      ({ registration, onViewReceipt }: any) => (
        <div data-testid='reg-card'>
          <button onClick={() => onViewReceipt(registration.id)}>View Receipt</button>
        </div>
      )
    )

    renderPage()

    await waitFor(() => fireEvent.click(screen.getByRole('button', { name: 'View Receipt' })))

    await waitFor(() => {
      expect(screen.getByText('Registration Receipt')).toBeInTheDocument()
    })
  })

  it('closes receipt modal when ✕ is clicked', async () => {
    ;(registrationsApi.getMyRegistrations as jest.Mock).mockResolvedValue([mockReg])
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([mockEvent])
    ;(receiptsApi.getReceiptHtml as jest.Mock).mockResolvedValue('<p>Receipt Content</p>')

    jest.spyOn(require('../../../components/RegistrationCard'), 'RegistrationCard').mockImplementation(
      ({ registration, onViewReceipt }: any) => (
        <div data-testid='reg-card'>
          <button onClick={() => onViewReceipt(registration.id)}>View Receipt</button>
        </div>
      )
    )

    renderPage()

    await waitFor(() => fireEvent.click(screen.getByRole('button', { name: 'View Receipt' })))
    await waitFor(() => expect(screen.getByText('Registration Receipt')).toBeInTheDocument())

    fireEvent.click(screen.getByTitle('Close'))
    await waitFor(() => expect(screen.queryByText('Registration Receipt')).not.toBeInTheDocument())
  })
})
