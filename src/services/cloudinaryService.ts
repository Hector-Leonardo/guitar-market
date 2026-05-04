/**
 * Servicio de Cloudinary para gestión de imágenes
 * Permite subir, no necesita autenticación en el frontend (usando preset sin firmar)
 */

const CLOUDINARY_CLOUD_NAME = 'dtkwn8jao'
const CLOUDINARY_UPLOAD_PRESET = 'guitarmarket_products' // Necesitamos crear este en Cloudinary

interface UploadResponse {
  success: boolean
  url?: string
  publicId?: string
  error?: string
}

/**
 * Sube una imagen a Cloudinary
 * @param file - Archivo de imagen
 * @param folder - Carpeta en Cloudinary (ej: "products", "users")
 * @returns Objeto con URL y public_id
 */
export const cloudinaryService = {
  async uploadImage(file: File, folder: string = 'guitarmarket'): Promise<UploadResponse> {
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
      formData.append('folder', folder)
      formData.append('resource_type', 'auto')

      console.log('📤 Subiendo imagen a Cloudinary...')

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`)
      }

      const data = await response.json()

      console.log('✅ Imagen subida exitosamente')
      console.log('🔗 URL:', data.secure_url)
      console.log('📝 Public ID:', data.public_id)

      return {
        success: true,
        url: data.secure_url,
        publicId: data.public_id
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error al subir imagen:', errorMsg)
      return {
        success: false,
        error: errorMsg
      }
    }
  },

  /**
   * Obtiene la URL optimizada de una imagen desde Cloudinary
   * @param publicId - Public ID de la imagen (public_id de Cloudinary)
   * @param options - Opciones de transformación
   */
  getOptimizedUrl(
    publicId: string,
    options: {
      width?: number
      height?: number
      quality?: 'auto' | 'good' | 'best'
      format?: 'auto' | 'jpg' | 'webp' | 'png'
    } = {}
  ): string {
    const { width = 800, height = 600, quality = 'auto', format = 'auto' } = options

    return `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/image/upload/w_${width},h_${height},q_${quality},f_${format}/${publicId}`
  },

  /**
   * Elimina una imagen de Cloudinary (requiere backend)
   */
  async deleteImage(publicId: string): Promise<UploadResponse> {
    try {
      const response = await fetch('/api/cloudinary/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ publicId })
      })

      const data = await response.json()

      if (data.success) {
        console.log('🗑️ Imagen eliminada exitosamente')
        return { success: true }
      } else {
        return {
          success: false,
          error: data.error || 'Error al eliminar'
        }
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Error desconocido'
      console.error('❌ Error al eliminar imagen:', errorMsg)
      return {
        success: false,
        error: errorMsg
      }
    }
  }
}
