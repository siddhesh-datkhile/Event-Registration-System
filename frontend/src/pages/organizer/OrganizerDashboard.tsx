import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllEvents } from '../../api/events'
import { getCurrentUser } from '../../api/auth'

export default function OrganizerDashboard() {
  const [stats, setStats] = useState({ totalEvents: 0, openEvents: 0 })
  const user = getCurrentUser()

  useEffect(() => {
    if (!user) return
    getAllEvents().then((events) => {
      const myEvents = events.filter((e) => e.organizerId === user.id)
      setStats({
        totalEvents: myEvents.length,
        openEvents: myEvents.filter((e) => e.status === 'OPEN').length,
      })
    })
  }, [user?.id])

  return (
    <div className='mx-auto max-w-6xl px-4 py-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Organizer Dashboard</h1>
          <p className='mt-2 text-slate-600'>Welcome back. Here is an overview of your events.</p>
        </div>
        <Link
          to='/organizer/events'
          className='inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700'
        >
          Manage External Events &rarr;
        </Link>
      </div>

      <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h3 className='text-sm font-medium text-slate-500'>Total Events</h3>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{stats.totalEvents}</p>
        </div>
        <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <h3 className='text-sm font-medium text-slate-500'>Open Events</h3>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{stats.openEvents}</p>
        </div>
      </div>
    </div>
  )
}
