import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  where,
} from 'firebase/firestore'
import { db } from '../lib/firebase'

const COLL = 'sales'

export async function addSale(data) {
  await addDoc(collection(db, COLL), {
    ...data,
    createdAt: new Date().toISOString(),
  })
}

export async function getSalesHistory(limitCount = 100) {
  const q = query(
    collection(db, COLL),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}

export async function getSalesStats() {
  const snap = await getDocs(collection(db, COLL))
  let totalRevenue = 0
  let totalProfit = 0
  const byCategory = {}
  snap.docs.forEach((d) => {
    const data = d.data()
    totalRevenue += data.revenue || 0
    totalProfit += data.profit || 0
    const cat = data.category || 'Uncategorized'
    byCategory[cat] = (byCategory[cat] || 0) + (data.revenue || 0)
  })
  const bestCategory = Object.entries(byCategory).sort((a, b) => b[1] - a[1])[0]
  return {
    totalRevenue,
    totalProfit,
    totalSales: snap.size,
    bestSellerCategory: bestCategory ? bestCategory[0] : null,
    byCategory,
  }
}
