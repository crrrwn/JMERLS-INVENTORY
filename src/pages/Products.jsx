import { useEffect, useState, useRef } from 'react'
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
  'w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm text-[#11212D] transition-all placeholder:text-[#9BA8AB] focus:border-[#4A5C6A] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#4A5C6A]/5 min-h-[48px] sm:min-h-0'
const labelClass = 'mb-1.5 block text-xs font-bold uppercase tracking-wider text-[#4A5C6A]'

/** Custom size dropdown — styled open state */
function SizeDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  useEffect(() => {
    const fn = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="select-input w-full text-left flex items-center justify-between gap-2"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className="text-[#11212D] font-medium">{value}</span>
        <Icon
          icon="solar:alt-arrow-down-linear"
          className={`h-5 w-5 shrink-0 text-[#4A5C6A] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-gray-200 bg-white py-2 shadow-xl shadow-[#11212D]/10"
          role="listbox"
        >
          {options.map((s) => (
            <button
              key={s}
              type="button"
              role="option"
              aria-selected={value === s}
              onClick={() => { onChange(s); setOpen(false) }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                value === s ? 'bg-[#11212D]/5 text-[#11212D] font-medium' : 'text-[#4A5C6A] hover:bg-gray-50'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/** Convert image file to base64 data URL (resized if needed so it fits in Firestore ~1MB) */
function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      let dataUrl = e.target.result
      if (dataUrl.length > 900000) {
        const img = new Image()
        img.onload = () => {
          const max = 600
          let w = img.width
          let h = img.height
          if (w > max || h > max) {
            if (w > h) {
              h = Math.round((h * max) / w)
              w = max
            } else {
              w = Math.round((w * max) / h)
              h = max
            }
          }
          const canvas = document.createElement('canvas')
          canvas.width = w
          canvas.height = h
          const ctx = canvas.getContext('2d')
          ctx.drawImage(img, 0, 0, w, h)
          resolve(canvas.toDataURL('image/jpeg', 0.75))
        }
        img.onerror = () => resolve(dataUrl)
        img.src = dataUrl
      } else {
        resolve(dataUrl)
      }
    }
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

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
    imageUrl: product?.imageUrl || '',
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(product?.imageUrl || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, userProfile } = useAuth()

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, GIF, WebP).')
        return
      }
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
      setError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      let imageUrl = form.imageUrl
      if (imageFile) {
        imageUrl = await fileToDataUrl(imageFile)
      }
      const payload = {
        ...form,
        quantity: Number(form.quantity) || 0,
        imageUrl: imageUrl || null,
      }
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

        <div className="sm:col-span-2">
          <label className={labelClass}>Product Picture</label>
          <div className="flex flex-col sm:flex-row gap-4 items-start">
            <div className="w-full sm:w-36 h-36 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50/50 overflow-hidden flex items-center justify-center shrink-0">
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-gray-300 flex flex-col items-center gap-1.5">
                  <Icon icon="solar:gallery-linear" className="h-10 w-10" />
                  <span className="text-xs">No image</span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="product-image-input"
                />
                <label
                  htmlFor="product-image-input"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#11212D] px-4 py-2.5 text-sm font-bold text-white cursor-pointer hover:bg-[#253745] transition-colors"
                >
                  <Icon icon="solar:upload-minimalistic-linear" className="h-4 w-4" />
                  Choose image
                </label>
                {imageFile && (
                  <span className="text-xs text-[#4A5C6A] truncate max-w-[12rem]" title={imageFile.name}>
                    {imageFile.name}
                  </span>
                )}
              </div>
              <p className="text-xs text-[#9BA8AB]">JPG, PNG, GIF or WebP. Shown in catalog.</p>
            </div>
          </div>
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
          <SizeDropdown
            value={form.size}
            options={SIZES}
            onChange={(size) => setForm((f) => ({ ...f, size }))}
          />
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

const PAGE_SIZE = 5

// --- Main Products Component ---
export default function Products() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const { user, userProfile } = useAuth()

  const totalPages = Math.max(1, Math.ceil(products.length / PAGE_SIZE))
  const start = (currentPage - 1) * PAGE_SIZE
  const paginatedProducts = products.slice(start, start + PAGE_SIZE)

  useEffect(() => {
    if (currentPage > totalPages && totalPages >= 1) setCurrentPage(totalPages)
  }, [currentPage, totalPages])

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
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#4A5C6A] w-20">Image</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#4A5C6A]">Product Detail</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#4A5C6A]">Category</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#4A5C6A]">Variants</th>
                  <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-[0.15em] text-[#4A5C6A]">Stock Level</th>
                  <th className="px-6 py-4 text-right text-[10px] font-bold uppercase tracking-[0.15em] text-[#4A5C6A]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginatedProducts.map((p) => {
                  const status = getStockStatus(p.quantity)
                  const cfg = STATUS_CONFIG[status]
                  return (
                    <tr key={p.id} className="group transition-colors hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <div className="w-14 h-14 rounded-lg border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                          {p.imageUrl ? (
                            <img
                              src={p.imageUrl}
                              alt={p.dressName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Icon icon="solar:gallery-linear" className="h-6 w-6 text-gray-300" />
                          )}
                        </div>
                      </td>
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

        {/* Pagination — only when there are products */}
        {!loading && products.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-xs font-medium text-[#4A5C6A]">
              Showing <span className="font-bold text-[#11212D]">{start + 1}</span>–<span className="font-bold text-[#11212D]">{Math.min(start + PAGE_SIZE, products.length)}</span> of <span className="font-bold text-[#11212D]">{products.length}</span> products
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#4A5C6A] hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                aria-label="Previous page"
              >
                <Icon icon="solar:alt-arrow-left-linear" className="h-5 w-5" />
              </button>
              <span className="min-w-[6rem] text-center text-sm font-medium text-[#11212D]">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-200 bg-white text-[#4A5C6A] hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
                aria-label="Next page"
              >
                <Icon icon="solar:alt-arrow-right-linear" className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Product Modal - responsive, no header overlap */}
      {modal && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-0 sm:p-4">
          <div className="absolute inset-0 bg-[#11212D]/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setModal(null)} aria-hidden="true" />
          <div className="relative w-full max-w-lg h-[85dvh] sm:h-auto sm:max-h-[85vh] rounded-t-3xl sm:rounded-3xl bg-white shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 flex flex-col overflow-hidden">
            <div className="shrink-0 flex items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-4 border-b border-gray-100">
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-[#11212D] truncate">{modal === 'add' ? 'New Product' : 'Edit Details'}</h2>
                <p className="mt-0.5 text-xs text-[#4A5C6A] hidden sm:block">Enter information for the inventory record.</p>
              </div>
              <button
                type="button"
                onClick={() => setModal(null)}
                className="shrink-0 rounded-full p-2 hover:bg-gray-100 text-[#4A5C6A] touch-manipulation h-10 w-10 flex items-center justify-center"
                aria-label="Close"
              >
                <Icon icon="solar:close-circle-linear" className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 sm:p-6">
              <ProductForm
                key={modal === 'add' ? 'add' : modal.id}
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