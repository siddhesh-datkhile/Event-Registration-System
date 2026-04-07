import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter, RouterProvider } from 'react-router'
import EventsPage from '../EventsPage'
import * as eventsApi from '../../api/events'

jest.mock('../../api/events', () => ({
  getAllEvents: jest.fn(),
}))

jest.mock('../../Components/EventCard', () => ({
  EventCard: ({ event }: { event: { title: string } }) => <div data-testid='event-card'>{event.title}</div>,
}))

const mockEvents = [
  { id: 1, title: 'React Conference', description: 'A React event', eventDate: '2026-06-01', entryFee: 500, capacity: 100, status: 'OPEN', organizerId: 1, venueId: 1 },
  { id: 2, title: 'Vue Summit', description: 'A Vue event', eventDate: '2026-07-01', entryFee: 300, capacity: 50, status: 'CLOSED', organizerId: 2, venueId: 2 },
  { id: 3, title: 'Angular Conf', description: 'An Angular event', eventDate: '2026-08-01', entryFee: 400, capacity: 200, status: 'OPEN', organizerId: 1, venueId: 3 },
]

const renderEventsPage = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  const router = createMemoryRouter([
    { path: '/', element: <EventsPage /> },
  ])
  return render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

describe('EventsPage', () => {
  beforeEach(() => jest.clearAllMocks())

  it('renders heading', async () => {
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue(mockEvents)
    renderEventsPage()
    expect(screen.getByText('Browse Events')).toBeInTheDocument()
  })

  it('renders event cards after loading', async () => {
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue(mockEvents)
    renderEventsPage()
    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(3)
    })
  })

  it('shows empty state when no events exist', async () => {
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue([])
    renderEventsPage()
    await waitFor(() => {
      expect(screen.getByText('No events found')).toBeInTheDocument()
    })
  })

  it('shows error message when API fails', async () => {
    ;(eventsApi.getAllEvents as jest.Mock).mockRejectedValue(new Error('Network error'))
    renderEventsPage()
    await waitFor(() => {
      expect(screen.getByText(/Could not load events/i)).toBeInTheDocument()
    })
  })

  it('filters events by search text', async () => {
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue(mockEvents)
    renderEventsPage()

    await waitFor(() => expect(screen.getAllByTestId('event-card')).toHaveLength(3))

    fireEvent.change(screen.getByPlaceholderText('Search events…'), {
      target: { value: 'React' },
    })

    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(1)
      expect(screen.getByText('React Conference')).toBeInTheDocument()
    })
  })

  it('filters events by OPEN status', async () => {
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue(mockEvents)
    renderEventsPage()

    await waitFor(() => expect(screen.getAllByTestId('event-card')).toHaveLength(3))

    fireEvent.click(screen.getByRole('button', { name: 'Open' }))

    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(2)
    })
  })

  it('filters events by CLOSED status', async () => {
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue(mockEvents)
    renderEventsPage()

    await waitFor(() => expect(screen.getAllByTestId('event-card')).toHaveLength(3))

    fireEvent.click(screen.getByRole('button', { name: 'Closed' }))

    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(1)
      expect(screen.getByText('Vue Summit')).toBeInTheDocument()
    })
  })

  it('shows all events when All filter is active', async () => {
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue(mockEvents)
    renderEventsPage()

    await waitFor(() => expect(screen.getAllByTestId('event-card')).toHaveLength(3))

    fireEvent.click(screen.getByRole('button', { name: 'Open' }))
    fireEvent.click(screen.getByRole('button', { name: 'All' }))

    await waitFor(() => {
      expect(screen.getAllByTestId('event-card')).toHaveLength(3)
    })
  })

  it('shows empty state when search matches nothing', async () => {
    ;(eventsApi.getAllEvents as jest.Mock).mockResolvedValue(mockEvents)
    renderEventsPage()

    await waitFor(() => expect(screen.getAllByTestId('event-card')).toHaveLength(3))

    fireEvent.change(screen.getByPlaceholderText('Search events…'), {
      target: { value: 'xyznonexistent' },
    })

    await waitFor(() => {
      expect(screen.getByText('No events found')).toBeInTheDocument()
    })
  })
})
