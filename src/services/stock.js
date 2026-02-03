import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
  doc,
  getDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { logAction } from './logs'

const LOGS_COLL = 'stockLogs'
const PRODUCTS_COLL = 'products'

export async function getStockLogs(limitCount = 50) {
  const q = query(
    collection(db, LOGS_COLL),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function recordStockIn(productId, quantity, userId, userName) {
  const productRef = doc(db, PRODUCTS_COLL, productId)
  const productSnap = await getDoc(productRef)
  if (!productSnap.exists()) throw new Error('Product not found')
  const product = productSnap.data()
  const newQty = (product.quantity || 0) + Number(quantity)

  const batch = writeBatch(db)
  batch.update(productRef, {
    quantity: newQty,
    updatedAt: new Date().toISOString(),
  })
  const logRef = doc(collection(db, LOGS_COLL))
  batch.set(logRef, {
    type: 'in',
    productId,
    productName: product.dressName || product.sku,
    quantity: Number(quantity),
    userId,
    userName,
    createdAt: new Date().toISOString(),
  })
  await batch.commit()

  await logAction(db, {
    action: 'stock_in',
    userId,
    userName,
    details: `Added ${quantity} stocks to ${product.dressName || product.sku}`,
    targetId: productId,
  })
  return newQty
}

export async function recordStockOut(productId, quantity, userId, userName, reason = '') {
  const productRef = doc(db, PRODUCTS_COLL, productId)
  const productSnap = await getDoc(productRef)
  if (!productSnap.exists()) throw new Error('Product not found')
  const product = productSnap.data()
  const current = product.quantity || 0
  const qty = Number(quantity)
  if (qty > current) throw new Error('Insufficient stock')
  const newQty = current - qty

  const batch = writeBatch(db)
  batch.update(productRef, {
    quantity: newQty,
    updatedAt: new Date().toISOString(),
  })
  const logRef = doc(collection(db, LOGS_COLL))
  batch.set(logRef, {
    type: 'out',
    productId,
    productName: product.dressName || product.sku,
    quantity: qty,
    userId,
    userName,
    reason: reason || 'Manual adjustment',
    createdAt: new Date().toISOString(),
  })
  await batch.commit()

  await logAction(db, {
    action: 'stock_out',
    userId,
    userName,
    details: `Removed ${qty} stocks from ${product.dressName || product.sku}${reason ? ` (${reason})` : ''}`,
    targetId: productId,
  })
  return newQty
}

export async function recordSale(productId, quantity, userId, userName) {
  const productRef = doc(db, PRODUCTS_COLL, productId)
  const productSnap = await getDoc(productRef)
  if (!productSnap.exists()) throw new Error('Product not found')
  const product = productSnap.data()
  const current = product.quantity || 0
  const qty = Number(quantity)
  if (qty > current) throw new Error('Insufficient stock')
  const newQty = current - qty
  const revenue = qty * (product.sellingPrice || 0)
  const cost = qty * (product.costPrice || 0)
  const profit = revenue - cost

  const batch = writeBatch(db)
  batch.update(productRef, {
    quantity: newQty,
    updatedAt: new Date().toISOString(),
  })
  const logRef = doc(collection(db, LOGS_COLL))
  batch.set(logRef, {
    type: 'sale',
    productId,
    productName: product.dressName || product.sku,
    quantity: qty,
    sellingPrice: product.sellingPrice,
    costPrice: product.costPrice,
    revenue,
    profit,
    userId,
    userName,
    createdAt: new Date().toISOString(),
  })
  await batch.commit()

  const { addSale } = await import('./sales')
  await addSale({
    productId,
    productName: product.dressName || product.sku,
    category: product.category || 'Uncategorized',
    quantity: qty,
    revenue,
    profit,
    userId,
    userName,
  })

  await logAction(db, {
    action: 'sale',
    userId,
    userName,
    details: `Sold ${qty} of ${product.dressName || product.sku}`,
    targetId: productId,
  })
  return { newQty, revenue, profit }
}
