import { useEffect, useState } from 'react'
import type { ShipmentListItem, Shipment } from '../types'
import { shipmentService } from '../services/shipmentService'
import { ShipmentCard } from './ShipmentCard'
import { ShipmentTracker } from './ShipmentTracker'

interface ShipmentsManagementProps {
  userId?: string
}

type ViewMode = 'list' | 'details'

export function ShipmentsManagement({ userId }: ShipmentsManagementProps) {
  const [shipments, setShipments] = useState<ShipmentListItem[]>([])
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  // Obtener envíos del usuario
  useEffect(() => {
    const loadShipments = async () => {
      if (!userId) {
        setError('Usuario no identificado')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const data = await shipmentService.getUserShipments(userId)
        setShipments(data)
      } catch (err) {
        console.error('Error al cargar envíos:', err)
        setError('No se pudieron cargar los envíos')
      } finally {
        setLoading(false)
      }
    }

    loadShipments()
  }, [userId])

  // Cargar detalles del envío cuando se selecciona
  useEffect(() => {
    const loadDetails = async () => {
      if (!selectedShipment && shipments.length > 0) {
        try {
          const details = await shipmentService.getShipmentDetails(shipments[0].id)
          setSelectedShipment(details)
          setViewMode('details')
        } catch (err) {
          console.error('Error al cargar detalles:', err)
        }
      }
    }

    if (viewMode === 'details' && !selectedShipment) {
      loadDetails()
    }
  }, [viewMode, selectedShipment, shipments])

  const handleSelectShipment = async (shipmentId: string) => {
    try {
      const details = await shipmentService.getShipmentDetails(shipmentId)
      setSelectedShipment(details)
      setViewMode('details')
    } catch (err) {
      console.error('Error al cargar detalles:', err)
      setError('No se pudieron cargar los detalles del envío')
    }
  }

  const handleBackToList = () => {
    setSelectedShipment(null)
    setViewMode('list')
  }

  const handleCancelShipment = async (shipmentId: string) => {
    if (!confirm('¿Estás seguro de que deseas cancelar este envío?')) {
      return
    }

    try {
      await shipmentService.cancelShipment(shipmentId)
      // Refrescar lista
      if (userId) {
        const data = await shipmentService.getUserShipments(userId)
        setShipments(data)
      }
      setSelectedShipment(null)
      setViewMode('list')
    } catch (err) {
      console.error('Error al cancelar:', err)
      setError('No se pudo cancelar el envío')
    }
  }

  // Filtrar envíos
  const filteredShipments =
    filterStatus === 'all' ? shipments : shipments.filter(s => s.status === filterStatus)

  const containerStyle: React.CSSProperties = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '24px',
  }

  const headerStyle: React.CSSProperties = {
    marginBottom: '32px',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '8px',
  }

  const subtitleStyle: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
  }

  const filterContainerStyle: React.CSSProperties = {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
    flexWrap: 'wrap',
  }

  const filterButtonStyle = (isActive: boolean): React.CSSProperties => ({
    padding: '8px 16px',
    border: isActive ? '2px solid #FFC107' : '1px solid #ddd',
    borderRadius: '4px',
    backgroundColor: isActive ? '#FFC107' : '#fff',
    color: isActive ? '#1a1a1a' : '#666',
    cursor: 'pointer',
    fontWeight: isActive ? 'bold' : 'normal',
    transition: 'all 0.3s ease',
  })

  const loadingStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 24px',
    fontSize: '16px',
    color: '#666',
  }

  const emptyStyle: React.CSSProperties = {
    textAlign: 'center',
    padding: '60px 24px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  }

  const emptyTitleStyle: React.CSSProperties = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '8px',
  }

  const emptyMessageStyle: React.CSSProperties = {
    color: '#666',
    fontSize: '14px',
  }

  const errorStyle: React.CSSProperties = {
    padding: '16px',
    backgroundColor: '#ffebee',
    border: '1px solid #ef5350',
    borderRadius: '4px',
    color: '#c62828',
    marginBottom: '24px',
  }

  const shipmentsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '16px',
    marginTop: '24px',
  }

  // Vista de detalles
  if (viewMode === 'details' && selectedShipment) {
    return (
      <div style={containerStyle}>
        <button
          onClick={handleBackToList}
          style={{
            padding: '8px 16px',
            marginBottom: '24px',
            backgroundColor: '#f5f5f5',
            border: '1px solid #ddd',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          ← Volver a lista
        </button>

        <ShipmentTracker shipment={selectedShipment} />

        <button
          onClick={() => handleCancelShipment(selectedShipment.id)}
          disabled={['shipped', 'in_transit', 'delivered', 'cancelled'].includes(selectedShipment.status)}
          style={{
            marginTop: '24px',
            padding: '12px 24px',
            backgroundColor: '#ef5350',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor:
              ['shipped', 'in_transit', 'delivered', 'cancelled'].includes(selectedShipment.status)
                ? 'not-allowed'
                : 'pointer',
            opacity:
              ['shipped', 'in_transit', 'delivered', 'cancelled'].includes(selectedShipment.status)
                ? 0.5
                : 1,
            fontWeight: 'bold',
          }}
        >
          Cancelar Envío
        </button>
      </div>
    )
  }

  // Vista de lista
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
          <h1 style={titleStyle}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px', display: 'inline-block', color: '#FFC107'}}>
              <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
            Mis Envíos
          </h1>
        <div style={filterContainerStyle}>
          <button
            style={filterButtonStyle(filterStatus === 'all')}
            onClick={() => setFilterStatus('all')}
          >
            Todos ({shipments.length})
          </button>
          <button style={filterButtonStyle(filterStatus === 'pending')} onClick={() => setFilterStatus('pending')}>
            Pendientes
          </button>
          <button style={filterButtonStyle(filterStatus === 'processing')} onClick={() => setFilterStatus('processing')}>
            Procesando
          </button>
          <button style={filterButtonStyle(filterStatus === 'shipped')} onClick={() => setFilterStatus('shipped')}>
            Enviados
          </button>
          <button style={filterButtonStyle(filterStatus === 'in_transit')} onClick={() => setFilterStatus('in_transit')}>
            En tránsito
          </button>
          <button style={filterButtonStyle(filterStatus === 'delivered')} onClick={() => setFilterStatus('delivered')}>
            Entregados
          </button>
        </div>
      </div>

      {error && <div style={errorStyle}>{error}</div>}

      {loading ? (
        <div style={loadingStyle}>Cargando envíos...</div>
      ) : filteredShipments.length === 0 ? (
        <div style={emptyStyle}>
          <p style={emptyTitleStyle}>No hay envíos</p>
          <p style={emptyMessageStyle}>
            {filterStatus === 'all'
              ? 'Aún no tienes envíos. ¡Haz tu primera compra!'
              : `No hay envíos ${filterStatus}`}
          </p>
        </div>
      ) : (
        <div style={shipmentsGridStyle}>
          {filteredShipments.map(shipment => (
            <ShipmentCard
              key={shipment.id}
              shipment={shipment}
              onSelect={handleSelectShipment}
            />
          ))}
        </div>
      )}
    </div>
  )
}
