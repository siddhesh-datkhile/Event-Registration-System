import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { EventCard } from '../EventCard'
import type { Event } from '../../model'

const baseEvent: Event = {
  id: 1,
  title: 'React Summit 2026',
  description: 'The biggest React conference of the year.',
  eventDate: '2026-06-15T10:00:00',
  entryFee: 500,
  capacity: 100,
  availableSeats: 80,
  status: 'OPEN',
  organizerId: 1,
  venueId: 1,
}

const renderCard = (event: Event, actionSlot?: React.ReactNode) => {
  const router = createMemoryRouter([
    { path: '/', element: <EventCard event={event} actionSlot={actionSlot} /> },
    { path: '/events/:id', element: <div>Event Detail</div> },
  ])
  return render(<RouterProvider router={router} />)
}

describe('EventCard', () => {
  it('renders event title and description', () => {
    renderCard(baseEvent)
    expect(screen.getByText('React Summit 2026')).toBeInTheDocument()
    expect(screen.getByText('The biggest React conference of the year.')).toBeInTheDocument()
  })

  it('renders OPEN status badge', () => {
    renderCard(baseEvent)
    expect(screen.getByText('Open')).toBeInTheDocument()
  })

  it('renders CLOSED status badge for closed event', () => {
    renderCard({ ...baseEvent, status: 'CLOSED' })
    expect(screen.getByText('Closed')).toBeInTheDocument()
  })

  it('renders seat availability as X / Y seats', () => {
    renderCard(baseEvent)
    expect(screen.getByText('80 / 100 seats')).toBeInTheDocument()
  })

  it('renders entry fee as ₹500 when paid', () => {
    renderCard(baseEvent)
    expect(screen.getByText('₹500')).toBeInTheDocument()
  })

  it('renders Free when entry fee is 0', () => {
    renderCard({ ...baseEvent, entryFee: 0 })
    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('renders View Details link pointing to correct event URL', () => {
    renderCard(baseEvent)
    const link = screen.getByRole('link', { name: /View Details/i })
    expect(link).toBeInTheDocument()
    expect(link).toHaveAttribute('href', '/events/1')
  })

  it('renders actionSlot when provided', () => {
    renderCard(baseEvent, <button>Cancel</button>)
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
  })

  it('does not render actionSlot area when not provided', () => {
    renderCard(baseEvent)
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument()
  })

  it('applies opacity/grayscale when event is CLOSED', () => {
    const { container } = renderCard({ ...baseEvent, status: 'CLOSED' })
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('opacity-60')
  })

  it('applies opacity/grayscale when availableSeats is 0', () => {
    const { container } = renderCard({ ...baseEvent, availableSeats: 0 })
    const card = container.firstChild as HTMLElement
    expect(card.className).toContain('opacity-60')
  })

  it('uses green seat badge when many seats available (>50%)', () => {
    // 80/100 = 80% > 50% -> emerald
    renderCard({ ...baseEvent, availableSeats: 80, capacity: 100 })
    const badge = screen.getByText('80 / 100 seats')
    expect(badge.className).toContain('emerald')
  })

  it('uses amber seat badge when seats are low (20-50%)', () => {
    // 30/100 = 30% -> amber
    renderCard({ ...baseEvent, availableSeats: 30, capacity: 100 })
    const badge = screen.getByText('30 / 100 seats')
    expect(badge.className).toContain('amber')
  })

  it('uses red seat badge when very few seats remain (<20%)', () => {
    // 10/100 = 10% -> red
    renderCard({ ...baseEvent, availableSeats: 10, capacity: 100 })
    const badge = screen.getByText('10 / 100 seats')
    expect(badge.className).toContain('red')
  })
})
