import { Link, useNavigate } from 'react-router-dom'
import { FileQuestion, ArrowLeft, Home } from 'lucide-react'

export default function ErrorPage() {
  const navigate = useNavigate()

  return (
    <div className='flex min-h-[80vh] flex-col items-center justify-center px-4 py-12'>
      <div className='flex max-w-lg flex-col items-center rounded-3xl border border-slate-100 bg-white p-10 text-center shadow-lg'>
        <div className='mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-slate-50 text-slate-400'>
          <FileQuestion className='h-12 w-12' />
        </div>
        
        <h1 className='mb-3 text-3xl font-bold text-slate-900'>Page Not Found</h1>
        <p className='mb-8 text-slate-500'>
          Oops! The page you are looking for doesn't exist or has been moved. Check the URL and try again.
        </p>
        
        <div className='flex w-full flex-col gap-3 sm:flex-row'>
          <button
            onClick={() => navigate(-1)}
            className='inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-200 focus:ring-offset-2'
          >
            <ArrowLeft className='mr-2 h-4 w-4' />
            Go Back
          </button>
          
          <Link
            to='/'
            className='inline-flex flex-1 items-center justify-center rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2'
          >
            <Home className='mr-2 h-4 w-4' />
            Return Home
          </Link>
        </div>
      </div>
    </div>
  )
}
