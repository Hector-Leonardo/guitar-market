import React, { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { sellerService } from '../services/sellerService'
import { cloudinaryService } from '../services/cloudinaryService'
import type { ProductFormData, ProductCategory } from '../types'
import styles from './ProductForm.module.css'

const CATEGORIES = {
  acoustic: 'Guitarra Acústica',
  electric: 'Guitarra Eléctrica',
  classical: 'Guitarra Clásica',
  bass: 'Bajo',
  ukulele: 'Ukelele',
  accessories: 'Accesorios',
  cases: 'Estuches',
  amplifiers: 'Amplificadores',
  effects: 'Efectos',
  strings: 'Cuerdas',
  other: 'Otros',
}

interface ProductFormProps {
  productId?: string
  onBack?: () => void
}

export function ProductForm({ productId, onBack }: ProductFormProps) {
  const { currentUser, sellerProfile, isSeller } = useAuth()

  const isEditing = !!productId

  // Estado del formulario
  const [formData, setFormData] = useState<ProductFormData>({
    title: '',
    description: '',
    price: 0,
    currency: 'USD',
    stock: 0,
    images: [],
    category: 'acoustic' as ProductCategory,
    condition: 'new',
    visible: true,
    tags: [],
    shipping: {
      included: true,
      weight: 2,
    },
  })
  const [priceInput, setPriceInput] = useState('')
  const [stockInput, setStockInput] = useState('')

  const [loadingProduct, setLoadingProduct] = useState(isEditing)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Cargar producto si es edición
  useEffect(() => {
    if (!isEditing || !currentUser) return

    const loadProduct = async () => {
      try {
        const product = await sellerService.getProduct(productId!)
        if (!product) {
          setError('Producto no encontrado')
          return
        }

        if (product.sellerId !== currentUser.uid) {
          setError('No tienes permiso para editar este producto')
          return
        }

        setFormData({
          title: product.title,
          description: product.description,
          price: product.price,
          currency: product.currency,
          stock: product.stock,
          images: product.images,
          category: product.category as ProductCategory,
          condition: product.condition,
          visible: product.visible,
          tags: product.tags || [],
          shipping: product.shipping,
        })
        setPriceInput(String(product.price))
        setStockInput(String(product.stock))
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error cargando producto'
        setError(errorMsg)
      } finally {
        setLoadingProduct(false)
      }
    }

    loadProduct()
  }, [isEditing, productId, currentUser])

  // Validar formulario
  const validateForm = (data: ProductFormData): string | null => {
    if (!data.title.trim()) return 'El título es requerido'
    if (data.title.length < 5) return 'El título debe tener mínimo 5 caracteres'
    if (!data.description.trim()) return 'La descripción es requerida'
    if (data.description.length < 20) return 'La descripción debe tener mínimo 20 caracteres'
    if (data.price <= 0) return 'El precio debe ser mayor a 0'
    if (data.stock < 0) return 'El stock no puede ser negativo'
    if (data.images.length === 0) return 'Debes agregar al menos una imagen'
    return null
  }

  // Manejar carga de imágenes
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.currentTarget.files
    if (!files) return

    setUploading(true)
    setError(null)

    try {
      for (const file of Array.from(files)) {
        if (formData.images.length >= 5) {
          setError('Máximo 5 imágenes por producto')
          break
        }

        const result = await cloudinaryService.uploadImage(
          file,
          'products'
        )

        if (result.success && result.url) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, result.url!],
          }))
        } else {
          setError(`Error subiendo imagen: ${result.error}`)
          break
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error subiendo imágenes')
    } finally {
      setUploading(false)
    }
  }

  // Eliminar imagen
  const handleRemoveImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }))
  }

  // Enviar formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const normalizedPrice = Number(priceInput.replace(',', '.'))
    const normalizedStock = Number.parseInt(stockInput, 10)

    const productPayload: ProductFormData = {
      ...formData,
      price: Number.isFinite(normalizedPrice) ? normalizedPrice : 0,
      stock: Number.isInteger(normalizedStock) ? normalizedStock : 0,
    }

    const validationError = validateForm(productPayload)
    if (validationError) {
      setError(validationError)
      return
    }

    if (!currentUser || !sellerProfile) {
      setError('Usuario o perfil de vendedor no encontrado')
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      if (isEditing) {
        await sellerService.updateProduct(currentUser.uid, productId!, productPayload)
      } else {
        await sellerService.createProduct(
          currentUser.uid,
          sellerProfile.storeName,
          productPayload
        )
      }

      setSuccess(true)
      setTimeout(() => {
        onBack?.()
      }, 2000)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error guardando producto'
      setError(errorMsg)
    } finally {
      setSubmitting(false)
    }
  }

  if (!isSeller) {
    return (
      <div className={styles.notSeller}>
        <h1>No tienes permiso para acceder a esta página</h1>
        <p>Debes ser vendedor para crear o editar productos.</p>
      </div>
    )
  }

  if (loadingProduct) {
    return <div className={styles.loading}>Cargando producto...</div>
  }

  if (success) {
    return (
      <div className={styles.success}>
        <h1>¡Éxito!</h1>
        <p>{isEditing ? 'Producto actualizado correctamente' : 'Producto creado correctamente'}</p>
        <p>Redirigiendo al dashboard...</p>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>{isEditing ? 'Editar Producto' : 'Crear Nuevo Producto'}</h1>

        {error && <div className={styles.error}>{error}</div>}

        {/* Título */}
        <div className={styles.formGroup}>
          <label>Título del Producto *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, title: e.target.value }))
            }
            placeholder="Ej: Guitarra Acústica Yamaha C40"
            className={styles.input}
            disabled={submitting}
            maxLength={100}
          />
          <small>{formData.title.length}/100 caracteres (Mínimo 5)</small>
        </div>

        {/* Descripción */}
        <div className={styles.formGroup}>
          <label>Descripción del Producto *</label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            placeholder="Describe detalladamente el producto, condición, incluye especificaciones..."
            rows={5}
            className={styles.textarea}
            disabled={submitting}
            maxLength={2000}
          />
          <small>{formData.description.length}/2000 caracteres (Mínimo 20)</small>
        </div>

        {/* Precio, Moneda y Stock */}
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>Precio *</label>
            <input
              type="text"
              inputMode="decimal"
              value={priceInput}
              onChange={(e) => {
                const value = e.target.value.replace(/,/g, '.')
                if (/^\d*\.?\d*$/.test(value)) {
                  setPriceInput(value)
                  setFormData((prev) => ({ ...prev, price: Number(value) || 0 }))
                }
              }}
              className={styles.input}
              disabled={submitting}
              placeholder="0.00"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Moneda</label>
            <select
              value={formData.currency}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, currency: e.target.value }))
              }
              className={styles.select}
              disabled={submitting}
            >
              <option value="USD">USD ($)</option>
              <option value="MXN">MXN ($)</option>
              <option value="COP">COP ($)</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Stock *</label>
            <input
                type="text"
                inputMode="numeric"
                value={stockInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '')
                  setStockInput(value)
                  setFormData((prev) => ({ ...prev, stock: Number.parseInt(value, 10) || 0 }))
                }}
              className={styles.input}
              disabled={submitting}
                placeholder="0"
            />
          </div>
        </div>

        {/* Condición */}
        <div className={styles.formGroup}>
          <label>Condición del Producto</label>
          <select
            value={formData.condition}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                condition: e.target.value as 'new' | 'refurbished' | 'used',
              }))
            }
            className={styles.select}
            disabled={submitting}
          >
            <option value="new">Nuevo</option>
            <option value="refurbished">Reacondicionado</option>
            <option value="used">Usado</option>
          </select>
        </div>

        {/* Categoría */}
        <div className={styles.formGroup}>
          <label>Categoría *</label>
          <select
            value={formData.category}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                category: e.target.value as ProductCategory,
              }))
            }
            className={styles.select}
            disabled={submitting}
          >
            {Object.entries(CATEGORIES).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Imágenes */}
        <div className={styles.formGroup}>
          <label>Imágenes del Producto *</label>
          <p className={styles.imageHint}>
            Máximo 5 imágenes. Sube imágenes claras y de buena calidad.
          </p>

          <div className={styles.uploadArea} onClick={() => {
            const input = document.querySelector(`input[type="file"]`) as HTMLInputElement
            input?.click()
          }}>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              disabled={uploading || submitting || formData.images.length >= 5}
              className={styles.fileInput}
            />
            <span className={styles.uploadText}>
              {uploading ? 'Subiendo imágenes...' : 'Haz clic para seleccionar imágenes'}
            </span>
          </div>

          <div className={styles.imagePreview}>
            {formData.images.map((image, index) => (
              <div key={index} className={styles.previewItem}>
                <img src={image} alt={`Vista previa ${index + 1}`} />
                <button
                  type="button"
                  onClick={() => handleRemoveImage(index)}
                  className={styles.removeBtn}
                  disabled={submitting}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
          <small>{formData.images.length}/5 imágenes</small>
        </div>

        {/* Envío */}
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.shipping.included}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  shipping: { ...prev.shipping, included: e.target.checked },
                }))
              }
              disabled={submitting}
            />
            Incluir envío
          </label>
        </div>

        {/* Visible */}
        <div className={styles.formGroup}>
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={formData.visible}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, visible: e.target.checked }))
              }
              disabled={submitting}
            />
            Producto visible en la tienda
          </label>
        </div>

        {/* Botones */}
        <div className={styles.actions}>
          <button
            type="submit"
            className={styles.submitBtn}
            disabled={submitting || uploading}
          >
            {submitting ? 'Guardando...' : isEditing ? 'Actualizar Producto' : 'Crear Producto'}
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onBack}
            disabled={submitting}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
