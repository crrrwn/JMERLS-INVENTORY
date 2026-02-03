import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { sendPasswordResetEmail } from 'firebase/auth'
import { auth } from '../lib/firebase'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await sendPasswordResetEmail(auth, email)
      setDone(true)
    } catch (err) {
      setError(err.message || 'Failed to send reset link. Please check the email address.')
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
        {/* Decorative Blur Circles */}
        <div className="absolute top-[-5%] left-[-5%] w-72 h-72 bg-[#4A5C6A]/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[10%] right-[-10%] w-96 h-96 bg-[#9BA8AB]/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 text-center">
          <img 
            src="/FORGOTPASS.png" 
            alt="Forgot Password Illustration" 
            className="max-h-[480px] w-auto drop-shadow-2xl animate-in fade-in zoom-in duration-700"
          />
          <div className="mt-12 max-w-sm mx-auto">
            <h2 className="text-3xl font-bold text-[#11212D]">Account Recovery</h2>
            <p className="mt-4 text-[#4A5C6A] leading-relaxed">
              Don't worry, it happens. Provide your email and we'll help you get back to your dashboard.
            </p>
          </div>
        </div>
      </div>

      {/* Right Section: Form */}
      <div className="flex w-full flex-col justify-center bg-[#11212D] px-6 py-12 sm:px-12 lg:w-[55%] lg:px-24">
        <div className="mx-auto w-full max-w-[420px]">
          
          {/* Logo/Brand for Mobile */}
          <div className="mb-10 flex items-center gap-3 lg:hidden">
            <img src="/JMERLSLOGO.png" alt="JMERLS" className="h-12 w-12 shrink-0 rounded-xl object-contain outline-none [border:none]" />
            <h1 className="font-sans text-2xl font-bold uppercase tracking-tighter text-white">JMERLS</h1>
          </div>

          <header className="mb-10 animate-in slide-in-from-top-4 duration-500">
            <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Reset Password</h1>
            <p className="mt-3 text-[#9BA8AB]">Enter your registered email address below.</p>
          </header>

          {done ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-[#253745] bg-white/5 p-10 text-center backdrop-blur-sm animate-in zoom-in-95 duration-500">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                <Icon icon="solar:letter-opened-bold-duotone" className="h-12 w-12" />
              </div>
              <h3 className="text-xl font-bold text-white">Check your Inbox</h3>
              <p className="mt-2 text-[#9BA8AB]">
                We've sent a recovery link to: <br />
                <span className="font-bold text-white">{email}</span>
              </p>
              <Link 
                to="/login" 
                className="mt-8 flex items-center gap-2 rounded-xl bg-[#4A5C6A] px-6 py-3 text-sm font-bold text-white transition-all hover:bg-[#3d4f5c]"
              >
                <Icon icon="solar:arrow-left-linear" className="h-4 w-4" />
                Return to Login
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-200 animate-in slide-in-from-top-2">
                  <Icon icon="solar:danger-circle-bold" className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}

              <div className="group">
                <label htmlFor="email" className={labelClass}>Work Email</label>
                <div className="relative">
                  <Icon 
                    icon="solar:letter-linear" 
                    className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[#9BA8AB] group-focus-within:text-white transition-colors" 
                  />
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="admin@jmerls.com"
                    className={inputClass}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="group relative flex w-full items-center justify-center overflow-hidden rounded-xl bg-[#4A5C6A] py-4 text-sm font-bold text-white shadow-xl transition-all hover:bg-[#3d4f5c] active:scale-[0.98] disabled:opacity-50"
              >
                {loading ? (
                  <Icon icon="svg-spinners:90-ring-with-bg" className="h-5 w-5" />
                ) : (
                  <span className="flex items-center gap-2">
                    Send Reset Link
                    <Icon icon="solar:paper-plane-linear" className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </span>
                )}
              </button>
            </form>
          )}

          <footer className="mt-12 text-center">
            <Link 
              to="/login" 
              className="inline-flex items-center gap-2 text-sm font-bold text-[#9BA8AB] hover:text-white transition-all underline-offset-4 hover:underline"
            >
              <Icon icon="solar:alt-arrow-left-linear" className="h-4 w-4" />
              Back to Sign In
            </Link>
          </footer>
        </div>
      </div>
    </div>
  )
}