import { NavLink, Outlet } from 'react-router'

const navItems = [
  { to: 'dashboard', label: 'Dashboard' },
  { to: 'users', label: 'Users' },
  { to: 'events', label: 'Events' },
  { to: 'registrations', label: 'Registrations' },
  { to: 'venues', label: 'Venues' },
]

export default function AdminLayout() {
  return (
    <div className='py-6'>
      <div className='mb-6 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4'>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              [
                'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
              ].join(' ')
            }
          >
            {item.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  )
}
