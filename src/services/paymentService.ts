import type { CartItem, ShippingData } from '../types'

/**
 * Servicio para realizar pagos con Mercado Pago
 * NOTA: Las preferencias se crean directamente desde el cliente
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
   * @param total - Total con envío incluido (no usado - incluido para compatibilidad)
   * @param userId - ID del usuario (no usado - incluido para compatibilidad)
   * @returns URL de redirección a Mercado Pago o error
   */
  async createOrder(items: CartItem[], shippingData?: ShippingData, _total?: number, _userId?: string): Promise<CreateOrderResponse> {
    console.log('🆔 V3-2024-05-05-MERCADO-PAGO-DIRECT')
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

      console.log('🔄 Creando preferencia de Mercado Pago...')
      console.log('📊 Items:', orderItems)
      console.log('📍 Envío:', shippingData)

      const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      const appUrl = window.location.origin

      const preferenceData: any = {
        items: orderItems,
        external_reference: orderId,
        back_urls: {
          success: `${appUrl}/?payment=approved&order_id=${encodeURIComponent(orderId)}`,
          failure: `${appUrl}/payment-failure.html`,
          pending: `${appUrl}/payment-pending.html`,
        },
        notification_url: undefined, // Opcional - configurar webhook después
      }

      const isLocalhost = ['localhost', '127.0.0.1'].includes(window.location.hostname)

      if (!isLocalhost) {
        preferenceData.auto_return = 'approved'
      }

      // Agregar datos de envío si existen
      if (shippingData) {
        const nameParts = (shippingData.fullName || '').split(' ')
        preferenceData.payer = {
          name: nameParts[0] || 'Cliente',
          surname: nameParts.slice(1).join(' ') || 'Guitar Market',
          email: 'cliente@guitarmarket.mx',
          phone: {
            number: shippingData.phone.replace(/\D/g, ''),
          },
          address: {
            street_name: shippingData.street,
            street_number: 1,
            zip_code: shippingData.postalCode,
            city_name: shippingData.city,
            state_name: shippingData.state,
          },
        }
      }

      console.log('📤 Enviando a Mercado Pago:', preferenceData)

      // Realizar petición a Mercado Pago con el token del cliente
      const mpUrl = 'https://api.mercadopago.com/checkout/preferences'
      console.log('🌐 URL:', mpUrl)
      console.log('🔑 Token:', 'Bearer APP_USR-...' + 'aed5a78c67fd960cffd145f1397e93e1-3337978854'.slice(-20))
      
      const response = await fetch(mpUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer APP_USR-5293198813101462-041503-aed5a78c67fd960cffd145f1397e93e1-3337978854',
        },
        body: JSON.stringify(preferenceData),
      })

      console.log('📊 Response Status:', response.status, response.statusText)
      console.log('📋 Response Headers:', {
        'content-type': response.headers.get('content-type'),
        'x-request-id': response.headers.get('x-request-id'),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => null)
        console.error('❌ Error Mercado Pago:', response.status, errorData)
        
        // Si el token es inválido, mostrar mensaje específico
        if (response.status === 401) {
          return {
            success: false,
            error: 'Credenciales de Mercado Pago inválidas',
            details: 'Verifica que el token de acceso esté configurado correctamente',
          }
        }

        return {
          success: false,
          error: errorData?.message || 'Error al crear preferencia en Mercado Pago',
          details: `HTTP ${response.status}`,
        }
      }

      const mpResponse = await response.json()
      
      if (mpResponse.id && mpResponse.init_point) {
        console.log('🎉 Preferencia creada:', mpResponse.id)
        return {
          success: true,
          init_point: mpResponse.init_point,
          preference_id: mpResponse.id,
          order_id: orderId,
        }
      } else {
        return {
          success: false,
          error: 'No se recibió init_point de Mercado Pago',
          details: JSON.stringify(mpResponse),
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error en paymentService:', errorMessage)
      
      return {
        success: false,
        error: 'Error al procesar el pago',
        details: errorMessage,
      }
    }
  },
}
