import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
  increment,
} from 'firebase/firestore'
import { db } from '../config/firebase-client'
import type { Product, ProductFormData, SellerProfile, SellerStats } from '../types'

/**
 * Servicio para gestión de vendedores y sus productos
 */
export const sellerService = {
  /**
   * Crear o actualizar perfil de vendedor
   */
  async createSellerProfile(
    uid: string,
    storeName: string,
    description: string
  ): Promise<SellerProfile> {
    try {
      const docRef = doc(db, 'sellers', uid)
      const sellerData: Partial<SellerProfile> = {
        uid,
        storeName,
        description,
        kycStatus: 'pending',
        rating: 0,
        ratingCount: 0,
        totalSales: 0,
        totalRevenue: 0,
        productCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      await setDoc(docRef, sellerData, { merge: true })

      return sellerData as SellerProfile
    } catch (error) {
      console.error('❌ Error creando perfil de vendedor:', error)
      throw error
    }
  },

  /**
   * Obtener perfil de vendedor por ID
   */
  async getSellerProfile(sellerId: string): Promise<SellerProfile | null> {
    try {
      const docRef = doc(db, 'sellers', sellerId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        console.warn(`⚠️ Perfil de vendedor ${sellerId} no encontrado`)
        return null
      }

      return { uid: docSnap.id, ...docSnap.data() } as SellerProfile
    } catch (error) {
      console.error('❌ Error obteniendo perfil de vendedor:', error)
      throw error
    }
  },

  /**
   * Actualizar perfil de vendedor
   */
  async updateSellerProfile(
    sellerId: string,
    updates: Partial<SellerProfile>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'sellers', sellerId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('❌ Error actualizando perfil de vendedor:', error)
      throw error
    }
  },

  /**
   * Crear producto
   */
  async createProduct(
    sellerId: string,
    sellerName: string,
    productData: ProductFormData
  ): Promise<Product> {
    try {
      const productsRef = collection(db, 'products')
      const docRef = await addDoc(productsRef, {
        ...productData,
        sellerId,
        sellerName,
        sold: 0,
        rating: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      // Intentar actualizar contador sin bloquear el guardado del producto.
      // Si falla por reglas/estado del doc de seller, el producto ya debe quedar persistido.
      try {
        await this.updateSellerStats(sellerId, { productCount: 1 })
      } catch (statsError) {
        console.warn('⚠️ No se pudo actualizar productCount, pero el producto fue creado:', statsError)
      }

      return {
        id: docRef.id,
        ...productData,
        sellerId,
        sellerName,
        sold: 0,
        rating: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as Product
    } catch (error) {
      console.error('❌ Error creando producto:', error)
      throw error
    }
  },

  /**
   * Actualizar producto
   */
  async updateProduct(
    sellerId: string,
    productId: string,
    updates: Partial<ProductFormData>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'products', productId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error('Producto no encontrado')
      }

      if (docSnap.data().sellerId !== sellerId) {
        throw new Error('No tienes permiso para editar este producto')
      }

      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('❌ Error actualizando producto:', error)
      throw error
    }
  },

  /**
   * Eliminar producto
   */
  async deleteProduct(sellerId: string, productId: string): Promise<void> {
    try {
      const docRef = doc(db, 'products', productId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error('Producto no encontrado')
      }

      if (docSnap.data().sellerId !== sellerId) {
        throw new Error('No tienes permiso para eliminar este producto')
      }

      await deleteDoc(docRef)

      // Actualizar contador de productos
      await this.updateSellerStats(sellerId, { productCount: -1 })
    } catch (error) {
      console.error('❌ Error eliminando producto:', error)
      throw error
    }
  },

  /**
   * Obtener productos de un vendedor con paginación
   */
  async getSellerProducts(
    sellerId: string,
    pageSize: number = 20
  ): Promise<Product[]> {
    try {
      // Evitamos orderBy en servidor para no depender de índices compuestos.
      const q = query(collection(db, 'products'), where('sellerId', '==', sellerId))
      const querySnapshot = await getDocs(q)

      const products = querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Product)
      )

      const sorted = products.sort((a, b) => {
        const aTime = new Date(a.createdAt).getTime()
        const bTime = new Date(b.createdAt).getTime()
        return bTime - aTime
      })

      return pageSize > 0 ? sorted.slice(0, pageSize) : sorted
    } catch (error) {
      console.error('❌ Error obteniendo productos del vendedor:', error)
      throw error
    }
  },

  /**
   * Obtener un producto por ID
   */
  async getProduct(productId: string): Promise<Product | null> {
    try {
      const docRef = doc(db, 'products', productId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Product
    } catch (error) {
      console.error('❌ Error obteniendo producto:', error)
      throw error
    }
  },

  /**
   * Obtener estadísticas del vendedor
   * Nota: Usa solo datos del perfil de vendedor para evitar restricciones de Firestore
   * Las órdenes detalladas se obtienen a través del backend (/api/seller/stats)
   */
  async getSellerStats(sellerId: string): Promise<SellerStats> {
    try {
      const sellerDoc = await this.getSellerProfile(sellerId)
      if (!sellerDoc) {
        throw new Error('Vendedor no encontrado')
      }

      // Devolver estadísticas del perfil del vendedor
      // El backend puede calcular órdenes pendientes si lo necesita
      return {
        totalSales: sellerDoc.totalSales || 0,
        totalRevenue: sellerDoc.totalRevenue || 0,
        rating: sellerDoc.rating || 0,
        ratingCount: sellerDoc.ratingCount || 0,
        productCount: sellerDoc.productCount || 0,
        pendingOrders: 0, // Se puede obtener desde backend si es necesario
        monthlyRevenue: 0, // Se puede obtener desde backend si es necesario
        lastUpdated: new Date().toISOString(),
      }
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error)
      throw error
    }
  },

  /**
   * Actualizar estadísticas del vendedor (uso interno)
   */
  async updateSellerStats(
    sellerId: string,
    updates: Partial<Record<keyof SellerStats, number>>
  ): Promise<void> {
    try {
      const docRef = doc(db, 'sellers', sellerId)
      const updateData: Record<string, any> = {}

      if (updates.productCount !== undefined) {
        updateData.productCount = increment(updates.productCount)
      }
      if (updates.totalSales !== undefined) {
        updateData.totalSales = increment(updates.totalSales)
      }
      if (updates.totalRevenue !== undefined) {
        updateData.totalRevenue = increment(updates.totalRevenue)
      }

      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = new Date().toISOString()
        await updateDoc(docRef, updateData)
      }
    } catch (error) {
      console.error('❌ Error actualizando estadísticas:', error)
      throw error
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
      // Evitamos combinación de where+orderBy para no requerir índices compuestos.
      const q = query(collection(db, 'products'), where('sellerId', '==', sellerId))
      const querySnapshot = await getDocs(q)

      return querySnapshot.docs
        .map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Product)
        )
        .filter((product) => product.stock <= threshold)
        .sort((a, b) => a.stock - b.stock)
    } catch (error) {
      console.error('❌ Error obteniendo productos con stock bajo:', error)
      return []
    }
  },
}
