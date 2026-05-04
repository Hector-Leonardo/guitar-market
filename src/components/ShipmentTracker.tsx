import { useEffect, useState } from 'react'
import type { Shipment, ShipmentStatus } from '../types'
import { shipmentService } from '../services/shipmentService'

interface ShipmentTrackerProps {
  shipment: Shipment
}

interface TrackingEvent {
  status: ShipmentStatus
  label: string
  icon: string
  completed: boolean
  date?: string
}

export function ShipmentTracker({ shipment }: ShipmentTrackerProps) {
  const [trackingInfo, setTrackingInfo] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTracking = async () => {
      try {
        const info = await shipmentService.getShipmentTracking(shipment.id)
        setTrackingInfo(info)
      } catch (err) {
        console.error('Error al cargar rastreo:', err)
      } finally {
        setLoading(false)
      }
    }

    loadTracking()
  }, [shipment.id])

  const getTrackingTimeline = (): TrackingEvent[] => {
    const timeline: TrackingEvent[] = [
      {
        status: 'pending',
        label: 'Orden Confirmada',
        icon: '✅',
        completed: shipment.status !== 'pending' || shipment.status === 'pending',
      },
      {
        status: 'processing',
        label: 'Procesando',
        icon: '⚙️',
        completed: ['processing', 'shipped', 'in_transit', 'delivered'].includes(shipment.status),
        date: shipment.updatedAt,
      },
      {
        status: 'shipped',
        label: 'Enviado',
        icon: '📦',
        completed: ['shipped', 'in_transit', 'delivered'].includes(shipment.status),
        date: shipment.updatedAt,
      },
      {
        status: 'in_transit',
        label: 'En Tránsito',
        icon: '🚚',
        completed: ['in_transit', 'delivered'].includes(shipment.status),
        date: shipment.updatedAt,
      },
      {
        status: 'delivered',
        label: 'Entregado',
        icon: '🏠',
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
  const currentStatusIndex = timeline.findIndex(t => t.status === shipment.status)

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>
        📦 Detalles del Envío {shipment.orderId.slice(-8)}
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
        <h3
          style={{
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#1a1a1a',
            marginBottom: '12px',
          }}
        >
          📍 Dirección de Envío
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
          <div style={{ marginTop: '8px' }}>
            📞 {shipment.shippingData.phone}
          </div>
        </div>
      </div>

      {/* Timeline de Estados */}
      <div style={timelineContainerStyle}>
        <h3 style={timelineTitle}>📅 Historial de Estados</h3>
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
          }}
        >
          ✅ Tu envío ha sido entregado el {shipment.actualDelivery ? formatDate(shipment.actualDelivery) : 'recientemente'}
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
          }}
        >
          ❌ Este envío ha sido cancelado
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
          <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
            💰 {shipment.refundData.status === 'approved' ? 'Reembolso Aprobado' : 'Reembolso en Proceso'}
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
