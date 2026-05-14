import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../config/firebase-client'
import type { Shipment, ShipmentItem, ShipmentListItem, ShipmentUpdate, ShippingData } from '../types'

export interface CreateShipmentInput {
  orderId: string
  userId: string
  paymentId?: string
  shippingData: ShippingData
  items: ShipmentItem[]
  totalAmount: number
  currency: string
  status?: Shipment['status']
  trackingNumber?: string
  carrier?: Shipment['carrier']
  estimatedDelivery?: string
}

const shipmentsCollection = collection(db, 'shipments')

export const shipmentService = {
  /**
   * Obtener todos los envíos del usuario actual
   */
  async getUserShipments(userId: string): Promise<ShipmentListItem[]> {
    try {
      const q = query(collection(db, 'shipments'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)

      const shipments = querySnapshot.docs.map((snapshot) => {
        const data = snapshot.data() as Shipment
        return {
          id: snapshot.id,
          orderId: data.orderId,
          status: data.status,
          trackingNumber: data.trackingNumber,
          estimatedDelivery: data.estimatedDelivery,
          createdAt: data.createdAt,
          recipientName: data.shippingData?.fullName || 'Cliente',
          city: data.shippingData?.city || 'Ciudad no disponible',
          itemCount: data.items?.length || 0,
          totalAmount: data.totalAmount,
        }
      })

      return shipments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } catch (error) {
      console.error('Error en getUserShipments:', error)
      throw error
    }
  },

  /**
   * Obtener detalles de un envío específico
   */
  async getShipmentDetails(shipmentId: string): Promise<Shipment> {
    try {
      const docRef = doc(db, 'shipments', shipmentId)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error('Envío no encontrado')
      }

      return {
        id: docSnap.id,
        ...docSnap.data(),
      } as Shipment
    } catch (error) {
      console.error('Error en getShipmentDetails:', error)
      throw error
    }
  },

  /**
   * Obtener un envío por su orden
   */
  async getShipmentByOrderId(orderId: string): Promise<Shipment | null> {
    try {
      const q = query(collection(db, 'shipments'), where('orderId', '==', orderId))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return null
      }

      const snapshot = querySnapshot.docs[0]
      return {
        id: snapshot.id,
        ...snapshot.data(),
      } as Shipment
    } catch (error) {
      console.error('Error en getShipmentByOrderId:', error)
      throw error
    }
  },

  /**
   * Actualizar campos de un envío por orderId
   */
  async updateShipmentByOrderId(orderId: string, updates: Partial<Shipment>): Promise<Shipment | null> {
    try {
      const q = query(collection(db, 'shipments'), where('orderId', '==', orderId))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        return null
      }

      const snapshot = querySnapshot.docs[0]
      const docRef = doc(db, 'shipments', snapshot.id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })

      const updated = await getDoc(docRef)
      if (!updated.exists()) {
        return null
      }

      return {
        id: updated.id,
        ...updated.data(),
      } as Shipment
    } catch (error) {
      console.error('Error en updateShipmentByOrderId:', error)
      throw error
    }
  },

  /**
   * Obtener información de rastreo de un envío
   */
  async getShipmentTracking(shipmentId: string): Promise<{
    trackingNumber: string
    status: string
    carrier: string
    estimatedDelivery: string
    lastUpdate: string
  }> {
    try {
      const shipment = await this.getShipmentDetails(shipmentId)
      return {
        trackingNumber: shipment.trackingNumber || '',
        status: shipment.status,
        carrier: shipment.carrier || 'manual',
        estimatedDelivery: shipment.estimatedDelivery || '',
        lastUpdate: shipment.updatedAt,
      }
    } catch (error) {
      console.error('Error en getShipmentTracking:', error)
      throw error
    }
  },

  /**
   * Crear un nuevo envío
   */
  async createShipment(input: CreateShipmentInput): Promise<Shipment> {
    try {
      const payload: Record<string, unknown> = {
        orderId: input.orderId,
        userId: input.userId,
        shippingData: input.shippingData,
        items: input.items,
        totalAmount: input.totalAmount,
        currency: input.currency,
        status: input.status || 'pending',
        carrier: input.carrier || 'manual',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }

      if (input.paymentId) {
        payload.paymentId = input.paymentId
      }

      if (input.trackingNumber) {
        payload.trackingNumber = input.trackingNumber
      }

      if (input.estimatedDelivery) {
        payload.estimatedDelivery = input.estimatedDelivery
      }

      const docRef = await addDoc(shipmentsCollection, payload)
      return {
        id: docRef.id,
        ...(payload as Omit<Shipment, 'id'>),
      }
    } catch (error) {
      console.error('Error en createShipment:', error)
      throw error
    }
  },

  /**
   * Actualizar estado de un envío
   */
  async updateShipment(shipmentId: string, updates: ShipmentUpdate): Promise<Shipment> {
    try {
      const docRef = doc(db, 'shipments', shipmentId)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: new Date().toISOString(),
      })

      const updated = await getDoc(docRef)
      if (!updated.exists()) {
        throw new Error('Envío no encontrado')
      }

      return {
        id: updated.id,
        ...updated.data(),
      } as Shipment
    } catch (error) {
      console.error('Error en updateShipment:', error)
      throw error
    }
  },

  /**
   * Cancelar un envío
   */
  async cancelShipment(shipmentId: string): Promise<Shipment> {
    try {
      return await this.updateShipment(shipmentId, {
        status: 'cancelled',
      })
    } catch (error) {
      console.error('Error en cancelShipment:', error)
      throw error
    }
  },
}
