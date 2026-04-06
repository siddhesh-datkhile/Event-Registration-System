import { Link } from 'react-router'
import { Users, UserCheck, UserPlus, CalendarDays, MapPin, ClipboardList } from 'lucide-react'
import { getAllEvents } from '../../api/events'
import { getAllUsers } from '../../api/auth'
import { getAllRegistrations } from '../../api/registrations'
import { getAllVenues } from '../../api/venues'
import { useQuery } from '@tanstack/react-query'

export default function AdminDashboardPage() {
  const { data: users = [], isLoading: loadingUsers } = useQuery({ queryKey: ['admin', 'users'], queryFn: getAllUsers })
  const { data: events = [], isLoading: loadingEvents } = useQuery({ queryKey: ['admin', 'events'], queryFn: getAllEvents })
  const { data: regs = [], isLoading: loadingRegs } = useQuery({ queryKey: ['admin', 'registrations'], queryFn: getAllRegistrations })
  const { data: venuesList = [], isLoading: loadingVenues } = useQuery({ queryKey: ['admin', 'venues'], queryFn: getAllVenues })

  const loading = loadingUsers || loadingEvents || loadingRegs || loadingVenues

  const stats = {
    totalUsers: users.length,
    organizers: users.filter((u) => u.role === 'ORGANIZER').length,
    registrants: users.filter((u) => u.role === 'REGISTRANT').length,
    events: events.length,
    registrations: regs.length,
    venues: venuesList.length,
  }

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
        <Link to='../users' relative='path' className='rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:ring-2 ring-violet-600 transition-all'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600'>
              <Users className='h-5 w-5' />
            </div>
            <h3 className='text-sm font-medium text-slate-500'>Total Users</h3>
          </div>
          <p className='mt-4 text-3xl font-bold text-slate-900'>{stats.totalUsers}</p>
        </Link>
        <Link to='../users' relative='path' className='rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:ring-2 ring-violet-600 transition-all'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-50 text-violet-600'>
              <UserCheck className='h-5 w-5' />
            </div>
            <h3 className='text-sm font-medium text-slate-500'>Organizers</h3>
          </div>
          <p className='mt-4 text-3xl font-bold text-slate-900'>{stats.organizers}</p>
        </Link>
        <Link to='../users' relative='path' className='rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:ring-2 ring-violet-600 transition-all'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600'>
              <UserPlus className='h-5 w-5' />
            </div>
            <h3 className='text-sm font-medium text-slate-500'>Registrants</h3>
          </div>
          <p className='mt-4 text-3xl font-bold text-slate-900'>{stats.registrants}</p>
        </Link>
        <Link to='../events' relative='path' className='rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:ring-2 ring-violet-600 transition-all'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sky-50 text-sky-600'>
              <CalendarDays className='h-5 w-5' />
            </div>
            <h3 className='text-sm font-medium text-slate-500'>Total Events</h3>
          </div>
          <p className='mt-4 text-3xl font-bold text-slate-900'>{stats.events}</p>
        </Link>
        <Link to='../venues' relative='path' className='rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:ring-2 ring-violet-600 transition-all'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-600'>
              <MapPin className='h-5 w-5' />
            </div>
            <h3 className='text-sm font-medium text-slate-500'>Platform Venues</h3>
          </div>
          <p className='mt-4 text-3xl font-bold text-slate-900'>{stats.venues}</p>
        </Link>
        <Link to='../registrations' relative='path' className='rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm hover:ring-2 ring-violet-600 transition-all sm:col-span-2 lg:col-span-4'>
          <div className='flex items-center gap-3'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-rose-50 text-rose-600'>
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
