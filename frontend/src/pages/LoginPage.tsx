import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { login as apiLogin, getCurrentUser } from '../api/auth'
import { useAuth } from '../contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema } from '../lib/schemas'

type LoginForm = { email: string; password: string }

function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      const { token, refreshToken } = await apiLogin(data)
      login(token, refreshToken)
      toast.success('Logged in successfully!')

      const user = getCurrentUser()
      const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN')
      const isOrganizer = user?.roles?.includes('ROLE_ORGANIZER') || user?.roles?.includes('ORGANIZER')

      if (isAdmin) {
        navigate('/admin/dashboard')
      } else if (isOrganizer) {
        navigate('/organizer/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Login failed. Please check your credentials.'
      toast.error(msg)
    }
  }

  return (
    <div className='flex w-full flex-1 items-center justify-center py-10'>
      <div className='w-full max-w-md rounded-3xl border border-slate-200 bg-slate-50 p-8 shadow-sm'>
        <h1 className='text-center text-3xl font-bold'>Welcome back</h1>
        <p className='mt-2 text-center text-slate-600'>
          Sign in to your account to continue.
        </p>

        <form noValidate className='mt-8 space-y-4' onSubmit={handleSubmit(onSubmit)}>
          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium text-slate-600'>
              Email
            </label>
            <input
              id='email'
              type='email'
              autoComplete='email'
              placeholder='you@example.com'
              {...register('email')}
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
              autoComplete='current-password'
              placeholder='••••••••'
              {...register('password')}
              className='w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-violet-600'
            />
            {errors.password && <p className='text-xs text-red-500'>{errors.password.message}</p>}
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='mt-2 inline-flex w-full items-center justify-center rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-70'
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className='text-center text-sm text-slate-600'>
            No account?{' '}
            <Link to='/register' className='font-semibold text-violet-600 hover:text-indigo-800'>
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
