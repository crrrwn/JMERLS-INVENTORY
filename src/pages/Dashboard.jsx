import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Card from '../components/ui/Card'
import { getProducts, getStockStatus } from '../services/products'
import { getSalesStats } from '../services/sales'
import { getStockLogs } from '../services/stock'

export default function Dashboard() {
  const [products, setProducts] = useState([])
  const [stats, setStats] = useState(null)
  const [recentLogs, setRecentLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const [prods, salesStats, logs] = await Promise.all([
          getProducts(),
          getSalesStats(),
          getStockLogs(10),
        ])
        if (!cancelled) {
          setProducts(prods)
          setStats(salesStats)
          setRecentLogs(logs)
        }
      } catch (error) {
        console.error("Failed to load dashboard data", error)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    load()
    return () => { cancelled = true }
  }, [])

  const totalProducts = products.length
  const lowStock = products.filter((p) => getStockStatus(p.quantity) === 'low').length
  const outOfStock = products.filter((p) => getStockStatus(p.quantity) === 'out').length

  if (loading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
        <Icon icon="svg-spinners:90-ring-with-bg" className="h-12 w-12 text-[#4A5C6A]" />
        <p className="text-sm font-medium text-[#4A5C6A] animate-pulse">Loading dashboard...</p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-4 sm:p-6">
      {/* Header Section */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#11212D] sm:text-3xl">Dashboard</h1>
          <p className="text-sm text-[#4A5C6A]">Welcome back! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2">
           <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
           <span className="text-xs font-medium text-[#4A5C6A] uppercase tracking-wider">Live System Status</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Total Products" 
          value={totalProducts} 
          icon="mdi:tshirt-crew" 
          color="bg-blue-50 text-blue-600"
          link="/products"
        />
        <StatCard 
          title="Low Stock Items" 
          value={lowStock} 
          icon="mdi:alert-circle" 
          color="bg-amber-50 text-amber-600"
          link="/search?available=low"
          subtitle="Needs attention"
        />
        <StatCard 
          title="Total Revenue" 
          value={`₱${(stats?.totalRevenue || 0).toLocaleString()}`} 
          icon="mdi:cash-multiple" 
          color="bg-emerald-50 text-emerald-600"
          link="/stock"
        />
        <StatCard 
          title="Total Profit" 
          value={`₱${(stats?.totalProfit || 0).toLocaleString()}`} 
          icon="mdi:trending-up" 
          color="bg-indigo-50 text-indigo-600"
          link="/stock"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions - Mas compact na version */}
        <Card className="lg:col-span-1 shadow-sm border-[#CCD0CF]/50">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-[#11212D]">Quick Actions</h3>
          </div>
          <div className="flex flex-col gap-2">
            <ActionButton to="/products?action=add" icon="mdi:plus" label="Add New Product" primary />
            <ActionButton to="/stock" icon="mdi:package-variant-plus" label="Restock Items" />
            <ActionButton to="/stock" icon="mdi:cart-outline" label="Record New Sale" />
          </div>
        </Card>

        {/* Inventory Summary */}
        <Card title="Inventory Health" className="lg:col-span-2 shadow-sm border-[#CCD0CF]/50">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InventoryStatus 
              label="Healthy Stock" 
              count={totalProducts - lowStock - outOfStock} 
              color="bg-green-500" 
              percentage={totalProducts ? Math.round(((totalProducts - lowStock - outOfStock) / totalProducts) * 100) : 0}
            />
            <InventoryStatus 
              label="Low Stock" 
              count={lowStock} 
              color="bg-amber-500" 
              percentage={totalProducts ? Math.round((lowStock / totalProducts) * 100) : 0}
            />
            <InventoryStatus 
              label="Out of Stock" 
              count={outOfStock} 
              color="bg-red-500" 
              percentage={totalProducts ? Math.round((outOfStock / totalProducts) * 100) : 0}
            />
          </div>
        </Card>
      </div>

      {/* Activity Log */}
      <Card
        title="Recent Activity"
        className="shadow-sm border-[#CCD0CF]/50"
        action={
          <Link to="/stock" className="text-xs font-bold uppercase tracking-wider text-[#4A5C6A] hover:text-[#11212D] transition-colors">
            View All History
          </Link>
        }
      >
        <div className="overflow-hidden">
          <ul className="divide-y divide-gray-100">
            {recentLogs.length === 0 ? (
              <li className="py-8 text-center text-sm text-[#4A5C6A]">
                <Icon icon="mdi:history" className="mx-auto h-10 w-10 opacity-20 mb-2" />
                No recent activity recorded.
              </li>
            ) : (
              recentLogs.map((log) => <ActivityItem key={log.id} log={log} />)
            )}
          </ul>
        </div>
      </Card>
    </div>
  )
}

