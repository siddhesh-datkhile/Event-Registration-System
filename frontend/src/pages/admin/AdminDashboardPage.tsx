import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllEvents } from '../../api/events'
import { getAllUsers } from '../../api/auth'
import { getAllRegistrations } from '../../api/registrations'
import { getAllVenues } from '../../api/venues'

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    organizers: 0,
    registrants: 0,
    events: 0,
    registrations: 0,
    venues: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      getAllUsers().catch(() => []), 
      getAllEvents().catch(() => []), 
      getAllRegistrations().catch(() => []),
      getAllVenues().catch(() => [])
    ])
      .then(([users, events, regs, venuesList]) => {
        setStats({
          totalUsers: users.length,
          organizers: users.filter((u) => u.role === 'ORGANIZER').length,
          registrants: users.filter((u) => u.role === 'REGISTRANT').length,
          events: events.length,
          registrations: regs.length,
          venues: venuesList.length,
        })
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className='mx-auto max-w-6xl px-4 py-8 text-center'>
        <p className='text-slate-500'>Loading dashboard metrics...</p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Admin Dashboard</h1>
          <p className='mt-2 text-slate-600'>Platform-wide metrics overview.</p>
        </div>
      </div>

      <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4'>
        <Link to='/admin/users' className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:ring-2 ring-indigo-500 transition-all'>
          <h3 className='text-sm font-medium text-slate-500'>Total Users</h3>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{stats.totalUsers}</p>
        </Link>
        <Link to='/admin/users' className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:ring-2 ring-indigo-500 transition-all'>
          <h3 className='text-sm font-medium text-slate-500'>Organizers</h3>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{stats.organizers}</p>
        </Link>
        <Link to='/admin/users' className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:ring-2 ring-indigo-500 transition-all'>
          <h3 className='text-sm font-medium text-slate-500'>Registrants</h3>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{stats.registrants}</p>
        </Link>
        <Link to='/admin/events' className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:ring-2 ring-indigo-500 transition-all'>
          <h3 className='text-sm font-medium text-slate-500'>Total Events</h3>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{stats.events}</p>
        </Link>
        <Link to='/admin/venues' className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:ring-2 ring-indigo-500 transition-all'>
          <h3 className='text-sm font-medium text-slate-500'>Platform Venues</h3>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{stats.venues}</p>
        </Link>
        <Link to='/admin/registrations' className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:ring-2 ring-indigo-500 transition-all sm:col-span-2 lg:col-span-4'>
          <h3 className='text-sm font-medium text-slate-500'>Platform Registrations</h3>
          <p className='mt-2 text-3xl font-bold text-slate-900'>{stats.registrations}</p>
        </Link>
      </div>
    </div>
  )
}
