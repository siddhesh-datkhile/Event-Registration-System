import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, UserCheck, UserPlus, CalendarDays, MapPin, ClipboardList } from 'lucide-react'
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
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600'>
              <Users className='h-5 w-5' />
            </div>
            <h3 className='text-sm font-medium text-slate-500'>Total Users</h3>
          </div>
          <p className='mt-4 text-3xl font-bold text-slate-900'>{stats.totalUsers}</p>
        </Link>
        <Link to='/admin/users' className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:ring-2 ring-indigo-500 transition-all'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600'>
              <UserCheck className='h-5 w-5' />
            </div>
            <h3 className='text-sm font-medium text-slate-500'>Organizers</h3>
          </div>
          <p className='mt-4 text-3xl font-bold text-slate-900'>{stats.organizers}</p>
        </Link>
        <Link to='/admin/users' className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:ring-2 ring-indigo-500 transition-all'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600'>
              <UserPlus className='h-5 w-5' />
            </div>
            <h3 className='text-sm font-medium text-slate-500'>Registrants</h3>
          </div>
          <p className='mt-4 text-3xl font-bold text-slate-900'>{stats.registrants}</p>
        </Link>
        <Link to='/admin/events' className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:ring-2 ring-indigo-500 transition-all'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600'>
              <CalendarDays className='h-5 w-5' />
            </div>
            <h3 className='text-sm font-medium text-slate-500'>Total Events</h3>
          </div>
          <p className='mt-4 text-3xl font-bold text-slate-900'>{stats.events}</p>
        </Link>
        <Link to='/admin/venues' className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:ring-2 ring-indigo-500 transition-all'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600'>
              <MapPin className='h-5 w-5' />
            </div>
            <h3 className='text-sm font-medium text-slate-500'>Platform Venues</h3>
          </div>
          <p className='mt-4 text-3xl font-bold text-slate-900'>{stats.venues}</p>
        </Link>
        <Link to='/admin/registrations' className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:ring-2 ring-indigo-500 transition-all sm:col-span-2 lg:col-span-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-600'>
              <ClipboardList className='h-5 w-5' />
            </div>
            <h3 className='text-sm font-medium text-slate-500'>Platform Registrations</h3>
          </div>
          <p className='mt-4 text-3xl font-bold text-slate-900'>{stats.registrations}</p>
        </Link>
      </div>
    </div>
  )
}
