import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getEventById, createEvent, updateEvent, deleteEvent, type EventStatus } from '../../api/events'
import { getCurrentUser } from '../../api/auth'

export default function ManageEventPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const user = getCurrentUser()

  const [loading, setLoading] = useState(isEditing)
  const [saving, setSaving] = useState(false)
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventDate: '',
    entryFee: 0,
    capacity: 100,
    status: 'OPEN' as EventStatus,
    organizerId: user?.id || 0,
  })

  useEffect(() => {
    if (isEditing && id) {
      getEventById(id)
        .then((data) => {
          setFormData({
            title: data.title,
            description: data.description,
            // Format datetime-local requires YYYY-MM-DDThh:mm
            eventDate: data.eventDate ? data.eventDate.slice(0, 16) : '',
            entryFee: data.entryFee,
            capacity: data.capacity,
            status: data.status,
            organizerId: data.organizerId,
          })
        })
        .catch(() => toast.error('Failed to load event'))
        .finally(() => setLoading(false))
    }
  }, [id, isEditing])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'entryFee' || name === 'capacity' ? Number(value) : value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      if (isEditing && id) {
        await updateEvent(id, formData)
        toast.success('Event updated successfully!')
      } else {
        await createEvent(formData)
        toast.success('Event created successfully!')
      }
      navigate('/organizer/events')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save event')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this event? This assumes there are no registrations.')) {
      return
    }
    try {
      await deleteEvent(id!)
      toast.success('Event deleted')
      navigate('/organizer/events')
    } catch (err: any) {
      toast.error('Could not delete event. It may have existing registrations.')
    }
  }

  if (loading) {
    return <div className="p-8 text-center text-slate-500">Loading...</div>
  }

  return (
    <div className='mx-auto max-w-3xl px-4 py-8'>
      <div className='mb-6 flex items-center gap-4'>
        <Link to='/organizer/events' className='text-sm font-medium text-slate-500 hover:text-slate-900'>
          &larr; Back to Events
        </Link>
      </div>

      <div className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8'>
        <div className='flex items-center justify-between'>
          <h1 className='text-2xl font-bold text-slate-900'>
            {isEditing ? 'Edit Event' : 'Create New Event'}
          </h1>
          {isEditing && (
            <button
              type='button'
              onClick={handleDelete}
              className='text-sm font-semibold text-red-600 hover:text-red-700'
            >
              Delete Event
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className='mt-8 space-y-6'>
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Event Title</label>
            <input
              required
              type='text'
              name='title'
              value={formData.title}
              onChange={handleChange}
              className='w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
              placeholder='e.g. Annual Tech Conference'
            />
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-700'>Description</label>
            <textarea
              required
              name='description'
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className='w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
              placeholder='Describe the event details...'
            />
          </div>

          <div className='grid gap-6 sm:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Date & Time</label>
              <input
                required
                type='datetime-local'
                name='eventDate'
                value={formData.eventDate}
                onChange={handleChange}
                className='w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Status</label>
              <select
                name='status'
                value={formData.status}
                onChange={handleChange}
                className='w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
              >
                <option value='OPEN'>Open</option>
                <option value='CLOSED'>Closed</option>
              </select>
            </div>
          </div>

          <div className='grid gap-6 sm:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Entry Fee (₹)</label>
              <input
                required
                type='number'
                min='0'
                name='entryFee'
                value={formData.entryFee}
                onChange={handleChange}
                className='w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-700'>Total Capacity</label>
              <input
                required
                type='number'
                min='1'
                name='capacity'
                value={formData.capacity}
                onChange={handleChange}
                className='w-full rounded-lg border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500'
              />
            </div>
          </div>

          <div className='pt-4'>
            <button
              type='submit'
              disabled={saving}
              className='w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-70'
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
