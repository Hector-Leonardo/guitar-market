import { useEffect, useState } from 'react'
import type { SavedShippingAddress, ShippingData, ShippingMethod } from '../types'
import { addressService } from '../services/addressService'

interface ShippingFormProps {
  onSubmit: (shippingData: ShippingData) => void
  isLoading?: boolean
  userId?: string
}

const emptyShippingData: ShippingData = {
  fullName: '',
  phone: '',
  street: '',
  apartment: '',
  city: '',
  state: '',
  postalCode: '',
  shippingMethod: 'standard',
}

export function ShippingForm({ onSubmit, isLoading = false, userId }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingData>({
    ...emptyShippingData,
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [savedAddresses, setSavedAddresses] = useState<SavedShippingAddress[]>([])
  const [selectedAddressId, setSelectedAddressId] = useState('new')
  const [showNewAddressForm, setShowNewAddressForm] = useState(true)
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null)
  const [loadingAddresses, setLoadingAddresses] = useState(false)
  const [saveAddressEnabled, setSaveAddressEnabled] = useState(true)
  const [savingAddress, setSavingAddress] = useState(false)
  const [saveAddressError, setSaveAddressError] = useState<string | null>(null)

  // Costos de envío en MXN
  const shippingCosts = {
    standard: 50,
    express: 150,
    overnight: 300,
  }

  useEffect(() => {
    const loadSavedAddresses = async () => {
      if (!userId) {
        return
      }

      setLoadingAddresses(true)
      const addresses = await addressService.getUserAddresses(userId)
      setSavedAddresses(addresses)

      if (addresses.length > 0) {
        const firstAddress = addresses[0]
        setSelectedAddressId(firstAddress.id)
        setFormData(firstAddress.shippingData)
        setSaveAddressEnabled(false)
        setShowNewAddressForm(false)
      } else {
        setSelectedAddressId('new')
        setShowNewAddressForm(true)
      }

      setLoadingAddresses(false)
    }

    loadSavedAddresses()
  }, [userId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) newErrors.fullName = 'Nombre completo requerido'
    if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido'
    if (!formData.street.trim()) newErrors.street = 'Calle requerida'
    if (!formData.city.trim()) newErrors.city = 'Ciudad requerida'
    if (!formData.state.trim()) newErrors.state = 'Estado requerido'
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Código postal requerido'

    // Validar teléfono (10 dígitos)
    if (!/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Teléfono debe tener 10 dígitos'
    }

    // Validar código postal (5 dígitos)
    if (!/^\d{5}$/.test(formData.postalCode.replace(/\D/g, ''))) {
      newErrors.postalCode = 'Código postal debe tener 5 dígitos'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleAddressSelection = (addressId: string) => {
    setSelectedAddressId(addressId)
    setSaveAddressError(null)

    const address = savedAddresses.find((item) => item.id === addressId)
    if (address) {
      setFormData(address.shippingData)
      setSaveAddressEnabled(false)
      setErrors({})
    }
  }

  const refreshAddresses = async (userIdToRefresh: string) => {
    const addresses = await addressService.getUserAddresses(userIdToRefresh)
    setSavedAddresses(addresses)
    return addresses
  }

  const openEditAddress = () => {
    const address = savedAddresses.find((item) => item.id === selectedAddressId)
    if (!address) {
      return
    }

    setEditingAddressId(address.id)
    setFormData(address.shippingData)
    setErrors({})
    setSaveAddressError(null)
    setSaveAddressEnabled(false)
    setShowNewAddressForm(true)
  }

  const deleteSelectedAddress = async () => {
    if (!userId || selectedAddressId === 'new') {
      return
    }

    const shouldDelete = window.confirm('¿Seguro que deseas eliminar esta dirección?')
    if (!shouldDelete) {
      return
    }

    try {
      const deleted = await addressService.deleteUserAddress(userId, selectedAddressId)

      if (!deleted) {
        setSaveAddressError('No se pudo eliminar la dirección seleccionada.')
        return
      }

      const addresses = await refreshAddresses(userId)

      if (addresses.length > 0) {
        const firstAddress = addresses[0]
        setSelectedAddressId(firstAddress.id)
        setFormData(firstAddress.shippingData)
        setSaveAddressEnabled(false)
        setShowNewAddressForm(false)
      } else {
        setSelectedAddressId('new')
        setFormData(emptyShippingData)
        setSaveAddressEnabled(true)
        setShowNewAddressForm(true)
      }

      setEditingAddressId(null)
      setSaveAddressError(null)
    } catch (error) {
      console.error('No se pudo eliminar la dirección:', error)
      setSaveAddressError('No se pudo eliminar la dirección.')
    }
  }

  const handleUseSelectedAddress = () => {
    if (selectedAddressId === 'new') {
      return
    }

    onSubmit(formData)
  }

  const handleShowNewAddress = () => {
    setSelectedAddressId('new')
    setFormData(emptyShippingData)
    setErrors({})
    setSaveAddressError(null)
    setSaveAddressEnabled(true)
    setEditingAddressId(null)
    setShowNewAddressForm(true)
  }

  const handleCancelNewAddress = () => {
    if (savedAddresses.length === 0) {
      return
    }

    const firstAddress = savedAddresses[0]
    setSelectedAddressId(firstAddress.id)
    setFormData(firstAddress.shippingData)
    setErrors({})
    setSaveAddressError(null)
    setSaveAddressEnabled(false)
    setEditingAddressId(null)
    setShowNewAddressForm(false)
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSaveAddressError(null)

    if (userId && editingAddressId) {
      try {
        setSavingAddress(true)
        const updatedAddress = await addressService.updateUserAddress(userId, editingAddressId, formData)

        if (updatedAddress) {
          const addresses = await refreshAddresses(userId)
          setSavedAddresses(addresses)
          setSelectedAddressId(updatedAddress.id)
          setShowNewAddressForm(false)
          setEditingAddressId(null)
        }
      } catch (error) {
        console.error('No se pudo actualizar la dirección:', error)
        setSaveAddressError('No se pudo actualizar la dirección, pero puedes continuar con esta compra.')
      } finally {
        setSavingAddress(false)
      }
    } else if (userId && saveAddressEnabled) {
      try {
        setSavingAddress(true)
        const savedAddress = await addressService.saveUserAddress(userId, formData)
        await refreshAddresses(userId)
        setSelectedAddressId(savedAddress.id)
        setSaveAddressEnabled(false)
        setShowNewAddressForm(false)
      } catch (error) {
        console.error('No se pudo guardar la dirección:', error)
        setSaveAddressError('No se pudo guardar la dirección, pero puedes continuar con esta compra.')
      } finally {
        setSavingAddress(false)
      }
    }

    onSubmit(formData)
  }

  const containerStyle: React.CSSProperties = {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  }

  const titleStyle: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: '20px',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  }

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#FFC107',
    marginTop: '16px',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }

  const formGroupStyle: React.CSSProperties = {
    marginBottom: '16px',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 12px',
    border: '2px solid #e0e0e0',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#1a1a1a',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  }

  const errorStyle: React.CSSProperties = {
    color: '#d32f2f',
    fontSize: '12px',
    marginTop: '4px',
    fontWeight: '500',
  }

  const rowStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  }

  const shippingOptionsStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr',
    gap: '12px',
  }

  const shippingOptionStyle = (selected: boolean): React.CSSProperties => ({
    padding: '12px',
    border: selected ? '2px solid #FFC107' : '2px solid #e0e0e0',
    borderRadius: '4px',
    cursor: 'pointer',
    backgroundColor: selected ? '#FFF9E6' : '#ffffff',
    transition: 'all 0.2s',
  })

  const shippingLabelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '13px',
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: '4px',
    cursor: 'pointer',
  }

  const shippingPriceStyle: React.CSSProperties = {
    fontSize: '12px',
    color: '#FFC107',
    fontWeight: 'bold',
  }

  const submitButtonStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 24px',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    border: '2px solid #FFC107',
    borderRadius: '4px',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    cursor: isLoading ? 'not-allowed' : 'pointer',
    opacity: isLoading ? 0.7 : 1,
    transition: 'all 0.3s',
    marginTop: '20px',
  }

  const titleIconStyle: React.CSSProperties = {
    width: '18px',
    height: '18px',
    color: '#FFC107',
    flexShrink: 0,
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ ...titleStyle, display: 'flex', alignItems: 'center', gap: '10px' }}>
        <svg style={titleIconStyle} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        <span>Información de Envío</span>
      </h2>

      {userId && savedAddresses.length > 0 && !showNewAddressForm && (
        <div style={{ marginBottom: '20px', padding: '12px', backgroundColor: '#f8f8f8', borderRadius: '6px', border: '1px solid #ececec' }}>
          <h3 style={{ ...sectionTitleStyle, marginTop: 0 }}>Direcciones Guardadas</h3>

          {loadingAddresses ? (
            <p style={{ margin: 0, color: '#666', fontSize: '13px' }}>Cargando direcciones...</p>
          ) : (
            <>
            <select
              value={selectedAddressId}
              onChange={(e) => handleAddressSelection(e.target.value)}
              style={inputStyle}
              disabled={isLoading || savingAddress}
            >
              {savedAddresses.map((address) => (
                <option key={address.id} value={address.id}>
                  {address.label}
                </option>
              ))}
            </select>

            <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
              <button
                type="button"
                onClick={handleUseSelectedAddress}
                disabled={isLoading || savingAddress}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '2px solid #FFC107',
                  backgroundColor: '#1a1a1a',
                  color: '#ffffff',
                  fontWeight: '700',
                  cursor: isLoading || savingAddress ? 'not-allowed' : 'pointer',
                }}
              >
                Usar dirección seleccionada
              </button>

              <button
                type="button"
                onClick={handleShowNewAddress}
                disabled={isLoading || savingAddress}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '2px solid #FFC107',
                  backgroundColor: '#ffffff',
                  color: '#1a1a1a',
                  fontWeight: '700',
                  cursor: isLoading || savingAddress ? 'not-allowed' : 'pointer',
                }}
              >
                + Agregar nueva dirección
              </button>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
              <button
                type="button"
                onClick={openEditAddress}
                disabled={isLoading || savingAddress}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #FFC107',
                  backgroundColor: '#fff8e1',
                  color: '#1a1a1a',
                  fontWeight: '700',
                  cursor: isLoading || savingAddress ? 'not-allowed' : 'pointer',
                }}
              >
                Editar
              </button>

              <button
                type="button"
                onClick={deleteSelectedAddress}
                disabled={isLoading || savingAddress}
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '6px',
                  border: '1px solid #ef5350',
                  backgroundColor: '#ffebee',
                  color: '#c62828',
                  fontWeight: '700',
                  cursor: isLoading || savingAddress ? 'not-allowed' : 'pointer',
                }}
              >
                Eliminar
              </button>
            </div>
            </>
          )}
        </div>
      )}

      {userId && savedAddresses.length > 0 && !showNewAddressForm ? null : (
      <form onSubmit={handleFormSubmit}>

        {/* Información Personal */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={sectionTitleStyle}>Información Personal</h3>

          <div style={rowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Nombre Completo</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Juan Pérez"
                disabled={isLoading}
              />
              {errors.fullName && <div style={errorStyle}>{errors.fullName}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Teléfono</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                style={inputStyle}
                placeholder="5512345678"
                disabled={isLoading}
              />
              {errors.phone && <div style={errorStyle}>{errors.phone}</div>}
            </div>
          </div>
        </div>

        {/* Dirección */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={sectionTitleStyle}>Dirección de Envío</h3>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Calle y Número</label>
            <input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Avenida Paseo de la Reforma 505"
              disabled={isLoading}
            />
            {errors.street && <div style={errorStyle}>{errors.street}</div>}
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Apartamento, Piso, etc. (Opcional)</label>
            <input
              type="text"
              name="apartment"
              value={formData.apartment}
              onChange={handleChange}
              style={inputStyle}
              placeholder="Apto. 1205"
              disabled={isLoading}
            />
          </div>

          <div style={rowStyle}>
            <div style={formGroupStyle}>
              <label style={labelStyle}>Ciudad</label>
              <input
                type="text"
                name="city"
                value={formData.city}
                onChange={handleChange}
                style={inputStyle}
                placeholder="Ciudad de México"
                disabled={isLoading}
              />
              {errors.city && <div style={errorStyle}>{errors.city}</div>}
            </div>

            <div style={formGroupStyle}>
              <label style={labelStyle}>Estado</label>
              <input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                style={inputStyle}
                placeholder="CDMX"
                disabled={isLoading}
              />
              {errors.state && <div style={errorStyle}>{errors.state}</div>}
            </div>
          </div>

          <div style={formGroupStyle}>
            <label style={labelStyle}>Código Postal</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              style={inputStyle}
              placeholder="06500"
              disabled={isLoading}
            />
            {errors.postalCode && <div style={errorStyle}>{errors.postalCode}</div>}
          </div>
        </div>

        {/* Opciones de Envío */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={sectionTitleStyle}>Tipo de Envío</h3>

          <div style={shippingOptionsStyle}>
            {(['standard', 'express', 'overnight'] as ShippingMethod[]).map(method => (
              <div
                key={method}
                style={shippingOptionStyle(formData.shippingMethod === method)}
                onClick={() =>
                  setFormData(prev => ({
                    ...prev,
                    shippingMethod: method,
                  }))
                }
              >
                <label style={shippingLabelStyle}>
                  <input
                    type="radio"
                    name="shippingMethod"
                    value={method}
                    checked={formData.shippingMethod === method}
                    onChange={handleChange}
                    style={{ marginRight: '6px', cursor: 'pointer' }}
                    disabled={isLoading}
                  />
                  {method === 'standard' && 'Estándar'}
                  {method === 'express' && 'Express'}
                  {method === 'overnight' && 'Nocturno'}
                </label>
                <div style={shippingPriceStyle}>
                  ${shippingCosts[method]} MXN
                </div>
                <div style={{ fontSize: '11px', color: '#666', marginTop: '4px' }}>
                  {method === 'standard' && '5-7 días hábiles'}
                  {method === 'express' && '2-3 días hábiles'}
                  {method === 'overnight' && 'Próximo día hábil'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Resumen de costos */}
        <div
          style={{
            padding: '12px',
            backgroundColor: '#FFF9E6',
            borderLeft: '4px solid #FFC107',
            marginBottom: '20px',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontSize: '13px', color: '#1a1a1a', marginBottom: '6px' }}>
            <strong>Envío seleccionado:</strong>{' '}
            {formData.shippingMethod === 'standard' && 'Estándar'}
            {formData.shippingMethod === 'express' && 'Express'}
            {formData.shippingMethod === 'overnight' && 'Nocturno'}
          </div>
          <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFC107' }}>
            Costo: ${shippingCosts[formData.shippingMethod]} MXN
          </div>
        </div>

        {userId && (
          <div style={{ marginBottom: '16px', padding: '10px', border: '1px solid #ececec', borderRadius: '6px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, color: '#1a1a1a', fontSize: '13px', fontWeight: 600 }}>
              <input
                type="checkbox"
                checked={saveAddressEnabled}
                onChange={(e) => setSaveAddressEnabled(e.target.checked)}
                disabled={isLoading || savingAddress}
              />
              {editingAddressId ? 'Guardar cambios de esta dirección' : 'Guardar esta dirección para próximas compras'}
            </label>
            {saveAddressError && (
              <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#d32f2f' }}>{saveAddressError}</p>
            )}
          </div>
        )}

        {userId && savedAddresses.length > 0 && (
          <button
            type="button"
            onClick={handleCancelNewAddress}
            disabled={isLoading || savingAddress}
            style={{
              width: '100%',
              marginBottom: '10px',
              padding: '10px 12px',
              borderRadius: '6px',
              border: '1px solid #ccc',
              backgroundColor: '#ffffff',
              color: '#444',
              fontWeight: '600',
              cursor: isLoading || savingAddress ? 'not-allowed' : 'pointer',
            }}
          >
            Cancelar y usar dirección guardada
          </button>
        )}

        <button
          type="submit"
          style={submitButtonStyle}
          disabled={isLoading || savingAddress}
          onMouseEnter={e => {
            if (!isLoading && !savingAddress) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFC107'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#1a1a1a'
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a1a1a'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#ffffff'
          }}
        >
          {isLoading ? 'Procesando...' : savingAddress ? 'Guardando dirección...' : '✓ Confirmar Envío'}
        </button>
      </form>
      )}
    </div>
  )
}
