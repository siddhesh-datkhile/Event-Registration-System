import { useEffect, useState } from 'react'
import { getAllRegistrations, type RegistrationResponse } from '../../api/registrations'
import { fetchUserProfile, type UserProfileResponse } from '../../api/auth'
import { getAllEvents, type Event } from '../../api/events'

type EnhancedRegistration = RegistrationResponse & {
  userProfile?: UserProfileResponse
  event?: Event
}

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<EnhancedRegistration[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [allRegs, allEvents] = await Promise.all([
          getAllRegistrations(),
          getAllEvents()
        ])

        const eventMap = new Map(allEvents.map(e => [e.id, e]))
        const enhanced = await Promise.all(
          allRegs.map(async (reg) => {
            let profile;
            try {
              profile = await fetchUserProfile(reg.userId)
            } catch (e) {
              console.error(`Failed to load profile for ${reg.userId}`)
            }
            return {
              ...reg,
              userProfile: profile,
              event: eventMap.get(reg.eventId)
            }
          })
        )
        // Sort newest first
        enhanced.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
        setRegistrations(enhanced)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className='mx-auto max-w-6xl px-4 py-8 text-center'>
        <p className='text-slate-500'>Loading global registrations data...</p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Global Registrations</h1>
          <p className='mt-2 text-slate-600'>An audit log of all registration requests and tickets.</p>
        </div>
      </div>

      <div className='mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm'>
        <div className='overflow-x-auto'>
          <table className='w-full whitespace-nowrap text-left text-sm'>
            <thead className='border-b border-slate-200 bg-white text-slate-600'>
              <tr>
                <th className='px-6 py-4 font-semibold'>Reg ID</th>
                <th className='px-6 py-4 font-semibold'>Event Name</th>
                <th className='px-6 py-4 font-semibold'>Attendee Identity</th>
                <th className='px-6 py-4 font-semibold'>Submitted Date</th>
                <th className='px-6 py-4 font-semibold'>Status</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-slate-100'>
              {registrations.map((reg) => (
                <tr key={reg.id} className='hover:bg-white'>
                  <td className='px-6 py-4 text-slate-900 font-medium'>#{reg.id}</td>
                  <td className='px-6 py-4 text-slate-900'>
                    {reg.event?.title || `Event ID: ${reg.eventId}`}
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex flex-col'>
                      <span className='font-medium text-slate-900'>{reg.userProfile?.name || `User ${reg.userId}`}</span>
                      <span className='text-xs text-slate-500'>{reg.userProfile?.email || 'N/A'}</span>
                    </div>
                  </td>
                  <td className='px-6 py-4 text-slate-600'>
                    {new Date(reg.registrationDate).toLocaleString()}
                  </td>
                  <td className='px-6 py-4'>
                    <span 
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        reg.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                        reg.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        'bg-red-100 text-red-800'
                      }`}
                    >
                      {reg.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {registrations.length === 0 && (
            <div className='py-12 text-center text-slate-500'>No registrations exist in the system yet.</div>
          )}
        </div>
      </div>
    </div>
  )
}
