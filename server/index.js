import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { PORT } from './config/config.js';
import { db } from './config/firebase.js';
import paymentRoutes from './routes/payment.routes.js';
import cloudinaryRoutes from './routes/cloudinary.routes.js';
import shipmentsRoutes from './routes/shipments.routes.js';
import shipmentsService from './services/shipmentsService.js';

const app = express();

// Middlewares
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Ruta de debugging para verificar Firestore
app.get('/api/debug/firestore', (req, res) => {
  console.log('🔍 [DEBUG] Verificando estado de Firestore...');
  console.log('🔍 [DEBUG] db es null:', db === null);
  console.log('🔍 [DEBUG] db es undefined:', db === undefined);
  console.log('🔍 [DEBUG] Tipo de db:', typeof db);
  
  if (db) {
    return res.json({
      success: true,
      message: 'Firestore está disponible',
      db_available: true,
    });
  } else {
    return res.status(500).json({
      success: false,
      message: 'Firestore NO está disponible',
      db_available: false,
    });
  }
});

// Ruta para listar todos los envíos en Firestore (debugging)
app.get('/api/debug/shipments', async (req, res) => {
  try {
    if (!db) {
      return res.status(500).json({ error: 'Firestore no disponible' });
    }

    const snapshot = await db.collection('shipments').get();
    const shipments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({
      success: true,
      count: shipments.length,
      shipments,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Ruta para listar envíos de un usuario específico (debugging)
app.get('/api/debug/shipments/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!db) {
      return res.status(500).json({ error: 'Firestore no disponible' });
    }

    console.log(`🔍 [DEBUG] Buscando envíos para userId: ${userId}`);

    const snapshot = await db
      .collection('shipments')
      .where('userId', '==', userId)
      .get();

    console.log(`🔍 [DEBUG] Se encontraron ${snapshot.docs.length} envíos`);

    const shipments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.json({
      success: true,
      userId,
      count: shipments.length,
      shipments,
    });
  } catch (error) {
    console.error('🔍 [DEBUG] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Ruta de debug para capturar exactamente qué envía el frontend
app.post('/api/debug/payment-request', (req, res) => {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('🔍 [DEBUG] === SOLICITUD DE PAGO RECIBIDA ===');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Headers:', JSON.stringify(req.headers, null, 2));
  console.log('Body:', JSON.stringify(req.body, null, 2));
  console.log('═══════════════════════════════════════════════════════════');
  
  res.json({
    success: true,
    message: 'Solicitud capturada para debugging',
    receivedData: req.body,
  });
});

// Ruta de debug para SIMULAR el webhook y asociar paymentId a un envío
app.post('/api/debug/associate-payment', async (req, res) => {
  try {
    const { orderId, paymentId } = req.body;

    if (!orderId || !paymentId) {
      return res.status(400).json({
        success: false,
        error: 'orderId y paymentId son requeridos',
      });
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔗 [DEBUG] === ASOCIANDO PAYMENT ID A ENVÍO ===');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📝 Order ID: ${orderId}`);
    console.log(`💳 Payment ID: ${paymentId}`);

    const result = await shipmentsService.updateShipmentPaymentId(orderId, paymentId);

    console.log('═══════════════════════════════════════════════════════════');

    return res.json(result);
  } catch (error) {
    console.error('❌ [DEBUG] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Ruta de debug para CANCELAR un envío y procesar reembolso
app.post('/api/debug/cancel-and-refund', async (req, res) => {
  try {
    const { shipmentId } = req.body;

    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        error: 'shipmentId es requerido',
      });
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('❌ [DEBUG] === CANCELANDO ENVÍO Y PROCESANDO REEMBOLSO ===');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📝 Shipment ID: ${shipmentId}`);

    const result = await shipmentsService.cancelShipment(shipmentId);

    console.log('═══════════════════════════════════════════════════════════');

    return res.json(result);
  } catch (error) {
    console.error('❌ [DEBUG] Error:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Rutas con prefijo /api
app.use('/api', paymentRoutes);
app.use('/api', shipmentsRoutes);
app.use('/api/cloudinary', cloudinaryRoutes);

// Prevenida de archivos públicos (para desarrollo)
app.use(express.static('public'));

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor Mercado Pago ejecutándose en http://localhost:${PORT}`);
  console.log(`ℹ️  Asegúrate de configurar MP_ACCESS_TOKEN en .env`);
});
