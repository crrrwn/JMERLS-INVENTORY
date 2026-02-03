import { useState, useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../../context/AuthContext'
import { getProducts, getStockStatus } from '../../services/products'
import { getStockLogs } from '../../services/stock'

export default function Header({ onMenuClick, globalSearch }) {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [notifLoading, setNotifLoading] = useState(false)
  const notifRef = useRef(null)
  const navigate = useNavigate()
  const [, setSearchParams] = useSearchParams()
  const { user } = useAuth()

  // Fetch notifications when dropdown opens
  useEffect(() => {
    if (!notificationOpen) return
    setNotifLoading(true)
    Promise.all([getProducts(), getStockLogs(15)])
      .then(([products, logs]) => {
        const items = []
        const lowStock = products.filter((p) => getStockStatus(p.quantity) === 'low' || getStockStatus(p.quantity) === 'out')
        lowStock.slice(0, 5).forEach((p) => {
          const status = getStockStatus(p.quantity)
          items.push({
            id: `low-${p.id}`,
            type: status === 'out' ? 'out' : 'low',
            title: status === 'out' ? 'Out of stock' : 'Low stock',
            message: `${p.dressName}${p.color ? ` (${p.color})` : ''}`,
            meta: `Qty: ${p.quantity}`,
            link: '/products',
            time: null,
          })
        })
        logs.slice(0, 8).forEach((log) => {
          items.push({
            id: log.id,
            type: log.type,
            title: log.type === 'in' ? 'Stock in' : log.type === 'sale' ? 'Sale' : 'Stock out',
            message: log.productName,
            meta: `${log.quantity} items${log.revenue != null ? ` · ₱${log.revenue?.toLocaleString()}` : ''}`,
            link: '/stock',
            time: log.createdAt,
          })
        })
        setNotifications(items)
      })
      .catch(() => setNotifications([]))
      .finally(() => setNotifLoading(false))
  }, [notificationOpen])

  // Click outside to close
  useEffect(() => {
    if (!notificationOpen) return
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotificationOpen(false)
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [notificationOpen])

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
      <div className="relative flex items-center gap-2" ref={notifRef}>
        {/* Notifications Bell - opens dropdown */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setNotificationOpen((o) => !o) }}
          className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all hover:bg-[#f0f4f8] hover:text-[#11212D] ${notificationOpen ? 'bg-[#f0f4f8] text-[#11212D]' : 'text-[#4A5C6A]'}`}
          aria-label="Notifications"
          aria-expanded={notificationOpen}
        >
          <Icon icon="solar:bell-linear" className="h-6 w-6" />
          {notifications.some((n) => n.type === 'low' || n.type === 'out') && (
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" aria-hidden />
          )}
        </button>

        {/* Notification dropdown panel */}
        {notificationOpen && (
          <div className="absolute right-0 top-full z-50 mt-2 w-[min(360px,100vw-2rem)] rounded-xl border border-[#253745]/10 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b border-[#253745]/10 px-4 py-3">
              <h3 className="text-sm font-bold text-[#11212D]">Notifications</h3>
              <button
                type="button"
                onClick={() => setNotificationOpen(false)}
                className="rounded-lg p-1.5 text-[#4A5C6A] hover:bg-[#f0f4f8]"
                aria-label="Close notifications"
              >
                <Icon icon="solar:close-circle-linear" className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[70vh] overflow-y-auto">
              {notifLoading ? (
                <div className="flex items-center justify-center gap-2 py-8 text-[#4A5C6A]">
                  <Icon icon="svg-spinners:90-ring-with-bg" className="h-6 w-6" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : notifications.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#9BA8AB]">No notifications</div>
              ) : (
                <ul className="divide-y divide-[#253745]/5">
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        onClick={() => {
                          setNotificationOpen(false)
                          navigate(n.link)
                        }}
                        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#f8fafc]"
                      >
                        <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                          n.type === 'out' ? 'bg-red-100 text-red-600' :
                          n.type === 'low' ? 'bg-amber-100 text-amber-600' :
                          n.type === 'sale' ? 'bg-emerald-100 text-emerald-600' : 'bg-[#253745]/10 text-[#4A5C6A]'
                        }`}>
                          <Icon icon={
                            n.type === 'out' ? 'solar:box-minimalistic-linear' :
                            n.type === 'low' ? 'solar:danger-triangle-linear' :
                            n.type === 'sale' ? 'solar:cart-large-2-linear' : 'solar:arrow-down-linear'
                          } className="h-4 w-4" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-[#11212D]">{n.title}</p>
                          <p className="truncate text-xs text-[#4A5C6A]">{n.message}</p>
                          {(n.meta || n.time) && (
                            <p className="mt-0.5 text-[10px] text-[#9BA8AB]">
                              {n.meta}
                              {n.time && ` · ${new Date(n.time).toLocaleString()}`}
                            </p>
                          )}
                        </div>
                        <Icon icon="solar:arrow-right-linear" className="h-4 w-4 shrink-0 text-[#9BA8AB]" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

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