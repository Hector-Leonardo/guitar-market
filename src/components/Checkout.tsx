import { useState } from 'react'
import type { CartItem, ShippingData } from '../types'
import { paymentService } from '../services/paymentService'
import { shipmentService } from '../services/shipmentService'
import { useAuth } from '../hooks/useAuth'
import { ShippingForm } from './ShippingForm'

interface CheckoutProps {
  cart: CartItem[]
  cartTotal: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

type CheckoutStep = 'shipping' | 'review'

// Costos de envío en MXN
const SHIPPING_COSTS = {
  standard: 50,
  express: 150,
  overnight: 300,
}

export function Checkout({ cart, cartTotal, onSuccess, onError }: CheckoutProps) {
  const [step, setStep] = useState<CheckoutStep>('shipping')
  const [shippingData, setShippingData] = useState<ShippingData | null>(null)
  const [loading, setLoading] = useState(false)
  const { currentUser } = useAuth()

  const handleShippingSubmit = (data: ShippingData) => {
    console.log('✅ Datos de envío confirmados:', data)
    setShippingData(data)
    setStep('review')
  }

  const handleEditShipping = () => {
    setStep('shipping')
  }

  const totalWithShipping = shippingData ? cartTotal + SHIPPING_COSTS[shippingData.shippingMethod] : cartTotal

  const handleCheckout = async () => {
    // Validar carrito
    if (cart.length === 0) {
      onError?.('Tu carrito está vacío')
      return
    }

    if (!shippingData) {
      onError?.('Información de envío requerida')
      return
    }

    // Mostrar loading
    setLoading(true)

    try {
      console.log('🎸 === INICIANDO PROCESO DE PAGO ===')
      console.log('📦 Artículos en el carrito:', cart.length)
      console.log('💰 Total productos:', cartTotal)
      console.log('🚚 Costo de envío:', SHIPPING_COSTS[shippingData.shippingMethod])
      console.log('💰 Total con envío:', totalWithShipping)
      console.log('📍 Envío a:', shippingData.city, shippingData.state)
      console.log('🔗 Conectando con: http://localhost:3000/api/create-order')
      console.log('👤 Usuario:', currentUser?.uid || 'Anónimo')

      // Enviar petición al backend con datos de envío
      const result = await paymentService.createOrder(cart, shippingData, totalWithShipping, currentUser?.uid)

      if (result.success && result.init_point) {
        console.log('✅ === PAGO PROCESADO EXITOSAMENTE ===')
        console.log('📋 Preference ID:', result.preference_id)
        console.log('🔗 Guardando envío en Firestore...')

        // Guardar datos completos de la orden en sessionStorage
        sessionStorage.setItem(
          'guitarmarket_order',
          JSON.stringify({
            orderId: result.order_id,
            preferenceId: result.preference_id,
            items: cart,
            subtotal: cartTotal,
            shippingCost: SHIPPING_COSTS[shippingData.shippingMethod],
            total: totalWithShipping,
            shippingData,
            timestamp: new Date().toISOString(),
          })
        )

        try {
          await shipmentService.createShipment({
            orderId: result.order_id || result.preference_id || `order-${Date.now()}`,
            userId: currentUser?.uid || 'guest',
            paymentId: result.preference_id,
            shippingData,
            items: cart.map((item) => ({
              productId: String(item.id),
              title: item.name,
              quantity: item.quantity,
              unitPrice: item.price,
              image: item.image,
            })),
            totalAmount: totalWithShipping,
            currency: 'MXN',
            status: 'pending',
          })
        } catch (shipmentError) {
          console.error('❌ No se pudo guardar el envío en Firestore:', shipmentError)
        }

        // Ejecutar callback
        onSuccess?.()

        // Redirigir a Mercado Pago
        window.location.href = result.init_point
      } else {
        const errorMsg = result.error || 'Error al procesar el pago'
        console.error('❌ === ERROR EN EL SERVIDOR ===')
        console.error('Mensaje:', errorMsg)
        onError?.(errorMsg)
        setLoading(false)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      console.error('❌ === EXCEPCIÓN ===')
      console.error('Error:', err)
      onError?.(errorMsg)
      setLoading(false)
    }
  }

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        {/* Paso 1: Información de Envío */}
        {step === 'shipping' && (
          <ShippingForm
            onSubmit={handleShippingSubmit}
            isLoading={loading}
            userId={currentUser?.uid}
          />
        )}

        {/* Paso 2: Revisión de Pedido */}
        {step === 'review' && cart.length > 0 && shippingData && (
          <>
            {/* Título */}
            <h2 style={titleStyle}>Finalizar Compra</h2>

            {/* Sección de Envío */}
            <div style={sectionStyle}>
              <div style={sectionHeaderStyle}>
                <h3 style={sectionTitleStyle}>📍 Información de Envío</h3>
                <button onClick={handleEditShipping} style={editButtonStyle} disabled={loading}>
                  Editar
                </button>
              </div>
              <div style={shippingInfoStyle}>
                <div style={infoRowStyle}>
                  <span style={infoLabelStyle}>Destinatario:</span>
                  <span style={infoValueStyle}>{shippingData.fullName}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={infoLabelStyle}>Teléfono:</span>
                  <span style={infoValueStyle}>{shippingData.phone}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={infoLabelStyle}>Dirección:</span>
                  <span style={infoValueStyle}>
                    {shippingData.street}
                    {shippingData.apartment && ` • ${shippingData.apartment}`}
                  </span>
                </div>
                <div style={infoRowStyle}>
                  <span style={infoLabelStyle}>Localidad:</span>
                  <span style={infoValueStyle}>
                    {shippingData.city}, {shippingData.state} {shippingData.postalCode}
                  </span>
                </div>
                <div style={infoRowStyle}>
                  <span style={infoLabelStyle}>Tipo de Envío:</span>
                  <span style={infoValueStyle}>
                    {shippingData.shippingMethod === 'standard' && 'Estándar (5-7 días)'}
                    {shippingData.shippingMethod === 'express' && 'Express (2-3 días)'}
                    {shippingData.shippingMethod === 'overnight' && 'Nocturno (Próximo día)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Resumen de productos */}
            <div style={itemsStyle}>
              <h3 style={subtitleStyle}>📦 Resumen de tu Pedido</h3>
              <table style={tableStyle}>
                <thead>
                  <tr style={tableHeadRowStyle}>
                    <th style={thStyle}>Producto</th>
                    <th style={thStyle}>Precio</th>
                    <th style={thStyle}>Cantidad</th>
                    <th style={thStyle}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {cart.map(item => (
                    <tr key={item.id} style={tableBodyRowStyle}>
                      <td style={tdStyle}>{item.name}</td>
                      <td style={{ ...tdStyle, textAlign: 'right' }}>
                        ${item.price.toLocaleString('es-MX')}
                      </td>
                      <td style={{ ...tdStyle, textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 'bold' }}>
                        ${(item.price * item.quantity).toLocaleString('es-MX')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totales */}
            <div style={totalSectionStyle}>
              <div style={totalRowStyle}>
                <span style={totalLabelStyle}>Subtotal:</span>
                <span style={totalValueStyle}>${cartTotal.toLocaleString('es-MX')} MXN</span>
              </div>
              <div style={totalRowStyle}>
                <span style={totalLabelStyle}>Envío:</span>
                <span style={totalValueStyle}>
                  ${SHIPPING_COSTS[shippingData.shippingMethod].toLocaleString('es-MX')} MXN
                </span>
              </div>
              <div style={totalRowStyle}>
                <span style={totalLabelStyle}>TOTAL A PAGAR:</span>
                <span style={totalAmountStyle}>${totalWithShipping.toLocaleString('es-MX')} MXN</span>
              </div>
            </div>

            {/* Botón de pago */}
            <div style={actionsStyle}>
              <button
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                style={loading || cart.length === 0 ? { ...buttonStyle, ...buttonDisabledStyle } : buttonStyle}
                onMouseEnter={e => {
                  if (!loading && cart.length > 0) {
                    ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFC107'
                    ;(e.currentTarget as HTMLButtonElement).style.color = '#1a1a1a'
                  }
                }}
                onMouseLeave={e => {
                  ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a1a1a'
                  ;(e.currentTarget as HTMLButtonElement).style.color = '#FFC107'
                }}
              >
                {loading ? (
                  <>
                    <span style={spinnerStyle}></span> Procesando pago...
                  </>
                ) : (
                  <>Proceder al Pago Seguro</>
                )}
              </button>
              <p style={infoStyle}>
                ✓ Pago seguro con Mercado Pago • Sin comisión adicional
              </p>
            </div>
          </>
        )}

        {/* Carrito vacío */}
        {cart.length === 0 && (
          <div style={emptyStyle}>
            <p>Tu carrito está vacío. Agrega productos para proceder al pago.</p>
          </div>
        )}
      </div>
    </div>
  )
}

// Estilos
const containerStyle: React.CSSProperties = {
  padding: '2rem 0',
  minHeight: '100vh',
  backgroundColor: '#f0f0f0',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '800px',
  margin: '0 auto',
  backgroundColor: '#ffffff',
  borderRadius: '12px',
  padding: '2rem',
  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
}

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 'bold',
  marginBottom: '2rem',
  textAlign: 'center',
  color: '#1a1a1a',
  textTransform: 'uppercase',
  letterSpacing: '2px',
}

const sectionStyle: React.CSSProperties = {
  marginBottom: '2rem',
  padding: '1.5rem',
  backgroundColor: '#f9f9f9',
  borderRadius: '8px',
  borderLeft: '4px solid #FFC107',
}

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '1rem',
}

const sectionTitleStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: '#1a1a1a',
  margin: 0,
}

const editButtonStyle: React.CSSProperties = {
  padding: '6px 12px',
  backgroundColor: '#FFC107',
  color: '#1a1a1a',
  border: 'none',
  borderRadius: '4px',
  fontSize: '12px',
  fontWeight: 'bold',
  cursor: 'pointer',
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  transition: 'all 0.2s',
}

const shippingInfoStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
}

const infoRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'flex-start',
  gap: '1rem',
  fontSize: '14px',
}

