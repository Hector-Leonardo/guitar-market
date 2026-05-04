import { useState, useRef } from 'react'
import { cloudinaryService } from '../services/cloudinaryService'

interface ImageUploadProps {
  onUploadSuccess?: (url: string, publicId: string) => void
  onUploadError?: (error: string) => void
  folder?: string
  maxSizeMB?: number
}

export function ImageUpload({
  onUploadSuccess,
  onUploadError,
  folder = 'guitarmarket',
  maxSizeMB = 5
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setError(null)

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      const errorMsg = 'El archivo debe ser una imagen'
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024)
    if (sizeMB > maxSizeMB) {
      const errorMsg = `La imagen no debe exceder ${maxSizeMB}MB`
      setError(errorMsg)
      onUploadError?.(errorMsg)
      return
    }

    // Mostrar preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Subir imagen
    setLoading(true)
    try {
      const result = await cloudinaryService.uploadImage(file, folder)

      if (result.success && result.url && result.publicId) {
        console.log('✅ Imagen subida:', result.url)
        onUploadSuccess?.(result.url, result.publicId)
        setPreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } else {
        const errorMsg = result.error || 'Error al subir imagen'
        setError(errorMsg)
        onUploadError?.(errorMsg)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error desconocido'
      setError(errorMsg)
      onUploadError?.(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: '20px',
        border: '2px dashed #FFC107',
        borderRadius: '8px',
        textAlign: 'center',
        cursor: 'pointer',
        backgroundColor: '#1a1a1a',
        transition: 'all 0.3s'
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={loading}
        style={{ display: 'none' }}
      />

      {preview ? (
        <div>
          <img
            src={preview}
            alt="Preview"
            style={{
              maxWidth: '200px',
              maxHeight: '200px',
              marginBottom: '10px',
              borderRadius: '6px'
            }}
          />
          <p style={{ color: '#FFC107', fontSize: '14px' }}>
            {loading ? 'Subiendo...' : 'Listo para subir'}
          </p>
        </div>
      ) : (
        <div style={{ color: '#FFC107' }}>
          <p style={{ fontSize: '24px', marginBottom: '10px' }}>📸</p>
          <p style={{ fontSize: '14px', fontWeight: 'bold' }}>
            Arrastra una imagen o haz click
          </p>
          <p style={{ fontSize: '12px', color: '#999', marginTop: '5px' }}>
            PNG, JPG, GIF (máx {maxSizeMB}MB)
          </p>
        </div>
      )}

      {error && (
        <div
          style={{
            marginTop: '10px',
            padding: '10px',
            backgroundColor: '#8B0000',
            borderRadius: '6px',
            color: '#FF6B6B',
            fontSize: '12px'
          }}
        >
          {error}
        </div>
      )}

      {loading && (
        <div style={{ marginTop: '10px', color: '#FFC107' }}>
          ⏳ Subiendo imagen...
        </div>
      )}
    </div>
  )
}
