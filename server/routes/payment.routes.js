import { Router } from 'express';
import { createOrder, receiveWebhook, getPaymentInfo } from '../controllers/payment.controller.js';
import { getOrders, getOrderById } from '../controllers/orders.controller.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = Router();

// ========== PAGOS ==========

// Ruta POST para crear una orden
router.post('/create-order', createOrder);

// Ruta GET para obtener información del pago (nuevo endpoint para asociar paymentId)
router.get('/payment-info/:preferenceId', getPaymentInfo);

// Ruta GET para recibir el éxito del pago - Sirve el archivo HTML
router.get('/success', (req, res) => {
  const successPagePath = path.join(__dirname, '../../public/payment-success.html');
  res.sendFile(successPagePath);
});

// Ruta GET para recibir el fracaso del pago - Sirve el archivo HTML
router.get('/failure', (req, res) => {
  const failurePagePath = path.join(__dirname, '../../public/payment-failure.html');
  res.sendFile(failurePagePath);
});

// Ruta GET para recibir el estado pendiente del pago
router.get('/pending', (req, res) => {
  res.json({
    success: false,
    message: 'El pago está pendiente de confirmación.',
    paymentId: req.query.payment_id || null,
  });
});

// Ruta GET/POST para recibir webhooks (Mercado Pago envía notificaciones)
router.get('/webhook', receiveWebhook);
router.post('/webhook', receiveWebhook);

// ========== ÓRDENES ==========

// Ruta GET para obtener todas las órdenes (admin)
router.get('/orders', getOrders);

// Ruta GET para obtener una orden específica
router.get('/orders/:orderId', getOrderById);

export default router;

