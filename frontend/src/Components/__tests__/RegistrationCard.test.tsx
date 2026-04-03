import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { RegistrationCard } from '../RegistrationCard'

// Mock EventCard to isolate this component
jest.mock('../EventCard', () => ({
  EventCard: ({ actionSlot }: { actionSlot: React.ReactNode }) => (
    <div data-testid="mock-event-card">{actionSlot}</div>
  )
}))

describe('RegistrationCard Component', () => {
  const mockEvent = {
    id: 1, title: 'Test Event', description: 'Tech meetup',
    eventDate: '2023-10-10T10:00:00Z', capacity: 100, entryFee: 50,
    status: 'OPEN' as any, organizerId: 1, venueId: 1,
    organizerName: 'John Doe',
    venue: { id: 1, name: 'Center', address: '123 St', city: 'Metro' }
  }

  const mockRegistration = {
    id: 1, eventId: 1, registrantId: 1, paymentId: 'pay_123',
    status: 'CONFIRMED' as any, registrationDate: '2023-09-01T10:00:00Z',
    event: mockEvent
  }

  it('should render unknown event if event object is missing', () => {
    render(<RegistrationCard registration={{ ...mockRegistration, event: undefined }} />)
    expect(screen.getByText('Unknown Event (ID: 1)')).toBeInTheDocument()
  })

  it('should render ticket details (status and date)', () => {
    render(<RegistrationCard registration={mockRegistration} />)
    expect(screen.getByText('CONFIRMED')).toBeInTheDocument()
    expect(screen.getByText(new Date(mockRegistration.registrationDate).toLocaleDateString())).toBeInTheDocument()
  })

  it('should trigger onPayNow when status is PENDING and button is clicked', () => {
    const payNowMock = jest.fn()
    render(<RegistrationCard registration={{ ...mockRegistration, status: 'PENDING' }} onPayNow={payNowMock} />)

    const payBtn = screen.getByRole('button', { name: /Pay Now/i })
    fireEvent.click(payBtn)
    expect(payNowMock).toHaveBeenCalledWith(1, mockEvent)
  })

  it('should display "CANCELLED" badge and disallow cancel action', () => {
    const cancelMock = jest.fn()
    const { rerender } = render(<RegistrationCard registration={{ ...mockRegistration, status: 'PENDING' }} onCancel={cancelMock} />)

    const cancelBtn = screen.getByRole('button', { name: /Cancel Registration/i })
    fireEvent.click(cancelBtn)
    expect(cancelMock).toHaveBeenCalledWith(1)

    // Re-render as cancelled
    rerender(<RegistrationCard registration={{ ...mockRegistration, status: 'CANCELLED' }} onCancel={cancelMock} />)
    expect(screen.getByText('CANCELLED')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /Cancel Registration/i })).not.toBeInTheDocument()
  })
})
