#!/usr/bin/env node

/**
 * Script para verificar la conexión a Firestore
 * Uso: node scripts/test-firebase.js
 */

import dotenv from 'dotenv';
import admin from 'firebase-admin';

dotenv.config();

console.log('🧪 Probando Conexión a Firebase Firestore...\n');

// Verificar variables de entorno
console.log('📋 Verificando configuración:');
console.log(`├─ FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID ? '✅' : '❌'}`);
console.log(`├─ GOOGLE_APPLICATION_CREDENTIALS: ${process.env.GOOGLE_APPLICATION_CREDENTIALS ? '✅' : '❌'}`);
console.log(`└─ NODE_ENV: ${process.env.NODE_ENV || 'development'}\n`);

// Intentar inicializar Firebase
try {
  if (!admin.apps.length) {
    const app = admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID,
      credential: admin.credential.applicationDefault(),
    });
    console.log('✅ Firebase Admin inicializado correctamente\n');
  }

  const db = admin.firestore();

  // Intentar una operación de lectura simple
  console.log('🔍 Intentando conectar a Firestore...');
  
  const testDoc = await db.collection('_test').doc('connection-test').get();
  
  console.log('✅ Conexión a Firestore exitosa!\n');

  // Probar escritura
  console.log('📝 Probando escritura a Firestore...');
  await db.collection('_test').doc('connection-test').set({
    timestamp: new Date(),
    message: 'Connection test successful',
  });
  
  console.log('✅ Escritura exitosa!\n');

  // Probar creación de colección
  console.log('📊 Verificando colecciones:');
  const collections = await db.listCollections();
  
  if (collections.length === 0) {
    console.log('ℹ️  No hay colecciones aún. Se crearán cuando hagas tu primer pago.\n');
  } else {
    console.log(`✅ Encontradas ${collections.length} colecciones:`);
    collections.forEach((col) => {
      console.log(`   └─ ${col.id}`);
    });
    console.log();
  }

  console.log('🎉 Todos los tests pasaron correctamente!\n');
  console.log('Puedes comenzar a procesar pagos y guardarán en Firestore.\n');

  process.exit(0);
} catch (error) {
  console.error('\n❌ Error al conectar a Firestore:\n');
  
  if (error.code === 'PERMISSION_DENIED') {
    console.error('Problema: Permisos insuficientes en Firestore');
    console.error('Solución: Revisa las reglas de seguridad en Firebase Console');
    console.error('Regla recomendada para desarrollo:');
    console.error(`
rules_version = '2';
match /databases/{database}/documents {
  match /{document=**} {
    allow read, write: if request.auth != null || true;
  }
}
`);
  } else if (error.code === 'UNAUTHENTICATED') {
    console.error('Problema: No estás autenticado en Google Cloud');
    console.error('Soluciones:');
    console.error('  1. Ejecuta: gcloud auth application-default login');
    console.error('  2. O descarga credenciales JSON en: https://console.firebase.google.com/');
    console.error('  3. Configura: export GOOGLE_APPLICATION_CREDENTIALS=/ruta/archivo.json');
  } else if (!process.env.FIREBASE_PROJECT_ID) {
    console.error('Problema: FIREBASE_PROJECT_ID no está configurado');
    console.error('Solución: Agrega a .env:');
    console.error('  FIREBASE_PROJECT_ID=tu_project_id');
  } else {
    console.error('Mensaje:', error.message);
    console.error('\nDetalles:', error);
  }

  console.error('\n📚 Documentación: Revisa FIREBASE_SETUP.md\n');
  process.exit(1);
}
