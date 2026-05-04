import { MercadoPagoConfig, Preference, Payment } from 'mercadopago';
import { MP_ACCESS_TOKEN, APP_URL } from '../config/config.js';
import ordersService from '../services/ordersService.js';
import shipmentsService from '../services/shipmentsService.js';

// Verificar que el token de acceso esté disponible
if (!MP_ACCESS_TOKEN) {
  console.error('⚠️ Error: No se ha configurado MP_ACCESS_TOKEN en las variables de entorno');
  console.error('Por favor, configura esta variable con tu token de acceso de Mercado Pago');
}

// Configurar MercadoPago con el token de acceso
const client = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN || 'TEST-PLACEHOLDER-TOKEN',
});

/**
 * Crear una orden de pago en Mercado Pago
 * Recibe items del carrito, datos de envío y retorna init_point para redirigir
 */
export const createOrder = async (req, res) => {
  try {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔄 [CREATE_ORDER] === SOLICITUD DE ORDEN RECIBIDA ===');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('Headers:', req.headers);
    console.log('Body (completo):', JSON.stringify(req.body, null, 2));
    
    if (!MP_ACCESS_TOKEN) {
      console.error('❌ [CREATE_ORDER] MP_ACCESS_TOKEN no configurado');
      return res.status(500).json({
        success: false,
        error: 'Token de Mercado Pago no configurado',
        details: 'Configura la variable de entorno MP_ACCESS_TOKEN en .env',
      });
    }

    console.log('✅ [CREATE_ORDER] Token de MP detectado:', MP_ACCESS_TOKEN.substring(0, 20) + '...');
    console.log('📍 [CREATE_ORDER] APP_URL:', APP_URL);

    // Obtener datos del carrito y envío del request
    const { items, userId, shippingData, total } = req.body || {};

    console.log('📦 [CREATE_ORDER] Items recibidos:', items?.length || 0);
    if (items && items.length > 0) {
      console.log('📦 [CREATE_ORDER] Detalles items:');
      items.forEach((item, idx) => {
        console.log(`   Item ${idx}:`, {
          title: item.title,
          unit_price: item.unit_price,
          quantity: item.quantity,
          currency_id: item.currency_id,
        });
      });
    }
    console.log('👤 [CREATE_ORDER] User ID:', userId || 'NO PROPORCIONADO');
    console.log('📍 [CREATE_ORDER] Datos de envío:', shippingData ? 'Sí' : 'No');
    console.log('💰 [CREATE_ORDER] Total:', total);

    // Validar que haya items
    if (!items || items.length === 0) {
      console.error('❌ [CREATE_ORDER] Carrito vacío - Rechazando solicitud');
      return res.status(400).json({
        success: false,
        error: 'El carrito está vacío',
        details: 'No se puede crear una orden sin productos',
      });
    }

    // Generar un ID de orden único
    const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    console.log('🆕 [CREATE_ORDER] Nuevo ID de orden:', orderId);

    // Usar el total proporcionado (que incluye envío) o calcular
    const orderTotal = total || items.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    console.log('💰 [CREATE_ORDER] Total calculado:', orderTotal);
    console.log('🔐 [CREATE_ORDER] Creando preferencia en Mercado Pago...');
    console.log('Items detalle:', JSON.stringify(items, null, 2))

    try {
      // Crear un objeto de preferencia
      const preference = new Preference(client);

      // Estructura mejorada para Mercado Pago
      // Usar solo URLs públicas o ninguna para desarrollo local
      const isLocalhost = APP_URL.includes('localhost') || APP_URL.includes('127.0.0.1');
      
      const preferenceData = {
        body: {
          items: items.map(item => ({
            title: item.title,
            unit_price: Number(item.unit_price),
            quantity: Number(item.quantity),
            currency_id: item.currency_id || 'MXN',
          })),
          // Solo agregar back_urls si no es localhost
          ...(isLocalhost ? {} : {
            back_urls: {
              success: `${APP_URL}/api/success?order_id=${orderId}`,
              failure: `${APP_URL}/api/failure?order_id=${orderId}`,
              pending: `${APP_URL}/api/pending?order_id=${orderId}`,
            },
          }),
          notification_url: isLocalhost ? undefined : `${APP_URL}/api/webhook`,
          external_reference: orderId,
        },
      };

      // Agregar información de envío si está disponible
      if (shippingData) {
        const nameParts = (shippingData.fullName || '').split(' ');
        preferenceData.body.payer = {
          name: nameParts[0] || 'Cliente',
          surname: nameParts.slice(1).join(' ') || 'GuitarMarket',
          phone: {
            number: shippingData.phone.replace(/\D/g, ''),
          },
          address: {
            street_name: shippingData.street,
            street_number: 1,
            zip_code: shippingData.postalCode,
          },
        };
        console.log('✅ [CREATE_ORDER] Información de pago agregada');
      }

      console.log('📋 [CREATE_ORDER] Estructura enviada a MP:', JSON.stringify(preferenceData, null, 2))

      const result = await preference.create(preferenceData);

      console.log('✅ [CREATE_ORDER] Preferencia creada exitosamente');
      console.log('🔗 [CREATE_ORDER] URL de pago:', result.init_point);
      console.log('📝 [CREATE_ORDER] ID de preferencia:', result.id);
      console.log('🛒 [CREATE_ORDER] ID de orden:', orderId);

      // 💾 Guardar la orden en Firestore (estado: pending)
      console.log('💾 [CREATE_ORDER] Guardando orden en Firestore...')
      const saveResult = await ordersService.createOrder({
        orderId,
        preferenceId: result.id,
        items,
        total: orderTotal,
        status: 'pending',
        userId,
        shippingData: shippingData || null,
        metadata: {
          source: 'guitarmarket-checkout',
          userAgent: req.headers['user-agent'],
          shippingMethod: shippingData?.shippingMethod || null,
        },
      });

      if (saveResult.success) {
        console.log('✅ [CREATE_ORDER] Orden guardada en Firestore')
      } else {
        console.warn('⚠️ [CREATE_ORDER] No se pudo guardar en Firestore, pero continúa el flujo de pago');
      }

      console.log('✅ [CREATE_ORDER] Enviando respuesta al cliente')

      // Devolver la URL de pago al cliente
      res.json({
        success: true,
        init_point: result.init_point,
        preference_id: result.id,
        order_id: orderId,
      });

    } catch (mpError) {
      console.error('❌ [CREATE_ORDER] Error de Mercado Pago:');
      console.error('  Tipo:', mpError.constructor.name);
      console.error('  Mensaje:', mpError.message);
      console.error('  Response:', mpError.response);
      console.error('  Stack:', mpError.stack);

      throw mpError;
    }

  } catch (error) {
    console.error('❌ [CREATE_ORDER] === EXCEPCIÓN EN EL SERVIDOR ===');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    console.error('Error response:', error.response?.data || 'N/A');
    console.error('Error stack:', error.stack);

    let errorMessage = 'Error al crear la orden';
    let errorDetails = error.message;

    if (error.message.includes('invalid access token') || error.message.includes('unauthorized')) {
      errorMessage = 'Token de acceso inválido o expirado';
      errorDetails = 'El token de Mercado Pago no es válido. Verifica tu MP_ACCESS_TOKEN en .env';
    } else if (error.message.includes('back_urls') || error.message.includes('back_url')) {
      errorMessage = 'Error en la configuración de URLs de retorno';
      errorDetails = `Mercado Pago rechazó las URLs: ${APP_URL}/api/success`;
    }

    return res.status(500).json({
      success: false,
      error: errorMessage,
      details: errorDetails,
    });
  }
};

