import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllEvents, type Event } from '../../api/events'
import { getCurrentUser } from '../../api/auth'
import { EventCard } from '../../Components/EventCard'

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const user = getCurrentUser()

  useEffect(() => {
    if (!user) return
    getAllEvents()
      .then((data) => {
        // Filter out only events belonging to the current organizer
        setEvents(data.filter((e) => e.organizerId === user.id))
      })
      .finally(() => setLoading(false))
  }, [user?.id])

  if (loading) {
    return (
      <div className='mx-auto max-w-6xl px-4 py-8 text-center'>
        <p className='text-slate-500'>Loading your events...</p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>My Events</h1>
          <p className='mt-2 text-slate-600'>Manage all the events you are hosting.</p>
        </div>
        <Link
          to='/organizer/events/new'
          className='inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700'
        >
          + Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className='mt-10 rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16 text-center shadow-sm'>
          <h3 className='text-lg font-semibold text-slate-900'>No events yet</h3>
          <p className='mt-2 text-sm text-slate-500'>You haven't created any events yet.</p>
          <Link
            to='/organizer/events/new'
            className='mt-6 inline-block font-semibold text-indigo-600 hover:text-indigo-800'
          >
            Create your first event &rarr;
          </Link>
        </div>
      ) : (
        <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              actionSlot={
                <div className='mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row'>
                  <Link
                    to={`/organizer/events/${event.id}/edit`}
                    className='flex-1 inline-flex items-center justify-center rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200'
                  >
                    Edit Event
                  </Link>
                  <Link
                    to={`/organizer/events/${event.id}/attendees`}
                    className='flex-1 inline-flex items-center justify-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100'
                  >
                    Attendees
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
