import { useContext } from 'react'
import { AuthContext } from '../context/AuthContext'

/**
 * Hook para acceder al contexto de autenticación
 * Proporciona usuario actual, perfil de vendedor y métodos relacionados
 */
export function useAuth() {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider')
  }

  return {
    currentUser: context.currentUser,
    sellerProfile: context.sellerProfile,
    isSeller: context.isSeller,
    loading: context.loading,
    error: context.error,
    becomeSeller: context.becomeSeller,
    loadSellerProfile: context.loadSellerProfile,
  }
}
