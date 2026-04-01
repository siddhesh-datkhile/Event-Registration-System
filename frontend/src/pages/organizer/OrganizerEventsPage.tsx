import type {  Event  } from '../../model'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllEvents } from '../../api/events'
import { EventCard } from '../../Components/EventCard'
import { useAuth } from '../../contexts/AuthContext'

export default function OrganizerEventsPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

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
          className='inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700'
        >
          + Create New Event
        </Link>
      </div>

      {events.length === 0 ? (
        <div className='mt-10 rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm'>
          <h3 className='text-lg font-semibold text-slate-900'>No events yet</h3>
          <p className='mt-2 text-sm text-slate-500'>You haven't created any events yet.</p>
          <Link
            to='/organizer/events/new'
            className='mt-6 inline-block font-semibold text-violet-600 hover:text-indigo-800'
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
                <div className='mt-4 flex flex-col gap-2 border-t border-slate-200 pt-4 sm:flex-row'>
                  <Link
                    to={`/organizer/events/${event.id}/edit`}
                    className='flex-1 inline-flex items-center justify-center rounded-lg bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100'
                  >
                    Edit Event
                  </Link>
                  <Link
                    to={`/organizer/events/${event.id}/attendees`}
                    className='flex-1 inline-flex items-center justify-center rounded-lg border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-600 hover:bg-violet-100'
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
