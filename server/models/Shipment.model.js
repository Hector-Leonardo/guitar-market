/**
 * Shipment Model
 * Estructura para almacenar información de envíos
 * 
 * En Firestore se almacena en colección: shipments
 * En SQL se almacena en tabla: shipments
 */

const ShipmentModel = {
  // Identificador único del envío (UUID)
  id: 'string',

  // Referencias a orden y usuario
  orderId: 'string', // ID de la orden relacionada
  userId: 'string', // ID del usuario propietario

  // Datos de envío (copia de ShippingData)
  shippingData: {
    fullName: 'string',
    phone: 'string',
    street: 'string',
    apartment: 'string (opcional)',
    city: 'string',
    state: 'string',
    postalCode: 'string',
    shippingMethod: 'standard | express | overnight',
  },

  // Estado del envío
  status: 'pending | processing | shipped | in_transit | delivered | cancelled',

  // Información de rastreo
  trackingNumber: 'string (opcional)',
  carrier: 'estafeta | dhl | fedex | manual (opcional)',

  // Fechas
  estimatedDelivery: 'ISO string (opcional)',
  actualDelivery: 'ISO string (opcional)',
  createdAt: 'ISO string',
  updatedAt: 'ISO string',
}

/**
 * Índices recomendados en Firestore:
 * - userId + status (para listar envíos pendientes de un usuario)
 * - orderId (para encontrar envío por orden)
 * - createdAt (para ordenar cronológicamente)
 * 
 * En SQL:
 * - PRIMARY KEY: id
 * - FOREIGN KEY: orderId -> orders(id)
 * - FOREIGN KEY: userId -> users(id)
 * - INDEX: (userId, status)
 * - INDEX: (orderId)
 * - INDEX: (trackingNumber) UNIQUE
 */

module.exports = ShipmentModel
