import { NavLink, Outlet } from 'react-router'

export default function OrganizerLayout() {
  return (
    <div className='py-6'>
      <div className='mb-6 flex flex-wrap items-center gap-3 border-b border-slate-200 pb-4'>
        <NavLink
          to='dashboard'
          className={({ isActive }) =>
            [
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            ].join(' ')
          }
        >
          Dashboard
        </NavLink>
        <NavLink
          to='events'
          end
          className={({ isActive }) =>
            [
              'rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive ? 'bg-violet-600 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
            ].join(' ')
          }
        >
          Events
        </NavLink>
      </div>

      <Outlet />
    </div>
  )
}
