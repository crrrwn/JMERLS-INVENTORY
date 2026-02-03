import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyA356arNm8uPvoSXGvRxzVq1VolOEHnhcw',
  authDomain: 'jmerlsfashion-ff9cd.firebaseapp.com',
  projectId: 'jmerlsfashion-ff9cd',
  storageBucket: 'jmerlsfashion-ff9cd.firebasestorage.app',
  messagingSenderId: '1060107230617',
  appId: '1:1060107230617:web:639974bde9dc48f3eec708',
  measurementId: 'G-L59DQT6QKJ',
}

const app = initializeApp(firebaseConfig)
let analytics = null
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

export const auth = getAuth(app)
export const db = getFirestore(app)
export { app, analytics }
