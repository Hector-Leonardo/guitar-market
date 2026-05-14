import React, { useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth'
import styles from './BecomeSeller.module.css'

interface BecomeSellerProps {
  onSuccess?: () => void
}

export function BecomeSeller({ onSuccess }: BecomeSellerProps) {
  const { becomeSeller, loading: authLoading, error: authError } = useAuth()

  const [storeName, setStoreName] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    // Aplicar fondo al body cuando el componente se monta
    document.body.style.background = 'linear-gradient(135deg, #f5f1e8 0%, #fef6e8 100%)'
    document.body.style.backgroundAttachment = 'fixed'
    
    // Limpiar cuando el componente se desmonta
    return () => {
      document.body.style.background = ''
      document.body.style.backgroundAttachment = ''
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validaciones
    if (!storeName.trim()) {
      setError('El nombre de la tienda es requerido')
      return
    }

    if (storeName.trim().length < 3) {
      setError('El nombre de la tienda debe tener al menos 3 caracteres')
      return
    }

    if (!description.trim()) {
      setError('La descripción es requerida')
      return
    }

    if (description.trim().length < 10) {
      setError('La descripción debe tener al menos 10 caracteres')
      return
    }

    setLoading(true)
    setError(null)

    try {
      await becomeSeller(storeName.trim(), description.trim())
      setSuccess(true)

      // Ejecutar callback después de 2 segundos
      setTimeout(() => {
        onSuccess?.()
      }, 2000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error al convertirse en vendedor'
      setError(errorMsg)
      setLoading(false)
    }
  }

  if (authLoading) {
    return <div className={styles.loading}>Cargando...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1>Conviértete en Vendedor</h1>
        <p className={styles.subtitle}>
          Comienza a vender tus instrumentos musicales en nuestra plataforma
        </p>

        {success ? (
          <div className={styles.success}>
            <h2>¡Éxito!</h2>
            <p>Registro exitoso</p>
            <p>Redirigiendo a tu dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="storeName">Nombre de tu tienda</label>
              <input
                id="storeName"
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Ej: Guitarras Premium"
                className={styles.input}
                disabled={loading}
              />
              <small>Mínimo 3 caracteres</small>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Descripción de tu tienda</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Cuéntale a los clientes sobre tu tienda, especialidades, etc."
                className={styles.textarea}
                rows={4}
                disabled={loading}
              />
              <small>Mínimo 10 caracteres</small>
            </div>

            {(error || authError) && (
              <div className={styles.error}>
                {error || authError}
              </div>
            )}

            <button
              type="submit"
              className={styles.submitBtn}
              disabled={loading}
            >
              {loading ? 'Creando perfil...' : 'Convertirse en Vendedor'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
