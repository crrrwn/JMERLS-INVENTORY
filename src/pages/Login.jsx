import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signIn(email, password, rememberMe)
      navigate('/')
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-xl border border-[#253745] bg-[#0d1f2a] py-3.5 pl-11 pr-4 text-sm text-white placeholder-[#4A5C6A] transition-all duration-300 focus:border-[#9BA8AB] focus:outline-none focus:ring-4 focus:ring-[#9BA8AB]/10 group-hover:border-[#4A5C6A]"
  const labelClass = "mb-2 block text-xs font-bold uppercase tracking-widest text-[#9BA8AB]"

  return (
    <div className="flex min-h-screen w-full bg-[#f0f4f8] lg:flex-row">
      
      {/* Left Section: Visual Branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-center items-center bg-[#f0f4f8] p-12 relative overflow-hidden">
        {/* Decorative Blur Elements */}
        <div className="absolute top-[-5%] right-[-5%] w-72 h-72 bg-[#4A5C6A]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] left-[-10%] w-96 h-96 bg-[#9BA8AB]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center">
          <img 
            src="/LOGIN.png" 
            alt="JMERLS Login Illustration" 
            className="max-h-[480px] w-auto drop-shadow-2xl animate-in fade-in zoom-in duration-700"
          />
          <div className="mt-12 max-w-sm mx-auto">
            <h2 className="text-3xl font-bold text-[#11212D]">Welcome Back</h2>
            <p className="mt-4 text-[#4A5C6A] leading-relaxed">
              Access your inventory dashboard and stay updated with your latest sales performance.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section: Form */}
      <div className="flex w-full flex-col justify-center bg-[#11212D] px-6 py-12 sm:px-12 lg:w-[55%] lg:px-24">
        <div className="mx-auto w-full max-w-[420px]">
          
          {/* Mobile Brand Logo */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <img src="/JMERLSLOGO.png" alt="JMERLS" className="h-12 w-12 shrink-0 rounded-xl object-contain outline-none [border:none]" />
            <h1 className="font-sans text-2xl font-bold uppercase tracking-tighter text-white">JMERLS</h1>
          </div>

          <header className="mb-10 animate-in slide-in-from-top-4 duration-500">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Sign In</h1>
            <p className="mt-3 text-[#9BA8AB]">Enter your credentials to manage your store.</p>
          </header>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200 animate-in slide-in-from-top-2">
                <Icon icon="solar:danger-circle-bold" className="h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            {/* Email Field */}
            <div className="group">
              <label htmlFor="email" className={labelClass}>Work Email</label>
              <div className="relative">
                <Icon icon="solar:letter-linear" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9BA8AB] group-focus-within:text-white transition-colors" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@jmerls.com"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="group">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="text-[10px] font-bold uppercase tracking-widest text-[#9BA8AB]">Password</label>
                <Link to="/forgot-password" size="sm" className="text-[11px] font-bold text-[#9BA8AB] hover:text-white transition-colors uppercase tracking-wider">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Icon icon="solar:lock-password-linear" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9BA8AB] group-focus-within:text-white transition-colors" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#9BA8AB] hover:bg-white/5 hover:text-white transition-all"
                >
                  <Icon icon={showPassword ? "solar:eye-closed-bold-duotone" : "solar:eye-bold-duotone"} className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Remember Me Toggle */}
            <div className="flex items-center py-2">
              <label className="flex cursor-pointer items-center gap-3 group">
                <div className="relative">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className="h-6 w-11 rounded-full bg-[#253745] transition-colors peer-checked:bg-[#4A5C6A] ring-1 ring-white/5"></div>
                  <div className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow-lg transition-transform peer-checked:translate-x-5"></div>
                </div>
                <span className="text-xs font-bold text-[#9BA8AB] uppercase tracking-wider group-hover:text-white transition-colors">Remember Session</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#4A5C6A] py-4 text-sm font-bold text-white shadow-xl shadow-black/10 transition-all hover:bg-[#3d4f5c] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <Icon icon="svg-spinners:90-ring-with-bg" className="h-5 w-5" />
              ) : (
                <span className="flex items-center gap-2">
                  Sign into Dashboard
                  <Icon icon="solar:login-2-linear" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </span>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p className="mt-12 text-center text-sm text-[#9BA8AB]">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-white underline-offset-4 hover:underline transition-all">
              Create one now
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}