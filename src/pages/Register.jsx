import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { useAuth } from '../context/AuthContext'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'

export default function Register() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleRegister = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const cred = await register(email, password, displayName)
      if (!cred?.user) throw new Error('Registration did not return user.')
      
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: cred.user.email,
        displayName: displayName || cred.user.email?.split('@')[0] || '',
        role: 'user',
        createdAt: new Date().toISOString(),
      })
      
      setDone(true)
      setTimeout(() => navigate('/'), 1800)
    } catch (err) {
      setError(err.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = "w-full rounded-xl border border-[#253745] bg-[#0d1f2a] py-3.5 pl-11 pr-4 text-sm text-white placeholder-[#4A5C6A] transition-all duration-300 focus:border-[#9BA8AB] focus:outline-none focus:ring-4 focus:ring-[#9BA8AB]/10 group-hover:border-[#4A5C6A]"
  const labelClass = "mb-2 block text-xs font-bold uppercase tracking-widest text-[#9BA8AB]"

  return (
    <div className="flex min-h-screen w-full bg-[#f0f4f8] lg:flex-row">
      
      {/* Left: Branding/Illustration Section */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-center items-center bg-[#f0f4f8] p-12 relative overflow-hidden">
        {/* Abstract Background Shapes */}
        <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-[#9BA8AB]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-96 h-96 bg-[#4A5C6A]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center space-y-8">
          <div className="flex justify-center">
            <img 
              src="/REGISTER.png" 
              alt="JMERLS Illustration" 
              className="max-h-[450px] w-auto drop-shadow-2xl animate-in zoom-in duration-700"
            />
          </div>
          <div className="max-w-sm mx-auto">
            <h2 className="text-3xl font-bold text-[#11212D]">Join JMERLS Today</h2>
            <p className="mt-4 text-[#4A5C6A] leading-relaxed">
              Streamline your inventory management and sales tracking with our all-in-one platform.
            </p>
          </div>
        </div>
      </div>

      {/* Right: Registration Form Section */}
      <div className="flex w-full flex-col justify-center bg-[#11212D] px-6 py-12 sm:px-12 lg:w-[55%] lg:px-24">
        <div className="mx-auto w-full max-w-[440px]">
          
          {/* Logo/Brand for Mobile - logo on top, name below, centered */}
          <div className="mb-8 flex flex-col items-center justify-center gap-2 lg:hidden">
            <img src="/JMERLSLOGO.png" alt="JMERLS Fashion" className="h-16 w-16 shrink-0 rounded-xl object-contain outline-none [border:none]" />
            <h1 className="text-lg font-bold text-white tracking-tight text-center">JMERLS FASHION</h1>
          </div>

          <header className="mb-10">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Get Started</h1>
            <p className="mt-3 text-[#9BA8AB]">Create your management account in minutes.</p>
          </header>

          {done ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-[#253745] bg-white/5 p-10 text-center backdrop-blur-sm animate-in zoom-in-95 duration-500">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Icon icon="solar:check-circle-bold" className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-white">Success!</h3>
              <p className="mt-2 text-[#9BA8AB]">Your account has been verified. Redirecting you to the dashboard...</p>
              <div className="mt-6 h-1 w-32 overflow-hidden rounded-full bg-[#253745]">
                <div className="h-full bg-emerald-500 animate-[progress_1.5s_ease-in-out]"></div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200 animate-in fade-in slide-in-from-top-2">
                  <Icon icon="solar:danger-triangle-bold" className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              {/* Email Input */}
              <div className="group">
                <label htmlFor="email" className={labelClass}>Email Address</label>
                <div className="relative">
                  <Icon icon="solar:letter-linear" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9BA8AB] transition-colors group-focus-within:text-white" />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="name@company.com"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Name Input */}
              <div className="group">
                <label htmlFor="displayName" className={labelClass}>Full Name</label>
                <div className="relative">
                  <Icon icon="solar:user-linear" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9BA8AB] transition-colors group-focus-within:text-white" />
                  <input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Juan Dela Cruz"
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="group">
                <label htmlFor="password" className={labelClass}>Secure Password</label>
                <div className="relative">
                  <Icon icon="solar:lock-password-linear" className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9BA8AB] transition-colors group-focus-within:text-white" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className={inputClass}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-[#9BA8AB] hover:bg-white/5 hover:text-white transition-all"
                  >
                    <Icon icon={showPassword ? "solar:eye-closed-linear" : "solar:eye-linear"} className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#4A5C6A] py-4 text-sm font-bold text-white transition-all hover:bg-[#3d4f5c] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Icon icon="svg-spinners:90-ring-with-bg" className="h-5 w-5" />
                ) : (
                  <span className="flex items-center gap-2">
                    Create Account
                    <Icon icon="solar:arrow-right-linear" className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </form>
          )}

          <footer className="mt-10 text-center">
            <p className="text-sm text-[#9BA8AB]">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-white underline-offset-4 hover:underline transition-all">
                Sign in here
              </Link>
            </p>
          </footer>
        </div>
      </div>
      
      {/* Custom Global Styles for Animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  )
}