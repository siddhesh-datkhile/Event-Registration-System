import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { register } from '../api/auth'

function RegisterPage() {
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [address, setAddress] = useState('')
  const [dob, setDob] = useState('')
  const [role, setRole] = useState<'ORGANIZER' | 'REGISTRANT'>('REGISTRANT')

  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (!name.trim()) return setError('Name is required')
    if (!email.trim()) return setError('Email is required')
    if (!password.trim()) return setError('Password is required')
    if (!phone.trim()) return setError('Phone number is required')
    if (!address.trim()) return setError('Address is required')
    if (!dob.trim()) return setError('DOB is required')

    setIsSubmitting(true)
    try {
      await register({ name: name.trim(), email: email.trim(), password, phone: phone.trim(), address: address.trim(), dob, role })
      toast.success('Account created! Please sign in.')
      navigate('/login')
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Registration failed. Please try again.'
      setError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='flex w-full flex-1 items-center justify-center py-10'>
      <div className='w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm'>
        <h1 className='text-center text-3xl font-bold'>Create account</h1>
        <p className='mt-2 text-center text-slate-600'>
          Create an account as an Organizer or Registrant.
        </p>

        {error ? (
          <div
            className='mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700'
            role='alert'
          >
            {error}
          </div>
        ) : null}

        <form className='mt-8 space-y-4' onSubmit={onSubmit}>
          <div className='space-y-2'>
            <label htmlFor='name' className='text-sm font-medium text-slate-700'>
              Full name
            </label>
            <input
              id='name'
              name='name'
              type='text'
              required
              placeholder='Your full name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='email' className='text-sm font-medium text-slate-700'>
              Email
            </label>
            <input
              id='email'
              name='email'
              type='email'
              required
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
              placeholder='••••••••'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='phone' className='text-sm font-medium text-slate-700'>
              Phone number
            </label>
            <input
              id='phone'
              name='phone'
              type='tel'
              required
              inputMode='numeric'
              pattern='^[0-9]{10}$'
              maxLength={10}
              placeholder='10-digit phone'
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='address' className='text-sm font-medium text-slate-700'>
              Address
            </label>
            <textarea
              id='address'
              name='address'
              required
              placeholder='Your address'
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='dob' className='text-sm font-medium text-slate-700'>
              Date of birth
            </label>
            <input
              id='dob'
              name='dob'
              type='date'
              required
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500'
            />
          </div>

          <div className='space-y-2'>
            <label htmlFor='role' className='text-sm font-medium text-slate-700'>
              Account type
            </label>
            <select
              id='role'
              name='role'
              required
              value={role}
              onChange={(e) => setRole(e.target.value as 'ORGANIZER' | 'REGISTRANT')}
              className='w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-indigo-500'
            >
              <option value='ORGANIZER'>Organizer</option>
              <option value='REGISTRANT'>Registrant</option>
            </select>
          </div>

          <button
            type='submit'
            disabled={isSubmitting}
            className='mt-2 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-70'
          >
            {isSubmitting ? 'Creating...' : 'Create account'}
          </button>

          <div className='text-center text-sm text-slate-600'>
            Already have an account?{' '}
            <Link to='/login' className='font-semibold text-indigo-700 hover:text-indigo-800'>
              Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RegisterPage

