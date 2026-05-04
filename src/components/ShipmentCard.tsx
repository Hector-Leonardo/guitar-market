import type { ShipmentListItem, ShipmentStatus } from '../types'

interface ShipmentCardProps {
  shipment: ShipmentListItem
  onSelect: (shipmentId: string) => void
}

export function ShipmentCard({ shipment, onSelect }: ShipmentCardProps) {
  const getStatusColor = (status: ShipmentStatus): string => {
    switch (status) {
      case 'pending':
        return '#FF9800'
      case 'processing':
        return '#2196F3'
      case 'shipped':
        return '#4CAF50'
      case 'in_transit':
        return '#FFC107'
      case 'delivered':
        return '#4CAF50'
      case 'cancelled':
        return '#f44336'
      default:
        return '#999'
    }
  }

  const getStatusLabel = (status: ShipmentStatus): string => {
    switch (status) {
      case 'pending':
        return 'Pendiente'
      case 'processing':
        return 'Procesando'
      case 'shipped':
        return 'Enviado'
      case 'in_transit':
        return 'En tránsito'
      case 'delivered':
        return 'Entregado'
      case 'cancelled':
        return 'Cancelado'
      default:
        return 'Desconocido'
    }
  }

  const getStatusIcon = (status: ShipmentStatus): string => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'processing':
        return '⚙️'
      case 'shipped':
        return '📦'
      case 'in_transit':
        return '🚚'
      case 'delivered':
        return '✅'
      case 'cancelled':
        return '❌'
      default:
        return '❓'
    }
  }

  const cardStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  }

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
  }

  const orderIdStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1a1a1a',
  }

  const statusBadgeStyle: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 12px',
    backgroundColor: getStatusColor(shipment.status),
    color: '#fff',
    borderRadius: '20px',
    fontSize: '12px',
    fontWeight: 'bold',
  }

  const infoRowStyle: React.CSSProperties = {
    marginBottom: '8px',
    fontSize: '14px',
    color: '#666',
  }

  const labelStyle: React.CSSProperties = {
    fontWeight: 'bold',
    color: '#1a1a1a',
  }

  const trackingStyle: React.CSSProperties = {
    marginTop: '12px',
    paddingTop: '12px',
    borderTop: '1px solid #eee',
    fontSize: '12px',
    color: '#999',
  }

  const dateStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#999',
    marginTop: '8px',
  }

  const buttonStyle: React.CSSProperties = {
    marginTop: '12px',
    padding: '8px 16px',
    width: '100%',
    backgroundColor: '#FFC107',
    border: 'none',
    borderRadius: '4px',
    color: '#1a1a1a',
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  }

  const handleClick = () => {
    onSelect(shipment.id)
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div
      style={cardStyle}
      onMouseEnter={e => {
        const el = e.currentTarget
        el.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)'
        el.style.transform = 'translateY(-2px)'
      }}
      onMouseLeave={e => {
        const el = e.currentTarget
        el.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)'
        el.style.transform = 'translateY(0)'
      }}
    >
      <div style={headerStyle}>
        <div>
          <div style={orderIdStyle}>Orden #{shipment.orderId.slice(-8)}</div>
        </div>
        <div style={statusBadgeStyle}>
          {getStatusIcon(shipment.status)} {getStatusLabel(shipment.status)}
        </div>
      </div>

      <div style={infoRowStyle}>
        <span style={labelStyle}>👤 </span>
        {shipment.recipientName}
      </div>

      <div style={infoRowStyle}>
        <span style={labelStyle}>📍 </span>
        {shipment.city}
      </div>

      {shipment.trackingNumber && (
        <div style={trackingStyle}>
          <strong>Rastreo:</strong> {shipment.trackingNumber}
        </div>
      )}

      {shipment.estimatedDelivery && (
        <div style={infoRowStyle}>
          <span style={labelStyle}>📅 </span>
          {new Date(shipment.estimatedDelivery).toLocaleDateString('es-MX')}
        </div>
      )}

      <div style={dateStyle}>Creado: {formatDate(shipment.createdAt)}</div>

      <button style={buttonStyle} onClick={handleClick}>
        Ver Detalles
      </button>
    </div>
  )
}
