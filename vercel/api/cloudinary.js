import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function handleCloudinaryEndpoint(req, res) {
  const { method, url } = req;
  const path = url.replace('/api/cloudinary', '').split('?')[0];

  try {
    // POST /api/cloudinary/upload
    if (method === 'POST' && path === '/upload') {
      if (!req.body.file) {
        return res.status(400).json({
          success: false,
          error: 'No file provided',
        });
      }

      try {
        const result = await cloudinary.uploader.upload(req.body.file, {
          folder: 'guitarmarket/products',
          resource_type: 'auto',
        });

        return res.status(200).json({
          success: true,
          imageUrl: result.secure_url,
          publicId: result.public_id,
        });
      } catch (error) {
        console.error('❌ Error uploading to Cloudinary:', error);
        return res.status(500).json({
          success: false,
          error: 'Error uploading image',
          details: error.message,
        });
      }
    }

    return res.status(404).json({
      success: false,
      error: 'Endpoint no encontrado',
    });
  } catch (error) {
    console.error('❌ Error en cloudinary API:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return handleCloudinaryEndpoint(req, res);
}
