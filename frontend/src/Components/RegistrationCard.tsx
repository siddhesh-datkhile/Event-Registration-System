import type { Event, RegistrationResponse } from '../model'
import { EventCard } from './EventCard'

type RegistrationWithEvent = RegistrationResponse & { event?: Event }

type RegistrationCardProps = {
  registration: RegistrationWithEvent
  onPayNow?: (regId: number, event: Event) => void
  onViewReceipt?: (regId: number) => void
  onCancel?: (regId: number) => void
}

const statusStyles: Record<string, string> = {
  CONFIRMED: 'bg-green-50 text-green-700 ring-green-600/20',
  PENDING: 'bg-yellow-50 text-yellow-800 ring-yellow-600/20',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-600/10',
}

export function RegistrationCard({
  registration: reg,
  onPayNow,
  onViewReceipt,
  onCancel,
}: RegistrationCardProps) {
  if (!reg.event) {
    return (
      <div className='rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500'>
        Unknown Event (ID: {reg.eventId})
      </div>
    )
  }

  return (
    <EventCard
      event={reg.event}
      actionSlot={
        <div className='mt-4 flex flex-col gap-3 rounded-xl bg-white p-4 border border-slate-200'>
          {/* Status row */}
          <div className='flex items-center justify-between text-sm'>
            <span className='text-slate-500'>Registration Status:</span>
            <span
              className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                statusStyles[reg.status] ?? 'bg-slate-50 text-slate-700 ring-slate-600/20'
              }`}
            >
              {reg.status}
            </span>
          </div>

          {/* Date row */}
          <div className='flex items-center justify-between text-sm'>
            <span className='text-slate-500'>Date Registered:</span>
            <span className='font-medium text-slate-900'>
              {new Date(reg.registrationDate).toLocaleDateString()}
            </span>
          </div>

          {/* Action buttons */}
          <div className='mt-2 flex flex-col gap-2'>
            {reg.status === 'PENDING' && onPayNow && (
              <button
                onClick={() => onPayNow(reg.id, reg.event!)}
                className='inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700'
              >
                Pay Now
              </button>
            )}

            {reg.status === 'CONFIRMED' && onViewReceipt && (
              <button
                onClick={() => onViewReceipt(reg.id)}
                className='inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700'
              >
                View Receipt
              </button>
            )}

            {(reg.status === 'CONFIRMED' || reg.status === 'PENDING') && onCancel && (
              <button
                onClick={() => onCancel(reg.id)}
                className='inline-flex w-full items-center justify-center rounded-lg border border-red-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700'
              >
                Cancel Registration
              </button>
            )}
          </div>
        </div>
      }
    />
  )
}
