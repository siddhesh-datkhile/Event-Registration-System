import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getEventById, type Event, type EventStatus } from '../api/events'

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function SkeletonDetail() {
  return (
    <div className='animate-pulse'>
      <div className='h-4 w-28 rounded bg-slate-200' />
      <div className='mt-6 h-10 w-2/3 rounded-lg bg-slate-200' />
      <div className='mt-3 h-5 w-24 rounded-full bg-slate-200' />
      <div className='mt-8 space-y-3'>
        {[100, 80, 90, 70].map((w, i) => (
          <div key={i} className={`h-4 rounded bg-slate-100`} style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className='mt-8 h-12 w-48 rounded-xl bg-slate-200' />
    </div>
  )
}

function EventDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getEventById(id)
      .then(setEvent)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  const seatPct = event ? Math.round((event.availableSeats / event.capacity) * 100) : 0

  return (
    <div className='w-full py-10'>
      {/* Back link */}
      <button
        onClick={() => navigate(-1)}
        className='mb-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900'
      >
        ← Back to Events
      </button>

      {loading && <SkeletonDetail />}

      {error && !loading && (
        <div className='rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700'>
          <p className='font-semibold'>Could not load event</p>
          <p className='mt-1'>{error}</p>
          <Link to='/events' className='mt-3 inline-block font-medium underline'>
            Back to all events
          </Link>
        </div>
      )}

      {event && !loading && (
        <div className='grid gap-8 lg:grid-cols-3'>
          {/* Main content */}
          <div className='lg:col-span-2'>
            <div className='flex flex-wrap items-center gap-3'>
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${STATUS_COLORS[event.status]}`}
              >
                {STATUS_LABELS[event.status]}
              </span>
              <span className='text-xs text-slate-500'>Event #{event.id}</span>
            </div>

            <h1 className='mt-4 text-4xl font-bold leading-tight text-slate-900'>
              {event.title}
            </h1>

            <p className='mt-4 text-base leading-relaxed text-slate-600'>{event.description}</p>

            {/* Details grid */}
            <dl className='mt-8 grid gap-4 sm:grid-cols-2'>
              <div className='rounded-2xl border border-slate-200 bg-white p-5'>
                <dt className='text-sm font-medium text-slate-500'>Date & Time</dt>
                <dd className='mt-1 font-semibold text-slate-900'>{formatDate(event.eventDate)}</dd>
              </div>

              <div className='rounded-2xl border border-slate-200 bg-white p-5'>
                <dt className='text-sm font-medium text-slate-500'>Entry Fee</dt>
                <dd className='mt-1 text-2xl font-bold text-slate-900'>
                  {event.entryFee === 0 ? (
                    <span className='text-emerald-600'>Free</span>
                  ) : (
                    `₹${event.entryFee}`
                  )}
                </dd>
              </div>

              <div className='rounded-2xl border border-slate-200 bg-white p-5'>
                <dt className='text-sm font-medium text-slate-500'>Total Capacity</dt>
                <dd className='mt-1 text-2xl font-bold text-slate-900'>{event.capacity}</dd>
              </div>

              <div className='rounded-2xl border border-slate-200 bg-white p-5'>
                <dt className='mb-2 text-sm font-medium text-slate-500'>Seat Availability</dt>
                <dd className='font-semibold text-slate-900'>
                  {event.availableSeats} of {event.capacity} left
                </dd>
                <div className='mt-2 h-2 w-full rounded-full bg-slate-100'>
                  <div
                    className={[
                      'h-2 rounded-full transition-all',
                      seatPct > 50
                        ? 'bg-emerald-500'
                        : seatPct > 20
                          ? 'bg-amber-400'
                          : 'bg-red-500',
                    ].join(' ')}
                    style={{ width: `${seatPct}%` }}
                  />
                </div>
              </div>
            </dl>
          </div>

          {/* Sidebar CTA */}
          <div className='lg:col-span-1'>
            <div className='sticky top-24 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm'>
              <div className='text-center'>
                <div className='text-3xl font-bold text-slate-900'>
                  {event.entryFee === 0 ? (
                    <span className='text-emerald-600'>Free</span>
                  ) : (
                    `₹${event.entryFee}`
                  )}
                </div>
                <p className='mt-1 text-sm text-slate-500'>per person</p>
              </div>

              <div className='mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm'>
                <div className='flex items-center justify-between text-slate-600'>
                  <span>Available seats</span>
                  <span className='font-semibold text-slate-900'>{event.availableSeats}</span>
                </div>
                <div className='mt-2 h-1.5 w-full rounded-full bg-slate-200'>
                  <div
                    className={[
                      'h-1.5 rounded-full',
                      seatPct > 50 ? 'bg-emerald-500' : seatPct > 20 ? 'bg-amber-400' : 'bg-red-500',
                    ].join(' ')}
                    style={{ width: `${seatPct}%` }}
                  />
                </div>
              </div>

              {event.status === 'CANCELLED' ? (
                <div className='mt-5 rounded-xl bg-red-50 px-4 py-3 text-center text-sm font-semibold text-red-600'>
                  This event has been cancelled
                </div>
              ) : event.availableSeats === 0 ? (
                <div className='mt-5 rounded-xl bg-slate-100 px-4 py-3 text-center text-sm font-semibold text-slate-500'>
                  Sold Out
                </div>
              ) : (
                <Link
                  to='/register'
                  state={{ eventId: event.id, eventTitle: event.title }}
                  className='mt-5 inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-indigo-700'
                >
                  Register for this Event
                </Link>
              )}

              <p className='mt-3 text-center text-xs text-slate-500'>
                You need an account to complete registration.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EventDetailPage
