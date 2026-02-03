import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Icon } from '@iconify/react'
import Card from '../components/ui/Card'
import { searchProducts, getStockStatus, getProducts } from '../services/products'

const SIZES = ['XS', 'S', 'M', 'L', 'XL']
const STATUS_CONFIG = {
  in: { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  low: { label: 'Low Stock', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  out: { label: 'Out of Stock', color: 'bg-rose-50 text-rose-700 border-rose-200' },
}

const filterLabelClass = "text-[10px] font-bold uppercase tracking-widest text-[#4A5C6A] mb-2 block";
const inputClass = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-[#11212D] transition-all placeholder:text-[#9BA8AB] focus:border-[#11212D] focus:outline-none focus:ring-4 focus:ring-[#11212D]/10 min-h-[48px] sm:min-h-0";

/** Custom category dropdown — styled open state (no browser default blue) */
function CategoryDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef(null)
  useEffect(() => {
    const fn = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', fn)
    return () => document.removeEventListener('mousedown', fn)
  }, [])
  const label = value ? value : 'All Categories'
  return (
    <div ref={wrapperRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="select-input w-full text-left flex items-center justify-between gap-2"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span className={value ? 'text-[#11212D] font-medium' : 'text-[#4A5C6A]'}>{label}</span>
        <Icon
          icon="solar:alt-arrow-down-linear"
          className={`h-5 w-5 shrink-0 text-[#4A5C6A] transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-gray-200 bg-white py-2 shadow-xl shadow-[#11212D]/10 max-h-56 overflow-y-auto"
          role="listbox"
        >
          <button
            type="button"
            role="option"
            aria-selected={!value}
            onClick={() => { onChange(''); setOpen(false) }}
            className={`w-full px-4 py-3 text-left text-sm transition-colors ${
              !value ? 'bg-[#11212D]/5 text-[#11212D] font-medium' : 'text-[#4A5C6A] hover:bg-gray-50'
            }`}
          >
            All Categories
          </button>
          {options.map((c) => (
            <button
              key={c}
              type="button"
              role="option"
              aria-selected={value === c}
              onClick={() => { onChange(c); setOpen(false) }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                value === c ? 'bg-[#11212D]/5 text-[#11212D] font-medium' : 'text-[#4A5C6A] hover:bg-gray-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [results, setResults] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)
  
  // States
  const [q, setQ] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [size, setSize] = useState(searchParams.get('size') || '')
  const [color, setColor] = useState(searchParams.get('color') || '')
  const [availableOnly, setAvailableOnly] = useState(searchParams.get('available') === 'true')

  useEffect(() => {
    getProducts().then((list) => {
      const cats = [...new Set(list.map((p) => p.category).filter(Boolean))].sort()
      setCategories(cats)
    })
  }, [])

  const runSearch = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (category) filters.category = category
      if (size) filters.size = size
      if (color) filters.color = color
      if (availableOnly) filters.availableOnly = true
      const list = await searchProducts(q, filters)
      setResults(list)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const timer = setTimeout(runSearch, 300) // Debounce search
    return () => clearTimeout(timer)
  }, [q, category, size, color, availableOnly])

  useEffect(() => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (category) params.set('category', category)
    if (size) params.set('size', size)
    if (color) params.set('color', color)
    if (availableOnly) params.set('available', 'true')
    setSearchParams(params, { replace: true })
  }, [q, category, size, color, availableOnly, setSearchParams])

  const clearFilters = () => {
    setQ('')
    setCategory('')
    setSize('')
    setColor('')
    setAvailableOnly(false)
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Page Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-[#11212D] sm:text-3xl">Advanced Search</h1>
        <p className="text-sm text-[#4A5C6A]">Filter through your entire inventory with precision.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-4">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <Card title="Filters" subtitle="Refine your results">
            <div className="space-y-6 pt-4">
              {/* Search Input */}
              <div>
                <label className={filterLabelClass}>Keywords</label>
                <div className="relative group">
                  <Icon icon="solar:magnifer-linear" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9BA8AB] group-focus-within:text-[#11212D] transition-colors" />
                  <input
                    type="search"
                    placeholder="SKU, name..."
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              {/* Category Select */}
              <div>
                <label className={filterLabelClass}>Category</label>
                <CategoryDropdown
                  value={category}
                  options={categories}
                  onChange={setCategory}
                />
              </div>

              {/* Size Select */}
              <div>
                <label className={filterLabelClass}>Size</label>
                <div className="flex flex-wrap gap-2">
                  {['', ...SIZES].map((s) => (
                    <button
                      key={s}
                      onClick={() => setSize(s)}
                      className={`flex h-9 w-10 items-center justify-center rounded-lg text-xs font-bold border transition-all ${
                        size === s 
                        ? 'bg-[#11212D] text-white border-[#11212D]' 
                        : 'bg-white text-[#4A5C6A] border-gray-200 hover:border-[#11212D]'
                      }`}
                    >
                      {s || 'ALL'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Input */}
              <div>
                <label className={filterLabelClass}>Color</label>
                <input
                  type="text"
                  placeholder="e.g. Navy Blue"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Toggle Switch for Availability */}
              <div className="pt-2">
                <label className="flex cursor-pointer items-center justify-between gap-2 rounded-xl border border-gray-100 bg-gray-50/50 p-3 hover:bg-gray-100 transition-colors">
                  <span className="text-xs font-bold text-[#4A5C6A] uppercase tracking-wider">In Stock Only</span>
                  <input
                    type="checkbox"
                    checked={availableOnly}
                    onChange={(e) => setAvailableOnly(e.target.checked)}
                    className="h-4 w-4 rounded border-gray-300 text-[#11212D] focus:ring-[#11212D]"
                  />
                </label>
              </div>

              <button
                onClick={clearFilters}
                className="w-full pt-4 text-xs font-bold text-[#4A5C6A] hover:text-rose-500 transition-colors uppercase tracking-widest"
              >
                Reset All Filters
              </button>
            </div>
          </Card>
        </div>

        {/* Results Grid */}
        <div className="lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-medium text-[#4A5C6A]">
              Showing <span className="font-bold text-[#11212D]">{results.length}</span> products
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Icon icon="svg-spinners:90-ring-with-bg" className="h-10 w-10 text-[#4A5C6A]" />
              <span className="text-sm font-medium text-[#4A5C6A] animate-pulse">Filtering items...</span>
            </div>
          ) : results.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 py-20 text-center">
              <Icon icon="solar:magnifer-zoom-out-linear" className="mb-4 h-12 w-12 text-gray-300" />
              <h3 className="text-lg font-bold text-[#11212D]">No matches found</h3>
              <p className="text-sm text-[#4A5C6A]">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((p) => {
                const status = getStockStatus(p.quantity)
                const cfg = STATUS_CONFIG[status]
                return (
                  <div
                    key={p.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all hover:shadow-xl hover:shadow-[#11212D]/5 hover:-translate-y-1"
                  >
                    <div className="aspect-square w-full bg-gray-50 overflow-hidden flex items-center justify-center">
                      {p.imageUrl ? (
                        <img src={p.imageUrl} alt={p.dressName} className="w-full h-full object-cover" />
                      ) : (
                        <Icon icon="solar:gallery-linear" className="h-12 w-12 text-gray-300" />
                      )}
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="mb-3 flex items-start justify-between">
                        <div className={`rounded-lg border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>
                          {cfg.label}
                        </div>
                        <span className="text-[10px] font-mono font-bold text-[#9BA8AB]">{p.sku || '—'}</span>
                      </div>
                      
                      <h3 className="text-base font-bold text-[#11212D] group-hover:text-[#4A5C6A] transition-colors">
                        {p.dressName || 'Untitled'}
                      </h3>
                      <div className="mt-1 flex items-center gap-1.5 text-xs text-[#4A5C6A]">
                        <Icon icon="solar:tag-linear" className="h-3.5 w-3.5 shrink-0" />
                        <span>{p.category || 'Uncategorized'}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                        <div className="flex gap-2">
                          <span className="flex items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold text-[#11212D]">
                            {p.size || '—'}
                          </span>
                          {p.color && (
                             <span className="flex items-center justify-center rounded-md bg-gray-100 px-2 py-1 text-[10px] font-bold text-[#11212D]">
                             {p.color}
                           </span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase text-[#9BA8AB]">Stock</p>
                          <p className="text-sm font-black text-[#11212D]">{p.quantity ?? 0}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}