
import { Link, NavLink, useNavigate } from 'react-router'
import { UserCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

type NavbarProps = {
  variant?: 'default' | 'sticky'
}
//take variant from props and if not set default
function Navbar({ variant = 'default' }: NavbarProps) {
  const navigate = useNavigate()
  const { isAuthenticated: loggedIn, user, logout } = useAuth()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const isOrganizer = user?.roles?.includes('ROLE_ORGANIZER') || user?.roles?.includes('ORGANIZER')
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ADMIN')

  // TODO: Add a check for the user role to determine the dashboard path

  const dashboardPath = isAdmin ? '/admin/dashboard' : isOrganizer ? '/organizer/dashboard' : '/dashboard'

  return (
    <header
      className={[
        variant === 'sticky' ? 'sticky top-0 z-40' : '',
        'border-b border-slate-200 bg-slate-50/90 backdrop-blur'
      ].join(' ')}
    >
      <div className='mx-auto flex max-w-6xl items-center justify-between px-4 py-3'>
        <Link to='/' className='flex items-center gap-3'>
          <div className='flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600 text-white font-semibold'>
            ER
          </div>
          <div className='leading-tight'>
            <div className='font-semibold'>Eventra</div>
            <div className='text-sm text-slate-600'>Fast, organized, and simple</div>
          </div>
        </Link>

        <nav className='flex items-center gap-4 text-sm font-medium'>
          <NavLink
            to='/events'
            className={({ isActive }) =>
              [
                'text-slate-600 hover:text-slate-900',
                isActive ? 'font-bold text-slate-900' : '',
              ].join(' ')
            }
          >
            Events
          </NavLink>

          {loggedIn ? (
            <>
              <NavLink
                to={dashboardPath}
                className={({ isActive }) =>
                  [
                    'text-slate-600 hover:text-slate-900',
                    isActive ? 'font-bold text-slate-900' : '',
                  ].join(' ')
                }
              >
                Dashboard
              </NavLink>
              <Link to='/profile' className='text-slate-600 hover:text-violet-600 transition-colors' title='User Profile'>
                <UserCircle className='w-6 h-6' />
              </Link>
              <button
                onClick={handleLogout}
                className='text-slate-600 hover:text-slate-900'
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to='/login'
                className={({ isActive }) =>
                  [
                    'text-slate-600 hover:text-slate-900',
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
                      ? 'bg-violet-700 text-white'
                      : 'bg-violet-600 text-white hover:bg-violet-700'
                  ].join(' ')
                }
              >
                Create Account
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>


  )
}

export default Navbar

