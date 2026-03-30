import { Link } from 'react-router-dom'

function LoginPage() {
  return (
    <div className='flex w-full flex-1 items-center justify-center py-10'>
      <div className='w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm'>
        <h1 className='text-center text-3xl font-bold'>Login</h1>
        <p className='mt-2 text-center text-slate-600'>
          This is a starter login page. Hook it up to your auth backend next.
        </p>

        <form className='mt-8 space-y-4'>
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
              className='w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500'
            />
          </div>

          <button
            type='submit'
            className='mt-2 inline-flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700'
          >
            Sign in
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

