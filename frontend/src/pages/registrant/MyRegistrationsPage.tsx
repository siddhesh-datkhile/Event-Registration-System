import type {  Event  } from '../../model'
import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { getMyRegistrations, cancelRegistration } from '../../api/registrations'
import { getAllEvents } from '../../api/events'
import { EventCard } from '../../Components/EventCard'
import { toast } from 'react-toastify'
import { getReceiptHtml } from '../../api/receipts'
import { createPaymentOrder } from '../../api/payments'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function MyRegistrationsPage() {
  const queryClient = useQueryClient()
  const [receiptHtml, setReceiptHtml] = useState<string | null>(null)

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ['events'],
    queryFn: getAllEvents,
  })

  const { data: regs = [], isLoading: loadingRegs } = useQuery({
    queryKey: ['registrations', 'me'],
    queryFn: getMyRegistrations,
  })

  const loading = loadingEvents || loadingRegs

  const registrations = useMemo(() => {
    if (!regs || !events) return []
    const eventMap = new Map(events.map(e => [e.id, e]))
    const mapped = regs.map(reg => ({
      ...reg,
      event: eventMap.get(reg.eventId)
    }))
    return mapped.sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
  }, [regs, events])

  const cancelMutation = useMutation({
    mutationFn: (id: number) => cancelRegistration(id),
    onSuccess: () => {
      toast.success('Registration cancelled successfully.')
      queryClient.invalidateQueries({ queryKey: ['registrations', 'me'] })
    },
    onError: () => {
      toast.error('Failed to cancel registration.')
    }
  })

  const handleCancel = (id: number) => {
    if (!window.confirm('Are you sure you want to cancel this registration?')) return
    cancelMutation.mutate(id)
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
              queryClient.invalidateQueries({ queryKey: ['registrations', 'me'] })
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
            className='block rounded-md bg-violet-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
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
                    <div className='mt-4 flex flex-col gap-3 rounded-xl bg-white p-4 border border-slate-200'>
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
                            className='inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-violet-700'
                          >
                            Pay Now
                          </button>
                        )}
                        {reg.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleViewReceipt(reg.id)}
                            className='inline-flex w-full items-center justify-center rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-emerald-700'
                          >
                            View Receipt
                          </button>
                        )}
                        {(reg.status === 'CONFIRMED' || reg.status === 'PENDING') && (
                          <button
                            onClick={() => handleCancel(reg.id)}
                            className='inline-flex w-full items-center justify-center rounded-lg border border-red-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 hover:text-red-700'
                          >
                            Cancel Registration
                          </button>
                        )}
                      </div>
                    </div>
                  }
                />
              ) : (
                <div key={reg.id} className='rounded-2xl border border-slate-200 bg-white p-6 text-center text-slate-500'>
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
          <div className="relative w-full max-w-3xl max-h-[90vh] bg-slate-50 rounded-xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-white">
              <h2 className="text-lg font-semibold text-slate-900">Registration Receipt</h2>
              <button 
                onClick={() => setReceiptHtml(null)} 
                className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
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
