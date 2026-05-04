import { useEffect, useState } from 'react'

interface PaymentStatusProps {
  onDone?: () => void
}

export function PaymentSuccess({ onDone }: PaymentStatusProps) {
  const [orderData, setOrderData] = useState<any>(null)

  useEffect(() => {
    // Obtener datos de la orden desde sessionStorage
    const saved = sessionStorage.getItem('guitarmarket_order')
    if (saved) {
      setOrderData(JSON.parse(saved))
      // Limpiar localStorage después de pago exitoso
      localStorage.removeItem('cart')
    }
  }, [])

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={iconStyle}>✅</div>

        <h1 style={titleStyle}>¡Pago Exitoso!</h1>

        <p style={messageStyle}>
          Tu pedido ha sido procesado correctamente. Hemos enviado un email de confirmación a tu cuenta.
        </p>

        {orderData && (
          <div style={summaryStyle}>
            <h2>Resumen del Pedido</h2>
            <div style={detailStyle}>
              <span style={labelStyle}>Número de Pedido:</span>
              <span style={valueStyle}>{orderData.orderId}</span>
            </div>
            <div style={detailStyle}>
              <span style={labelStyle}>Total Pagado:</span>
              <span style={valueStyle}>${orderData.total?.toLocaleString('es-MX')}</span>
            </div>
            <div style={detailStyle}>
              <span style={labelStyle}>Fecha:</span>
             <span style={valueStyle}>
                {new Date(orderData.timestamp).toLocaleDateString('es-MX')}
              </span>
            </div>
          </div>
        )}

        <div style={actionsStyle}>
          <button style={primaryBtnStyle} onClick={onDone}>
            Volver a la Tienda
          </button>
          <button style={secondaryBtnStyle} onClick={() => window.print()}>
            Imprimir Recibo
          </button>
        </div>

        <p style={infoStyle}>
          📧 Revisa tu email para los detalles de tu compra<br/>
          🚚 Recibirás actualizaciones sobre tu envío pronto
        </p>
      </div>
    </div>
  )
}

const containerStyle = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '70vh',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  padding: '2rem'
} as const

const contentStyle = {
  background: 'white',
  borderRadius: '12px',
  padding: '3rem 2rem',
  maxWidth: '500px',
  width: '100%',
  boxShadow: '0 10px 40px rgba(0, 0, 0, 0.2)',
  textAlign: 'center' as const
}

const iconStyle = {
  fontSize: '4rem',
  marginBottom: '1.5rem'
}

const titleStyle = {
  fontSize: '2rem',
  fontWeight: 'bold',
  color: '#333',
  marginBottom: '1rem'
}

const messageStyle = {
  fontSize: '1rem',
  color: '#666',
  marginBottom: '2rem'
}

const summaryStyle = {
  background: '#f9f9f9',
  padding: '1.5rem',
  borderRadius: '8px',
  marginBottom: '2rem',
  textAlign: 'left' as const
}

const detailStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  padding: '0.75rem 0',
  borderBottom: '1px solid #eee'
}

const labelStyle = {
  fontWeight: 'bold',
  color: '#333'
}

const valueStyle = {
  color: '#667eea',
  fontWeight: 'bold'
}

const actionsStyle = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem'
}

const primaryBtnStyle = {
  flex: 1,
  padding: '0.75rem 1rem',
  background: '#667eea',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
}

const secondaryBtnStyle = {
  flex: 1,
  padding: '0.75rem 1rem',
  background: 'transparent',
  color: '#667eea',
  border: '1px solid #667eea',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
}

const infoStyle = {
  fontSize: '0.9rem',
  color: '#999',
  marginTop: '1rem'
} as const
