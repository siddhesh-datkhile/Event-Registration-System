import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getEventRegistrations, type RegistrationResponse } from '../../api/registrations'
import { getEventById, type Event } from '../../api/events'

export default function EventAttendeesPage() {
  const { id } = useParams<{ id: string }>()
  const [registrations, setRegistrations] = useState<RegistrationResponse[]>([])
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([getEventById(id), getEventRegistrations(id)])
      .then(([eventData, regData]) => {
        setEvent(eventData)
        setRegistrations(regData)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading attendees...</div>
  }

  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <div className='mb-6'>
        <Link to='/organizer/events' className='text-sm font-medium text-slate-500 hover:text-slate-900'>
          &larr; Back to Events
        </Link>
        <h1 className='mt-4 text-3xl font-bold text-slate-900'>Attendees</h1>
        {event && (
          <p className='mt-2 text-slate-600'>
            Viewing registrations for <strong>{event.title}</strong>
          </p>
        )}
      </div>

      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
        {registrations.length === 0 ? (
          <div className='p-8 text-center text-slate-500'>No attendees registered for this event yet.</div>
        ) : (
          <table className='w-full min-w-full text-left text-sm'>
            <thead className='border-b border-slate-200 bg-slate-50 text-slate-600'>
              <tr>
                <th className='px-6 py-4 font-semibold'>Reg ID</th>
                <th className='px-6 py-4 font-semibold'>User ID</th>
                <th className='px-6 py-4 font-semibold'>Date</th>
                <th className='px-6 py-4 font-semibold'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {registrations.map((reg) => (
                <tr key={reg.id} className='hover:bg-slate-50'>
                  <td className='px-6 py-4 text-slate-900'>#{reg.id}</td>
                  <td className='px-6 py-4 text-slate-600'>User {reg.userId}</td>
                  <td className='px-6 py-4 text-slate-600'>
                    {new Date(reg.registrationDate).toLocaleDateString()}
                  </td>
                  <td className='px-6 py-4'>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${reg.status === 'CONFIRMED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : reg.status === 'CANCELLED'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                    >
                      {reg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
