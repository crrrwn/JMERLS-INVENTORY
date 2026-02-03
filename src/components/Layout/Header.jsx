import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'

export default function Header({ onMenuClick, globalSearch }) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  const handleSearch = (e) => {
    e.preventDefault()
    const q = query.trim()
    if (globalSearch && q) navigate(`/search?q=${encodeURIComponent(q)}`)
    else if (q) setSearchParams({ q })
    setQuery('')
  }

  // Get initial for avatar
  const userInitial = (user?.displayName || user?.email || 'U').charAt(0).toUpperCase()
  const userName = user?.displayName || user?.email?.split('@')[0] || 'User'

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b border-[#253745]/10 bg-white/80 px-4 backdrop-blur-md safe-top sm:px-8">
      
      {/* Mobile Menu Button */}
      <button 
        type="button" 
        className="flex h-10 w-10 items-center justify-center rounded-xl text-[#253745] transition-all hover:bg-[#4A5C6A]/10 active:scale-95 lg:hidden" 
        onClick={onMenuClick} 
        aria-label="Open menu"
      >
        <Icon icon="solar:hamburger-menu-linear" className="h-6 w-6" />
      </button>

      {/* Search Bar Section */}
      <form onSubmit={handleSearch} className="min-w-0 flex-1 sm:max-w-md">
        <div className="relative group">
          <div className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors duration-200 ${isFocused ? 'text-[#11212D]' : 'text-[#4A5C6A]'}`}>
            <Icon icon="solar:magnifer-linear" className="h-5 w-5" />
          </div>
          <input
            type="search"
            placeholder="Search products, orders, or logs..."
            value={query}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onChange={(e) => setQuery(e.target.value)}
            className="h-11 w-full rounded-xl border border-[#253745]/10 bg-[#f8fafc] py-2 pl-10 pr-4 text-sm text-[#11212D] placeholder-[#9BA8AB] transition-all focus:border-[#4A5C6A] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#4A5C6A]/5 group-hover:bg-[#f1f5f9]"
          />
          {/* Keyboard Shortcut Hint (Desktop only) */}
          <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 sm:block">
            <kbd className="flex h-5 items-center gap-1 rounded border border-[#9BA8AB]/30 bg-white px-1.5 font-sans text-[10px] font-medium text-[#9BA8AB]">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </form>

      {/* Right Side Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications Icon with Badge */}
        <button 
          type="button" 
          className="relative flex h-10 w-10 items-center justify-center rounded-xl text-[#4A5C6A] transition-all hover:bg-[#f0f4f8] hover:text-[#11212D]" 
          aria-label="Notifications"
        >
          <Icon icon="solar:bell-linear" className="h-6 w-6" />
          <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </button>

        {/* Vertical Divider */}
        <div className="mx-1 h-6 w-px bg-[#253745]/10 hidden sm:block"></div>

        {/* User Profile Area */}
        <div className="flex items-center gap-3 pl-2 transition-opacity hover:opacity-80 cursor-pointer">
          <div className="hidden flex-col items-end sm:flex">
            <span className="text-sm font-bold leading-tight text-[#11212D]">
              {userName}
            </span>
            <span className="text-[11px] font-medium text-[#4A5C6A]">
              Administrator
            </span>
          </div>
          
          <div className="relative">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-[#11212D] to-[#4A5C6A] text-sm font-bold text-white shadow-lg shadow-[#11212D]/20">
              {userInitial}
            </div>
            {/* Online Status Indicator */}
            <div className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500"></div>
          </div>
        </div>
      </div>
    </header>
  )
}