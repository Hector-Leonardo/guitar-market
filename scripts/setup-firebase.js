#!/usr/bin/env node

/**
 * Script interactivo para setup de Firebase
 * Uso: node scripts/setup-firebase.js
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (q) =>
  new Promise((resolve) => {
    rl.question(q, (answer) => {
      resolve(answer);
    });
  });

console.log('\n🔧 Setup de Firebase Firestore para GuitarLA\n');
console.log('Este script te ayudará a configurar Firebase.\n');

(async () => {
  try {
    // Paso 1: Verificar si ya está configurado
    const envPath = '.env';
    let envContent = '';

    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf-8');
      const hasProjectId = envContent.includes('FIREBASE_PROJECT_ID');

      if (hasProjectId) {
        const answer = await question(
          '✅ Ya tienes FIREBASE_PROJECT_ID configurado. ¿Quieres reconfigurarlo? (s/n): '
        );

        if (answer.toLowerCase() !== 's') {
          console.log('\n👍 Setup cancelado. Tu configuración se mantiene intacta.\n');
          rl.close();
          process.exit(0);
        }
      }
    }

    // Paso 2: Obtener Project ID
    console.log('\n1️⃣  Obtén tu Project ID de Firebase:\n');
    console.log('   • Ve a: https://console.firebase.google.com/');
    console.log('   • Selecciona tu proyecto');
    console.log('   • En Project Settings (engranaje) → Project ID\n');

    const projectId = await question('📝 Ingresa tu FIREBASE_PROJECT_ID: ');

    if (!projectId.trim()) {
      console.log('\n❌ Project ID es requerido.\n');
      rl.close();
      process.exit(1);
    }

    // Paso 3: Obtener credenciales
    console.log('\n2️⃣  Obtén tus credenciales de Firebase:\n');
    console.log('   Opción A (Recomendado para desarrollo):');
    console.log('   • Ejecuta: gcloud auth application-default login');
    console.log('   • Sigue las instrucciones en el navegador\n');

    console.log('   Opción B (Usando archivo JSON):');
    console.log('   • Ve a: https://console.firebase.google.com/');
    console.log('   • Project Settings → Service Accounts');
    console.log('   • Click "Generate new private key"');
    console.log('   • Descarga el archivo JSON\n');

    const credsPath = await question('📝 Ruta al archivo de credenciales (o deja vacío para Opción A): ');

    // Paso 4: Configurar .env
    let newEnvContent = envContent;

    // Remover línea anterior si existe
    newEnvContent = newEnvContent
      .split('\n')
      .filter((line) => !line.startsWith('FIREBASE_PROJECT_ID'))
      .join('\n');

    // Agregar nueva configuración
    if (!newEnvContent.includes('# FIREBASE')) {
      newEnvContent += '\n# =====================================================\n# FIREBASE\n# =====================================================\n';
    }

    newEnvContent += `\nFIREBASE_PROJECT_ID=${projectId}\n`;

    if (credsPath.trim()) {
      newEnvContent += `GOOGLE_APPLICATION_CREDENTIALS=${credsPath}\n`;
    }

    // Guardar .env
    fs.writeFileSync(envPath, newEnvContent, 'utf-8');

    console.log('\n✅ Configuración guardada en .env\n');

    // Paso 5: Crear estructura en Firestore
    console.log('3️⃣  Creando reglas de seguridad en Firestore:\n');
    console.log('   Para desarrollo, usa estas reglas:');
    console.log(`
rules_version = '2';
match /databases/{database}/documents {
  match /{document=**} {
    allow read, write: if true;
  }
}
    `);

    console.log('   Para producción:');
    console.log(`
rules_version = '2';
match /databases/{database}/documents {
  match /orders/{orderId} {
    allow read: if request.auth != null || true;
    allow write: if request.auth.token.admin == true;
  }
  match /users/{uid} {
    allow read, write: if request.auth.uid == uid;
  }
}
    `);

    // Paso 6: Probar conexión (opcional)
    const testNow = await question(
      '\n¿Quieres probar la conexión ahora? (s/n): '
    );

    if (testNow.toLowerCase() === 's') {
      console.log('\n🧪 Probando conexión...\n');
      
      try {
        // Dinámicamente importar el test
        const { execSync } = await import('child_process');
        execSync('node scripts/test-firebase.js', { stdio: 'inherit' });
      } catch (error) {
        console.error('\n⚠️  Error en la prueba. Revisa los detalles arriba.\n');
      }
    }

    console.log('\n✨ Setup completado! Ahora puedes:\n');
    console.log('   1. Ejecutar: npm run server');
    console.log('   2. Procesar pagos en la tienda');
    console.log('   3. Las órdenes se guardarán en Firestore automáticamente\n');

    console.log('📚 Revisa la documentación general del proyecto si necesitas más detalle\n');

    rl.close();
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error:', error.message, '\n');
    rl.close();
    process.exit(1);
  }
})();
