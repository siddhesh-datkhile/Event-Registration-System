import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { jwtDecode } from 'jwt-decode'
import { getMyRegistrations } from '../../api/registrations'
import { useQuery } from '@tanstack/react-query'

function DashboardPage() {
  const [userName, setUserName] = useState('User')

  const { data: registrations = [], isLoading: loading } = useQuery({
    queryKey: ['registrations', 'me'],
    queryFn: getMyRegistrations,
  })

  useEffect(() => {
    // Try to extract name from token if available, otherwise fallback
    const token = localStorage.getItem('token')
    if (token) {
      try {
        const decoded: any = jwtDecode(token)
        // Spring Security often uses 'sub' for the username/email
        if (decoded.sub) {
          const namePart = decoded.sub.split('@')[0]
          setUserName(namePart.charAt(0).toUpperCase() + namePart.slice(1))
        }
      } catch (e) {
        /* ignore */
      }
    }
  }, [])

  const confirmedCount = registrations.filter((r) => r.status === 'CONFIRMED').length

  return (
    <div className='mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold tracking-tight text-slate-900'>
            Hello, {userName}
          </h1>
          <p className='mt-2 text-slate-600'>Welcome to your registrant dashboard.</p>
        </div>
        <Link
          to='/events'
          className='inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700'
        >
          Browse Events
        </Link>
      </div>

      <div className='mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3'>
        {/* Stat Card 1 */}
        <div className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm'>
          <dt className='truncate text-sm font-medium text-slate-500'>
            Registered Events
          </dt>
          <dd className='mt-2 flex items-baseline gap-x-2'>
            <span className='text-4xl font-semibold tracking-tight text-slate-900'>
              {loading ? '-' : confirmedCount}
            </span>
          </dd>
        </div>

        {/* Quick Links */}
        <div className='sm:col-span-2 lg:col-span-2'>
          <div className='h-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm'>
            <div className='border-b border-slate-200 bg-white px-6 py-4'>
              <h3 className='font-semibold text-slate-900'>Quick Actions</h3>
            </div>
            <div className='divide-y divide-slate-100'>
              <Link
                to='/dashboard/registrations'
                className='block px-6 py-4 hover:bg-white'
              >
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium text-violet-600'>
                    View My Registrations &rarr;
                  </p>
                  <p className='text-sm text-slate-500'>
                    Manage your tickets and cancellations.
                  </p>
                </div>
              </Link>
              <Link to='/events' className='block px-6 py-4 hover:bg-white'>
                <div className='flex items-center justify-between'>
                  <p className='text-sm font-medium text-violet-600'>
                    Find New Events &rarr;
                  </p>
                  <p className='text-sm text-slate-500'>
                    Discover and register for upcoming events.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DashboardPage
