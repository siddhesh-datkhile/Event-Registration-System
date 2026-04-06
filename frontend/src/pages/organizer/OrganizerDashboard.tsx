import { Link } from 'react-router'
import { getAllEvents } from '../../api/events'
import { useAuth } from '../../contexts/AuthContext'
import { useQuery } from '@tanstack/react-query'

export default function OrganizerDashboard() {
  const { user } = useAuth()

  const { data: allEvents = [] } = useQuery({
    queryKey: ['events'],
    queryFn: getAllEvents,
    enabled: !!user
  })

  const myEvents = allEvents.filter((e) => e.organizerId === user?.id)
  const stats = {
    totalEvents: myEvents.length,
    openEvents: myEvents.filter((e) => e.status === 'OPEN').length,
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Organizer Dashboard</h1>
          <p className='mt-2 text-slate-600'>Welcome back. Here is an overview of your events.</p>
        </div>
        <Link
          to='../events'
          relative='path'
          className='inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700'
        >
          Manage External Events &rarr;
        </Link>
      </div>

      <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm'>
          <h3 className='text-sm font-medium text-slate-500'>Total Events</h3>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{stats.totalEvents}</p>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm'>
          <h3 className='text-sm font-medium text-slate-500'>Open Events</h3>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{stats.openEvents}</p>
        </div>
      </div>
    </div>
  )
}
