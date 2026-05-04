import { useState } from 'react'
import { ImageUpload } from '../components/ImageUpload'

export function TestImageUpload() {
  const [uploadedImage, setUploadedImage] = useState<{
    url: string
    publicId: string
  } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const handleUploadSuccess = (url: string, publicId: string) => {
    console.log('✅ Upload exitoso:', { url, publicId })
    setUploadedImage({ url, publicId })
  }

  const handleUploadError = (error: string) => {
    console.error('❌ Upload error:', error)
  }

  const handleDeleteImage = async () => {
    if (!uploadedImage?.publicId) return

    setDeleteLoading(true)
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publicId: uploadedImage.publicId })
      })

      const data = await response.json()

      if (data.success) {
        console.log('✅ Imagen eliminada')
        setUploadedImage(null)
      } else {
        console.error('❌ Error:', data.error)
      }
    } catch (error) {
      console.error('❌ Error:', error)
    } finally {
      setDeleteLoading(false)
    }
  }

  return (
    <div
      style={{
        padding: '40px',
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#0a0a0a',
        minHeight: '100vh'
      }}
    >
      <h1 style={{ color: '#FFC107', marginBottom: '30px' }}>Test: Upload de Imágenes</h1>

      <div style={{ marginBottom: '40px' }}>
        <h2 style={{ color: '#FFC107', fontSize: '16px', marginBottom: '15px' }}>
          Subir Nueva Imagen
        </h2>
        <ImageUpload
          onUploadSuccess={handleUploadSuccess}
          onUploadError={handleUploadError}
          folder="guitarmarket/test"
          maxSizeMB={5}
        />
      </div>

      {uploadedImage && (
        <div
          style={{
            backgroundColor: '#1a1a1a',
            border: '1px solid #FFC107',
            borderRadius: '8px',
            padding: '20px'
          }}
        >
          <h2 style={{ color: '#FFC107', fontSize: '16px', marginBottom: '15px' }}>
            Imagen Subida
          </h2>

          <img
            src={uploadedImage.url}
            alt="Subida"
            style={{
              maxWidth: '100%',
              marginBottom: '15px',
              borderRadius: '6px'
            }}
          />

          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: '#999', fontSize: '12px' }}>Public ID:</p>
            <code
              style={{
                display: 'block',
                backgroundColor: '#0a0a0a',
                padding: '8px',
                borderRadius: '4px',
                color: '#FFC107',
                fontSize: '12px',
                overflow: 'auto',
                wordBreak: 'break-all'
              }}
            >
              {uploadedImage.publicId}
            </code>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <p style={{ color: '#999', fontSize: '12px' }}>URL:</p>
            <code
              style={{
                display: 'block',
                backgroundColor: '#0a0a0a',
                padding: '8px',
                borderRadius: '4px',
                color: '#FFC107',
                fontSize: '12px',
                overflow: 'auto',
                wordBreak: 'break-all'
              }}
            >
              {uploadedImage.url}
            </code>
          </div>

          <button
            onClick={handleDeleteImage}
            disabled={deleteLoading}
            style={{
              width: '100%',
              padding: '10px',
              backgroundColor: '#1a1a1a',
              border: '1px solid #8B0000',
              color: '#FF6B6B',
              borderRadius: '6px',
              cursor: deleteLoading ? 'not-allowed' : 'pointer',
              opacity: deleteLoading ? 0.5 : 1,
              fontWeight: 'bold'
            }}
          >
            {deleteLoading ? 'Eliminando...' : 'Eliminar Imagen'}
          </button>
        </div>
      )}
    </div>
  )
}
