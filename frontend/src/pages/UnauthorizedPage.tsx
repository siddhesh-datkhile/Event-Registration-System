import { Link, useNavigate } from 'react-router'
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react'

export default function UnauthorizedPage() {
  const navigate = useNavigate()

  return (
    <div className='flex min-h-[80vh] flex-col items-center justify-center px-4 py-12'>
      <div className='flex max-w-lg flex-col items-center rounded-3xl border border-red-100 bg-slate-50 p-10 text-center shadow-lg'>
        <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-50 text-red-500'>
          <ShieldAlert className='h-12 w-12' />
        </div>
        
        <h1 className='mb-3 text-3xl font-bold text-slate-900'>Access Denied</h1>
        <p className='mb-8 text-slate-500'>
          You don't have the necessary permissions to view this page. If you believe this is an error, please contact your administrator.
        </p>
        
        <div className='flex w-full flex-col gap-3 sm:flex-row'>
          <button
            onClick={() => navigate(-1)}
            className='inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-600 shadow-sm hover:bg-white focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Go Back
          </button>
          
          <Link
            to='/'
            className='inline-flex flex-1 items-center justify-center rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-violet-600 focus:ring-offset-2'
          >
            <Home className='mr-2 h-4 w-4' />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
