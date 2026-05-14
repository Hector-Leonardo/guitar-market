import React, { createContext, useEffect, useState } from 'react'
import { 
  type User,
  onAuthStateChanged,
} from 'firebase/auth'
import { auth } from '../config/firebase-client'
import type { SellerProfile } from '../types'
import { sellerService } from '../services/sellerService'

interface AuthContextType {
  currentUser: User | null
  sellerProfile: SellerProfile | null
  loading: boolean
  error: string | null
  isSeller: boolean
  becomeSeller: (storeName: string, description: string) => Promise<SellerProfile>
  loadSellerProfile: (user?: User | null) => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [sellerProfile, setSellerProfile] = useState<SellerProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  /**
   * Cargar perfil de vendedor del usuario actual
   */
  const loadSellerProfile = async (user?: User | null) => {
    const authenticatedUser = user ?? currentUser

    if (!authenticatedUser) {
      setSellerProfile(null)
      return
    }

    try {
      const profile = await sellerService.getSellerProfile(authenticatedUser.uid)
      setSellerProfile(profile)
    } catch (err) {
      console.error('❌ Error cargando perfil de vendedor:', err)
      setSellerProfile(null)
    }
  }

  /**
   * Convertir usuario en vendedor
   */
  const becomeSeller = async (
    storeName: string,
    description: string
  ): Promise<SellerProfile> => {
    if (!currentUser) {
      throw new Error('Usuario no autenticado')
    }

    try {
      const profile = await sellerService.createSellerProfile(
        currentUser.uid,
        storeName,
        description
      )
      setSellerProfile(profile as SellerProfile)
      return profile as SellerProfile
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al convertirse en vendedor'
      setError(errorMsg)
      throw err
    }
  }

  useEffect(() => {
    // Escuchar cambios de autenticación
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        try {
          setCurrentUser(user)
          setError(null)

          if (user) {
            // Cargar perfil de vendedor si existe
            await loadSellerProfile(user)
          } else {
            setSellerProfile(null)
          }
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Error de autenticación'
          setError(errorMsg)
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
    sellerProfile,
    loading,
    error,
    isSeller: !!sellerProfile,
    becomeSeller,
    loadSellerProfile,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