// --- Sub-components para malinis ang main Dashboard code ---

function StatCard({ title, value, icon, color, link, subtitle }) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200 border-[#CCD0CF]/30">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#4A5C6A]">{title}</p>
          <h2 className="mt-1 text-2xl font-bold text-[#11212D]">{value}</h2>
          {subtitle && <p className="text-[10px] font-bold text-amber-600 uppercase mt-1">{subtitle}</p>}
        </div>
        <div className={`rounded-lg ${color} p-2.5`}>
          <Icon icon={icon} className="h-6 w-6" />
        </div>
      </div>
      <Link to={link} className="mt-4 flex items-center text-xs font-semibold text-[#4A5C6A] hover:underline">
        Details <Icon icon="mdi:chevron-right" className="h-4 w-4" />
      </Link>
    </Card>
  )
}

function ActionButton({ to, icon, label, primary = false }) {
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
        primary 
        ? 'bg-[#11212D] text-white hover:bg-[#253745] shadow-sm' 
        : 'bg-[#F9FAFB] text-[#4A5C6A] border border-gray-100 hover:border-[#9BA8AB] hover:bg-white'
      }`}
    >
      <Icon icon={icon} className="h-5 w-5" />
      <span className="text-sm font-bold">{label}</span>
    </Link>
  )
}

function InventoryStatus({ label, count, color, percentage }) {
  return (
    <div className="rounded-2xl border border-gray-100 p-4 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-bold text-[#4A5C6A] uppercase">{label}</span>
        <span className="text-lg font-bold text-[#11212D]">{count}</span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div className={`h-2 rounded-full ${color}`} style={{ width: `${percentage}%` }}></div>
      </div>
      <p className="mt-2 text-[10px] text-gray-400 font-medium">{percentage}% of inventory</p>
    </div>
  )
}

function ActivityItem({ log }) {
  const isSale = log.type === 'sale'
  const isIn = log.type === 'in'

  return (
    <li className="group flex items-center justify-between py-4 hover:bg-gray-50/50 px-2 transition-colors rounded-lg">
      <div className="flex items-center gap-4">
        <div className={`rounded-full p-2.5 shadow-sm ${
          isIn ? 'bg-green-50 text-green-600' : isSale ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-gray-600'
        }`}>
          <Icon icon={isIn ? "mdi:arrow-down-bold" : isSale ? "mdi:cart" : "mdi:arrow-up-bold"} className="h-4 w-4" />
        </div>
        <div>
          <p className="text-sm font-bold text-[#11212D]">
            {log.productName} <span className="font-normal text-[#4A5C6A]">by {log.userName}</span>
          </p>
          <p className="text-xs text-[#9BA8AB] font-medium">
            {new Date(log.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })} • {log.quantity} units
          </p>
        </div>
      </div>
      <span className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${
        isIn ? 'border-green-200 text-green-700 bg-green-50' : 'border-gray-200 text-[#4A5C6A] bg-white'
      }`}>
        {log.type}
      </span>
    </li>
  )
}