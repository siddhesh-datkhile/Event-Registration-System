import { Link, Outlet } from 'react-router-dom'
import Navbar from '../Components/Navbar'

function HomeLayout() {
  return (
    <div className='min-h-screen bg-slate-50 text-slate-900 flex flex-col'>
      <Navbar variant='sticky' />

      <main className='mx-auto w-full max-w-6xl flex-1 px-4'>
        <Outlet />
      </main>

      <footer className='border-t border-slate-200 bg-slate-50'>
        <div className='mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 md:flex-row md:items-center md:justify-between'>
          <div className='text-sm text-slate-600'>
            © {new Date().getFullYear()} Event Registration System
          </div>
          <div className='flex gap-4 text-sm font-medium'>
            <Link to='/register' className='text-slate-600 hover:text-slate-900'>
              Register
            </Link>
            <Link to='/login' className='text-slate-600 hover:text-slate-900'>
              Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomeLayout
