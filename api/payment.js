import { MercadoPagoConfig, Preference } from 'mercadopago';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const APP_URL = process.env.APP_URL || 'https://guitarla-ts-main.vercel.app';

const client = MP_ACCESS_TOKEN
  ? new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })
  : null;

async function handlePaymentEndpoint(req, res) {
  const { method, url } = req;
  const path = url.replace('/api/payment', '').split('?')[0];

  try {
    // POST /api/payment/create-order
    if (method === 'POST' && path === '/create-order') {
      if (!client) {
        return res.status(500).json({
          success: false,
          error: 'MP_ACCESS_TOKEN no configurado',
        });
      }

      const { items, userId, shippingData, total } = req.body;

      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'El carrito está vacío',
        });
      }

      try {
        const preference = new Preference(client);
        const orderId = `order-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const preferenceData = {
          body: {
            items: items.map(item => ({
              title: item.title || item.name,
              unit_price: Number(item.unit_price || item.price),
              quantity: Number(item.quantity),
              currency_id: 'MXN',
            })),
            external_reference: orderId,
            notification_url: `${APP_URL}/api/payment/webhook`,
          },
        };

        if (shippingData) {
          const nameParts = (shippingData.fullName || '').split(' ');
          preferenceData.body.payer = {
            name: nameParts[0] || 'Cliente',
            surname: nameParts.slice(1).join(' ') || 'Guitar Market',
            phone: { number: shippingData.phone.replace(/\D/g, '') },
            address: {
              street_name: shippingData.street,
              street_number: 1,
              zip_code: shippingData.postalCode,
            },
          };
        }

        const result = await preference.create(preferenceData);

        return res.status(201).json({
          success: true,
          preferenceId: result.id,
          init_point: result.init_point,
          orderId,
        });
      } catch (error) {
        console.error('❌ Error creando preferencia MP:', error);
        return res.status(500).json({
          success: false,
          error: 'Error creando orden de pago',
          details: error.message,
        });
      }
    }

    // GET /api/payment/success
    if (method === 'GET' && path === '/success') {
      return res.status(200).json({
        success: true,
        message: 'Pago exitoso',
        paymentId: req.query.payment_id,
      });
    }

    // GET /api/payment/failure
    if (method === 'GET' && path === '/failure') {
      return res.status(200).json({
        success: false,
        message: 'Pago fallido',
        paymentId: req.query.payment_id,
      });
    }

    // GET /api/payment/pending
    if (method === 'GET' && path === '/pending') {
      return res.status(200).json({
        success: false,
        message: 'Pago pendiente',
        paymentId: req.query.payment_id,
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Endpoint no encontrado',
    });
  } catch (error) {
    console.error('❌ Error en payment API:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return handlePaymentEndpoint(req, res);
}
