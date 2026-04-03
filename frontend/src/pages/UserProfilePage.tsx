import type {  UpdateProfileRequest  } from '../model'
import { useState, useEffect } from 'react'
import { fetchUserProfile, updateProfile } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import { UserCircle, Mail, Phone, MapPin, Calendar, Shield } from 'lucide-react'
import { toast } from 'react-toastify'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateProfileSchema } from '../lib/schemas'

export default function UserProfilePage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)

  const { register, handleSubmit, reset, formState: { errors, isSubmitting: saving } } = useForm<UpdateProfileRequest>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: { name: '', phone: '', address: '', dob: '' }
  })

  const { data: profile, isLoading, error: queryError } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: !!user?.id,
  })

  // Pre-fill form when profile data loads
  useEffect(() => {
    if (profile) {
      reset({
        name: profile.name || '',
        phone: profile.phone || '',
        address: profile.address || '',
        dob: profile.dob || ''
      })
    }
  }, [profile, reset])

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProfileRequest) => updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] })
      setIsEditing(false)
      toast.success('Profile updated successfully!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile. Please check the required fields.')
    }
  })

  const onSubmit = (data: UpdateProfileRequest) => updateMutation.mutate(data)

  const handleCancel = () => {
    setIsEditing(false)
    if (profile) reset({ name: profile.name || '', phone: profile.phone || '', address: profile.address || '', dob: profile.dob || '' })
  }

  const loading = isLoading
  const error = !user ? 'User not authenticated.' : (queryError ? 'Failed to load profile information.' : null)

  if (loading) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-12 text-center'>
        <p className='text-slate-500'>Loading profile...</p>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className='mx-auto max-w-3xl px-4 py-12 text-center'>
        <p className='text-red-500'>{error || 'Profile not found.'}</p>
      </div>
    )
  }

  return (
    <div className='mx-auto max-w-3xl px-4 py-12'>
      <div className='overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm'>
        {/* Header Cover */}
        <div className='h-32 bg-gradient-to-r from-violet-600 to-indigo-600'></div>
        
        {/* Profile Info */}
        <div className='relative px-6 pb-8 sm:px-10'>
          <div className='-mt-12 mb-6 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4'>
            <div className='flex items-end'>
              <div className='rounded-full border-4 border-white bg-slate-50 p-1 shadow-sm'>
                <UserCircle className='h-24 w-24 text-slate-300' strokeWidth={1} />
              </div>
            </div>
            <div className='flex items-center gap-3'>
              <span className='inline-flex items-center rounded-full bg-violet-50 px-3 py-1 text-sm font-semibold text-violet-600 border border-violet-200'>
                <Shield className='mr-1.5 h-4 w-4' />
                {profile.role.replace('ROLE_', '')}
              </span>
              <button
                type='button'
                onClick={isEditing ? handleCancel : () => setIsEditing(true)}
                className='inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-white'
              >
                {isEditing ? 'Cancel' : 'Edit Profile'}
              </button>
            </div>
          </div>

          <div>
            <h1 className='text-3xl font-bold text-slate-900'>{profile.name}</h1>
            <p className='text-slate-500'>ID: #{profile.id}</p>
          </div>

          {isEditing ? (
            <form noValidate onSubmit={handleSubmit(onSubmit)} className='mt-8 flex flex-col gap-6'>
              <div className='grid gap-6 sm:grid-cols-2'>
                <div>
                  <label className='block text-sm font-medium text-slate-600'>Full Name</label>
                  <input
                    type='text'
                    {...register('name')}
                    className='mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm p-2.5 border'
                  />
                  {errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name.message}</p>}
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-600'>Email Address (Read-only)</label>
                  <input
                    type='email'
                    disabled
                    value={profile.email}
                    className='mt-1 block w-full rounded-lg border-slate-200 bg-white text-slate-500 shadow-sm sm:text-sm p-2.5 border cursor-not-allowed'
                  />
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-600'>Phone Number</label>
                  <input
                    type='text'
                    placeholder='1234567890'
                    {...register('phone')}
                    className='mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm p-2.5 border'
                  />
                  {errors.phone && <p className='mt-1 text-xs text-red-500'>{errors.phone.message}</p>}
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-600'>Date of Birth</label>
                  <input
                    type='date'
                    max={new Date().toISOString().split('T')[0]}
                    {...register('dob')}
                    className='mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm p-2.5 border'
                  />
                  {errors.dob && <p className='mt-1 text-xs text-red-500'>{errors.dob.message}</p>}
                </div>

                <div className='sm:col-span-2'>
                  <label className='block text-sm font-medium text-slate-600'>Address</label>
                  <textarea
                    rows={3}
                    {...register('address')}
                    className='mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm p-2.5 border'
                  />
                  {errors.address && <p className='mt-1 text-xs text-red-500'>{errors.address.message}</p>}
                </div>
              </div>

              <div className='flex justify-end pt-4 border-t border-slate-200'>
                <button
                  type='submit'
                  disabled={saving}
                  className='inline-flex items-center rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50'
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : (
            <div className='mt-8 grid gap-6 sm:grid-cols-2'>
              <div className='flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4'>
                <Mail className='mt-0.5 h-5 w-5 text-violet-600' />
                <div>
                  <p className='text-sm font-medium text-slate-500'>Email Address</p>
                  <p className='font-medium text-slate-900'>{profile.email}</p>
                </div>
              </div>

              <div className='flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4'>
                <Phone className='mt-0.5 h-5 w-5 text-violet-600' />
                <div>
                  <p className='text-sm font-medium text-slate-500'>Phone Number</p>
                  <p className='font-medium text-slate-900'>{profile.phone || 'Not provided'}</p>
                </div>
              </div>

              <div className='flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:col-span-2'>
                <MapPin className='mt-0.5 h-5 w-5 text-violet-600' />
                <div>
                  <p className='text-sm font-medium text-slate-500'>Address</p>
                  <p className='font-medium text-slate-900'>{profile.address || 'Not provided'}</p>
                </div>
              </div>

              <div className='flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-4'>
                <Calendar className='mt-0.5 h-5 w-5 text-violet-600' />
                <div>
                  <p className='text-sm font-medium text-slate-500'>Date of Birth</p>
                  <p className='font-medium text-slate-900'>{profile.dob || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
