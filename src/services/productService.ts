import {
  collection,
  query,
  where,
  getDocs,
  limit,
  orderBy,
  QueryConstraint,
} from 'firebase/firestore'
import { db } from '../config/firebase-client'
import type { Product, ProductCategory } from '../types'

export interface ProductFilters {
  category?: ProductCategory
  priceMin?: number
  priceMax?: number
  condition?: 'new' | 'refurbished' | 'used'
  minRating?: number
}

/**
 * Servicio público para búsqueda y visualización de productos
 */
export const productService = {
  /**
   * Obtener todos los productos visibles con filtros opcionales
   */
  async getAllProducts(
    filters?: ProductFilters,
    pageSize: number = 20
  ): Promise<Product[]> {
    try {
      // Evitamos orderBy remoto para no depender de índices compuestos en producción.
      const constraints: QueryConstraint[] = [where('visible', '==', true)]

      if (filters?.category) {
        constraints.push(where('category', '==', filters.category))
      }

      if (filters?.priceMin !== undefined) {
        constraints.push(where('price', '>=', filters.priceMin))
      }

      if (filters?.priceMax !== undefined) {
        constraints.push(where('price', '<=', filters.priceMax))
      }

      if (filters?.condition) {
        constraints.push(where('condition', '==', filters.condition))
      }

      if (filters?.minRating !== undefined) {
        constraints.push(where('rating', '>=', filters.minRating))
      }

      if (pageSize > 0) {
        // Traemos un buffer para ordenar/filtrar localmente sin perder resultados relevantes.
        constraints.push(limit(pageSize * 3))
      }

      const q = query(collection(db, 'products'), ...constraints)
      const querySnapshot = await getDocs(q)

      const products = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Product)
      )

      const sorted = products.sort((a, b) => {
        const aTime = new Date(a.createdAt || 0).getTime()
        const bTime = new Date(b.createdAt || 0).getTime()
        return bTime - aTime
      })

      return pageSize > 0 ? sorted.slice(0, pageSize) : sorted
    } catch (error) {
      console.error('❌ Error obteniendo productos:', error)
      throw error
    }
  },

  /**
   * Obtener productos por categoría
   */
  async getProductsByCategory(
    category: ProductCategory,
    pageSize: number = 20
  ): Promise<Product[]> {
    try {
      const q = query(
        collection(db, 'products'),
        where('visible', '==', true),
        where('category', '==', category),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      )

      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Product)
      )
    } catch (error) {
      console.error('❌ Error obteniendo productos por categoría:', error)
      throw error
    }
  },

  /**
   * Buscar productos por título o descripción
   */
  async searchProducts(
    searchQuery: string,
    pageSize: number = 20
  ): Promise<Product[]> {
    try {
      const q = query(
        collection(db, 'products'),
        where('visible', '==', true),
        orderBy('createdAt', 'desc'),
        limit(pageSize * 2)
      )

      const querySnapshot = await getDocs(q)
      const searchLower = searchQuery.toLowerCase()

      return querySnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            } as Product)
        )
        .filter(
          (product) =>
            product.title.toLowerCase().includes(searchLower) ||
            product.description.toLowerCase().includes(searchLower) ||
            product.tags?.some((tag) =>
              tag.toLowerCase().includes(searchLower)
            )
        )
        .slice(0, pageSize)
    } catch (error) {
      console.error('❌ Error buscando productos:', error)
      throw error
    }
  },

  /**
   * Obtener productos destacados (mejor rating)
   */
  async getFeaturedProducts(pageSize: number = 12): Promise<Product[]> {
    try {
      const q = query(
        collection(db, 'products'),
        where('visible', '==', true),
        where('rating', '>=', 4),
        orderBy('rating', 'desc'),
        limit(pageSize)
      )

      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Product)
      )
    } catch (error) {
      console.error('❌ Error obteniendo productos destacados:', error)
      return []
    }
  },

  /**
   * Obtener productos con stock bajo
   */
  async getLowStockProducts(
    sellerId: string,
    threshold: number = 5
  ): Promise<Product[]> {
    try {
      const q = query(
        collection(db, 'products'),
        where('sellerId', '==', sellerId),
        where('stock', '<=', threshold),
        orderBy('stock', 'asc')
      )

      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Product)
      )
    } catch (error) {
      console.error('❌ Error obteniendo productos con stock bajo:', error)
      return []
    }
  },
}
