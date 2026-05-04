import React, { createContext, useEffect, useState } from 'react'
import { 
  type User,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../config/firebase-client'

interface AuthContextType {
  currentUser: User | null
  loading: boolean
  error: string | null
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Escuchar cambios de autenticación
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        try {
          setCurrentUser(user)
          setError(null)
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Error de autenticación')
        } finally {
          setLoading(false)
        }
      },
      (error) => {
        setError(error.message)
        setLoading(false)
      }
    )

    // Cleanup
    return unsubscribe
  }, [])

  const value: AuthContextType = {
    currentUser,
    loading,
    error,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
