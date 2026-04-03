
import { useState } from 'react'
import { getAllVenues, addVenue } from '../../api/venues'
import { toast } from 'react-toastify'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function AdminVenuesPage() {
  const queryClient = useQueryClient()
  const { data: venues = [], isLoading: loading } = useQuery({ queryKey: ['admin', 'venues'], queryFn: getAllVenues })

  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({ name: '', address: '', city: '' })

  const venueMutation = useMutation({
    mutationFn: addVenue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'venues'] })
      queryClient.invalidateQueries({ queryKey: ['venues'] })
      toast.success('Venue added successfully!')
      setShowAddForm(false)
      setFormData({ name: '', address: '', city: '' })
    },
    onError: () => {
      toast.error('Failed to add venue. Please check your inputs.')
    }
  })

  const submitting = venueMutation.isPending

  const handleAddVenue = (e: React.FormEvent) => {
    e.preventDefault()
    venueMutation.mutate(formData)
  }

  return (
    <div className='mx-auto max-w-6xl px-4 py-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Platform Venues</h1>
          <p className='mt-2 text-slate-600'>Manage and add event venues available for organizers.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className='inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition'
        >
          {showAddForm ? 'Cancel Creation' : '+ Add New Venue'}
        </button>
      </div>

      {showAddForm && (
        <div className='mt-6 rounded-2xl border border-violet-100 bg-violet-50/50 p-6'>
          <h2 className='text-lg font-semibold text-slate-900'>Create New Venue</h2>
          <p className='text-sm text-slate-500 mb-6'>Provide details to add a new physical location for events.</p>
          <form onSubmit={handleAddVenue} className='flex flex-col gap-4 sm:flex-row sm:items-end flex-wrap'>
            <div className='flex-1 min-w-[200px]'>
              <label className='block text-sm font-medium text-slate-600'>Venue Name</label>
              <input
                type='text'
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className='mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm p-2 border bg-slate-50'
                placeholder='e.g. Grand Convention Center'
              />
            </div>
            <div className='flex-1 min-w-[200px]'>
              <label className='block text-sm font-medium text-slate-600'>Address</label>
              <input
                type='text'
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className='mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm p-2 border bg-slate-50'
                placeholder='e.g. 123 Main St'
              />
            </div>
            <div className='flex-1 min-w-[200px]'>
              <label className='block text-sm font-medium text-slate-600'>City</label>
              <input
                type='text'
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className='mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm p-2 border bg-slate-50'
                placeholder='e.g. Metro City'
              />
            </div>
            <button
              type='submit'
              disabled={submitting}
              className='inline-flex items-center justify-center rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 h-[42px]'
            >
              {submitting ? 'Adding...' : 'Save Venue'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className='mt-12 text-center text-slate-500'>Loading venues...</div>
      ) : (
        <div className='mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full whitespace-nowrap text-left text-sm'>
              <thead className='border-b border-slate-200 bg-white text-slate-600'>
                <tr>
                  <th className='px-6 py-4 font-semibold'>ID</th>
                  <th className='px-6 py-4 font-semibold'>Name</th>
                  <th className='px-6 py-4 font-semibold'>Address</th>
                  <th className='px-6 py-4 font-semibold'>City</th>
                  <th className='px-6 py-4 font-semibold'>Created at</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {venues.map((v) => (
                  <tr key={v.id} className='hover:bg-white'>
                    <td className='px-6 py-4 text-slate-900'>#{v.id}</td>
                    <td className='px-6 py-4 text-slate-900 font-medium'>{v.name}</td>
                    <td className='px-6 py-4 text-slate-600'>{v.address}</td>
                    <td className='px-6 py-4 text-slate-600'>{v.city}</td>
                    <td className='px-6 py-4 text-slate-600'>
                      {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {venues.length === 0 && (
            <div className='py-12 text-center text-slate-500'>No venues found. Make sure to add some!</div>
          )}
        </div>
      )}
    </div>
  )
}
