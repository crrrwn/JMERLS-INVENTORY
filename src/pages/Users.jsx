import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import Card from '../components/ui/Card'
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { useAuth } from '../context/AuthContext'

export default function Users() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const { user: currentUser, isAdmin } = useAuth()

  useEffect(() => {
    getDocs(collection(db, 'users')).then((snap) => {
      setUsers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    }).finally(() => setLoading(false))
  }, [])

  const setRole = async (userId, role) => {
    try {
      await updateDoc(doc(db, 'users', userId), { role })
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role } : u)))
    } catch (err) {
      alert(err.message)
    }
  }

  if (!isAdmin) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 text-center">
        <Icon icon="mdi:lock" className="mx-auto h-12 w-12 text-amber-600" />
        <p className="mt-2 font-medium text-amber-800">Admin only</p>
        <p className="text-sm text-amber-700">You don&apos;t have access to user management.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-primary-900 sm:text-2xl">User management</h1>
        <p className="text-sm text-primary-600">Manage roles and access</p>
      </div>

      <Card title="Users">
        {loading ? (
          <div className="flex justify-center py-12">
            <Icon icon="mdi:loading" className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">User</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-gray-500">Role</th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">
                      {u.displayName || u.email?.split('@')[0] || u.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          u.role === 'admin' ? 'bg-primary-100 text-primary-700' : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {u.role || 'user'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {u.id !== currentUser?.uid && (
                        <div className="select-wrapper select-wrapper-sm inline-block min-w-[7rem]">
                          <select
                            value={u.role || 'user'}
                            onChange={(e) => setRole(u.id, e.target.value)}
                            className="select-input select-input-sm"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                          <Icon icon="solar:alt-arrow-down-linear" className="select-arrow" />
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
