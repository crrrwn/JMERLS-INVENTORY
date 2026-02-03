import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import Card from '../components/ui/Card'
import { getSystemLogs } from '../services/logs'

const ACTION_CONFIG = {
  product_created: { icon: 'solar:add-circle-bold-duotone', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  product_updated: { icon: 'solar:pen-new-square-bold-duotone', color: 'text-blue-600', bg: 'bg-blue-50' },
  product_deleted: { icon: 'solar:trash-bin-trash-bold-duotone', color: 'text-rose-600', bg: 'bg-rose-50' },
  stock_in: { icon: 'solar:alt-arrow-down-bold-duotone', color: 'text-emerald-600', bg: 'bg-emerald-50' },
  stock_out: { icon: 'solar:alt-arrow-up-bold-duotone', color: 'text-amber-600', bg: 'bg-amber-50' },
  sale: { icon: 'solar:cart-large-bold-duotone', color: 'text-indigo-600', bg: 'bg-indigo-50' },
  default: { icon: 'solar:info-circle-bold-duotone', color: 'text-gray-500', bg: 'bg-gray-50' }
}

export default function SystemLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getSystemLogs(100)
      .then(setLogs)
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-5xl space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#11212D] sm:text-3xl">System Audit Trail</h1>
          <p className="text-sm text-[#4A5C6A]">Monitor all user activities and data changes in real-time.</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-white border border-gray-100 px-4 py-2 shadow-sm">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#4A5C6A]">Live Logging Active</span>
        </div>
      </div>

      <Card 
        title="Recent Activity Logs" 
        subtitle={`Showing last ${logs.length} operations recorded by the system`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Icon icon="svg-spinners:ring-resize" className="h-10 w-10 text-[#4A5C6A]" />
            <p className="text-sm font-medium text-[#4A5C6A] animate-pulse">Fetching audit history...</p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <ul className="divide-y divide-gray-50">
              {logs.length === 0 ? (
                <li className="py-20 text-center">
                  <Icon icon="solar:history-linear" className="mx-auto h-12 w-12 text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-500">The audit trail is currently empty.</p>
                </li>
              ) : (
                logs.map((log) => {
                  const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.default;
                  const date = log.createdAt ? new Date(log.createdAt) : null;

                  return (
                    <li key={log.id} className="group flex flex-col sm:flex-row sm:items-center gap-4 py-5 transition-colors hover:bg-gray-50/50 px-2 rounded-xl">
                      {/* Action Icon */}
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl shadow-sm ${config.bg} ${config.color} transition-transform group-hover:scale-110`}>
                        <Icon icon={config.icon} className="h-6 w-6" />
                      </div>

                      {/* Log Content */}
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-bold text-[#11212D] leading-none">
                            {log.details}
                          </p>
                          <span className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase tracking-wider border ${
                            log.level === 'error' 
                              ? 'bg-rose-50 border-rose-100 text-rose-600' 
                              : 'bg-gray-50 border-gray-100 text-[#4A5C6A]'
                          }`}>
                            {log.level}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs font-medium text-[#9BA8AB]">
                          <span className="text-[#4A5C6A]">{log.userName}</span>
                          <span>•</span>
                          <span className="capitalize">{log.action.replace('_', ' ')}</span>
                        </div>
                      </div>

                      {/* Timestamp Section */}
                      <div className="flex flex-col items-start sm:items-end shrink-0">
                        <p className="text-sm font-bold text-[#11212D]">
                          {date?.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-[11px] font-medium text-[#9BA8AB]">
                          {date?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </li>
                  )
                })
              )}
            </ul>
          </div>
        )}
      </Card>
    </div>
  )
}