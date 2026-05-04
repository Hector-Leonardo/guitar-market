import { Payment } from 'mercadopago';
import { MercadoPagoConfig } from 'mercadopago';
import { MP_ACCESS_TOKEN } from '../config/config.js';

const client = new MercadoPagoConfig({
  accessToken: MP_ACCESS_TOKEN || 'TEST-PLACEHOLDER-TOKEN',
});

/**
 * Servicio para gestionar reembolsos de Mercado Pago
 */
const refundsService = {
  /**
   * Procesar reembolso a través de Mercado Pago
   * @param {string} paymentId - ID del pago en Mercado Pago
   * @param {number} amount - Monto a reembolsar (opcional, si no se proporciona, reembolsa todo)
   * @param {string} reason - Razón del reembolso
   * @returns {object} Resultado del reembolso
   */
  async processRefund(paymentId, amount = null, reason = 'Cancelación de pedido solicitada por el cliente') {
    try {
      console.log('═══════════════════════════════════════');
      console.log('🔄 [REFUND] ===== INICIANDO REEMBOLSO =====');
      console.log('═══════════════════════════════════════');
      
      if (!MP_ACCESS_TOKEN) {
        console.error('❌ [REFUND] MP_ACCESS_TOKEN no configurado');
        console.error('❌ [REFUND] Verifica tu archivo .env');
        return {
          success: false,
          error: 'Token de Mercado Pago no configurado',
          refundId: null,
        };
      }

      console.log(`✅ [REFUND] Token de MP detectado`);

      if (!paymentId) {
        console.error('❌ [REFUND] paymentId es requerido');
        return {
          success: false,
          error: 'ID de pago no proporcionado',
          refundId: null,
        };
      }

      console.log(`📝 [REFUND] Parámetros:`);
      console.log(`   - Payment ID: ${paymentId}`);
      console.log(`   - Monto: ${amount ? `$${amount}` : 'Total (reembolso completo)'}`);
      console.log(`   - Razón: ${reason}`);

      const payment = new Payment(client);

      // Primero obtener la información del pago para verificar que existe
      console.log(`🔍 [REFUND] Verificando que el pago existe en Mercado Pago...`);
      let paymentInfo;
      try {
        paymentInfo = await payment.get({ id: paymentId });
        console.log(`✅ [REFUND] Pago encontrado`);
        console.log(`   - Status: ${paymentInfo.status}`);
        console.log(`   - Monto original: $${paymentInfo.transaction_amount}`);
        console.log(`   - Moneda: ${paymentInfo.currency_id}`);
      } catch (getError) {
        console.error(`❌ [REFUND] Pago no encontrado en Mercado Pago`);
        console.error(`   Error: ${getError.message}`);
        return {
          success: false,
          error: `Pago ${paymentId} no encontrado en Mercado Pago`,
          refundId: null,
          details: getError.message,
        };
      }

      // Crear el reembolso en Mercado Pago
      console.log(`💳 [REFUND] Enviando solicitud de reembolso a Mercado Pago...`);
      const refundData = {
        amount: amount, // null = reembolso completo
      };

      console.log(`📤 [REFUND] Estructura del reembolso:`, JSON.stringify(refundData, null, 2));

      const response = await payment.refund(paymentId, refundData);

      console.log(`✅ [REFUND] Respuesta recibida de Mercado Pago`);
      console.log(`📋 [REFUND] Detalles de la respuesta:`, JSON.stringify(response, null, 2));

      if (response && response.id) {
        console.log(`✅ [REFUND] Reembolso procesado exitosamente`);
        console.log(`   - Refund ID: ${response.id}`);
        console.log(`   - Monto reembolsado: $${response.amount}`);
        console.log(`   - Estado: ${response.status}`);
        console.log('═══════════════════════════════════════');

        return {
          success: true,
          refundId: response.id,
          amount: response.amount,
          status: response.status, // 'pending', 'approved', 'rejected'
          message: `Reembolso de $${response.amount} MXN procesado`,
        };
      } else {
        console.warn('⚠️  [REFUND] Respuesta inesperada de Mercado Pago');
        console.warn('⚠️  [REFUND] Response:', JSON.stringify(response, null, 2));
        return {
          success: false,
          error: 'Respuesta inesperada de Mercado Pago',
          refundId: null,
          details: response,
        };
      }
    } catch (error) {
      console.error('═══════════════════════════════════════');
      console.error('❌ [REFUND] === ERROR EN REEMBOLSO ===');
      console.error('═══════════════════════════════════════');
      console.error(`Tipo de error: ${error.constructor.name}`);
      console.error(`Mensaje: ${error.message}`);
      console.error(`Stack completo:`, error.stack);

      // Intentar extraer más detalles del error
      if (error.response) {
        console.error('📡 [REFUND] Respuesta HTTP del error:');
        console.error(`   - Status: ${error.response.status}`);
        console.error(`   - Data:`, JSON.stringify(error.response.data, null, 2));
      }

      if (error.config) {
        console.error('⚙️  [REFUND] Configuración de la solicitud:');
        console.error(`   - URL: ${error.config.url}`);
        console.error(`   - Método: ${error.config.method}`);
      }

      console.error('═══════════════════════════════════════');

      return {
        success: false,
        error: error.message || 'Error al procesar reembolso',
        refundId: null,
        details: {
          message: error.message,
          response: error.response?.data || null,
          status: error.response?.status || null,
        },
      };
    }
  },

  /**
   * Obtener información de reembolsos de un pago
   * @param {string} paymentId - ID del pago
   * @returns {array} Lista de reembolsos
   */
  async getRefunds(paymentId) {
    try {
      if (!MP_ACCESS_TOKEN) {
        return { success: false, refunds: [] };
      }

      const payment = new Payment(client);
      const paymentData = await payment.get(paymentId);

      if (paymentData && paymentData.refunds) {
        console.log(`📊 [REFUND] Se encontraron ${paymentData.refunds.length} reembolsos`);
        return {
          success: true,
          refunds: paymentData.refunds,
        };
      }

      return { success: true, refunds: [] };
    } catch (error) {
      console.error('❌ [REFUND] Error al obtener reembolsos:', error.message);
      return { success: false, refunds: [], error: error.message };
    }
  },
};

export default refundsService;
