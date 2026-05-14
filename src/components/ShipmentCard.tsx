import type { ShipmentListItem, ShipmentStatus } from '../types'

interface ShipmentCardProps {
  shipment: ShipmentListItem
  onSelect: (shipmentId: string) => void
}

export function ShipmentCard({ shipment, onSelect }: ShipmentCardProps) {
  const iconStyle = {
    width: 16,
    height: 16,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }

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

  const getStatusIcon = (status: ShipmentStatus) => {
    const svgProps = {
      width: 18,
      height: 18,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2,
      strokeLinecap: 'round' as const,
      strokeLinejoin: 'round' as const,
    }

    switch (status) {
      case 'pending':
        return (
          <svg {...svgProps} style={{ color: '#FF9800' }}>
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        )
      case 'processing':
        return (
          <svg {...svgProps} style={{ color: '#2196F3' }}>
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 2.2" />
          </svg>
        )
      case 'shipped':
        return (
          <svg {...svgProps} style={{ color: '#4CAF50' }}>
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        )
      case 'in_transit':
        return (
          <svg {...svgProps} style={{ color: '#FFC107' }}>
            <path d="M19 17h2c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-1V9c0-.55-.45-1-1-1h-2l-3-4H5c-.55 0-1 .45-1 1v14c0 .55.45 1 1 1h14zM16 16h-3v-2h3v2z" />
            <circle cx="5.5" cy="17.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
        )
      case 'delivered':
        return (
          <svg {...svgProps} style={{ color: '#4CAF50' }}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )
      case 'cancelled':
        return (
          <svg {...svgProps} style={{ color: '#f44336' }}>
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        )
      default:
        return (
          <svg {...svgProps}>
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        )
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
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const rowIconStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    color: '#FFC107',
    flexShrink: 0,
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
        <svg style={rowIconStyle} {...iconStyle}>
          <circle cx="12" cy="7" r="4" />
          <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
        </svg>
        <span>{shipment.recipientName}</span>
      </div>

      <div style={infoRowStyle}>
        <svg style={rowIconStyle} {...iconStyle}>
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>{shipment.city}</span>
      </div>

      {shipment.trackingNumber && (
        <div style={trackingStyle}>
          <strong>Rastreo:</strong> {shipment.trackingNumber}
        </div>
      )}

      {shipment.itemCount !== undefined && (
        <div style={infoRowStyle}>
          <svg style={rowIconStyle} {...iconStyle}>
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span>{shipment.itemCount} artículo{shipment.itemCount === 1 ? '' : 's'}</span>
        </div>
      )}

      {shipment.totalAmount !== undefined && (
        <div style={infoRowStyle}>
          <svg style={rowIconStyle} {...iconStyle}>
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span>${shipment.totalAmount.toLocaleString('es-MX')} MXN</span>
        </div>
      )}

      {shipment.estimatedDelivery && (
        <div style={infoRowStyle}>
          <svg style={rowIconStyle} {...iconStyle}>
            <rect x="3" y="4" width="18" height="17" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span>{new Date(shipment.estimatedDelivery).toLocaleDateString('es-MX')}</span>
        </div>
      )}

      <div style={dateStyle}>Creado: {formatDate(shipment.createdAt)}</div>

      <button style={buttonStyle} onClick={handleClick}>
        Ver Detalles
      </button>
    </div>
  )
}
