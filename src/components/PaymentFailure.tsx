import { useEffect, useState } from 'react'

interface PaymentFailureProps {
  onRetry?: () => void
  onCancel?: () => void
}

export function PaymentFailure({ onRetry, onCancel }: PaymentFailureProps) {
  const [reason, setReason] = useState<string>('')

  useEffect(() => {
    // Obtener la razón del error desde URL params si existe
    const params = new URLSearchParams(window.location.search)
    const errorReason = params.get('reason') || 'Razón desconocida'
    setReason(errorReason)
  }, [])

  return (
    <div style={containerStyle}>
      <div style={contentStyle}>
        <div style={iconStyle}>❌</div>

        <h1 style={titleStyle}>¡Pago No Completado!</h1>

        <p style={messageStyle}>
          Lamentablemente, tu pago no pudo ser procesado. Por favor intenta de nuevo.
        </p>

        <div style={errorBoxStyle}>
          <h3>Motivo del Error:</h3>
          <p>{reason}</p>
        </div>

        <div style={troubleshootingStyle}>
          <h3>Consejos para resolver:</h3>
          <ul>
            <li>Verifica que tus datos de tarjeta sean correctos</li>
            <li>Confirma que tu tarjeta tiene fondos disponibles</li>
            <li>Intenta con otra tarjeta de crédito o débito</li>
            <li>Contacta a tu banco si el problema persiste</li>
          </ul>
        </div>

        <div style={actionsStyle}>
          <button style={retryBtnStyle} onClick={onRetry}>
            Intentar Nuevamente
          </button>
          <button style={cancelBtnStyle} onClick={onCancel}>
            Volver al Carrito
          </button>
        </div>

        <p style={supportStyle}>
          ¿Necesitas ayuda? Contacta a nuestro soporte: <a href="mailto:support@guitarmarket.com" style={{color: '#f5576c'}}>support@guitarmarket.com</a>
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
  background: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)',
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
  color: '#dc3545',
  marginBottom: '1rem'
}

const messageStyle = {
  fontSize: '1rem',
  color: '#666',
  marginBottom: '2rem'
}

const errorBoxStyle = {
  background: '#ffebee',
  border: '1px solid #ffcdd2',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '1.5rem',
  color: '#c62828'
}

const troubleshootingStyle = {
  background: '#fff3e0',
  borderRadius: '8px',
  padding: '1.5rem',
  marginBottom: '2rem',
  textAlign: 'left' as const
}

const actionsStyle = {
  display: 'flex',
  gap: '1rem',
  marginBottom: '2rem'
}

const retryBtnStyle = {
  flex: 1,
  padding: '0.75rem 1rem',
  background: '#f5576c',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
}

const cancelBtnStyle = {
  flex: 1,
  padding: '0.75rem 1rem',
  background: 'transparent',
  color: '#f5576c',
  border: '1px solid #f5576c',
  borderRadius: '6px',
  cursor: 'pointer',
  fontWeight: 'bold'
}

const supportStyle = {
  fontSize: '0.9rem',
  color: '#999',
  marginTop: '1rem'
}
