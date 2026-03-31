import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyRegistrations, cancelRegistration, type RegistrationResponse } from '../../api/registrations'
import { getAllEvents, type Event } from '../../api/events'
import { EventCard } from '../../Components/EventCard'
import { toast } from 'react-toastify'

interface RegistrationRow extends RegistrationResponse {
  event?: Event
}

function MyRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        const [regs, events] = await Promise.all([
          getMyRegistrations(),
          getAllEvents()
        ])

        // Map events to registrations for display
        //used hashmap for O(1) lookup

        const eventMap = new Map(events.map(e => [e.id, e]))

        const mapped = regs.map(reg => ({
          ...reg,
          event: eventMap.get(reg.eventId)
        }))

        // Sort by youngest registration first
        //Descending sort (b-a)
        mapped.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())

        setRegistrations(mapped)
      } catch (error) {
        toast.error('Failed to load registrations.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleCancel = async (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return

    try {
      await cancelRegistration(id)
      toast.success('Registration cancelled successfully.')
      // Update local state
      setRegistrations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: 'CANCELLED' } : r))
      )
    } catch (error) {
      toast.error('Failed to cancel registration.')
    }
  }

  return (
    <div className='mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8'>
      <div className='sm:flex sm:items-center'>
        <div className='sm:flex-auto'>
          <h1 className='text-3xl font-bold tracking-tight text-slate-900'>My Registrations</h1>
          <p className='mt-2 text-sm text-slate-600'>
            A list of all the events you have registered for .
          </p>
        </div>
        <div className='mt-4 sm:ml-16 sm:mt-0 sm:flex-none'>
          <Link
            to='/events'
            className='block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
          >
            Find more events
          </Link>
        </div>
      </div>

      <div className='mt-8'>
        {loading ? (
          <div className='py-10 text-center text-sm text-slate-500'>Loading...</div>
        ) : registrations.length === 0 ? (
          <div className='py-10 text-center text-sm text-slate-500'>
            You haven't registered for any events yet.
          </div>
        ) : (
          <div className='grid gap-5 md:grid-cols-2 lg:grid-cols-3'>
            {registrations.map((reg) => (
              reg.event ? (
                <EventCard
                  key={reg.id}
                  event={reg.event}
                  actionSlot={
                    <div className='mt-4 flex flex-col gap-3 rounded-xl bg-slate-50 p-4 border border-slate-100'>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-slate-500'>Registration Status:</span>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${reg.status === 'CONFIRMED' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                          reg.status === 'PENDING' ? 'bg-yellow-50 text-yellow-800 ring-yellow-600/20' :
                            'bg-red-50 text-red-700 ring-red-600/10'
                          }`}>
                          {reg.status}
                        </span>
                      </div>
                      <div className='flex items-center justify-between text-sm'>
                        <span className='text-slate-500'>Date Registered:</span>
                        <span className='font-medium text-slate-900'>{new Date(reg.registrationDate).toLocaleDateString()}</span>
                      </div>

                      {(reg.status === 'CONFIRMED' || reg.status === 'PENDING') && (
                        <button
                          onClick={() => handleCancel(reg.id)}
                          className='mt-2 inline-flex w-full items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700'
                        >
                          Cancel Registration
                        </button>
                      )}
                    </div>
                  }
                />
              ) : (
                <div key={reg.id} className='rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center text-slate-500'>
                  Unknown Event (ID: {reg.eventId})
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default MyRegistrationsPage
