import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { register as apiRegister } from '../api/auth'
import { useForm } from 'react-hook-form'

type RegisterForm = {
  name: string
  email: string
  password: string
  phone: string
  address: string
  dob: string
  role: 'ORGANIZER' | 'REGISTRANT'
}

function RegisterPage() {
  const navigate = useNavigate()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm<RegisterForm>({ defaultValues: { role: 'REGISTRANT' } })

  const onSubmit = async (data: RegisterForm) => {
    try {
      await apiRegister({
        name: data.name.trim(),
        email: data.email.trim(),
        password: data.password,
        phone: data.phone.trim(),
        address: data.address.trim(),
        dob: data.dob,
        role: data.role
      })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.'
      toast.error(msg)
    }
  }

  return (
    <div className='flex w-full flex-1 items-center justify-center py-10'>
      <div className='w-full max-w-md rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm'>
        <h1 className='text-center text-3xl font-bold'>Create account</h1>
        <p className='mt-2 text-center text-slate-600'>
          Create an account as an Organizer or Registrant.
        </p>

        <form className='mt-8 space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-2'>
            <label htmlFor='name' className='text-sm font-medium text-slate-600'>
              Full name
            </label>
            <input
              id='name'
              type='text'
              placeholder='Your full name'
              {...register('name', { required: 'Name is required' })}
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-600'
            />
            {errors.name && <p className='text-xs text-red-500'>{errors.name.message}</p>}
          </div>

          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium text-slate-600'>
              Email
            </label>
            <input
              id='email'
              type='email'
              placeholder='you@example.com'
              {...register('email', { required: 'Email is required' })}
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-600'
            />
            {errors.email && <p className='text-xs text-red-500'>{errors.email.message}</p>}
          </div>

          <div className='space-y-2'>
            <label htmlFor='password' className='text-sm font-medium text-slate-600'>
              Password
            </label>
            <input
              id='password'
              type='password'
              placeholder='••••••••'
              {...register('password', {
                required: 'Password is required',
                minLength: { value: 6, message: 'Password must be at least 6 characters' }
              })}
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-600'
            />
            {errors.password && <p className='text-xs text-red-500'>{errors.password.message}</p>}
          </div>

          <div className='space-y-2'>
            <label htmlFor='phone' className='text-sm font-medium text-slate-600'>
              Phone number
            </label>
            <input
              id='phone'
              type='tel'
              inputMode='numeric'
              maxLength={10}
              placeholder='10-digit phone'
              {...register('phone', {
                required: 'Phone number is required',
                pattern: { value: /^[0-9]{10}$/, message: 'Enter a valid 10-digit phone number' }
              })}
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-600'
            />
            {errors.phone && <p className='text-xs text-red-500'>{errors.phone.message}</p>}
          </div>

          <div className='space-y-2'>
            <label htmlFor='address' className='text-sm font-medium text-slate-600'>
              Address
            </label>
            <textarea
              id='address'
              placeholder='Your address'
              rows={3}
              {...register('address', { required: 'Address is required' })}
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-600'
            />
            {errors.address && <p className='text-xs text-red-500'>{errors.address.message}</p>}
          </div>

          <div className='space-y-2'>
            <label htmlFor='dob' className='text-sm font-medium text-slate-600'>
              Date of birth
            </label>
            <input
              id='dob'
              type='date'
              {...register('dob', { required: 'Date of birth is required' })}
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-600'
            />
            {errors.dob && <p className='text-xs text-red-500'>{errors.dob.message}</p>}
          </div>

          <div className='space-y-2'>
            <label htmlFor='role' className='text-sm font-medium text-slate-600'>
              Account type
            </label>
            <select
              id='role'
              {...register('role', { required: true })}
              className='w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-violet-600'
            >
              <option value='ORGANIZER'>Organizer</option>
              <option value='REGISTRANT'>Registrant</option>
            </select>
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='mt-2 inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70'
          >
            {isSubmitting ? 'Creating...' : 'Create account'}
          </button>

          <div className='text-center text-sm text-slate-600'>
            Already have an account?{' '}
            <Link to='/login' className='font-semibold text-violet-600 hover:text-indigo-800'>
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage
