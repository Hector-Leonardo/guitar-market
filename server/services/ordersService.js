import { db } from '../config/firebase.js';
import shipmentsService from './shipmentsService.js';

/**
 * Servicio para gestionar órdenes en Firestore
 */

export const ordersService = {
  /**
   * Crear una nueva orden en Firestore
   * También crea automáticamente un envío asociado a la orden
   */
  async createOrder(orderData) {
    try {
      if (!db) {
        console.warn('⚠️  Firestore no está disponible. Orden no se guardará en BD.');
        return {
          success: false,
          warning: 'Base de datos no disponible',
          order: orderData,
        };
      }

      const {
        orderId,
        preferenceId,
        items,
        total,
        status = 'pending',
        userId = null,
        email = null,
        shippingData = null,
        metadata = {},
      } = orderData;

      // Crear documento de la orden
      const orderDoc = {
        orderId,
        preferenceId,
        items,
        total,
        status, // pending, approved, rejected, canceled
        userId,
        email,
        shippingData,
        metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Guardar en Firestore
      const docRef = await db.collection('orders').add(orderDoc);

      console.log('✅ Orden guardada en Firestore:', docRef.id);

      // 📦 Crear envío automáticamente si hay userId y shippingData
      let shipmentResult = null;
      if (userId && shippingData) {
        console.log('📦 [ÓRDENES] Creando envío asociado a la orden...');
        shipmentResult = await shipmentsService.createShipment(orderId, userId, shippingData, metadata?.paymentId || null);
        
        if (shipmentResult.success) {
          console.log('✅ [ÓRDENES] Envío creado automáticamente:', shipmentResult.shipment.id);
        } else {
          console.warn('⚠️  [ÓRDENES] No se pudo crear envío automáticamente:', shipmentResult.error);
        }
      }

      return {
        success: true,
        orderId,
        firestoreId: docRef.id,
        order: orderDoc,
        shipment: shipmentResult?.shipment || null,
      };
    } catch (error) {
      console.error('❌ Error al guardar orden:', error);
      return {
        success: false,
        error: 'Error al guardar la orden',
        details: error.message,
      };
    }
  },

  /**
   * Actualizar el estado de una orden
   */
  async updateOrderStatus(orderId, status, paymentData = {}) {
    try {
      if (!db) {
        console.warn('⚠️  Firestore no está disponible. Estado no se actualizará.');
        return { success: false, warning: 'Base de datos no disponible' };
      }

      // Buscar la orden por orderId
      const snapshot = await db
        .collection('orders')
        .where('orderId', '==', orderId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        console.warn(`⚠️  Orden ${orderId} no encontrada en Firestore`);
        return { success: false, error: 'Orden no encontrada' };
      }

      const docRef = snapshot.docs[0].ref;

      // Actualizar documento
      await docRef.update({
        status,
        paymentData: {
          ...paymentData,
          updatedAt: new Date(),
        },
        updatedAt: new Date(),
      });

      console.log(`✅ Orden ${orderId} actualizada a ${status}`);

      return {
        success: true,
        orderId,
        status,
      };
    } catch (error) {
      console.error('❌ Error al actualizar orden:', error);
      return {
        success: false,
        error: 'Error al actualizar la orden',
        details: error.message,
      };
    }
  },

  /**
   * Obtener una orden por ID
   */
  async getOrder(orderId) {
    try {
      if (!db) {
        return { success: false, warning: 'Base de datos no disponible' };
      }

      const snapshot = await db
        .collection('orders')
        .where('orderId', '==', orderId)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return { success: false, error: 'Orden no encontrada' };
      }

      const order = snapshot.docs[0].data();
      return {
        success: true,
        order,
      };
    } catch (error) {
      console.error('❌ Error al obtener orden:', error);
      return {
        success: false,
        error: 'Error al obtener la orden',
        details: error.message,
      };
    }
  },

  /**
   * Obtener órdenes de un usuario
   */
  async getUserOrders(userId) {
    try {
      if (!db) {
        return { success: false, warning: 'Base de datos no disponible', orders: [] };
      }

      const snapshot = await db
        .collection('orders')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();

      const orders = snapshot.docs.map((doc) => ({
        ...doc.data(),
        firestoreId: doc.id,
      }));

      return {
        success: true,
        orders,
        count: orders.length,
      };
    } catch (error) {
      console.error('❌ Error al obtener órdenes del usuario:', error);
      return {
        success: false,
        error: 'Error al obtener órdenes',
        details: error.message,
        orders: [],
      };
    }
  },
};

export default ordersService;