/**
 * Manejar webhooks de Mercado Pago
 * Se ejecuta cuando hay cambios en el estado de pagos
 */
export const receiveWebhook = async (req, res) => {
  try {
    console.log('🔔 Webhook recibido');
    console.log('Query:', req.query);
    console.log('Body:', req.body);

    // Determinar el tipo de notificación
    let notificationType;
    let resourceId;

    // Verificar si es una notificación de pago
    if (req.query.type === 'payment' && req.body.data && req.body.data.id) {
      notificationType = 'payment';
      resourceId = req.body.data.id;
    }
    // Verificar si es una notificación de merchant_order
    else if (req.query.topic === 'merchant_order' && req.query.id) {
      notificationType = 'merchant_order';
      resourceId = req.query.id;
    }
    // Otros tipos de notificaciones
    else if (req.body.type === 'payment' && req.body.data && req.body.data.id) {
      notificationType = 'payment';
      resourceId = req.body.data.id;
    }

    console.log(`Tipo de notificación: ${notificationType}, ID: ${resourceId}`);

    if (!notificationType || !resourceId) {
      console.log('Tipo de notificación no manejado:', notificationType);
      return res.status(200).send('OK - No procesado');
    }

    // Procesar según el tipo de notificación
    if (notificationType === 'payment') {
      try {
        // Obtener información del pago
        const paymentApi = new Payment(client);
        const paymentInfo = await paymentApi.get({ id: resourceId });

        console.log('💰 Información del pago recibida:');
        console.log('Estado:', paymentInfo.status);
        console.log('Monto:', paymentInfo.transaction_amount);
        console.log('ID de orden externa:', paymentInfo.external_reference);

        // 💾 ACTUALIZAR ORDEN EN FIRESTORE
        if (paymentInfo.external_reference) {
          const updateResult = await ordersService.updateOrderStatus(
            paymentInfo.external_reference,
            paymentInfo.status, // approved, rejected, pending, cancelled
            {
              paymentId: resourceId,
              transactionAmount: paymentInfo.transaction_amount,
              currency: paymentInfo.currency_id,
              paymentMethod: paymentInfo.payment_method_id,
              paymentStatus: paymentInfo.status,
            }
          );

          if (updateResult.success) {
            console.log('✅ Orden actualizada en Firestore');
          } else {
            console.warn('⚠️  No se pudo actualizar la orden:', updateResult.error);
          }

          // 💳 ACTUALIZAR ENVÍO CON PAYMENT_ID si el pago fue aprobado
          if (paymentInfo.status === 'approved') {
            console.log('💳 [WEBHOOK] Pago aprobado, actualizando envío con paymentId...');
            const shipmentUpdateResult = await shipmentsService.updateShipmentPaymentId(
              paymentInfo.external_reference,
              resourceId
            );

            if (shipmentUpdateResult.success) {
              console.log('✅ [WEBHOOK] Envío actualizado con paymentId');
            } else {
              console.warn('⚠️  [WEBHOOK] No se pudo actualizar envío:', shipmentUpdateResult.error);
            }
          }

          // TODO: Aquí enviarías emails de confirmación
          // await emailService.sendConfirmation(paymentInfo.payer.email, ...)
        }

        return res.status(200).send('OK');
      } catch (error) {
        console.error('❌ Error al procesar el pago:', error);
        return res.status(200).send('Error procesando pago');
      }
    } else if (notificationType === 'merchant_order') {
      console.log('📦 Orden de comerciante recibida:', resourceId);
      return res.status(200).send('OK');
    }

    return res.status(200).send('OK - Tipo no manejado');
  } catch (error) {
    console.error('Error en el webhook:', error);
    // Siempre responder con 200 para que Mercado Pago no reintente
    return res.status(200).send('Error');
  }
};

