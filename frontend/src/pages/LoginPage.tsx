import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { login, saveTokens, getCurrentUser } from '../api/auth'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const { token, refreshToken } = await login({ email, password })
      saveTokens(token, refreshToken)
      toast.success('Logged in successfully!')
      
      const user = getCurrentUser()
      const isOrganizer = user?.roles?.includes('ROLE_ORGANIZER') || user?.roles?.includes('ORGANIZER')
      if (isOrganizer) {
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
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex w-full flex-1 items-center justify-center py-10'>
      <div className='w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm'>
        <h1 className='text-center text-3xl font-bold'>Welcome back</h1>
        <p className='mt-2 text-center text-slate-600'>
          Sign in to your account to continue.
        </p>

        <form className='mt-8 space-y-4' onSubmit={onSubmit}>
          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium text-slate-700'>
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              required
              autoComplete='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='password' className='text-sm font-medium text-slate-700'>
              Password
            </label>
            <input
              id='password'
              name='password'
              type='password'
              required
              autoComplete='current-password'
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500'
            />
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='mt-2 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70'
          >
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>

          <div className='text-center text-sm text-slate-600'>
            No account?{' '}
            <Link to='/register' className='font-semibold text-indigo-700 hover:text-indigo-800'>
              Create one
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage
