import { MercadoPagoConfig, Preference } from 'mercadopago';

const MP_ACCESS_TOKEN = process.env.MP_ACCESS_TOKEN;
const APP_URL = process.env.APP_URL || 'https://guitarla-ts-main.vercel.app';

const client = MP_ACCESS_TOKEN
  ? new MercadoPagoConfig({ accessToken: MP_ACCESS_TOKEN })
  : null;

export default async function handler(req, res) {
  const { method } = req;

  // Habilitar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (method === 'POST') {
    try {
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
        preference_id: result.id,
        init_point: result.init_point,
        order_id: orderId,
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

  return res.status(405).json({ error: 'Método no permitido' });
}
