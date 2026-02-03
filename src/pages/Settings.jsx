import { useState } from 'react'
import { Icon } from '@iconify/react'
import Card from '../components/ui/Card'
import { useAuth } from '../context/AuthContext'

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-[#11212D] transition-all placeholder:text-[#9BA8AB] focus:border-[#4A5C6A] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#4A5C6A]/5'
const labelClass = 'mb-1.5 block text-[10px] font-bold uppercase tracking-widest text-[#4A5C6A]'

export default function Settings() {
  const { user, changePassword } = useAuth()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.')
      return
    }
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters.')
      return
    }

    setLoading(true)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setSuccess('Your password has been updated successfully.')
    } catch (err) {
      setError(err.message || 'Failed to update password. Please check your current password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#11212D] sm:text-3xl">System Settings</h1>
        <p className="text-sm text-[#4A5C6A]">Manage your account preferences and security protocols.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Profile Summary Sidebar */}
        <div className="md:col-span-1 space-y-4">
          <Card className="text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#11212D] to-[#4A5C6A] text-2xl font-bold text-white shadow-lg shadow-[#11212D]/20">
              {(user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
            </div>
            <h3 className="font-bold text-[#11212D] truncate">
              {user?.displayName || user?.email?.split('@')[0]}
            </h3>
            <p className="text-xs text-[#9BA8AB] truncate mb-4">{user?.email}</p>
            <div className="inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 border border-emerald-100">
              Active Account
            </div>
          </Card>
          
          <div className="rounded-2xl bg-blue-50/50 border border-blue-100 p-4">
            <div className="flex gap-3">
              <Icon icon="solar:shield-check-bold" className="h-5 w-5 text-blue-600 shrink-0" />
              <p className="text-[11px] leading-relaxed text-blue-700">
                Your account security is our priority. Always use a unique password to protect your inventory data.
              </p>
            </div>
          </div>
        </div>

        {/* Password Form Section */}
        <div className="md:col-span-2">
          <Card title="Security Credentials" subtitle="Update your access password regularly">
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
              {/* Feedback Messages */}
              {error && (
                <div className="flex items-center gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 animate-in slide-in-from-top-2">
                  <Icon icon="solar:danger-circle-bold" className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}
              {success && (
                <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 animate-in slide-in-from-top-2">
                  <Icon icon="solar:check-circle-bold" className="h-5 w-5 shrink-0" />
                  {success}
                </div>
              )}

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className={labelClass}>Current Password</label>
                  <div className="relative group">
                    <Icon icon="solar:lock-password-linear" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9BA8AB] group-focus-within:text-[#11212D]" />
                    <input
                      type={showCurrent ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={`${inputClass} pl-11`}
                      placeholder="Verify identity"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9BA8AB] hover:text-[#11212D] transition-colors"
                    >
                      <Icon icon={showCurrent ? 'solar:eye-closed-linear' : 'solar:eye-linear'} className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* New Password */}
                  <div>
                    <label className={labelClass}>New Password</label>
                    <div className="relative group">
                      <Icon icon="solar:key-linear" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9BA8AB]" />
                      <input
                        type={showNew ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className={`${inputClass} pl-11`}
                        placeholder="Min. 6 characters"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9BA8AB]"
                      >
                        <Icon icon={showNew ? 'solar:eye-closed-linear' : 'solar:eye-linear'} className="h-5 w-5" />
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className={labelClass}>Confirm Password</label>
                    <div className="relative group">
                      <Icon icon="solar:check-read-linear" className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9BA8AB]" />
                      <input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`${inputClass} pl-11`}
                        placeholder="Re-type new password"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#11212D] px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#11212D]/20 transition-all hover:bg-[#253745] active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <Icon icon="svg-spinners:ring-resize" className="h-5 w-5" />
                  ) : (
                    <Icon icon="solar:shield-keyhole-linear" className="h-5 w-5" />
                  )}
                  Save New Password
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  )
}