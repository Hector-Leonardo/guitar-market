import type { CartItem, ShippingData } from '../types'

/**
 * Servicio para realizar pagos con Mercado Pago
 * Se comunica con el backend en /api/create-order
 */

interface CreateOrderResponse {
  success: boolean
  init_point?: string
  preference_id?: string
  order_id?: string
  error?: string
  details?: string
}

export const paymentService = {
  /**
   * Crea una orden de pago y obtiene el link de redirección a Mercado Pago
   * @param items - Items del carrito
   * @param shippingData - Datos de envío del cliente
   * @param total - Total con envío incluido
   * @param userId - ID del usuario (opcional)
   * @returns URL de redirección a Mercado Pago o error
   */
  async createOrder(items: CartItem[], shippingData?: ShippingData, total?: number, userId?: string): Promise<CreateOrderResponse> {
    try {
      // Validar que haya items
      if (!items || items.length === 0) {
        return {
          success: false,
          error: 'El carrito está vacío',
          details: 'Agrega productos antes de proceder al pago',
        }
      }

      // Convertir items del carrito al formato de Mercado Pago
      const orderItems = items.map((item) => ({
        title: item.name,
        unit_price: item.price,
        quantity: item.quantity,
        currency_id: 'MXN',
      }))

      console.log('🔄 Conectando con el servidor de pagos...')
      console.log('📊 Items a enviar:', orderItems)
      console.log('📍 Datos de envío:', shippingData)
      console.log('💰 Total con envío:', total)

      // Realizar petición al backend
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: orderItems,
          userId: userId,
          shippingData: shippingData,
          total: total,
        }),
      })

      // Verificar que la respuesta sea OK
      if (!response.ok) {
        console.error(`❌ Error HTTP ${response.status}: ${response.statusText}`)
        
        // Intentar leer el error del servidor
        let errorData
        try {
          errorData = await response.json()
        } catch {
          errorData = null
        }

        throw new Error(
          errorData?.error ||
          `El servidor respondió con error: ${response.status} ${response.statusText}`
        )
      }

      console.log('✅ Respuesta del servidor recibida')

      const data: CreateOrderResponse = await response.json()

      if (data.success && data.init_point) {
        console.log('🎉 Orden creada exitosamente en Mercado Pago')
        return {
          success: true,
          init_point: data.init_point,
          preference_id: data.preference_id,
          order_id: data.order_id,
        }
      } else {
        console.error('❌ Error del servidor:', data.error)
        return {
          success: false,
          error: data.error || 'Error al crear la orden',
          details: data.details,
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error en paymentService:', errorMessage)
      
      // Detectar si es un problema de conexión
      let userMessage = 'Error de conexión'
      if (errorMessage.includes('Failed to fetch')) {
        userMessage = 'No se pudo conectar con el servidor. Verifica que esté ejecutándose'
      } else if (errorMessage.includes('HTTP 500')) {
        userMessage = 'Error en el servidor. Por favor, intenta de nuevo'
      } else if (errorMessage.includes('HTTP 400')) {
        userMessage = 'Datos inválidos en la solicitud'
      } else if (errorMessage.includes('socket hang up')) {
        userMessage = 'Conexión perdida con el servidor'
      }

      return {
        success: false,
        error: userMessage,
        details: errorMessage,
      }
    }
  },

  /**
   * Obtiene el estado de un pago
   * @param paymentId - ID del pago de Mercado Pago
   */
  async getPaymentStatus(paymentId: string) {
    try {
      const response = await fetch(`/api/payment-status?payment_id=${paymentId}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      console.error('Error al verificar estado del pago:', error)
      return {
        success: false,
        error: 'Error de conexión',
      }
    }
  },
}
