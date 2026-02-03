import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { logAction } from './logs'

const COLL = 'products'

export async function getProducts(filters = {}) {
  const q = query(collection(db, COLL), orderBy('createdAt', 'desc'))
  const snap = await getDocs(q)
  let list = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  if (filters.category) list = list.filter((p) => p.category === filters.category)
  if (filters.color) list = list.filter((p) => (p.color || '').toLowerCase() === (filters.color || '').toLowerCase())
  if (filters.size) list = list.filter((p) => p.size === filters.size)
  if (filters.availableOnly) list = list.filter((p) => (p.quantity || 0) > 0)
  return list
}

export async function getProductById(id) {
  const snap = await getDoc(doc(db, COLL, id))
  return snap.exists() ? { id: snap.id, ...snap.data() } : null
}

export async function searchProducts(term, filters = {}) {
  const all = await getProducts(filters)
  const t = (term || '').toLowerCase()
  if (!t) return all
  return all.filter(
    (p) =>
      (p.dressName || '').toLowerCase().includes(t) ||
      (p.sku || '').toLowerCase().includes(t) ||
      (p.category || '').toLowerCase().includes(t)
  )
}

export async function createProduct(data, userId, userName) {
  const ref = await addDoc(collection(db, COLL), {
    sku: data.sku || `PRD-${Date.now()}`,
    dressName: data.dressName || '',
    category: data.category || '',
    size: data.size || '',
    color: data.color || '',
    quantity: Number(data.quantity) || 0,
    costPrice: Number(data.costPrice) || 0,
    sellingPrice: Number(data.sellingPrice) || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  })
  await logAction(db, {
    action: 'product_created',
    userId,
    userName,
    details: `Added product: ${data.dressName || data.sku}`,
    targetId: ref.id,
  })
  return ref.id
}

export async function updateProduct(id, data, userId, userName) {
  const ref = doc(db, COLL, id)
  await updateDoc(ref, {
    ...data,
    updatedAt: new Date().toISOString(),
  })
  await logAction(db, {
    action: 'product_updated',
    userId,
    userName,
    details: `Updated product: ${id}`,
    targetId: id,
  })
}

export async function deleteProduct(id, userId, userName) {
  await deleteDoc(doc(db, COLL, id))
  await logAction(db, {
    action: 'product_deleted',
    userId,
    userName,
    details: `Deleted product: ${id}`,
    targetId: id,
  })
}

export function getStockStatus(quantity) {
  if (quantity <= 0) return 'out'
  if (quantity <= 5) return 'low'
  return 'in'
}
