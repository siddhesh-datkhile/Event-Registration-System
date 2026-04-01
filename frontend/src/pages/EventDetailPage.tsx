import type { Event } from '../model'
import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { getEventById } from '../api/events'
import { createRegistration, getMyRegistrations } from '../api/registrations'
import { useAuth } from '../contexts/AuthContext'
import { createPaymentOrder } from '../api/payments'
import { toast } from 'react-toastify'

const STATUS_LABELS: Record<string, string> = {
  OPEN: 'Open',
  CLOSED: 'Closed',
}

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  CLOSED: 'bg-white text-slate-600 ring-slate-500/20',
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
      <div className='h-4 w-28 rounded bg-slate-100' />
      <div className='mt-6 h-10 w-2/3 rounded-lg bg-slate-100' />
      <div className='mt-3 h-5 w-24 rounded-full bg-slate-100' />
      <div className='mt-8 space-y-3'>
        {[100, 80, 90, 70].map((w, i) => (
          <div key={i} className={`h-4 rounded bg-white`} style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className='mt-8 h-12 w-48 rounded-xl bg-slate-100' />
    </div>
  )
}

function EventDetailPage() {
  const { isAuthenticated } = useAuth()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [registering, setRegistering] = useState(false)
  const [hasRegistered, setHasRegistered] = useState(false)

  const handleRegister = async () => {
    if (!event) return

    if (!isAuthenticated) {
      toast.info('Please log in to register for this event.')
      navigate('/login')
      return
    }

    setRegistering(true)
    try {
      const reg = await createRegistration(event.id)
      
      if (event.entryFee > 0) {
        toast.info('Initializing payment...')
        const paymentOrder = await createPaymentOrder(reg.id)
        
        const options = {
            key: "rzp_test_SUah4LvPVpASiA",
            amount: paymentOrder.amount * 100, // Razorpay expects amount in paise
            currency: paymentOrder.currency,
            name: "Event Registration System",
            description: `Registration for ${event.title}`,
            order_id: paymentOrder.razorpayOrderId,
            handler: function () {
                toast.success('Payment successful! Registration confirmed.')
                navigate('/dashboard/registrations')
            },
            prefill: {
                name: "User",
                email: "user@example.com",
                contact: "9999999999"
            },
            theme: {
                color: "#4f46e5"
            }
        };
        
        const rzp = new (window as any).Razorpay(options);
        rzp.on('payment.failed', function (response: any){
            toast.error(`Payment failed: ${response.error.description}`);
            navigate('/dashboard/registrations')
        });
        rzp.open();
      } else {
        toast.success('Successfully registered for the free event!')
        navigate('/dashboard/registrations')
      }
    } catch (err: any) {
      if (err.response?.status === 409 || err.response?.data?.message?.includes('already')) {
        toast.error('You are already registered for this event.')
      } else {
        toast.error('Failed to register. The event might be full or closed.')
      }
    } finally {
      setRegistering(false)
    }
  }

  useEffect(() => {
    if (!id) return
    const fetchData = async () => {
      try {
        const ev = await getEventById(id)
        setEvent(ev)

        if (isAuthenticated) {
          const regs = await getMyRegistrations()
          const alreadyReg = regs.find(
            (r) => r.eventId === ev.id && (r.status === 'CONFIRMED' || r.status === 'PENDING')
          )
          if (alreadyReg) {
            setHasRegistered(true)
          }
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
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
              <div className='rounded-2xl border border-slate-200 bg-slate-50 p-5'>
                <dt className='text-sm font-medium text-slate-500'>Date & Time</dt>
                <dd className='mt-1 font-semibold text-slate-900'>{formatDate(event.eventDate)}</dd>
              </div>

              <div className='rounded-2xl border border-slate-200 bg-slate-50 p-5'>
                <dt className='text-sm font-medium text-slate-500'>Entry Fee</dt>
                <dd className='mt-1 text-2xl font-bold text-slate-900'>
                  {event.entryFee === 0 ? (
                    <span className='text-emerald-600'>Free</span>
                  ) : (
                    `₹${event.entryFee}`
                  )}
                </dd>
              </div>

              <div className='rounded-2xl border border-slate-200 bg-slate-50 p-5'>
                <dt className='text-sm font-medium text-slate-500'>Total Capacity</dt>
                <dd className='mt-1 text-2xl font-bold text-slate-900'>{event.capacity}</dd>
              </div>

              <div className='rounded-2xl border border-slate-200 bg-slate-50 p-5'>
                <dt className='mb-2 text-sm font-medium text-slate-500'>Seat Availability</dt>
                <dd className='font-semibold text-slate-900'>
                  {event.availableSeats} of {event.capacity} left
                </dd>
                <div className='mt-2 h-2 w-full rounded-full bg-white'>
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
            <div className='sticky top-24 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm'>
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

              <div className='mt-4 rounded-xl bg-white px-4 py-3 text-sm'>
                <div className='flex items-center justify-between text-slate-600'>
                  <span>Available seats</span>
                  <span className='font-semibold text-slate-900'>{event.availableSeats}</span>
                </div>
                <div className='mt-2 h-1.5 w-full rounded-full bg-slate-100'>
                  <div
                    className={[
                      'h-1.5 rounded-full',
                      seatPct > 50 ? 'bg-emerald-500' : seatPct > 20 ? 'bg-amber-400' : 'bg-red-500',
                    ].join(' ')}
                    style={{ width: `${seatPct}%` }}
                  />
                </div>
              </div>

              {event.status === 'CLOSED' ? (
                <div className='rounded-2xl bg-white p-4 text-center text-sm font-semibold text-slate-600 border border-slate-200'>
                  This event is closed.
                </div>
              ) : hasRegistered ? (
                <div className='space-y-4'>
                  <div className='rounded-2xl bg-emerald-50 p-4 text-center text-sm font-semibold text-emerald-700 border border-emerald-100'>
                    You are already registered!
                  </div>
                  <button
                    className='mt-3 flex w-full items-center justify-center rounded-xl border border-indigo-600 bg-slate-50 px-5 py-3 text-sm font-semibold text-violet-600 transition-colors hover:bg-violet-50'
                    onClick={() => navigate('/dashboard/registrations')}
                  >
                    View My Tickets
                  </button>
                </div>
              ) : event.availableSeats === 0 ? (
                <div className='rounded-2xl bg-white p-4 text-center text-sm font-semibold text-slate-600 border border-slate-200'>
                  Tickets Sold Out
                </div>
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className='mt-5 flex w-full items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-violet-700 disabled:opacity-70 disabled:cursor-not-allowed'
                >
                  {registering ? 'Registering...' : 'Register for this Event'}
                </button>
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
