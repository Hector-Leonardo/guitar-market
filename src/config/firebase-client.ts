import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

/**
 * Configuración de Firebase (frontend)
 * Estas credenciales son públicas y están destinadas a ser usadas en el cliente
 */
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyBvJRFgnSZC8xdjN8zQHrgF12345abcde',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'guitarmarket-b033a.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'guitarmarket-b033a',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'guitarmarket-b033a.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef123456'
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar Firebase Authentication y obtener una referencia a él
export const auth = getAuth(app)

// Inicializar Cloud Firestore
export const db = getFirestore(app)

export default app
