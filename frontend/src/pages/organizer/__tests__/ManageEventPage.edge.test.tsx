import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '../../../contexts/AuthContext'
import ManageEventPage from '../ManageEventPage'
import * as eventsApi from '../../../api/events'
import * as venuesApi from '../../../api/venues'
import { toast } from 'react-toastify'

jest.mock('../../../api/events', () => ({
  getEventById: jest.fn(),
  createEvent: jest.fn(),
  updateEvent: jest.fn(),
  deleteEvent: jest.fn(),
}))
jest.mock('../../../api/venues', () => ({
  getAllVenues: jest.fn(),
}))
jest.mock('react-toastify', () => ({ toast: { success: jest.fn(), error: jest.fn() } }))

let queryClient: QueryClient

const renderWithProviders = (ui) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{ui}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

describe.skip('ManageEventPage edge cases', () => {
  const mockVenue = { id: 1, name: 'Venue A', address: 'Addr', city: 'City' }

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    ;(venuesApi.getAllVenues as jest.Mock).mockResolvedValue([mockVenue])
  })
})
