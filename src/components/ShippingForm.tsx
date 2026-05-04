import { useState } from 'react'
import type { ShippingData, ShippingMethod } from '../types'

interface ShippingFormProps {
  onSubmit: (shippingData: ShippingData) => void
  isLoading?: boolean
}

export function ShippingForm({ onSubmit, isLoading = false }: ShippingFormProps) {
  const [formData, setFormData] = useState<ShippingData>({
    fullName: '',
    phone: '',
    street: '',
    apartment: '',
    city: '',
    state: '',
    postalCode: '',
    shippingMethod: 'standard',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  // Costos de envío en MXN
  const shippingCosts = {
    standard: 50,
    express: 150,
    overnight: 300,
  }

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(formData)
    }
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

  const selectStyle: React.CSSProperties = {
    ...inputStyle,
    cursor: 'pointer',
    backgroundColor: '#ffffff',
  }

  const textareaStyle: React.CSSProperties = {
    ...inputStyle,
    minHeight: '60px',
    resize: 'vertical',
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

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>📍 Información de Envío</h2>

      <form onSubmit={handleSubmit}>
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

        <button
          type="submit"
          style={submitButtonStyle}
          disabled={isLoading}
          onMouseEnter={e => {
            if (!isLoading) {
              (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFC107'
              ;(e.currentTarget as HTMLButtonElement).style.color = '#1a1a1a'
            }
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1a1a1a'
            ;(e.currentTarget as HTMLButtonElement).style.color = '#ffffff'
          }}
        >
          {isLoading ? 'Procesando...' : '✓ Confirmar Envío'}
        </button>
      </form>
    </div>
  )
}
