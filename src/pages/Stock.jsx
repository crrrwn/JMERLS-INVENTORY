import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import Card from '../components/ui/Card'
import { getProducts } from '../services/products'
import { getStockLogs, recordStockIn, recordStockOut, recordSale } from '../services/stock'
import { useAuth } from '../context/AuthContext'

const TAB_CONFIG = {
  in: { label: 'Stock In', icon: 'solar:import-linear', color: 'text-emerald-600', bg: 'bg-emerald-50', btn: 'bg-emerald-600 hover:bg-emerald-700' },
  out: { label: 'Stock Out', icon: 'solar:export-linear', color: 'text-rose-600', bg: 'bg-rose-50', btn: 'bg-rose-600 hover:bg-rose-700' },
  sale: { label: 'Record Sale', icon: 'solar:cart-large-minimalistic-linear', color: 'text-blue-600', bg: 'bg-blue-50', btn: 'bg-blue-600 hover:bg-blue-700' },
  logs: { label: 'History Logs', icon: 'solar:history-linear', color: 'text-[#4A5C6A]', bg: 'bg-gray-50', btn: '' },
}

export default function Stock() {
  const [productList, setProductList] = useState([])
  const [logs, setLogs] = useState([])
  const [tab, setTab] = useState('in')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [form, setForm] = useState({ productId: '', quantity: '', reason: '' })
  const [error, setError] = useState('')
  const { user, userProfile } = useAuth()

  const loadData = async () => {
    setLoading(true)
    try {
      const [prods, logList] = await Promise.all([getProducts(), getStockLogs(80)])
      setProductList(prods)
      setLogs(logList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setActionLoading(true)
    const qty = Number(form.quantity) || 0

    if (!form.productId || qty <= 0) {
      setError('Please select a product and enter a valid quantity.')
      setActionLoading(false)
      return
    }

    try {
      const name = userProfile?.displayName || user?.email || 'User'
      if (tab === 'in') await recordStockIn(form.productId, qty, user?.uid, name)
      else if (tab === 'out') await recordStockOut(form.productId, qty, user?.uid, name, form.reason)
      else if (tab === 'sale') await recordSale(form.productId, qty, user?.uid, name)
      
      setForm({ productId: '', quantity: '', reason: '' })
      loadData()
    } catch (err) {
      setError(err.message || 'Transaction failed')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-4">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#11212D] sm:text-3xl">Stock Management</h1>
          <p className="text-sm text-[#4A5C6A]">Monitor inventory flow and record transactions.</p>
        </div>
      </div>

      {/* Modern Tabs (Segmented Control) */}
      <div className="flex p-1 space-x-1 bg-gray-100/80 rounded-2xl max-w-2xl">
        {Object.entries(TAB_CONFIG).map(([id, cfg]) => (
          <button
            key={id}
            onClick={() => { setTab(id); setError(''); }}
            className={`flex flex-1 items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold transition-all duration-200 rounded-xl ${
              tab === id 
              ? 'bg-white text-[#11212D] shadow-sm ring-1 ring-black/5' 
              : 'text-[#4A5C6A] hover:bg-white/50'
            }`}
          >
            <Icon icon={cfg.icon} className="h-5 w-5" />
            <span className="hidden sm:inline">{cfg.label}</span>
          </button>
        ))}
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        {/* Action Form Section */}
        {tab !== 'logs' && (
          <div className="lg:col-span-5 animate-in fade-in slide-in-from-left-4 duration-500">
            <Card title={TAB_CONFIG[tab].label} subtitle="Fill in the details below">
              <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-xl bg-rose-50 p-4 text-xs font-bold text-rose-600 border border-rose-100">
                    <Icon icon="solar:danger-circle-bold" className="h-5 w-5" />
                    {error}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5C6A] mb-2 block">Select Product</label>
                    <div className="relative group">
                      <select
                        value={form.productId}
                        onChange={(e) => setForm((f) => ({ ...f, productId: e.target.value }))}
                        className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm transition-all focus:border-[#11212D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#11212D]/5"
                        required
                      >
                        <option value="">Search or select product...</option>
                        {(tab === 'sale' ? productList.filter(p => p.quantity > 0) : productList).map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.dressName} ({p.sku}) — In Stock: {p.quantity}
                          </option>
                        ))}
                      </select>
                      <Icon icon="solar:alt-arrow-down-linear" className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 pointer-events-none text-[#9BA8AB]" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5C6A] mb-2 block">Quantity</label>
                      <input
                        type="number"
                        min={1}
                        placeholder="0"
                        value={form.quantity}
                        onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
                        className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm focus:border-[#11212D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#11212D]/5"
                        required
                      />
                    </div>
                    {tab === 'out' && (
                      <div className="col-span-2 sm:col-span-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-[#4A5C6A] mb-2 block">Reason</label>
                        <input
                          type="text"
                          value={form.reason}
                          onChange={(e) => setForm((f) => ({ ...f, reason: e.target.value }))}
                          placeholder="e.g. Damage"
                          className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3.5 text-sm focus:border-[#11212D] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#11212D]/5"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`flex w-full items-center justify-center gap-2 rounded-2xl px-6 py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-95 disabled:opacity-50 ${TAB_CONFIG[tab].btn}`}
                >
                  {actionLoading ? (
                    <Icon icon="svg-spinners:ring-resize" className="h-5 w-5" />
                  ) : (
                    <>
                      <Icon icon={TAB_CONFIG[tab].icon} className="h-5 w-5" />
                      {tab === 'in' ? 'Confirm Stock In' : tab === 'sale' ? 'Process Sale' : 'Confirm Stock Out'}
                    </>
                  )}
                </button>
              </form>
            </Card>
          </div>
        )}

        {/* Logs Section */}
        <div className={`${tab === 'logs' ? 'lg:col-span-12' : 'lg:col-span-7'} animate-in fade-in slide-in-from-right-4 duration-500`}>
          <Card 
            title="Activity Logs" 
            subtitle="Recent inventory movements"
            action={tab !== 'logs' && <button onClick={() => setTab('logs')} className="text-xs font-bold text-[#4A5C6A] hover:underline">View All</button>}
          >
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Icon icon="svg-spinners:90-ring-with-bg" className="h-10 w-10 text-[#4A5C6A]" />
                <span className="text-sm font-medium animate-pulse text-[#4A5C6A]">Loading logs...</span>
              </div>
            ) : (
              <div className="overflow-hidden">
                <ul className="relative space-y-1 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-gray-200 before:via-gray-100 before:to-transparent">
                  {logs.slice(0, tab === 'logs' ? 100 : 8).map((log) => {
                    const cfg = TAB_CONFIG[log.type] || TAB_CONFIG.logs;
                    return (
                      <li key={log.id} className="relative group pl-12 py-4 hover:bg-gray-50/50 rounded-2xl transition-colors">
                        <div className={`absolute left-2.5 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-white shadow-sm ${cfg.bg} ${cfg.color}`}>
                          <Icon icon={cfg.icon} className="h-3.5 w-3.5" />
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-bold text-[#11212D]">
                              {log.type === 'in' ? 'Stock Added' : log.type === 'sale' ? 'Item Sold' : 'Stock Removed'}: 
                              <span className="ml-1 font-medium">{log.productName}</span>
                            </p>
                            <p className="text-[11px] font-medium text-[#4A5C6A]">
                              By {log.userName} • {log.quantity} units 
                              {log.reason && <span className="italic"> ({log.reason})</span>}
                              {log.revenue != null && <span className="ml-2 font-bold text-emerald-600">₱{log.revenue.toLocaleString()}</span>}
                            </p>
                          </div>
                          <span className="text-[10px] font-bold text-[#9BA8AB] uppercase">
                            {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}