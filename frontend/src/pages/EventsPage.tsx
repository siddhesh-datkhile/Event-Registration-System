import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllEvents, type Event, type EventStatus } from '../api/events'

const STATUS_LABELS: Record<EventStatus, string> = {
  UPCOMING: 'Upcoming',
  ONGOING: 'Ongoing',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
}

const STATUS_COLORS: Record<EventStatus, string> = {
  UPCOMING: 'bg-indigo-100 text-indigo-700',
  ONGOING: 'bg-emerald-100 text-emerald-700',
  COMPLETED: 'bg-slate-100 text-slate-600',
  CANCELLED: 'bg-red-100 text-red-600',
}

const SEAT_BADGE = (available: number, capacity: number) => {
  const pct = available / capacity
  if (pct > 0.5) return 'bg-emerald-100 text-emerald-700'
  if (pct > 0.2) return 'bg-amber-100 text-amber-700'
  return 'bg-red-100 text-red-600'
}

const ALL_STATUSES: EventStatus[] = ['UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED']

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// ---- Skeleton card ----
function SkeletonCard() {
  return (
    <div className='animate-pulse rounded-2xl border border-slate-200 bg-white p-6'>
      <div className='mb-4 flex items-center justify-between'>
        <div className='h-5 w-20 rounded-full bg-slate-200' />
        <div className='h-5 w-16 rounded-full bg-slate-200' />
      </div>
      <div className='h-6 w-3/4 rounded-lg bg-slate-200' />
      <div className='mt-3 h-4 w-full rounded bg-slate-100' />
      <div className='mt-1 h-4 w-5/6 rounded bg-slate-100' />
      <div className='mt-6 flex items-center justify-between'>
        <div className='h-4 w-24 rounded bg-slate-200' />
        <div className='h-4 w-20 rounded bg-slate-200' />
      </div>
      <div className='mt-5 h-9 w-full rounded-lg bg-slate-200' />
    </div>
  )
}

function EventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [activeStatus, setActiveStatus] = useState<EventStatus | 'ALL'>('ALL')

  useEffect(() => {
    getAllEvents()
      .then(setEvents)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = events.filter((e) => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase())
    const matchStatus = activeStatus === 'ALL' || e.status === activeStatus
    return matchSearch && matchStatus
  })

  return (
    <div className='w-full py-10'>
      {/* Header */}
      <div className='mb-8'>
        <h1 className='text-4xl font-bold leading-tight'>Browse Events</h1>
        <p className='mt-2 text-slate-600'>Discover and register for upcoming events.</p>
      </div>

      {/* Search + Filters */}
      <div className='mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <input
          id='event-search'
          type='text'
          placeholder='Search events…'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className='w-full max-w-sm rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 sm:w-80'
        />

        <div className='flex flex-wrap gap-2'>
          <button
            onClick={() => setActiveStatus('ALL')}
            className={[
              'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
              activeStatus === 'ALL'
                ? 'bg-indigo-600 text-white'
                : 'border border-slate-300 text-slate-700 hover:bg-slate-50',
            ].join(' ')}
          >
            All
          </button>
          {ALL_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className={[
                'rounded-full px-4 py-1.5 text-sm font-semibold transition-colors',
                activeStatus === s
                  ? 'bg-indigo-600 text-white'
                  : 'border border-slate-300 text-slate-700 hover:bg-slate-50',
              ].join(' ')}
            >
              {STATUS_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className='mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'>
          Could not load events: {error}. Make sure the backend is running.
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className='flex flex-col items-center justify-center py-20 text-slate-500'>
          <div className='text-5xl'>🎟️</div>
          <p className='mt-4 text-lg font-semibold'>No events found</p>
          <p className='mt-1 text-sm'>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
          {filtered.map((event) => (
            <div
              key={event.id}
              className='flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md'
            >
              {/* Status + Seats */}
              <div className='flex items-center justify-between'>
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
                className='mt-6 inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:bg-slate-50'
              >
                View Details →
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default EventsPage
