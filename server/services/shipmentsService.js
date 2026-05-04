import { v4 as uuidv4 } from 'uuid'
import { db } from '../config/firebase.js'
import refundsService from './refundsService.js'

/**
 * Servicio de Gestión de Envíos
 * Utiliza Firestore para persistencia de datos
 */

const shipmentsService = {
  /**
   * Obtener todos los envíos de un usuario
   */
  async getUserShipments(userId) {
    try {
      if (!db) {
        console.warn('⚠️  Firestore no disponible en getUserShipments')
        return { success: false, error: 'Firestore no disponible', shipments: [] }
      }

      console.log(`📦 [ENVÍOS] Buscando envíos para usuario: ${userId}`)
      
      // Nota: Se omite .orderBy() porque sin índice compuesto en Firestore causará error
      const snapshot = await db
        .collection('shipments')
        .where('userId', '==', userId)
        .get()

      console.log(`📦 [ENVÍOS] Se encontraron ${snapshot.docs.length} envíos`)

      const shipments = snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          orderId: data.orderId,
          status: data.status,
          trackingNumber: data.trackingNumber,
          estimatedDelivery: data.estimatedDelivery,
          createdAt: data.createdAt,
          recipientName: data.shippingData?.fullName,
          city: data.shippingData?.city,
        }
      }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

      return { success: true, shipments }
    } catch (error) {
      console.error('❌ Error en getUserShipments:', error.message)
      console.error('❌ Stack:', error.stack)
      return { success: false, error: error.message || 'Error al obtener envíos del usuario', shipments: [] }
    }
  },

  /**
   * Obtener detalles completos de un envío
   */
  async getShipmentDetails(shipmentId) {
    try {
      if (!db) {
        return { success: false, error: 'Firestore no disponible' }
      }

      const doc = await db.collection('shipments').doc(shipmentId).get()

      if (!doc.exists) {
        return { success: false, error: 'Envío no encontrado' }
      }

      return {
        success: true,
        shipment: {
          id: doc.id,
          ...doc.data(),
        },
      }
    } catch (error) {
      console.error('❌ Error en getShipmentDetails:', error)
      return { success: false, error: 'Error al obtener detalles del envío' }
    }
  },

  /**
   * Obtener información de rastreo
   */
  async getShipmentTracking(shipmentId) {
    try {
      if (!db) {
        return { success: false, error: 'Firestore no disponible' }
      }

      const doc = await db.collection('shipments').doc(shipmentId).get()

      if (!doc.exists) {
        return { success: false, error: 'Envío no encontrado' }
      }

      const data = doc.data()
      return {
        success: true,
        tracking: {
          trackingNumber: data.trackingNumber || 'N/A',
          status: data.status,
          carrier: data.carrier || 'Pendiente asignar',
          estimatedDelivery: data.estimatedDelivery || 'Por determinar',
          lastUpdate: data.updatedAt,
        },
      }
    } catch (error) {
      console.error('❌ Error en getShipmentTracking:', error)
      return { success: false, error: 'Error al obtener información de rastreo' }
    }
  },

  /**
   * Crear un nuevo envío (llamado automáticamente al crear una orden)
   */
  async createShipment(orderId, userId, shippingData, paymentId = null) {
    try {
      if (!db) {
        return { success: false, error: 'Firestore no disponible' }
      }

      const shipmentId = uuidv4()
      const now = new Date().toISOString()

      const newShipment = {
        id: shipmentId,
        orderId,
        userId,
        paymentId,
        shippingData,
        status: 'pending',
        trackingNumber: null,
        carrier: null,
        estimatedDelivery: null,
        actualDelivery: null,
        refundData: null,
        createdAt: now,
        updatedAt: now,
      }

      await db.collection('shipments').doc(shipmentId).set(newShipment)

      console.log(`✅ Envío creado en Firestore: ${shipmentId} para orden ${orderId}`)
      if (paymentId) {
        console.log(`💳 [ENVÍO] Pago asociado: ${paymentId}`)
      }

      return { success: true, shipment: newShipment }
    } catch (error) {
      console.error('❌ Error en createShipment:', error)
      return { success: false, error: 'Error al crear envío' }
    }
  },

  /**
   * Actualizar estado de un envío
   */
  async updateShipment(shipmentId, updates) {
    try {
      if (!db) {
        return { success: false, error: 'Firestore no disponible' }
      }

      const doc = await db.collection('shipments').doc(shipmentId).get()

      if (!doc.exists) {
        return { success: false, error: 'Envío no encontrado' }
      }

      const updatedData = {
        ...updates,
        updatedAt: new Date().toISOString(),
      }

      await db.collection('shipments').doc(shipmentId).update(updatedData)

      const updatedDoc = await db.collection('shipments').doc(shipmentId).get()
      const updatedShipment = updatedDoc.data()

      console.log(`✅ Envío actualizado en Firestore: ${shipmentId}`)

      return { success: true, shipment: { id: shipmentId, ...updatedShipment } }
    } catch (error) {
      console.error('❌ Error en updateShipment:', error)
      return { success: false, error: 'Error al actualizar envío' }
    }
  },

  /**
   * Cancelar un envío (procesa reembolso si es aplicable)
   */
  async cancelShipment(shipmentId) {
    try {
      if (!db) {
        return { success: false, error: 'Firestore no disponible' }
      }

      const doc = await db.collection('shipments').doc(shipmentId).get()

      if (!doc.exists) {
        return { success: false, error: 'Envío no encontrado' }
      }

      const data = doc.data()

      if (data.status === 'cancelled') {
        return { success: false, error: 'Este envío ya ha sido cancelado' }
      }

      if (['shipped', 'in_transit', 'delivered'].includes(data.status)) {
        return { success: false, error: `No se puede cancelar un envío con estado: ${data.status}` }
      }

      console.log(`🔄 [CANCEL] Cancelando envío: ${shipmentId}`)

      // 💰 Procesar reembolso si hay paymentId
      let refundResult = null;
      if (data.paymentId) {
        console.log(`💰 [CANCEL] Iniciando reembolso para pago: ${data.paymentId}`)
        refundResult = await refundsService.processRefund(
          data.paymentId,
          null,
          'Cancelación de envío solicitada por el cliente'
        )

        if (refundResult.success) {
          console.log(`✅ [CANCEL] Reembolso procesado: ${refundResult.refundId}`)
        } else {
          console.warn(`⚠️  [CANCEL] No se pudo procesar el reembolso: ${refundResult.error}`)
        }
      } else {
        console.warn(`⚠️  [CANCEL] No hay paymentId para procesar reembolso`)
      }

      const updateData = {
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      }

      // Agregar información de reembolso si fue procesado
      if (refundResult && refundResult.success) {
        updateData.refundData = {
          refundId: refundResult.refundId,
          amount: refundResult.amount,
          status: refundResult.status,
          reason: 'Cancelación solicitada por cliente',
          requestedAt: new Date().toISOString(),
          processedAt: new Date().toISOString(),
        }
      }

      await db.collection('shipments').doc(shipmentId).update(updateData)

      console.log(`✅ Envío cancelado en Firestore: ${shipmentId}`)

      return {
        success: true,
        shipment: { id: shipmentId, ...data, status: 'cancelled', ...updateData },
        refund: refundResult,
      }
    } catch (error) {
      console.error('❌ Error en cancelShipment:', error)
      return { success: false, error: 'Error al cancelar envío' }
    }
  },

  /**
   * Obtener envío por orden ID
   */
  async getShipmentByOrderId(orderId) {
    try {
      if (!db) {
        return { success: false, error: 'Firestore no disponible' }
      }

      const snapshot = await db
        .collection('shipments')
        .where('orderId', '==', orderId)
        .limit(1)
        .get()

      if (snapshot.empty) {
        return { success: false, error: 'Envío no encontrado para esta orden' }
      }

      const doc = snapshot.docs[0]
      return {
        success: true,
        shipment: {
          id: doc.id,
          ...doc.data(),
        },
      }
    } catch (error) {
      console.error('❌ Error en getShipmentByOrderId:', error)
      return { success: false, error: 'Error al obtener envío' }
    }
  },

  /**
   * Actualizar envío con paymentId después de completado el pago
   */
  async updateShipmentPaymentId(orderId, paymentId) {
    try {
      if (!db) {
        return { success: false, error: 'Firestore no disponible' }
      }

      if (!orderId || !paymentId) {
        return { success: false, error: 'orderId y paymentId son requeridos' }
      }

      console.log(`💳 [SHIPMENT] Actualizando envío con paymentId: ${paymentId}`)

      const snapshot = await db
        .collection('shipments')
        .where('orderId', '==', orderId)
        .limit(1)
        .get()

      if (snapshot.empty) {
        console.warn(`⚠️  [SHIPMENT] No se encontró envío para orden: ${orderId}`)
        return { success: false, error: 'Envío no encontrado para esta orden' }
      }

      const doc = snapshot.docs[0]
      await doc.ref.update({
        paymentId,
        updatedAt: new Date().toISOString(),
      })

      console.log(`✅ [SHIPMENT] Envío actualizado con paymentId: ${paymentId}`)

      return {
        success: true,
        shipment: {
          id: doc.id,
          ...doc.data(),
          paymentId,
        },
      }
    } catch (error) {
      console.error('❌ Error en updateShipmentPaymentId:', error)
      return { success: false, error: 'Error al actualizar envío con paymentId' }
    }
  },
}

export default shipmentsService
