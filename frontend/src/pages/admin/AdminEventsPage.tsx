import { Link } from 'react-router'
import { getAllEvents } from '../../api/events'
import { EventCard } from '../../Components/EventCard'
import { useQuery } from '@tanstack/react-query'

export default function AdminEventsPage() {
  const { data: events = [], isLoading: loading } = useQuery({ queryKey: ['admin', 'events'], queryFn: getAllEvents })

  if (loading) {
    return (
      <div className='mx-auto max-w-6xl px-4 py-8 text-center'>
        <p className='text-slate-500'>Loading platform events...</p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Platform Events</h1>
          <p className='mt-2 text-slate-600'>Supervise and modify all events hosted by any organizer.</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className='mt-10 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm'>
          <h3 className='text-lg font-semibold text-slate-900'>No events found</h3>
          <p className='mt-2 text-sm text-slate-500'>There are no events currently registered on the platform.</p>
        </div>
      ) : (
        <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              actionSlot={
                <div className='mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row'>
                  <Link
                    to={`/organizer/events/${event.id}/edit`}
                    className='flex-1 inline-flex items-center justify-center rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 border border-amber-200'
                  >
                    Force Edit
                  </Link>
                  <Link
                    to={`/organizer/events/${event.id}/attendees`}
                    className='flex-1 inline-flex items-center justify-center rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-600 hover:bg-violet-100'
                  >
                    Force View Attendees
                  </Link>
                </div>
              }
            />
          ))}
        </div>
      )}
    </div>
  )
}
