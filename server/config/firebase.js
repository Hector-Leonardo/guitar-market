import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

dotenv.config();

const __dirname = dirname(fileURLToPath(import.meta.url));

// Verificar que Firebase esté configurado
if (!process.env.FIREBASE_PROJECT_ID) {
  console.warn('⚠️  FIREBASE_PROJECT_ID no está configurado. Las órdenes no se guardarán en Firestore.');
  console.warn('Configura las variables FIREBASE_* en .env para usar persistencia.');
}

console.log('📋 [FIREBASE] FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('📋 [FIREBASE] GOOGLE_APPLICATION_CREDENTIALS:', process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Inicializar Firebase Admin
let db = null;

try {
  if (!admin.apps.length) {
    // Convertir ruta de Windows a formato compatible
    const credPath = process.env.GOOGLE_APPLICATION_CREDENTIALS?.replace(/\\/g, '/');
    
    console.log('📋 [FIREBASE] Ruta de credenciales normalizada:', credPath);
    
    const config = {
      projectId: process.env.FIREBASE_PROJECT_ID,
    };
    
    // Si hay credenciales, usarlas; si no, confiar en Application Default Credentials
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      config.credential = admin.credential.cert(credPath);
      console.log('✅ [FIREBASE] Usando credenciales de archivo JSON');
    } else {
      config.credential = admin.credential.applicationDefault();
      console.log('⚠️  [FIREBASE] Usando Application Default Credentials (sin archivo JSON)');
    }
    
    admin.initializeApp(config);
    db = admin.firestore();
    console.log('✅ [FIREBASE] Firebase inicializado correctamente');
  } else {
    db = admin.firestore();
    console.log('✅ [FIREBASE] Firestore obtenido de instancia existente');
  }
} catch (error) {
  console.error('❌ [FIREBASE] Error al inicializar Firebase:', error.message);
  console.error('🔍 [FIREBASE] Stack:', error.stack);
  console.error('ℹ️  [FIREBASE] Ejecuta: firebase emulator:start (para desarrollo local)');
  console.error('ℹ️  [FIREBASE] O configura las credenciales de Firebase correctamente.');
}

export { db, admin };