/**
 * Obtener información del pago y asociar paymentId con la orden
 * Se usa cuando el usuario vuelve de Mercado Pago después de completar el pago
 */
export const getPaymentInfo = async (req, res) => {
  try {
    const { preferenceId } = req.params;

    console.log('═══════════════════════════════════════════════════════════');
    console.log('💳 [PAYMENT_INFO] === OBTENIENDO INFORMACIÓN DEL PAGO ===');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`📝 Preference ID: ${preferenceId}`);

    if (!preferenceId) {
      return res.status(400).json({
        success: false,
        error: 'preferenceId es requerido',
      });
    }

    if (!MP_ACCESS_TOKEN) {
      return res.status(500).json({
        success: false,
        error: 'Token de Mercado Pago no configurado',
      });
    }

    // Crear instancia de API de Mercado Pago
    const preference = new Preference(client);

    // Obtener información de la preferencia (que contiene los pagos)
    console.log('🔍 [PAYMENT_INFO] Buscando pagos para la preferencia...');
    
    // Usar Payment API para buscar pagos por external_reference
    // Esto requiere hacer una búsqueda por el ID de preferencia
    try {
      const paymentApi = new Payment(client);
      
      // Intentar obtener información de pagos asociados a esta preferencia
      // Nota: Mercado Pago no proporciona un endpoint directo para obtener pagos por preference_id
      // Por lo que usaremos una búsqueda más amplia y filtraremos manualmente
      
      console.log('⚠️  [PAYMENT_INFO] Nota: Mercado Pago requiere ngrok o un webhook para confirmar pagos automáticamente');
      console.log('📚 [PAYMENT_INFO] Para desarrollo local, use ngrok: ngrok http 3000');
      console.log('🔧 [PAYMENT_INFO] Configure el webhook en: https://www.mercadopago.com/settings/api');
      
      return res.json({
        success: true,
        message: 'Para completar automáticamente el pago, configure ngrok y el webhook',
        note: 'Use el endpoint POST /api/debug/associate-payment para pruebas locales',
        preferenceId: preferenceId,
      });
    } catch (error) {
      console.error('❌ [PAYMENT_INFO] Error:', error.message);
      return res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  } catch (error) {
    console.error('❌ [PAYMENT_INFO] Error general:', error.message);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

