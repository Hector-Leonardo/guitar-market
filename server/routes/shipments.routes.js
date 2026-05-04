import { Router } from 'express'
import {
  getUserShipments,
  getShipmentDetails,
  getShipmentTracking,
  createShipment,
  updateShipment,
  cancelShipment,
  getShipmentByOrderId,
} from '../controllers/shipments.controller.js'

const router = Router()

/**
 * Rutas de Gestión de Envíos
 */

// Obtener envíos de un usuario
router.get('/shipments/user/:userId', getUserShipments)

// Obtener envío por ID de orden
router.get('/shipments/order/:orderId', getShipmentByOrderId)

// Obtener detalles de un envío
router.get('/shipments/:shipmentId', getShipmentDetails)

// Obtener información de rastreo
router.get('/shipments/:shipmentId/tracking', getShipmentTracking)

// Crear un nuevo envío
router.post('/shipments', createShipment)

// Actualizar envío (estado, tracking, etc)
router.put('/shipments/:shipmentId', updateShipment)

// Cancelar envío
router.post('/shipments/:shipmentId/cancel', cancelShipment)

export default router
