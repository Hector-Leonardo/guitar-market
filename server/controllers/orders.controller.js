import ordersService from '../services/ordersService.js';

/**
 * Obtener todas las órdenes (para admin/dashboard)
 * GET /api/orders?status=approved&limit=10
 */
export const getOrders = async (req, res) => {
  try {
    const { status, limit = 50, userId } = req.query;

    if (userId) {
      // Obtener órdenes de un usuario específico
      const result = await ordersService.getUserOrders(userId);

      if (!result.success) {
        return res.status(404).json({
          success: false,
          error: result.error,
          orders: [],
        });
      }

      // Filtrar por estado si se especifica
      let orders = result.orders;
      if (status) {
        orders = orders.filter((order) => order.status === status);
      }

      // Limitar resultados
      orders = orders.slice(0, parseInt(limit));

      return res.json({
        success: true,
        orders,
        count: orders.length,
        filtered: status ? `por status: ${status}` : 'sin filtro',
      });
    }

    // TODO: Implementar obtener todas las órdenes (requiere permisos de admin)
    return res.status(401).json({
      success: false,
      error: 'Necesitas permisos de administrador para ver todas las órdenes',
      hint: 'Usa /api/orders?userId=xxx para ver órdenes de un usuario',
    });
  } catch (error) {
    console.error('❌ Error al obtener órdenes:', error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener órdenes',
      details: error.message,
    });
  }
};

/**
 * Obtener una orden específica por ID
 * GET /api/orders/:orderId
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'Order ID es requerido',
      });
    }

    const result = await ordersService.getOrder(orderId);

    if (!result.success) {
      return res.status(404).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      order: result.order,
    });
  } catch (error) {
    console.error('❌ Error al obtener orden:', error);

    res.status(500).json({
      success: false,
      error: 'Error al obtener la orden',
      details: error.message,
    });
  }
};
