import { collection, addDoc, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../lib/firebase'

const COLL = 'systemLogs'

export async function logAction(dbInstance, { action, userId, userName, details, targetId, level = 'info' }) {
  await addDoc(collection(dbInstance, COLL), {
    action,
    userId: userId || null,
    userName: userName || 'System',
    details: details || '',
    targetId: targetId || null,
    level,
    createdAt: new Date().toISOString(),
  })
}

export async function getSystemLogs(limitCount = 100) {
  const q = query(
    collection(db, COLL),
    orderBy('createdAt', 'desc'),
    limit(limitCount)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }))
}
