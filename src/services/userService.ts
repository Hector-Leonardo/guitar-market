import type { UserProfile, VendorProduct, VendorOrder, VendorRating } from '../types'

// Usar variable de entorno para la URL del API, con fallback a /api
const API_BASE = import.meta.env.VITE_API_URL || '/api'

export const userService = {
  /**
   * Obtener perfil de usuario por ID
   */
  async getUserProfile(userId: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.success ? data.user : null
    } catch (error) {
      console.error('❌ Error obteniendo perfil:', error)
      return null
    }
  },

  /**
   * Crear nuevo perfil de usuario
   */
  async createUserProfile(uid: string, email: string, displayName: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${API_BASE}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ uid, email, displayName }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.success ? data.user : null
    } catch (error) {
      console.error('❌ Error creando perfil:', error)
      return null
    }
  },

  /**
   * Convertir usuario en vendedor
   */
  async becomeVendor(userId: string, storeName: string, description: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/become-vendor`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeName, description }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.success ? data.user : null
    } catch (error) {
      console.error('❌ Error al convertirse en vendedor:', error)
      return null
    }
  },

  /**
   * Actualizar información de la tienda
   */
  async updateStoreInfo(userId: string, storeName: string, description: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${API_BASE}/users/${userId}/store-info`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ storeName, description }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.success ? data.user : null
    } catch (error) {
      console.error('❌ Error actualizando tienda:', error)
      return null
    }
  },

  /**
   * Obtener productos de un vendedor
   */
  async getVendorProducts(vendorId: string): Promise<VendorProduct[]> {
    try {
      const response = await fetch(`${API_BASE}/users/vendor/${vendorId}/products`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.success ? data.products : []
    } catch (error) {
      console.error('❌ Error obteniendo productos del vendedor:', error)
      return []
    }
  },

  /**
   * Obtener órdenes de un vendedor
   */
  async getVendorOrders(vendorId: string): Promise<VendorOrder[]> {
    try {
      const response = await fetch(`${API_BASE}/users/vendor/${vendorId}/orders`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.success ? data.orders : []
    } catch (error) {
      console.error('❌ Error obteniendo órdenes del vendedor:', error)
      return []
    }
  },

  /**
   * Obtener estadísticas del vendedor
   */
  async getVendorStats(vendorId: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE}/users/vendor/${vendorId}/stats`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.success ? data.stats : null
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error)
      return null
    }
  },

  /**
   * Crear producto de vendedor
   */
  async createVendorProduct(vendorId: string, productData: {
    name: string
    description: string
    price: number
    stock: number
    category: string
    image: string
  }): Promise<VendorProduct | null> {
    try {
      const response = await fetch(`${API_BASE}/users/vendor/${vendorId}/products`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.success ? data.product : null
    } catch (error) {
      console.error('❌ Error al crear producto:', error)
      return null
    }
  },

  /**
   * Obtener todos los vendedores
   */
  async getAllVendors(): Promise<any[]> {
    try {
      const response = await fetch(`${API_BASE}/users/vendors`)

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.success ? data.vendors : []
    } catch (error) {
      console.error('❌ Error al obtener vendedores:', error)
      return []
    }
  },

  /**
   * Crear una calificación para un vendedor
   */
  async rateVendor(vendorId: string, rating: number, comment: string): Promise<VendorRating | null> {
    try {
      const response = await fetch(`${API_BASE}/users/vendor/${vendorId}/ratings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating, comment }),
      })

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      return data.success ? data.rating : null
    } catch (error) {
      console.error('❌ Error al crear calificación:', error)
      return null
    }
  },
}
