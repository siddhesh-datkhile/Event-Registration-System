import type {  Event  } from '../model'
import { Link } from 'react-router'
import type {} from '../api/events'
import React from 'react'

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-emerald-100 text-emerald-700',
  CLOSED: 'bg-white text-slate-600',
}

const SEAT_BADGE = (available: number, capacity: number) => {
  const pct = available / capacity
  if (pct > 0.5) return 'bg-emerald-100 text-emerald-700'
  if (pct > 0.2) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-600'
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

interface EventCardProps {
  event: Event
  actionSlot?: React.ReactNode
}

export function EventCard({ event, actionSlot }: EventCardProps) {
  const isClosed = event.status === 'CLOSED' || event.availableSeats === 0

  return (
    <div className={`relative flex flex-col rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm transition-all hover:shadow-md ${isClosed ? 'opacity-60 grayscale-[0.2]' : ''}`}>
      {/* Status + Seats */}
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[event.status]}`}
        >
          {STATUS_LABELS[event.status]}
        </span>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${SEAT_BADGE(event.availableSeats, event.capacity)}`}
        >
          {event.availableSeats} / {event.capacity} seats
        </span>
      </div>

      {/* Title + Description */}
      <h2 className='mt-4 text-xl font-bold text-slate-900'>{event.title}</h2>
      <p className='mt-2 flex-1 text-sm leading-relaxed text-slate-600 line-clamp-3'>
        {event.description}
      </p>

      {/* Meta */}
      <div className='mt-5 space-y-1.5 text-sm text-slate-600'>
        <div className='flex items-center gap-2'>
          <span>📅</span>
          <span>{formatDate(event.eventDate)}</span>
        </div>
        <div className='flex items-center gap-2'>
          <span>💰</span>
          <span>{event.entryFee === 0 ? 'Free' : `₹${event.entryFee}`}</span>
        </div>
      </div>

      {/* CTA */}
      <Link
        to={`/events/${event.id}`}
        className='mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-900 transition-colors hover:bg-white'
      >
        View Details &rarr;
      </Link>

      {/* Optional extra action (like Cancel Registration) */}
      {actionSlot && <div className='mt-3'>{actionSlot}</div>}
    </div>
  )
}
