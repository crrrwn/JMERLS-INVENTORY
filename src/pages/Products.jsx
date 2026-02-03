import { useEffect, useState } from 'react'
import { Icon } from '@iconify/react'
import Card from '../components/ui/Card'
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getStockStatus,
} from '../services/products'
import { useAuth } from '../context/AuthContext'

const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const STATUS_CONFIG = {
  in: { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  low: { label: 'Low Stock', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  out: { label: 'Out of Stock', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
}

const inputClass =
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-[#11212D] transition-all placeholder:text-[#9BA8AB] focus:border-[#4A5C6A] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#4A5C6A]/5'
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4A5C6A]'

// --- Sub-component: Product Form ---
function ProductForm({ product, onClose, onSaved }) {
  const isEdit = !!product
  const [form, setForm] = useState({
    sku: product?.sku || '',
    dressName: product?.dressName || '',
    category: product?.category || '',
    size: product?.size || SIZES[0],
    color: product?.color || '',
    quantity: product?.quantity ?? 0,
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, userProfile } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const payload = { ...form, quantity: Number(form.quantity) || 0 }
      const userName = userProfile?.displayName || user?.email
      if (isEdit) {
        await updateProduct(product.id, payload, user?.uid, userName)
      } else {
        await createProduct(payload, user?.uid, userName)
      }
      onSaved()
      onClose()
    } catch (err) {
      setError(err.message || 'Failed to save product')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4 text-sm text-red-700 animate-in fade-in zoom-in duration-300">
          <Icon icon="solar:danger-circle-bold" className="h-5 w-5 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:gap-5 grid-cols-1 sm:grid-cols-2">
        <div className={isEdit ? '' : 'sm:col-span-2'}>
          <label className={labelClass}>Product Name</label>
          <input
            type="text"
            value={form.dressName}
            onChange={(e) => setForm((f) => ({ ...f, dressName: e.target.value }))}
            className={inputClass}
            placeholder="e.g. Floral Summer Maxi"
            required
            autoComplete="off"
          />
        </div>

        {isEdit && (
          <div>
            <label className={labelClass}>SKU (Read Only)</label>
            <div className="flex min-h-[48px] items-center rounded-xl border border-gray-100 bg-gray-100/50 px-4 text-sm font-mono text-[#4A5C6A]">
              {form.sku}
            </div>
          </div>
        )}

        <div>
          <label className={labelClass}>Category</label>
          <input
            type="text"
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            className={inputClass}
            placeholder="e.g. Dresses"
            autoComplete="off"
          />
        </div>

        <div>
          <label className={labelClass}>Size</label>
          <select
            value={form.size}
            onChange={(e) => setForm((f) => ({ ...f, size: e.target.value }))}
            className={inputClass}
            aria-label="Size"
          >
            {SIZES.map((s) => (<option key={s} value={s}>{s}</option>))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Color</label>
          <input
            type="text"
            value={form.color}
            onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
            className={inputClass}
            placeholder="e.g. Pastel Blue"
            autoComplete="off"
          />
        </div>

        <div>
          <label className={labelClass}>Initial Quantity</label>
          <input
            type="number"
            min={0}
            value={form.quantity}
            onChange={(e) => setForm((f) => ({ ...f, quantity: e.target.value }))}
            className={inputClass}
            inputMode="numeric"
          />
        </div>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end border-t border-gray-100 pt-5 sm:pt-6">
        <button
          type="button"
          onClick={onClose}
          className="w-full sm:w-auto rounded-xl px-6 py-3.5 sm:py-3 text-sm font-bold text-[#4A5C6A] transition-colors hover:bg-gray-100 touch-manipulation min-h-[48px] sm:min-h-0"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-[#11212D] px-8 py-3.5 sm:py-3 text-sm font-bold text-white shadow-lg shadow-[#11212D]/20 transition-all hover:bg-[#253745] active:scale-[0.98] disabled:opacity-50 touch-manipulation min-h-[48px] sm:min-h-0"
        >
          {loading ? (
            <Icon icon="svg-spinners:ring-resize" className="h-5 w-5" />
          ) : (
            <Icon icon={isEdit ? "solar:refresh-linear" : "solar:add-circle-linear"} className="h-5 w-5" />
          )}
          {isEdit ? 'Save Changes' : 'Create Product'}
        </button>
      </div>
    </form>
  )
}

// --- Main Products Component ---
export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const { user, userProfile } = useAuth()

  const load = async () => {
    setLoading(true)
    try {
      const list = await getProducts()
      setProducts(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    try {
      await deleteProduct(deleteTarget.id, user?.uid, userProfile?.displayName || user?.email)
      setDeleteTarget(null)
      load()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#11212D] sm:text-3xl">Inventory Catalog</h1>
          <p className="text-sm text-[#4A5C6A]">Manage, track, and update your product listings.</p>
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center justify-center gap-2 rounded-xl bg-[#11212D] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-[#11212D]/10 transition-all hover:bg-[#253745] active:scale-95"
        >
          <Icon icon="solar:add-circle-bold" className="h-5 w-5" />
          Add New Product
        </button>
      </div>

      {/* Table Section */}
      <Card className="overflow-hidden border-none shadow-sm ring-1 ring-gray-100">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-[#4A5C6A]">
            <Icon icon="svg-spinners:90-ring-with-bg" className="h-10 w-10" />
            <span className="text-sm font-medium animate-pulse">Syncing catalog...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-50 text-gray-300">
              <Icon icon="solar:box-minimalistic-linear" className="h-8 w-8" />
            </div>
            <h3 className="text-lg font-bold text-[#11212D]">No products found</h3>
            <p className="text-sm text-[#4A5C6A]">Your inventory is currently empty.</p>
            <button
              onClick={() => setModal('add')}
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-[#4A5C6A] hover:underline underline-offset-4"
            >
              Add your first item now
              <Icon icon="solar:arrow-right-linear" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#4A5C6A]">Product Detail</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#4A5C6A]">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#4A5C6A]">Variants</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#4A5C6A]">Stock Level</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#4A5C6A]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((p) => {
                  const status = getStockStatus(p.quantity)
                  const cfg = STATUS_CONFIG[status]
                  return (
                    <tr key={p.id} className="group transition-colors hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-[#11212D]">{p.dressName}</span>
                          <span className="text-[10px] font-mono text-[#9BA8AB]">{p.sku || 'NO-SKU'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-lg bg-gray-100 px-2.5 py-1 text-[11px] font-bold text-[#4A5C6A]">
                          {p.category || 'Uncategorized'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#4A5C6A]">
                        <span className="font-semibold text-[#11212D]">{p.size}</span> / {p.color || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold text-[#11212D] w-8">{p.quantity}</span>
                          <div className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                            {cfg.label}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => setModal(p)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-gray-200 text-[#4A5C6A] shadow-sm hover:border-[#11212D] hover:text-[#11212D]"
                          >
                            <Icon icon="solar:pen-new-square-linear" className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(p)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl bg-white border border-gray-200 text-rose-500 shadow-sm hover:bg-rose-50 hover:border-rose-200"
                          >
                            <Icon icon="solar:trash-bin-trash-linear" className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Product Modal - responsive for all devices */}
      {modal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-[#11212D]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setModal(null)} aria-hidden="true" />
          <div className="relative w-full max-w-xl max-h-[92dvh] sm:max-h-[90vh] rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-start justify-between gap-4 p-4 sm:p-6 lg:p-8 pb-0 sm:pb-0">
              <div className="min-w-0">
                <h2 className="text-xl sm:text-2xl font-bold text-[#11212D]">{modal === 'add' ? 'New Product' : 'Edit Details'}</h2>
                <p className="mt-0.5 text-xs sm:text-sm text-[#4A5C6A]">Enter information for the inventory record.</p>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="shrink-0 rounded-full p-2 hover:bg-gray-100 text-[#4A5C6A] touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close"
              >
                <Icon icon="solar:close-circle-linear" className="h-6 w-6 sm:h-7 sm:w-7" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6 lg:p-8 pt-4">
              <ProductForm
                product={modal === 'add' ? null : modal}
                onClose={() => setModal(null)}
                onSaved={load}
              />
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#11212D]/40 backdrop-blur-sm" onClick={() => setDeleteTarget(null)} />
          <div className="relative w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-500">
              <Icon icon="solar:trash-bin-trash-bold" className="h-8 w-8" />
            </div>
            <h2 className="text-center text-xl font-bold text-[#11212D]">Are you sure?</h2>
            <p className="mt-2 text-center text-sm text-[#4A5C6A]">
              This will permanently delete <span className="font-bold text-[#11212D]">"{deleteTarget.dressName}"</span>. This action cannot be undone.
            </p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              <button onClick={() => setDeleteTarget(null)} className="rounded-xl bg-gray-100 py-3 text-sm font-bold text-[#4A5C6A] hover:bg-gray-200 transition-colors">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="rounded-xl bg-rose-500 py-3 text-sm font-bold text-white shadow-lg shadow-rose-500/20 hover:bg-rose-600 transition-colors">
                Delete Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}