const infoLabelStyle: React.CSSProperties = {
  fontWeight: 'bold',
  color: '#666',
  minWidth: '120px',
}

const infoValueStyle: React.CSSProperties = {
  color: '#1a1a1a',
  flex: 1,
  textAlign: 'right',
}

const emptyStyle: React.CSSProperties = {
  padding: '1.5rem',
  backgroundColor: '#fffbea',
  borderLeft: '4px solid #FFC107',
  borderRadius: '8px',
  color: '#333',
}

const subtitleStyle: React.CSSProperties = {
  fontSize: '1.2rem',
  marginBottom: '1rem',
  color: '#1a1a1a',
  borderBottom: '2px solid #ddd',
  paddingBottom: '0.5rem',
  fontWeight: 'bold',
}

const itemsStyle: React.CSSProperties = {
  marginBottom: '2rem',
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginBottom: '1rem',
}

const tableHeadRowStyle: React.CSSProperties = {
  backgroundColor: '#f9f9f9',
  borderBottom: '2px solid #ddd',
}

const thStyle: React.CSSProperties = {
  padding: '0.75rem',
  textAlign: 'left',
  fontWeight: 'bold',
  fontSize: '0.95rem',
  color: '#1a1a1a',
  textTransform: 'uppercase',
}

const tableBodyRowStyle: React.CSSProperties = {
  borderBottom: '1px solid #eee',
}

