import { Link, NavLink } from 'react-router-dom'

type NavbarProps = {
  variant?: 'default' | 'sticky'
}

function Navbar({ variant = 'default' }: NavbarProps) {
  return (
    <header
      className={[
        variant === 'sticky' ? 'sticky top-0 z-40' : '',
        'border-b border-slate-200 bg-white/90 backdrop-blur'
      ].join(' ')}
    >
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
        <Link to='/' className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white font-semibold'>
            ER
          </div>
          <div className='leading-tight'>
            <div className='font-semibold'>Event Registration</div>
            <div className='text-sm text-slate-600'>Fast, organized, and simple</div>
          </div>
        </Link>

        <nav className='flex items-center gap-4 text-sm font-medium'>
          <NavLink
            to='/events'
            className={({ isActive }) =>
              [
                'text-slate-700 hover:text-slate-900',
                isActive ? 'font-bold text-slate-900' : '',
              ].join(' ')
            }
          >
            Events
          </NavLink>
          <NavLink
            to='/login'
            className={({ isActive }) =>
              [
                'text-slate-700 hover:text-slate-900',
                isActive ? 'text-slate-900' : ''
              ].join(' ')
            }
          >
            Login
          </NavLink>
          <NavLink
            to='/register'
            className={({ isActive }) =>
              [
                'inline-flex items-center justify-center rounded-lg px-4 py-2',
                isActive
                  ? 'bg-indigo-700 text-white'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              ].join(' ')
            }
          >
            Create Account
          </NavLink>
        </nav>
      </div>
    </header>
  )
}

export default Navbar

