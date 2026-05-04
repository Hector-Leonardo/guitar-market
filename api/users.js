import { getFirestore } from './lib/firebase.js';

async function handleUsersEndpoint(req, res) {
  const db = getFirestore();
  
  if (!db) {
    return res.status(500).json({
      success: false,
      error: 'Base de datos no disponible',
    });
  }

  const { method, url } = req;
  const path = url.replace('/api/users', '').split('?')[0];

  try {
    // POST /api/users - Crear nuevo usuario
    if (method === 'POST' && path === '') {
      const { uid, email, displayName } = req.body;

      if (!uid || !email) {
        return res.status(400).json({
          success: false,
          error: 'uid y email son requeridos',
        });
      }

      const userRef = db.collection('users').doc(uid);
      const userDoc = await userRef.get();

      if (userDoc.exists) {
        return res.status(200).json({
          success: true,
          user: userDoc.data(),
          message: 'Usuario ya existe',
        });
      }

      const userData = {
        uid,
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await userRef.set(userData);

      return res.status(201).json({
        success: true,
        user: userData,
        message: 'Usuario creado exitosamente',
      });
    }

    // GET /api/users/:userId - Obtener perfil de usuario
    const userIdMatch = path.match(/^\/([^\/]+)$/);
    if (method === 'GET' && userIdMatch) {
      const userId = userIdMatch[1];

      // Validar que no sea una subruta especial
      if (userId === 'vendors') {
        return handleGetVendors(db, res);
      }

      const userDoc = await db.collection('users').doc(userId).get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
        });
      }

      return res.status(200).json({
        success: true,
        user: userDoc.data(),
      });
    }

    // POST /api/users/:userId/become-vendor - Convertir en vendedor
    const becomeVendorMatch = path.match(/^\/([^\/]+)\/become-vendor$/);
    if (method === 'POST' && becomeVendorMatch) {
      const userId = becomeVendorMatch[1];
      const { storeName, description } = req.body;

      if (!storeName) {
        return res.status(400).json({
          success: false,
          error: 'storeName es requerido',
        });
      }

      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
        });
      }

      const vendorInfo = {
        storeName,
        description: description || '',
        totalSales: 0,
        totalRevenue: 0,
        rating: 0,
        ratingCount: 0,
        createdAt: new Date().toISOString(),
      };

      const updatedData = {
        ...userDoc.data(),
        vendorInfo,
        updatedAt: new Date().toISOString(),
      };

      await userRef.set(updatedData);

      return res.status(200).json({
        success: true,
        user: updatedData,
        message: 'Ahora eres vendedor',
      });
    }

    // PUT /api/users/:userId/store-info - Actualizar información de tienda
    const storeInfoMatch = path.match(/^\/([^\/]+)\/store-info$/);
    if (method === 'PUT' && storeInfoMatch) {
      const userId = storeInfoMatch[1];
      const { storeName, description } = req.body;

      const userRef = db.collection('users').doc(userId);
      const userDoc = await userRef.get();

      if (!userDoc.exists) {
        return res.status(404).json({
          success: false,
          error: 'Usuario no encontrado',
        });
      }

      const userData = userDoc.data();
      if (!userData.vendorInfo) {
        return res.status(400).json({
          success: false,
          error: 'El usuario no es vendedor',
        });
      }

      const updatedData = {
        ...userData,
        vendorInfo: {
          ...userData.vendorInfo,
          storeName: storeName || userData.vendorInfo.storeName,
          description: description !== undefined ? description : userData.vendorInfo.description,
        },
        updatedAt: new Date().toISOString(),
      };

      await userRef.set(updatedData);

      return res.status(200).json({
        success: true,
        user: updatedData,
        message: 'Información de tienda actualizada',
      });
    }

    // POST /api/users/vendor/:vendorId/products - Crear producto
    const createProductMatch = path.match(/^\/vendor\/([^\/]+)\/products$/);
    if (method === 'POST' && createProductMatch) {
      const vendorId = createProductMatch[1];
      const { name, description, price, stock, category, imageUrl } = req.body;

      if (!name || !price) {
        return res.status(400).json({
          success: false,
          error: 'name y price son requeridos',
        });
      }

      const productId = `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const productData = {
        id: productId,
        vendorId,
        name,
        description: description || '',
        price: Number(price),
        stock: Number(stock) || 0,
        category: category || 'general',
        imageUrl: imageUrl || '',
        sales: 0,
        rating: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await db.collection('vendorProducts').doc(productId).set(productData);

      return res.status(201).json({
        success: true,
        product: productData,
        message: 'Producto creado exitosamente',
      });
    }

    // GET /api/users/vendor/:vendorId/products - Obtener productos del vendedor
    const getProductsMatch = path.match(/^\/vendor\/([^\/]+)\/products$/);
    if (method === 'GET' && getProductsMatch) {
      const vendorId = getProductsMatch[1];

      const snapshot = await db
        .collection('vendorProducts')
        .where('vendorId', '==', vendorId)
        .get();

      const products = snapshot.docs.map(doc => doc.data());

      return res.status(200).json({
        success: true,
        products,
      });
    }

    // GET /api/users/vendor/:vendorId/stats - Obtener estadísticas del vendedor
    const getStatsMatch = path.match(/^\/vendor\/([^\/]+)\/stats$/);
    if (method === 'GET' && getStatsMatch) {
      const vendorId = getStatsMatch[1];

      const userDoc = await db.collection('users').doc(vendorId).get();
      const userData = userDoc.data();

      if (!userData?.vendorInfo) {
        return res.status(400).json({
          success: false,
          error: 'El usuario no es vendedor',
        });
      }

      const stats = {
        totalSales: userData.vendorInfo.totalSales || 0,
        totalRevenue: userData.vendorInfo.totalRevenue || 0,
        totalOrders: userData.vendorInfo.totalOrders || 0,
        rating: userData.vendorInfo.rating || 0,
        ratingCount: userData.vendorInfo.ratingCount || 0,
      };

      return res.status(200).json({
        success: true,
        stats,
      });
    }

    // GET /api/users/vendors - Obtener todos los vendedores
    if (method === 'GET' && path === '/vendors') {
      return handleGetVendors(db, res);
    }

    // POST /api/users/vendor/:vendorId/ratings - Crear calificación
    const rateVendorMatch = path.match(/^\/vendor\/([^\/]+)\/ratings$/);
    if (method === 'POST' && rateVendorMatch) {
      const vendorId = rateVendorMatch[1];
      const { buyerId, rating, comment } = req.body;

      if (!buyerId || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({
          success: false,
          error: 'buyerId y rating (1-5) son requeridos',
        });
      }

      const ratingId = `rating-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const ratingData = {
        id: ratingId,
        vendorId,
        buyerId,
        rating: Number(rating),
        comment: comment || '',
        createdAt: new Date().toISOString(),
      };

      await db.collection('vendorRatings').doc(ratingId).set(ratingData);

      // Actualizar promedio de calificación del vendedor
      const ratingsSnapshot = await db
        .collection('vendorRatings')
        .where('vendorId', '==', vendorId)
        .get();

      const allRatings = ratingsSnapshot.docs.map(doc => doc.data());
      const averageRating = allRatings.reduce((sum, r) => sum + r.rating, 0) / allRatings.length;

      const userRef = db.collection('users').doc(vendorId);
      const userDoc = await userRef.get();
      const userData = userDoc.data();

      const updatedData = {
        ...userData,
        vendorInfo: {
          ...userData.vendorInfo,
          rating: averageRating,
          ratingCount: allRatings.length,
        },
        updatedAt: new Date().toISOString(),
      };

      await userRef.set(updatedData);

      return res.status(201).json({
        success: true,
        rating: ratingData,
        message: 'Calificación registrada',
      });
    }

    return res.status(404).json({
      success: false,
      error: 'Endpoint no encontrado',
    });
  } catch (error) {
    console.error('❌ Error en usuarios API:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

async function handleGetVendors(db, res) {
  try {
    const snapshot = await db.collection('users').where('vendorInfo', '!=', null).get();

    const vendors = [];
    for (const doc of snapshot.docs) {
      const userData = doc.data();
      const productsSnapshot = await db
        .collection('vendorProducts')
        .where('vendorId', '==', doc.id)
        .get();

      vendors.push({
        id: doc.id,
        name: userData.displayName || userData.email,
        vendorInfo: userData.vendorInfo,
        productCount: productsSnapshot.size,
      });
    }

    return res.status(200).json({
      success: true,
      vendors,
    });
  } catch (error) {
    console.error('❌ Error obteniendo vendedores:', error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}

export default async function handler(req, res) {
  // Headers CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return handleUsersEndpoint(req, res);
}
