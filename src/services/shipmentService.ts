import type { Shipment, ShipmentListItem, ShipmentUpdate } from '../types'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

export const shipmentService = {
  /**
   * Obtener todos los envíos del usuario actual
   */
  async getUserShipments(userId: string): Promise<ShipmentListItem[]> {
    try {
      const response = await fetch(`${API_URL}/shipments/user/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al obtener envíos')
      }

      const data = await response.json()
      return data.shipments || []
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
      const response = await fetch(`${API_URL}/shipments/${shipmentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al obtener detalles del envío')
      }

      const data = await response.json()
      return data.shipment
    } catch (error) {
      console.error('Error en getShipmentDetails:', error)
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
      const response = await fetch(`${API_URL}/shipments/${shipmentId}/tracking`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al obtener información de rastreo')
      }

      return await response.json()
    } catch (error) {
      console.error('Error en getShipmentTracking:', error)
      throw error
    }
  },

  /**
   * Crear un nuevo envío (generalmente llamado automáticamente al crear una orden)
   */
  async createShipment(orderId: string, userId: string): Promise<Shipment> {
    try {
      const response = await fetch(`${API_URL}/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Error al crear envío')
      }

      return await response.json()
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
      const response = await fetch(`${API_URL}/shipments/${shipmentId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      })

      if (!response.ok) {
        throw new Error('Error al actualizar envío')
      }

      return await response.json()
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
      const response = await fetch(`${API_URL}/shipments/${shipmentId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error al cancelar envío')
      }

      return await response.json()
    } catch (error) {
      console.error('Error en cancelShipment:', error)
      throw error
    }
  },
}
