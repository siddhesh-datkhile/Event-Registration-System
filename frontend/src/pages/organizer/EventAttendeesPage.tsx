import type {  RegistrationResponse, UserProfileResponse  } from '../../model'
import { useParams, Link } from 'react-router'
import { getEventRegistrations } from '../../api/registrations'
import { getEventById } from '../../api/events'
import { fetchUserProfile } from '../../api/auth'
import { useQuery } from '@tanstack/react-query'

type AttendeeRecord = RegistrationResponse & {
  userProfile?: UserProfileResponse
}

export default function EventAttendeesPage() {
  const { id } = useParams<{ id: string }>()
  const { data: event, isLoading: loadingEvent } = useQuery({
    queryKey: ['events', id],
    queryFn: () => getEventById(id!),
    enabled: !!id
  })

  const { data: registrations = [], isLoading: loadingRegs } = useQuery({
    queryKey: ['event-registrations', id],
    queryFn: async () => {
      const regData = await getEventRegistrations(id!)
      return Promise.all(
        regData.map(async (reg) => {
          try {
            const profile = await fetchUserProfile(reg.userId)
            return { ...reg, userProfile: profile } as AttendeeRecord
          } catch (err) {
            return reg as AttendeeRecord
          }
        })
      )
    },
    enabled: !!id
  })

  const loading = loadingEvent || loadingRegs

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading attendees...</div>
  }

  return (
    <div className='mx-auto max-w-4xl px-4 py-8'>
      <div className='mb-6'>
        <Link to='../..' relative='path' className='text-sm font-medium text-slate-500 hover:text-slate-900'>
          &larr; Back to Events
        </Link>
        <h1 className='mt-4 text-3xl font-bold text-slate-900'>Attendees</h1>
        {event && (
          <p className='mt-2 text-slate-600'>
            Viewing registrations for <strong>{event.title}</strong>
          </p>
        )}
      </div>

      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm'>
        {registrations.length === 0 ? (
          <div className='p-8 text-center text-slate-500'>No attendees registered for this event yet.</div>
        ) : (
          <table className='w-full min-w-full text-left text-sm'>
            <thead className='border-b border-slate-200 bg-white text-slate-600'>
              <tr>
                <th className='px-6 py-4 font-semibold'>Reg ID</th>
                <th className='px-6 py-4 font-semibold'>Attendee Name</th>
                <th className='px-6 py-4 font-semibold'>Contact</th>
                <th className='px-6 py-4 font-semibold'>Date</th>
                <th className='px-6 py-4 font-semibold'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {registrations.map((reg) => (
                <tr key={reg.id} className='hover:bg-white'>
                  <td className='px-6 py-4 text-slate-900'>#{reg.id}</td>
                  <td className='px-6 py-4 text-slate-900 font-medium'>
                    {reg.userProfile?.name || `User ${reg.userId}`}
                  </td>
                  <td className='px-6 py-4 text-slate-600'>
                    <div className='flex flex-col'>
                      <span className='text-sm'>{reg.userProfile?.email || 'N/A'}</span>
                      {reg.userProfile?.phone && (
                        <span className='text-xs text-slate-400'>{reg.userProfile.phone}</span>
                      )}
                    </div>
                  </td>
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
