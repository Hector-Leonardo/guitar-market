import axios from 'axios'
import crypto from 'crypto'

// Eliminar imagen de Cloudinary
export const deleteImage = async (req, res) => {
  try {
    const { publicId } = req.body

    if (!publicId) {
      return res.status(400).json({
        success: false,
        error: 'publicId es requerido'
      })
    }

    const cloudinaryCloudName = process.env.CLOUDINARY_CLOUD_NAME
    const cloudinaryApiKey = process.env.CLOUDINARY_API_KEY
    const cloudinaryApiSecret = process.env.CLOUDINARY_API_SECRET

    if (!cloudinaryApiSecret || !cloudinaryApiKey) {
      console.error('❌ Credenciales de Cloudinary no configuradas')
      return res.status(500).json({
        success: false,
        error: 'Credenciales de Cloudinary no configuradas'
      })
    }

    // Llamar API de Cloudinary para eliminar
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryCloudName}/image/destroy`

    const deleteResponse = await axios.post(cloudinaryUrl, {
      public_id: publicId,
      api_key: cloudinaryApiKey,
      signature: generateSignature(publicId, cloudinaryApiSecret, cloudinaryApiKey)
    })

    console.log(`✅ Imagen eliminada de Cloudinary: ${publicId}`)

    res.json({
      success: true,
      message: 'Imagen eliminada exitosamente',
      data: deleteResponse.data
    })
  } catch (error) {
    console.error('❌ Error al eliminar imagen:', error.message)
    res.status(500).json({
      success: false,
      error: error.message || 'Error al eliminar imagen'
    })
  }
}

// Función para generar firma de Cloudinary
function generateSignature(publicId, apiSecret, apiKey) {
  const timestamp = Math.floor(Date.now() / 1000)

  const stringToSign = `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`
  const signature = crypto.createHash('sha1').update(stringToSign).digest('hex')

  return signature
}