const tdStyle: React.CSSProperties = {
  padding: '1rem 0.75rem',
  fontSize: '0.95rem',
  color: '#1a1a1a',
}

const totalSectionStyle: React.CSSProperties = {
  backgroundColor: '#f9f9f9',
  padding: '1.5rem',
  borderRadius: '8px',
  marginBottom: '2rem',
  border: '2px solid #FFC107',
}

const totalLabelStyle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 'bold',
  color: '#1a1a1a',
  textTransform: 'uppercase',
}

const totalValueStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 'bold',
  color: '#1a1a1a',
}

const totalAmountStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#FFC107',
}

const totalRowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: '1rem',
  marginBottom: '0.75rem',
}

const actionsStyle: React.CSSProperties = {
  textAlign: 'center',
}

const buttonStyle: React.CSSProperties = {
  width: '100%',
  padding: '1rem',
  fontSize: '1rem',
  fontWeight: 'bold',
  backgroundColor: '#1a1a1a',
  color: '#FFC107',
  border: '2px solid #FFC107',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  textTransform: 'uppercase',
  letterSpacing: '1px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
}

const buttonDisabledStyle: React.CSSProperties = {
  backgroundColor: '#555',
  color: '#999',
  borderColor: '#999',
  cursor: 'not-allowed',
  opacity: 0.5,
}

const spinnerStyle: React.CSSProperties = {
  display: 'inline-block',
  width: '16px',
  height: '16px',
  border: '2px solid rgba(255, 255, 255, 0.3)',
  borderTop: '2px solid #FFC107',
  borderRadius: '50%',
}

const infoStyle: React.CSSProperties = {
  marginTop: '1rem',
  fontSize: '0.85rem',
  color: '#666',
}

export default Checkout
