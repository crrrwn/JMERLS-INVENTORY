import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Header from './Header'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Kusa nitong isasara ang sidebar kapag nag-iba ang route (importante sa mobile)
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Naka-fixed na ito sa loob ng component nito */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="flex min-w-0 flex-1 flex-col transition-all duration-300 ease-in-out lg:pl-64">
        
        {/* Header - Mas mataas na z-index para laging nasa ibabaw */}
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          globalSearch 
        />

        {/* Main Viewport */}
        <main className="relative flex-1">
          {/* Decorative Background Element (Optional - para sa modern look) */}
          <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#f0f4f8] to-transparent h-40 pointer-events-none" />

          {/* Content Wrapper */}
          <div className="relative z-10 mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
            {/* Page Transition Wrapper */}
            <div 
              key={location.pathname}
              className="animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              <Outlet />
            </div>
          </div>
        </main>

        {/* Footer / Copyright Section (Optional) */}
        <footer className="py-6 px-8 text-center text-[11px] font-medium uppercase tracking-widest text-[#9BA8AB]">
          © {new Date().getFullYear()} Inventory Management System • Version 2.0
        </footer>
      </div>

      {/* Overlay para sa Mobile Sidebar */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#11212D]/40 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  )
}