import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getMyRegistrations, cancelRegistration, type RegistrationResponse } from '../../api/registrations'
import { getAllEvents, type Event } from '../../api/events'
import { EventCard } from '../../Components/EventCard'
import { toast } from 'react-toastify'
import { getReceiptHtml } from '../../api/receipts'
import { createPaymentOrder } from '../../api/payments'

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

  const handlePayNow = async (regId: number, event: Event) => {
    try {
      toast.info('Initializing payment...')
      const paymentOrder = await createPaymentOrder(regId)
      
      const options = {
          key: "rzp_test_SUah4LvPVpASiA",
          amount: paymentOrder.amount * 100, // Razorpay expects paise
          currency: paymentOrder.currency,
          name: "Event Registration System",
          description: `Registration for ${event.title}`,
          order_id: paymentOrder.razorpayOrderId,
          handler: function () {
              toast.success('Payment successful!')
              setRegistrations((prev) =>
                  prev.map((r) => (r.id === regId ? { ...r, status: 'CONFIRMED' } : r))
              )
          },
          theme: { color: "#4f46e5" }
      };
      
      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any){
          toast.error(`Payment failed: ${response.error.description}`);
      });
      rzp.open();
    } catch (err: any) {
      toast.error('Failed to initialize payment.')
    }
  }

  const [receiptHtml, setReceiptHtml] = useState<string | null>(null)

  const handleViewReceipt = async (regId: number) => {
    try {
      toast.info('Fetching receipt...', { autoClose: 1000 })
      const html = await getReceiptHtml(regId)
      setReceiptHtml(html)
    } catch (error) {
      toast.error('Failed to load receipt.')
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

                      <div className='mt-2 flex flex-col gap-2'>
                        {reg.status === 'PENDING' && (
                          <button
                            onClick={() => handlePayNow(reg.id, reg.event!)}
                            className='inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700'
                          >
                            Pay Now
                          </button>
                        )}
                        {reg.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleViewReceipt(reg.id)}
                            className='inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700'
                          >
                            View Receipt
                          </button>
                        )}
                        {(reg.status === 'CONFIRMED' || reg.status === 'PENDING') && (
                          <button
                            onClick={() => handleCancel(reg.id)}
                            className='inline-flex w-full items-center justify-center rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700'
                          >
                            Cancel Registration
                          </button>
                        )}
                      </div>
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

      {/* Receipt Modal */}
      {receiptHtml && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-white rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
              <h2 className="text-lg font-semibold text-slate-800">Registration Receipt</h2>
              <button 
                onClick={() => setReceiptHtml(null)} 
                className="rounded-full p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
                title="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-6 overflow-y-auto" dangerouslySetInnerHTML={{ __html: receiptHtml }} />
          </div>
        </div>
      )}

    </div>
  )
}

export default MyRegistrationsPage
