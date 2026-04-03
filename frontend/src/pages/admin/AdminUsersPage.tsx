import { useState } from 'react'
import { getAllUsers, addOrganizer, addRegistrant } from '../../api/auth'
import { toast } from 'react-toastify'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { userSchema } from '../../lib/schemas'

type AddUserForm = { name: string; email: string; role: 'ORGANIZER' | 'REGISTRANT' }

export default function AdminUsersPage() {
  const queryClient = useQueryClient()
  const { data: users = [], isLoading: loading } = useQuery({ queryKey: ['admin', 'users'], queryFn: getAllUsers })

  const [showAddForm, setShowAddForm] = useState(false)
  
  const { register, handleSubmit, reset, formState: { errors, isSubmitting: submitting } } = useForm<AddUserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: { name: '', email: '', role: 'REGISTRANT' }
  })

  const userMutation = useMutation({
    mutationFn: (data: AddUserForm) => data.role === 'ORGANIZER' ? addOrganizer(data) : addRegistrant(data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success(`${variables.role} account created successfully!`)
      setShowAddForm(false)
      reset()
    },
    onError: () => {
      toast.error('Failed to create account. Email might already be in use.')
    }
  })

  const onSubmit = (data: AddUserForm) => userMutation.mutate(data)

  return (
    <div className='mx-auto max-w-6xl px-4 py-8'>
      <div className='flex flex-wrap items-center justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-slate-900'>Platform Users</h1>
          <p className='mt-2 text-slate-600'>Manage organizers and registrants across the platform.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className='inline-flex items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 transition'
        >
          {showAddForm ? 'Cancel Creation' : '+ Add New User'}
        </button>
      </div>

      {showAddForm && (
        <div className='mt-6 rounded-2xl border border-violet-100 bg-violet-50/50 p-6'>
          <h2 className='text-lg font-semibold text-slate-900'>Create Pre-Authorized Account</h2>
          <p className='text-sm text-slate-500 mb-6'>Users will be created instantly with default privileges.</p>
          <form noValidate onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4 sm:flex-row sm:items-end'>
            <div className='flex-1'>
              <label className='block text-sm font-medium text-slate-600'>Full Name</label>
              <input
                type='text'
                placeholder='Jane Doe'
                {...register('name')}
                className='mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm p-2 border'
              />
              {errors.name && <p className='mt-1 text-xs text-red-500'>{errors.name.message}</p>}
            </div>
            <div className='flex-1'>
              <label className='block text-sm font-medium text-slate-600'>Email Address</label>
              <input
                type='email'
                placeholder='jane@example.com'
                {...register('email')}
                className='mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm p-2 border'
              />
              {errors.email && <p className='mt-1 text-xs text-red-500'>{errors.email.message}</p>}
            </div>
            <div className='flex-1'>
              <label className='block text-sm font-medium text-slate-600'>Initial Role</label>
              <select
                {...register('role')}
                className='mt-1 block w-full rounded-lg border-slate-200 shadow-sm focus:border-violet-600 focus:ring-violet-600 sm:text-sm p-2 border bg-slate-50'
              >
                <option value='REGISTRANT'>Registrant</option>
                <option value='ORGANIZER'>Organizer</option>
              </select>
            </div>
            <button
              type='submit'
              disabled={submitting}
              className='inline-flex items-center justify-center rounded-lg bg-violet-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 disabled:opacity-50 h-[42px]'
            >
              {submitting ? 'Creating...' : 'Provision User'}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <div className='mt-12 text-center text-slate-500'>Loading users...</div>
      ) : (
        <div className='mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm'>
          <div className='overflow-x-auto'>
            <table className='w-full whitespace-nowrap text-left text-sm'>
              <thead className='border-b border-slate-200 bg-white text-slate-600'>
                <tr>
                  <th className='px-6 py-4 font-semibold'>ID</th>
                  <th className='px-6 py-4 font-semibold'>Name</th>
                  <th className='px-6 py-4 font-semibold'>Email</th>
                  <th className='px-6 py-4 font-semibold'>Role</th>
                  <th className='px-6 py-4 font-semibold'>Status</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-slate-100'>
                {users.map((u) => (
                  <tr key={u.id} className='hover:bg-white'>
                    <td className='px-6 py-4 text-slate-900'>#{u.id}</td>
                    <td className='px-6 py-4 text-slate-900 font-medium'>{u.name || 'N/A'}</td>
                    <td className='px-6 py-4 text-slate-600'>{u.email}</td>
                    <td className='px-6 py-4'>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold
                        ${u.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                          u.role === 'ORGANIZER' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className='px-6 py-4'>
                      <span className='inline-flex items-center rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800'>
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {users.length === 0 && (
            <div className='py-12 text-center text-slate-500'>No users found.</div>
          )}
        </div>
      )}
    </div>
  )
}
