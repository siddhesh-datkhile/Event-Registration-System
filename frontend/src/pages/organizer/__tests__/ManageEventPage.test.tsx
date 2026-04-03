import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '../../../contexts/AuthContext'
import ManageEventPage from '../ManageEventPage'
import * as eventApi from '../../../api/events'
import * as venueApi from '../../../api/venues'
import * as authApi from '../../../api/auth'

jest.mock('../../../api/events', () => ({
  createEvent: jest.fn(), getEventById: jest.fn(), updateEvent: jest.fn(), deleteEvent: jest.fn()
}))
jest.mock('../../../api/venues', () => ({ getAllVenues: jest.fn() }))
jest.mock('../../../api/auth', () => ({ getCurrentUser: jest.fn(), isLoggedIn: jest.fn() }))
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

describe('ManageEventPage Component', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    ;(authApi.getCurrentUser as jest.Mock).mockReturnValue({ id: 1, roles: ['ORGANIZER'] })
    ;(venueApi.getAllVenues as jest.Mock).mockResolvedValue([{ id: 1, name: 'Venue A' }])
  })

  // To silence DOM nesting warnings due to wrapper nesting
  const originalError = console.error
  beforeAll(() => {
    console.error = (...args) => {
      if (/Warning.*not wrapped in act/.test(args[0])) return
      originalError.call(console, ...args)
    }
  })
  afterAll(() => { console.error = originalError })

  const renderComponent = (isEditing = false) => render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={isEditing ? ['/organizer/events/1'] : ['/organizer/events/new']}>
          <Routes>
            <Route path='/organizer/events/new' element={<ManageEventPage />} />
            <Route path='/organizer/events/:id' element={<ManageEventPage />} />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>
  )

  it('should render form for creating a new event', async () => {
    renderComponent(false)
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: 'Create New Event' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Create Event' })).toBeInTheDocument()
    })
  })

  it('should pre-fill form data when editing an existing event', async () => {
    ;(eventApi.getEventById as jest.Mock).mockResolvedValueOnce({
      id: 1, title: 'Old Event', description: 'Desc', entryFee: 100, capacity: 50, status: 'OPEN', organizerId: 1, venueId: 1
    })

    renderComponent(true)

    await waitFor(() => {
      expect(eventApi.getEventById).toHaveBeenCalledWith('1')
      expect(screen.getByDisplayValue('Old Event')).toBeInTheDocument()
    })
  })

  it('should show delete button only when editing an event', async () => {
    ;(eventApi.getEventById as jest.Mock).mockResolvedValueOnce({ title: 'Old Event' })
    renderComponent(true)
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /Delete Event/i })).toBeInTheDocument()
    })
  })

  it('should correctly parse form values before submission', async () => {
    ;(eventApi.createEvent as jest.Mock).mockResolvedValueOnce({})
    renderComponent(false)

    await waitFor(() => {
        expect(document.querySelector('input[name="title"]')).toBeInTheDocument()
    })
    
    fireEvent.change(document.querySelector('input[name="title"]') as Element, { target: { value: 'New Event' } })
    fireEvent.change(document.querySelector('textarea[name="description"]') as Element, { target: { value: 'Tech Event' } })
    fireEvent.change(document.querySelector('input[name="eventDate"]') as Element, { target: { value: '2025-01-01T10:00' } })
    fireEvent.change(document.querySelector('input[name="entryFee"]') as Element, { target: { value: '50' } })
    fireEvent.change(document.querySelector('input[name="capacity"]') as Element, { target: { value: '100' } })

    fireEvent.click(screen.getByRole('button', { name: 'Create Event' }))

    await waitFor(() => {
      expect(eventApi.createEvent).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Event',
        entryFee: 50,
        capacity: 100,
      }))
    })
  })
})
