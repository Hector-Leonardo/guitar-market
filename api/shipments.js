import { getFirestore } from './lib/firebase.js';

async function handleShipmentsEndpoint(req, res) {
  const db = getFirestore();

  if (!db) {
    return res.status(500).json({
      success: false,
      error: 'Base de datos no disponible',
    });
  }

  const { method, url } = req;
  const path = url.replace('/api/shipments', '').split('?')[0];

  try {
    // GET /api/shipments/user/:userId
    const userShipmentsMatch = path.match(/^\/user\/([^\/]+)$/);
    if (method === 'GET' && userShipmentsMatch) {
      const userId = userShipmentsMatch[1];

      const snapshot = await db.collection('shipments').where('userId', '==', userId).get();
      const shipments = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      return res.status(200).json({
        success: true,
        shipments,
      });
    }

    // GET /api/shipments/order/:orderId
    const orderShipmentsMatch = path.match(/^\/order\/([^\/]+)$/);
    if (method === 'GET' && orderShipmentsMatch) {
      const orderId = orderShipmentsMatch[1];

      const snapshot = await db.collection('shipments').where('orderId', '==', orderId).get();

      if (snapshot.empty) {
        return res.status(404).json({
          success: false,
          error: 'Envío no encontrado',
        });
      }

      const shipment = {
        id: snapshot.docs[0].id,
        ...snapshot.docs[0].data(),
      };

      return res.status(200).json({
        success: true,
        shipment,
      });
    }

    // GET /api/shipments/:shipmentId
    const detailsMatch = path.match(/^\/([^\/]+)$/);
    if (method === 'GET' && detailsMatch) {
      const shipmentId = detailsMatch[1];

      // Validar que no sea una subruta
      if (shipmentId === 'user' || shipmentId === 'order') {
        return res.status(404).json({
          success: false,
          error: 'Endpoint no encontrado',
        });
      }

      const shipmentDoc = await db.collection('shipments').doc(shipmentId).get();

      if (!shipmentDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Envío no encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        shipment: {
          id: shipmentId,
          ...shipmentDoc.data(),
        },
      });
    }

    // GET /api/shipments/:shipmentId/tracking
    const trackingMatch = path.match(/^\/([^\/]+)\/tracking$/);
    if (method === 'GET' && trackingMatch) {
      const shipmentId = trackingMatch[1];

      const shipmentDoc = await db.collection('shipments').doc(shipmentId).get();

      if (!shipmentDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Envío no encontrado',
        });
      }

      const shipment = shipmentDoc.data();

      return res.status(200).json({
        success: true,
        tracking: {
          status: shipment.status,
          trackingNumber: shipment.trackingNumber || 'N/A',
          carrier: shipment.carrier || 'N/A',
          estimatedDelivery: shipment.estimatedDelivery || 'N/A',
          actualDelivery: shipment.actualDelivery || null,
          history: shipment.trackingHistory || [],
        },
      });
    }

    // POST /api/shipments - Crear envío
    if (method === 'POST' && path === '') {
      const { orderId, userId, shippingData } = req.body;

      if (!orderId || !userId) {
        return res.status(400).json({
          success: false,
          error: 'orderId y userId son requeridos',
        });
      }

      const shipmentId = `shipment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const shipmentData = {
        id: shipmentId,
        orderId,
        userId,
        shippingData: shippingData || {},
        status: 'pending',
        trackingNumber: null,
        carrier: null,
        estimatedDelivery: null,
        actualDelivery: null,
        trackingHistory: [
          {
            status: 'pending',
            timestamp: new Date().toISOString(),
            message: 'Envío creado',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection('shipments').doc(shipmentId).set(shipmentData);

      return res.status(201).json({
        success: true,
        shipment: shipmentData,
        message: 'Envío creado exitosamente',
      });
    }

    // PUT /api/shipments/:shipmentId - Actualizar envío
    const updateMatch = path.match(/^\/([^\/]+)$/);
    if (method === 'PUT' && updateMatch && !path.includes('/tracking')) {
      const shipmentId = updateMatch[1];
      const { status, trackingNumber, carrier, estimatedDelivery, actualDelivery } = req.body;

      const shipmentRef = db.collection('shipments').doc(shipmentId);
      const shipmentDoc = await shipmentRef.get();

      if (!shipmentDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Envío no encontrado',
        });
      }

      const shipmentData = shipmentDoc.data();
      const history = shipmentData.trackingHistory || [];

      if (status && status !== shipmentData.status) {
        history.push({
          status,
          timestamp: new Date().toISOString(),
          message: `Estado cambiado a: ${status}`,
        });
      }

      const updatedData = {
        ...shipmentData,
        status: status || shipmentData.status,
        trackingNumber: trackingNumber || shipmentData.trackingNumber,
        carrier: carrier || shipmentData.carrier,
        estimatedDelivery: estimatedDelivery || shipmentData.estimatedDelivery,
        actualDelivery: actualDelivery || shipmentData.actualDelivery,
        trackingHistory: history,
        updatedAt: new Date().toISOString(),
      };

      await shipmentRef.set(updatedData);

      return res.status(200).json({
        success: true,
        shipment: updatedData,
        message: 'Envío actualizado',
      });
    }

    // POST /api/shipments/:shipmentId/cancel
    const cancelMatch = path.match(/^\/([^\/]+)\/cancel$/);
    if (method === 'POST' && cancelMatch) {
      const shipmentId = cancelMatch[1];

      const shipmentRef = db.collection('shipments').doc(shipmentId);
      const shipmentDoc = await shipmentRef.get();

      if (!shipmentDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Envío no encontrado',
        });
      }

      const shipmentData = shipmentDoc.data();
      const history = shipmentData.trackingHistory || [];

      history.push({
        status: 'cancelled',
        timestamp: new Date().toISOString(),
        message: 'Envío cancelado',
      });

      const updatedData = {
        ...shipmentData,
        status: 'cancelled',
        trackingHistory: history,
        updatedAt: new Date().toISOString(),
      };

      await shipmentRef.set(updatedData);

      return res.status(200).json({
        success: true,
        shipment: updatedData,
        message: 'Envío cancelado',
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Endpoint no encontrado',
    });
  } catch (error) {
    console.error('❌ Error en shipments API:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return handleShipmentsEndpoint(req, res);
}
