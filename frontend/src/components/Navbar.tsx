import { Link, NavLink, useNavigate } from 'react-router'
import { UserCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { buttonVariants } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"


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
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger className={buttonVariants({ variant: "ghost", size: "icon" }) + " text-slate-600 hover:text-violet-600 transition-colors cursor-pointer"}>
                  <UserCircle className="w-6 h-6" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => navigate(dashboardPath)}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <NavLink to='/login' className={buttonVariants({ variant: "ghost" })}>
                Login
              </NavLink>
              <NavLink to='/register' className={buttonVariants({ variant: "default" }) + " bg-violet-600 text-white hover:bg-violet-700"}>
                Create Account
              </NavLink>
            </div>
          )}
        </nav>
      </div>
    </header>


  )
}

export default Navbar

