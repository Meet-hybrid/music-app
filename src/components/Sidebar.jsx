import { NavLink } from 'react-router-dom'
import { Home, Search, Library, Music2 } from 'lucide-react'

const links = [
  { to: '/', icon: Home, label: 'Home' },
  { to: '/search', icon: Search, label: 'Search' },
  { to: '/library', icon: Library, label: 'Your Library' },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-black flex flex-col py-6 px-4 gap-6 shrink-0">
      <div className="flex items-center gap-2 px-2">
        <Music2 size={28} className="text-green-400" />
        <span className="text-lg font-bold tracking-tight">MusicBox</span>
      </div>

      <nav className="flex flex-col gap-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
              ${isActive
                ? 'bg-[#282828] text-white'
                : 'text-[#b3b3b3] hover:text-white hover:bg-[#1a1a1a]'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}