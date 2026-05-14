import { useEffect } from 'react'
import type { Shipment, ShipmentStatus } from '../types'
import { shipmentService } from '../services/shipmentService'

interface ShipmentTrackerProps {
  shipment: Shipment
}

interface TrackingEvent {
  status: ShipmentStatus
  label: string
  icon: React.ReactNode
  completed: boolean
  date?: string
}

export function ShipmentTracker({ shipment }: ShipmentTrackerProps) {
  useEffect(() => {
    const loadTracking = async () => {
      try {
        await shipmentService.getShipmentTracking(shipment.id)
      } catch (err) {
        console.error('Error al cargar rastreo:', err)
      }
    }

    loadTracking()
  }, [shipment.id])

  const getStatusIcon = (status: ShipmentStatus) => {
    const svgProps = {
      width: 16,
      height: 16,
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
          <svg {...svgProps}>
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )
      case 'processing':
        return (
          <svg {...svgProps}>
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 2.2" />
          </svg>
        )
      case 'shipped':
        return (
          <svg {...svgProps}>
            <line x1="16.5" y1="9.4" x2="7.5" y2="4.21" />
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        )
      case 'in_transit':
        return (
          <svg {...svgProps}>
            <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
            <path d="M16 5h3a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-3" />
            <circle cx="5.5" cy="18.5" r="2.5" />
            <circle cx="12.5" cy="18.5" r="2.5" />
          </svg>
        )
      case 'delivered':
        return (
          <svg {...svgProps}>
            <path d="M22 11.08V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-9" />
            <path d="M23 4a2 2 0 0 1-2 2h-3V2a2 2 0 0 1 2-2z" />
            <path d="M23 7v4" />
            <path d="M20 4v7" />
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

  const getTrackingTimeline = (): TrackingEvent[] => {
    const timeline: TrackingEvent[] = [
      {
        status: 'pending',
        label: 'Orden Confirmada',
        icon: getStatusIcon('pending'),
        completed: shipment.status !== 'pending' || shipment.status === 'pending',
      },
      {
        status: 'processing',
        label: 'Procesando',
        icon: getStatusIcon('processing'),
        completed: ['processing', 'shipped', 'in_transit', 'delivered'].includes(shipment.status),
        date: shipment.updatedAt,
      },
      {
        status: 'shipped',
        label: 'Enviado',
        icon: getStatusIcon('shipped'),
        completed: ['shipped', 'in_transit', 'delivered'].includes(shipment.status),
        date: shipment.updatedAt,
      },
      {
        status: 'in_transit',
        label: 'En Tránsito',
        icon: getStatusIcon('in_transit'),
        completed: ['in_transit', 'delivered'].includes(shipment.status),
        date: shipment.updatedAt,
      },
      {
        status: 'delivered',
        label: 'Entregado',
        icon: getStatusIcon('delivered'),
        completed: shipment.status === 'delivered',
        date: shipment.actualDelivery,
      },
    ]

    return timeline
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

  const getStatusFullLabel = (status: ShipmentStatus): string => {
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

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '32px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    marginBottom: '24px',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  }

  const titleIconStyle: React.CSSProperties = {
    width: '28px',
    height: '28px',
    color: '#FFC107',
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    marginBottom: '24px',
  }

  const detailsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '24px',
    marginBottom: '32px',
    paddingBottom: '32px',
    borderBottom: '1px solid #eee',
  }

  const detailItemStyle: React.CSSProperties = {
    paddingBottom: '12px',
  }

  const detailLabelStyle: React.CSSProperties = {
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#999',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    marginBottom: '4px',
  }

  const detailValueStyle: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#1a1a1a',
  }

  const timelineContainerStyle: React.CSSProperties = {
    marginTop: '32px',
  }

  const timelineTitle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '24px',
  }

  const timelineStyle: React.CSSProperties = {
    position: 'relative',
    paddingLeft: '40px',
  }

  const addressBoxStyle: React.CSSProperties = {
    backgroundColor: '#f5f5f5',
    border: '1px solid #ddd',
    borderRadius: '8px',
    padding: '16px',
    marginTop: '24px',
  }

  const addressTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  }

  const addressIconStyle: React.CSSProperties = {
    width: '16px',
    height: '16px',
    color: '#FFC107',
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Pendiente'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const timeline = getTrackingTimeline()

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        <svg style={titleIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        Detalles del Envío {shipment.orderId.slice(-8)}
      </h2>
      <p style={subtitleStyle}>
        Estado: <strong style={{ color: getStatusColor(shipment.status) }}>
          {getStatusFullLabel(shipment.status)}
        </strong>
      </p>

      {/* Información General */}
      <div style={detailsGridStyle}>
        <div style={detailItemStyle}>
          <div style={detailLabelStyle}>Número de Rastreo</div>
          <div style={detailValueStyle}>
            {shipment.trackingNumber || 'Por asignar'}
          </div>
        </div>

        <div style={detailItemStyle}>
          <div style={detailLabelStyle}>Transportista</div>
          <div style={detailValueStyle}>
            {shipment.carrier
              ? shipment.carrier.toUpperCase()
              : 'Pendiente asignar'}
          </div>
        </div>

        <div style={detailItemStyle}>
          <div style={detailLabelStyle}>Entrega Estimada</div>
          <div style={detailValueStyle}>
            {shipment.estimatedDelivery
              ? formatDate(shipment.estimatedDelivery)
              : 'Por determinar'}
          </div>
        </div>

        <div style={detailItemStyle}>
          <div style={detailLabelStyle}>Fecha de Envío</div>
          <div style={detailValueStyle}>
            {formatDate(shipment.createdAt)}
          </div>
        </div>
      </div>

      {/* Dirección de Envío */}
      <div style={addressBoxStyle}>
        <h3 style={addressTitleStyle}>
          <svg style={addressIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Dirección de Envío
        </h3>
        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
          <div>
            <strong>{shipment.shippingData.fullName}</strong>
          </div>
          <div>{shipment.shippingData.street}</div>
          {shipment.shippingData.apartment && (
            <div>Apto/Casa: {shipment.shippingData.apartment}</div>
          )}
          <div>
            {shipment.shippingData.city}, {shipment.shippingData.state} {shipment.shippingData.postalCode}
          </div>
          <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            {shipment.shippingData.phone}
          </div>
        </div>
      </div>

      {shipment.items && shipment.items.length > 0 && (
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#fffbea',
            border: '1px solid #ffe082',
            borderRadius: '8px',
          }}
        >
          <h3
            style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Artículos Comprados
          </h3>
          <div style={{ display: 'grid', gap: '10px' }}>
            {shipment.items.map((item) => (
              <div
                key={`${item.productId}-${item.title}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '12px',
                  fontSize: '14px',
                  color: '#444',
                  paddingBottom: '8px',
                  borderBottom: '1px solid #f0e6b8',
                }}
              >
                <div>
                  <strong>{item.title}</strong>
                  <div>Cantidad: {item.quantity}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div>${item.unitPrice.toLocaleString('es-MX')}</div>
                  <div style={{ fontWeight: 'bold' }}>
                    ${(item.unitPrice * item.quantity).toLocaleString('es-MX')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline de Estados */}
      <div style={timelineContainerStyle}>
        <h3 style={timelineTitle}>Historial de Estados</h3>
        <div style={timelineStyle}>
          {timeline.map((event, index) => (
            <div key={event.status} style={{ marginBottom: '24px' }}>
              {/* Línea vertical */}
              {index < timeline.length - 1 && (
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '40px',
                    width: '2px',
                    height: '40px',
                    backgroundColor: event.completed
                      ? getStatusColor(event.status)
                      : '#ddd',
                  }}
                />
              )}

              {/* Punto del timeline */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: event.completed
                      ? getStatusColor(event.status)
                      : '#f0f0f0',
                    color: event.completed ? '#fff' : '#999',
                    fontWeight: 'bold',
                    fontSize: '16px',
                    position: 'relative',
                    zIndex: 10,
                    border: '2px solid #fff',
                    boxShadow: '0 0 0 2px ' + (event.completed
                      ? getStatusColor(event.status)
                      : '#ddd'),
                  }}
                >
                  {event.icon}
                </div>

                <div>
                  <div
                    style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: event.completed ? '#1a1a1a' : '#999',
                    }}
                  >
                    {event.label}
                  </div>
                  {event.completed && event.date && (
                    <div
                      style={{
                        fontSize: '12px',
                        color: '#666',
                        marginTop: '4px',
                      }}
                    >
                      {formatDate(event.date)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Mensaje de Entrega Completada */}
      {shipment.status === 'delivered' && (
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#c8e6c9',
            border: '1px solid #4caf50',
            borderRadius: '4px',
            color: '#1b5e20',
            textAlign: 'center',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Tu envío ha sido entregado el {shipment.actualDelivery ? formatDate(shipment.actualDelivery) : 'recientemente'}
        </div>
      )}

      {/* Mensaje de Cancelación */}
      {shipment.status === 'cancelled' && (
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: '#ffebee',
            border: '1px solid #f44336',
            borderRadius: '4px',
            color: '#b71c1c',
            textAlign: 'center',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          Este envío ha sido cancelado
        </div>
      )}

      {/* Información de Reembolso */}
      {shipment.refundData && (
        <div
          style={{
            marginTop: '24px',
            padding: '16px',
            backgroundColor: shipment.refundData.status === 'approved' ? '#e8f5e9' : '#fff3e0',
            border: `1px solid ${shipment.refundData.status === 'approved' ? '#4caf50' : '#ff9800'}`,
            borderRadius: '4px',
            color: shipment.refundData.status === 'approved' ? '#1b5e20' : '#e65100',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            {shipment.refundData.status === 'approved' ? 'Reembolso Aprobado' : 'Reembolso en Proceso'}
          </div>
          <div style={{ fontSize: '14px', lineHeight: '1.6' }}>
            <div>
              <strong>Monto:</strong> ${shipment.refundData.amount?.toFixed(2) || '0.00'} MXN
            </div>
            {shipment.refundData.refundId && (
              <div>
                <strong>ID de Reembolso:</strong> {shipment.refundData.refundId}
              </div>
            )}
            <div>
              <strong>Estado:</strong> {shipment.refundData.status === 'approved' ? 'Aprobado' : shipment.refundData.status === 'pending' ? 'Pendiente' : 'Rechazado'}
            </div>
            {shipment.refundData.processedAt && (
              <div>
                <strong>Procesado:</strong> {formatDate(shipment.refundData.processedAt)}
              </div>
            )}
            {shipment.refundData.reason && (
              <div>
                <strong>Razón:</strong> {shipment.refundData.reason}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
