import { NavLink, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'

const navItems = [
  { to: '/', icon: 'solar:widget-2-linear', activeIcon: 'solar:widget-2-bold', label: 'Dashboard' },
  { to: '/products', icon: 'solar:t-shirt-linear', activeIcon: 'solar:t-shirt-bold', label: 'Products' },
  { to: '/stock', icon: 'solar:box-minimalistic-linear', activeIcon: 'solar:box-minimalistic-bold', label: 'Stock' },
  { to: '/search', icon: 'solar:filter-linear', activeIcon: 'solar:filter-bold', label: 'Search & Filter' },
]

const systemItems = [
  { to: '/logs', icon: 'solar:clipboard-list-linear', activeIcon: 'solar:clipboard-list-bold', label: 'System Logs' },
  { to: '/settings', icon: 'solar:settings-linear', activeIcon: 'solar:settings-bold', label: 'Settings' },
]

const adminItems = [
  { to: '/users', icon: 'solar:users-group-two-rounded-linear', activeIcon: 'solar:users-group-two-rounded-bold', label: 'User Management' },
]

export default function Sidebar({ open, onClose }) {
  const { userProfile, signOut, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = () => {
    signOut()
    onClose?.()
    navigate('/login')
  }

  // Common styles for NavLinks
  const navLinkClass = ({ isActive }) => `
    group relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200
    ${isActive 
      ? 'bg-gradient-to-r from-[#253745] to-[#11212D] text-white shadow-lg' 
      : 'text-[#9BA8AB] hover:bg-[#253745]/40 hover:text-white'
    }
  `

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-[#11212D]/60 backdrop-blur-sm lg:hidden" onClick={onClose} />
      )}

      <aside
        className={`fixed top-0 left-0 z-50 flex h-full w-64 flex-col bg-[#11212D] border-r border-[#253745]/30 transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-20 items-center justify-between px-6">
          <NavLink to="/" className="flex items-center gap-3" onClick={onClose}>
            <img src="/JMERLSLOGO.png" alt="JMERLS" className="h-10 w-10 shrink-0 rounded-xl object-contain border-0 outline-none" />
            <span className="text-xl font-bold tracking-tight text-white">JMERLS</span>
          </NavLink>
          <button 
            type="button" 
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#9BA8AB] hover:bg-[#253745] lg:hidden" 
            onClick={onClose}
          >
            <Icon icon="solar:close-square-linear" className="h-6 w-6" />
          </button>
        </div>

        {/* Navigation Content */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide">
          {/* Main Menu */}
          <div className="mb-8">
            <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5C6A]">Main Menu</p>
            <ul className="space-y-1.5">
              {navItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} onClick={onClose} className={navLinkClass}>
                    {({ isActive }) => (
                      <>
                        <Icon icon={isActive ? item.activeIcon : item.icon} className={`h-5 w-5 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                        <span>{item.label}</span>
                        {isActive && <div className="absolute right-2 h-1.5 w-1.5 rounded-full bg-[#9BA8AB] shadow-[0_0_8px_rgba(155,168,171,0.8)]" />}
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Admin Section */}
          {isAdmin && (
            <div className="mb-8">
              <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-red-400/70">Administration</p>
              <ul className="space-y-1.5">
                {adminItems.map((item) => (
                  <li key={item.to}>
                    <NavLink to={item.to} onClick={onClose} className={navLinkClass}>
                      {({ isActive }) => (
                        <>
                          <Icon icon={isActive ? item.activeIcon : item.icon} className="h-5 w-5" />
                          <span>{item.label}</span>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* System Section */}
          <div>
            <p className="mb-2 px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#4A5C6A]">System</p>
            <ul className="space-y-1.5">
              {systemItems.map((item) => (
                <li key={item.to}>
                  <NavLink to={item.to} onClick={onClose} className={navLinkClass}>
                    {({ isActive }) => (
                      <>
                        <Icon icon={isActive ? item.activeIcon : item.icon} className="h-5 w-5" />
                        <span>{item.label}</span>
                      </>
                    )}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Footer / Profile Card */}
        <div className="p-4">
          <div className="rounded-2xl bg-[#253745]/30 border border-[#253745]/50 p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-[#4A5C6A] flex items-center justify-center text-[10px] font-bold text-white uppercase">
                {userProfile?.displayName?.charAt(0) || userProfile?.email?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-white">
                  {userProfile?.displayName || userProfile?.email?.split('@')[0]}
                </p>
                <p className="truncate text-[10px] text-[#9BA8AB]">
                  {isAdmin ? 'Super Admin' : 'Staff Member'}
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleSignOut}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-red-500/10 py-2.5 text-xs font-bold text-red-400 transition-all hover:bg-red-500 hover:text-white"
            >
              <Icon icon="solar:logout-linear" className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}