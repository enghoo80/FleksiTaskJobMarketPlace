import { NavLink } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { logout } from '../slices/authSlice'

const links = [
  { to: '/', label: 'Dashboard', icon: '📊' },
  { to: '/users', label: 'Users', icon: '👥' },
  { to: '/tasks', label: 'Tasks', icon: '📋' },
  { to: '/applications', label: 'Applications', icon: '📝' },
  { to: '/active-workers', label: 'Active Workers', icon: '🟢' },
  { to: '/time-logs', label: 'Time & Payments', icon: '⏱️' },
  { to: '/withdrawals', label: 'Withdrawals', icon: '💸' },
  { to: '/analytics', label: 'Analytics', icon: '📈' },
]

export default function Sidebar() {
  const dispatch = useDispatch()
  return (
    <aside className="w-60 bg-gray-900 text-white flex flex-col shrink-0">
      <div className="px-6 py-5 border-b border-gray-700">
        <p className="font-bold text-lg">⚡ FleksiTask</p>
        <p className="text-xs text-gray-400 mt-0.5">Admin Dashboard</p>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {links.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'
              }`
            }
          >
            <span>{icon}</span> {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-gray-700">
        <button
          onClick={() => dispatch(logout())}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-gray-800 transition-colors"
        >
          <span>🚪</span> Logout
        </button>
      </div>
    </aside>
  )
}
