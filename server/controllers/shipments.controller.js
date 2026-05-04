import shipmentsService from '../services/shipmentsService.js'

/**
 * GET /api/shipments/user/:userId
 * Obtener todos los envíos de un usuario
 */
export const getUserShipments = async (req, res) => {
  try {
    const { userId } = req.params
    const { limit = 50, status } = req.query

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'userId es requerido',
      })
    }

    const result = await shipmentsService.getUserShipments(userId)

    if (!result.success) {
      // Si no hay envíos pero es exitoso, retornar array vacío
      return res.json({
        success: true,
        shipments: result.shipments || [],
        count: 0,
      })
    }

    // Filtrar por estado si se especifica
    let shipments = result.shipments
    if (status) {
      shipments = shipments.filter(s => s.status === status)
    }

    // Limitar resultados
    shipments = shipments.slice(0, parseInt(limit))

    return res.json({
      success: true,
      shipments,
      count: shipments.length,
    })
  } catch (error) {
    console.error('❌ Error en getUserShipments:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener envíos del usuario',
    })
  }
}

/**
 * GET /api/shipments/:shipmentId
 * Obtener detalles de un envío específico
 */
export const getShipmentDetails = async (req, res) => {
  try {
    const { shipmentId } = req.params

    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        error: 'shipmentId es requerido',
      })
    }

    const result = await shipmentsService.getShipmentDetails(shipmentId)

    if (!result.success) {
      return res.status(404).json(result)
    }

    return res.json({
      success: true,
      shipment: result.shipment,
    })
  } catch (error) {
    console.error('❌ Error en getShipmentDetails:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener detalles del envío',
    })
  }
}

/**
 * GET /api/shipments/:shipmentId/tracking
 * Obtener información de rastreo
 */
export const getShipmentTracking = async (req, res) => {
  try {
    const { shipmentId } = req.params

    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        error: 'shipmentId es requerido',
      })
    }

    const result = await shipmentsService.getShipmentTracking(shipmentId)

    if (!result.success) {
      return res.status(404).json(result)
    }

    return res.json({
      success: true,
      ...result.tracking,
    })
  } catch (error) {
    console.error('❌ Error en getShipmentTracking:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener información de rastreo',
    })
  }
}

/**
 * POST /api/shipments
 * Crear un nuevo envío
 */
export const createShipment = async (req, res) => {
  try {
    const { orderId, userId, shippingData } = req.body

    if (!orderId || !userId) {
      return res.status(400).json({
        success: false,
        error: 'orderId y userId son requeridos',
      })
    }

    const result = await shipmentsService.createShipment(orderId, userId, shippingData)

    if (!result.success) {
      return res.status(400).json(result)
    }

    return res.status(201).json({
      success: true,
      shipment: result.shipment,
    })
  } catch (error) {
    console.error('❌ Error en createShipment:', error)
    res.status(500).json({
      success: false,
      error: 'Error al crear envío',
    })
  }
}

/**
 * PUT /api/shipments/:shipmentId
 * Actualizar estado de un envío
 */
export const updateShipment = async (req, res) => {
  try {
    const { shipmentId } = req.params
    const updates = req.body

    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        error: 'shipmentId es requerido',
      })
    }

    // Validar que los campos de actualización sean válidos
    const allowedUpdates = ['status', 'trackingNumber', 'carrier', 'estimatedDelivery', 'actualDelivery']
    const updateKeys = Object.keys(updates)
    const isValidUpdate = updateKeys.every(key => allowedUpdates.includes(key))

    if (!isValidUpdate) {
      return res.status(400).json({
        success: false,
        error: 'Campos de actualización no válidos',
        allowed: allowedUpdates,
      })
    }

    const result = await shipmentsService.updateShipment(shipmentId, updates)

    if (!result.success) {
      return res.status(404).json(result)
    }

    return res.json({
      success: true,
      shipment: result.shipment,
    })
  } catch (error) {
    console.error('❌ Error en updateShipment:', error)
    res.status(500).json({
      success: false,
      error: 'Error al actualizar envío',
    })
  }
}

/**
 * POST /api/shipments/:shipmentId/cancel
 * Cancelar un envío
 */
export const cancelShipment = async (req, res) => {
  try {
    const { shipmentId } = req.params

    if (!shipmentId) {
      return res.status(400).json({
        success: false,
        error: 'shipmentId es requerido',
      })
    }

    const result = await shipmentsService.cancelShipment(shipmentId)

    if (!result.success) {
      return res.status(400).json(result)
    }

    return res.json({
      success: true,
      shipment: result.shipment,
    })
  } catch (error) {
    console.error('❌ Error en cancelShipment:', error)
    res.status(500).json({
      success: false,
      error: 'Error al cancelar envío',
    })
  }
}

/**
 * GET /api/shipments/order/:orderId
 * Obtener envío por ID de orden
 */
export const getShipmentByOrderId = async (req, res) => {
  try {
    const { orderId } = req.params

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId es requerido',
      })
    }

    const result = await shipmentsService.getShipmentByOrderId(orderId)

    if (!result.success) {
      return res.status(404).json(result)
    }

    return res.json({
      success: true,
      shipment: result.shipment,
    })
  } catch (error) {
    console.error('❌ Error en getShipmentByOrderId:', error)
    res.status(500).json({
      success: false,
      error: 'Error al obtener envío',
    })
  }
}
