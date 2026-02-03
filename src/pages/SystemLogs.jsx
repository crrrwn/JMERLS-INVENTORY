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
    <div className="mx-auto max-w-4xl px-4 sm:px-6 space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:gap-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight text-[#11212D] sm:text-3xl">System Audit Trail</h1>
          <p className="text-sm text-[#4A5C6A] max-w-xl">Monitor all user activities and data changes in real-time.</p>
        </div>
        <div className="inline-flex items-center gap-2.5 rounded-full bg-emerald-50 border border-emerald-100 px-4 py-2.5 w-fit">
          <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" aria-hidden />
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">Live Logging Active</span>
        </div>
      </div>

      <Card
        title="Recent Activity Logs"
        subtitle={loading ? 'Loading…' : `Showing last ${logs.length} operations`}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 sm:py-24 gap-4">
            <Icon icon="svg-spinners:ring-resize" className="h-10 w-10 text-[#4A5C6A]" />
            <p className="text-sm font-medium text-[#4A5C6A] animate-pulse">Fetching audit history...</p>
          </div>
        ) : (
          <div className="overflow-hidden -mx-1 sm:mx-0">
            <ul className="relative space-y-0">
              {logs.length === 0 ? (
                <li className="py-16 sm:py-20 text-center">
                  <Icon icon="solar:history-linear" className="mx-auto h-12 w-12 text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-500">The audit trail is currently empty.</p>
                </li>
              ) : (
                logs.map((log, index) => {
                  const config = ACTION_CONFIG[log.action] || ACTION_CONFIG.default
                  const date = log.createdAt ? new Date(log.createdAt) : null
                  const dateStr = date
                    ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : '—'
                  const timeStr = date
                    ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '—'

                  return (
                    <li
                      key={log.id}
                      className="group relative flex gap-4 py-4 sm:py-5 px-3 sm:px-4 rounded-xl transition-colors hover:bg-gray-50/80 min-h-[4.5rem] sm:min-h-0"
                    >
                      {index < logs.length - 1 && (
                        <span
                          className="absolute left-[1.875rem] top-14 bottom-0 w-px bg-gray-100 hidden sm:block"
                          aria-hidden
                        />
                      )}
                      <div
                        className={`relative z-0 flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl ${config.bg} ${config.color} transition-transform group-hover:scale-105 ring-4 ring-white`}
                      >
                        <Icon icon={config.icon} className="h-5 w-5 sm:h-5 sm:w-5" />
                      </div>
                      <div className="min-w-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-0.5">
                        <div className="space-y-1 min-w-0">
                          <p className="text-sm font-bold text-[#11212D] leading-snug break-words">
                            {log.details}
                          </p>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                            <span
                              className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                                log.level === 'error'
                                  ? 'bg-rose-50 text-rose-600'
                                  : 'bg-gray-100 text-[#4A5C6A]'
                              }`}
                            >
                              {log.level}
                            </span>
                            <span className="text-xs text-[#9BA8AB]">
                              {log.userName}
                              <span className="mx-1">·</span>
                              <span className="capitalize">{log.action.replace(/_/g, ' ')}</span>
                            </span>
                          </div>
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-xs font-semibold text-[#11212D] whitespace-nowrap">
                            {dateStr}
                          </p>
                          <p className="text-[11px] font-medium text-[#9BA8AB] whitespace-nowrap">
                            {timeStr}
                          </p>
                        </div>
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