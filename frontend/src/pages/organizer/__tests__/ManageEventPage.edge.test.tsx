import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router'
import { AuthProvider } from '../../../contexts/AuthContext'
import * as venuesApi from '../../../api/venues'

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

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{ui}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  )
}

void renderWithProviders

describe.skip('ManageEventPage edge cases', () => {
  const mockVenue = { id: 1, name: 'Venue A', address: 'Addr', city: 'City' }

  beforeEach(() => {
    jest.clearAllMocks()
    queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    ;(venuesApi.getAllVenues as jest.Mock).mockResolvedValue([mockVenue])
  })
})
