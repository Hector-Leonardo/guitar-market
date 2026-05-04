import { Router } from 'express'
import { deleteImage } from '../controllers/cloudinary.controller.js'

const router = Router()

// Ruta para eliminar imagen
router.delete('/delete', deleteImage)

export default router