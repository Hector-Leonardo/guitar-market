export default async function handler(request, response) {
  if (request.method !== 'POST') {
    response.status(405).json({ success: false, error: 'Method not allowed' })
    return
  }

  try {
    const { paymentId, orderId, amount, reason } = request.body || {}
    console.log('[refund-shipment] Request body:', { paymentId, orderId, amount, reason })

    const accessToken = process.env.MP_ACCESS_TOKEN

    if (!accessToken) {
      response.status(500).json({ success: false, error: 'MP_ACCESS_TOKEN is not configured' })
      return
    }

    const refundPayment = async (targetPaymentId) => {
      const refundResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(targetPaymentId)}/refunds`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: amount ? JSON.stringify({ amount }) : undefined,
      })

      const refundData = await refundResponse.json().catch(() => null)

      return {
        ok: refundResponse.ok,
        status: refundResponse.status,
        data: refundData,
      }
    }

    const resolvePaymentIdByOrder = async () => {
      if (!orderId) {
        return null
      }

      const searchResponse = await fetch(`https://api.mercadopago.com/v1/payments/search?external_reference=${encodeURIComponent(orderId)}&sort=date_created&criteria=desc`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const searchData = await searchResponse.json().catch(() => null)

      if (!searchResponse.ok) {
        return null
      }

      const payment = (searchData?.results || []).find((item) => item?.status === 'approved' || item?.status === 'authorized')
      return payment?.id || null
    }

    let refundResult = null

    if (paymentId) {
      refundResult = await refundPayment(paymentId)
    }

    if (!refundResult || (!refundResult.ok && refundResult.data?.message === 'invalid_caller_id')) {
      const resolvedPaymentId = await resolvePaymentIdByOrder()

      if (!resolvedPaymentId) {
        response.status(404).json({
          success: false,
          error: 'No se encontró un pago aprobado para reembolsar',
          details: { paymentId, orderId },
        })
        return
      }

      refundResult = await refundPayment(resolvedPaymentId)
    }

    if (!refundResult.ok) {
      response.status(refundResult.status).json({
        success: false,
        error: refundResult.data?.message || 'No se pudo crear el reembolso',
        details: refundResult.data,
      })
      return
    }

    response.status(200).json({
      success: true,
      refundId: refundResult.data?.id,
      status: refundResult.data?.status || 'approved',
      amount: refundResult.data?.amount || amount,
      reason: reason || 'Cancelación de envío',
    })
  } catch (error) {
    response.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Unexpected error',
    })
  }
}
