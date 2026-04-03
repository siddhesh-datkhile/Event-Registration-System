import type { EventStatus } from '../../model'
import { useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getEventById, createEvent, updateEvent, deleteEvent } from '../../api/events'
import { getAllVenues } from '../../api/venues'
import { useAuth } from '../../contexts/AuthContext'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { eventSchema } from '../../lib/schemas'

type EventForm = {
  title: string
  description: string
  eventDate: string
  entryFee: number
  capacity: number
  status: EventStatus
  organizerId: number
  venueId: number
}

export default function ManageEventPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const { user } = useAuth()

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<EventForm>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      title: '',
      description: '',
      eventDate: '',
      entryFee: 0,
      capacity: 100,
      status: 'OPEN',
      organizerId: user?.id || 0,
      venueId: 0,
    }
  })

  const { data: eventData, isLoading: loadingEvent } = useQuery({
    queryKey: ['events', id],
    queryFn: () => getEventById(id!),
    enabled: isEditing && !!id
  })

  const { data: venues = [], isLoading: loadingVenues } = useQuery({
    queryKey: ['venues'],
    queryFn: getAllVenues
  })

  const loading = loadingEvent || loadingVenues

  // Pre-fill form when editing an existing event
  useEffect(() => {
    if (eventData) {
      reset({
        title: eventData.title,
        description: eventData.description,
        eventDate: eventData.eventDate ? eventData.eventDate.slice(0, 16) : '',
        entryFee: eventData.entryFee,
        capacity: eventData.capacity,
        status: eventData.status,
        organizerId: eventData.organizerId,
        venueId: eventData.venueId,
      })
    }
  }, [eventData, reset])

  // Default to first venue when creating a new event
  useEffect(() => {
    if (!isEditing && venues.length > 0) {
      setValue('venueId', venues[0].id)
    }
  }, [venues, isEditing, setValue])

  const mutation = useMutation({
    mutationFn: (data: EventForm) => isEditing && id ? updateEvent(id, data) : createEvent(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success(isEditing ? 'Event updated successfully!' : 'Event created successfully!')
      navigate('/organizer/events')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to save event')
    }
  })

  const deleteMutation = useMutation({
    mutationFn: () => deleteEvent(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      toast.success('Event deleted')
      navigate('/organizer/events')
    },
    onError: () => {
      toast.error('Could not delete event. It may have existing registrations.')
    }
  })

  const onSubmit = (data: EventForm) => mutation.mutate(data)

  const handleDelete = () => {
    if (!window.confirm('Are you sure you want to delete this event? This assumes there are no registrations.')) return
    deleteMutation.mutate()
  }

  const saving = mutation.isPending

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

      <div className='rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm sm:p-8'>
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

        <form noValidate onSubmit={handleSubmit(onSubmit)} className='mt-8 space-y-6'>
          <div>
            <label className='mb-1 block text-sm font-medium text-slate-600'>Event Title</label>
            <input
              type='text'
              placeholder='e.g. Annual Tech Conference'
              {...register('title')}
              className='w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600'
            />
            {errors.title && <p className='mt-1 text-xs text-red-500'>{errors.title.message}</p>}
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-600'>Description</label>
            <textarea
              rows={4}
              placeholder='Describe the event details...'
              {...register('description')}
              className='w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600'
            />
            {errors.description && <p className='mt-1 text-xs text-red-500'>{errors.description.message}</p>}
          </div>

          <div className='grid gap-6 sm:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-600'>Date &amp; Time</label>
              <input
                type='datetime-local'
                {...register('eventDate')}
                className='w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600'
              />
              {errors.eventDate && <p className='mt-1 text-xs text-red-500'>{errors.eventDate.message}</p>}
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-600'>Status</label>
              <select
                {...register('status')}
                className='w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600'
              >
                <option value='OPEN'>Open</option>
                <option value='CLOSED'>Closed</option>
              </select>
            </div>
          </div>

          <div>
            <label className='mb-1 block text-sm font-medium text-slate-600'>Venue</label>
            <select
              {...register('venueId', { valueAsNumber: true })}
              className='w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600'
            >
              {venues.length === 0 ? (
                <option value='0' disabled>No venues available. Please contact admin.</option>
              ) : (
                venues.map(v => (
                  <option key={v.id} value={v.id}>{v.name} ({v.address}, {v.city})</option>
                ))
              )}
            </select>
          </div>

          <div className='grid gap-6 sm:grid-cols-2'>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-600'>Entry Fee (₹)</label>
              <input
                type='number'
                min='0'
                {...register('entryFee', { valueAsNumber: true })}
                className='w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600'
              />
            </div>
            <div>
              <label className='mb-1 block text-sm font-medium text-slate-600'>Total Capacity</label>
              <input
                type='number'
                min='1'
                {...register('capacity', { valueAsNumber: true })}
                className='w-full rounded-lg border border-slate-200 px-4 py-2 text-sm focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600'
              />
            </div>
          </div>

          <div className='pt-4'>
            <button
              type='submit'
              disabled={saving}
              className='w-full rounded-xl bg-violet-600 px-4 py-3 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-70'
            >
              {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
