import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from 'firebase/firestore'
import { db } from '../config/firebase-client'
import type { Order, OrderStatus } from '../types'
import { sellerService } from './sellerService'

/**
 * Servicio para gestión de órdenes
 */
export const orderService = {
  /**
   * Crear nueva orden
   */
  async createOrder(
    buyerId: string,
    buyerName: string,
    buyerEmail: string,
    productId: string,
    quantity: number
  ): Promise<Order> {
    try {
      // Validar que el producto existe y tiene stock
      const prod = await sellerService.getProduct(productId)
      if (!prod) {
        throw new Error('Producto no encontrado')
      }

      if (prod.stock < quantity) {
        throw new Error('Stock insuficiente')
      }

      const totalAmount = prod.price * quantity

      const orderData = {
        buyerId,
        buyerName,
        buyerEmail,
        sellerId: prod.sellerId,
        sellerName: prod.sellerName,
        productId,
        productTitle: prod.title,
        quantity,
        unitPrice: prod.price,
        totalAmount,
        currency: prod.currency,
        status: 'pending' as OrderStatus,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      const docRef = await addDoc(collection(db, 'orders'), orderData)

      return {
        id: docRef.id,
        ...orderData,
      } as Order
    } catch (error) {
      console.error('❌ Error creando orden:', error)
      throw error
    }
  },

  /**
   * Actualizar estado de la orden
   */
  async updateOrderStatus(
    orderId: string,
    newStatus: OrderStatus
  ): Promise<void> {
    try {
      const docRef = doc(db, 'orders', orderId)
      await updateDoc(docRef, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('❌ Error actualizando estado de orden:', error)
      throw error
    }
  },

  /**
   * Obtener órdenes del vendedor
   */
  async getOrdersBySeller(
    sellerId: string,
    pageSize: number = 50
  ): Promise<Order[]> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('sellerId', '==', sellerId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      )

      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Order)
      )
    } catch (error) {
      console.error('❌ Error obteniendo órdenes del vendedor:', error)
      throw error
    }
  },

  /**
   * Obtener órdenes del comprador
   */
  async getOrdersByBuyer(
    buyerId: string,
    pageSize: number = 50
  ): Promise<Order[]> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('buyerId', '==', buyerId),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      )

      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Order)
      )
    } catch (error) {
      console.error('❌ Error obteniendo órdenes del comprador:', error)
      throw error
    }
  },

  /**
   * Obtener orden por ID
   */
  async getOrder(orderId: string): Promise<Order | null> {
    try {
      const docRef = doc(db, 'orders', orderId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Order
    } catch (error) {
      console.error('❌ Error obteniendo orden:', error)
      throw error
    }
  },

  /**
   * Agregar retroalimentación a una orden
   */
  async addOrderFeedback(
    orderId: string,
    rating: number,
    comment: string
  ): Promise<void> {
    try {
      const docRef = doc(db, 'orders', orderId)
      await updateDoc(docRef, {
        feedback: {
          rating,
          comment,
          createdAt: new Date().toISOString(),
        },
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      console.error('❌ Error agregando feedback:', error)
      throw error
    }
  },

  /**
   * Obtener órdenes en estado específico
   */
  async getOrdersByStatus(
    sellerId: string,
    status: OrderStatus
  ): Promise<Order[]> {
    try {
      const q = query(
        collection(db, 'orders'),
        where('sellerId', '==', sellerId),
        where('status', '==', status),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)

      return querySnapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Order)
      )
    } catch (error) {
      console.error('❌ Error obteniendo órdenes por estado:', error)
      throw error
    }
  },
}
