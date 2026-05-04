# 🚀 Guía Paso a Paso: Integrar Firebase Firestore

## 🎯 Objetivo

Guardar automáticamente todas las órdenes de pago en Firestore cuando los usuarios paguen con Mercado Pago.

---

## 📋 Requisitos Previos

- ✅ Cuenta de Google (Gmail)
- ✅ Token de Mercado Pago (ya tienes configurado)

---

## 5️⃣ PASOS PARA INTEGRAR FIREBASE

### **PASO 1: Crear Proyecto en Firebase (5 min)**

1. Ve a: **https://console.firebase.google.com/**

2. Click en **"Agregar proyecto"** (o selecciona uno existente)

   ![Firebase Console](https://via.placeholder.com/500x300?text=Firebase+Console)

3. Nombra el proyecto: `guitarmarket-db` (o como prefieras)

4. Click **"Crear proyecto"** → Espera a que se cree

5. Una vez creado, verás la pantalla de inicio

---

### **PASO 2: Obtener Project ID (2 min)**

1. En la pantalla principal, busca el **engranaje** ⚙️ (Project Settings)

2. Click en **"Project Settings"**

3. En la pestaña **"General"**, busca **"Project ID"**

   ```
   Ejemplo: guitarmarket-db-12345
   ```

4. **Copia este ID** - Lo necesitarás en el siguiente paso

---

### **PASO 3: Configurar SQL Firestore (3 min)**

1. En Firebase Console, haz clic en **"Firestore Database"** (en el menú izquierdo)

2. Click **"Crear base de datos"**

3. Elige modo:
   - ✅ **Empezar en modo de prueba** (para desarrollo)
   - (en producción cambias a modo de autenticación)

4. Elige región: **us-central1** (o la más cercana)

5. Click **"Crear"**

   Espera a que Firestore se inicialice...

---

### **PASO 4: Obtener Credenciales (3 min)**

#### **Opción A: Google Cloud CLI (Recomendado - simplest)**

```bash
# 1. Instala Google Cloud SDK desde:
#    https://cloud.google.com/sdk/docs/install

# 2. Ejecuta:
gcloud auth application-default login

# 3. Sigue instrucciones en el navegador
# 4. ¡Listo! Firebase está configurado automáticamente
```

#### **Opción B: Archivo JSON (Alternativa)**

1. En Firebase Console, ve a **Project Settings** → **Service Accounts**

2. Click **"Generate new private key"**

3. Se descarga un archivo JSON

4. Guarda en tu proyecto:
   ```
   /path/to/guitarla-ts/firebase-credentials.json
   ```

5. Configura en `.env`:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=/ruta/completa/firebase-credentials.json
   ```

---

### **PASO 5: Configurar Variables de Entorno (2 min)**

En tu archivo `.env`:

```env
# FIREBASE
FIREBASE_PROJECT_ID=guitarmarket-db-12345
# GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/archivo.json  # Solo si usas JSON
```

---

### **PASO 6: Probar Conexión (1 min)**

Ejecuta:

```bash
npm run test-firebase
```

**Deberías ver:**
```
✅ Firebase Admin inicializado correctamente
✅ Conexión a Firestore exitosa!
✅ Escritura exitosa!
🎉 Todos los tests pasaron correctamente!
```

---

### **PASO 7: Configurar Seguridad en Firestore (5 min)**

#### **Para DESARROLLO (simplificar):**

1. En Firebase Console → Firestore → **"Reglas"**

2. Reemplaza todo con:

```javascript
rules_version = '2';
match /databases/{database}/documents {
  match /{document=**} {
    allow read, write: if true;
  }
}
```

3. Click **"Publicar"**

#### **Para PRODUCCIÓN (más seguro):**

```javascript
rules_version = '2';
match /databases/{database}/documents {
  match /orders/{orderId} {
    allow read: if request.auth != null;
    allow write: if request.auth.token.admin == true;
  }
}
```

---

## 🧪 Probar el Flujo Completo

### **Terminal 1: Inicia Backend**
```bash
npm run server
```

### **Terminal 2: Inicia Frontend**
```bash
npm run dev
```

### **Prueba el Pago:**

1. Abre `http://localhost:5173`
2. Agrega guitarra al carrito
3. Click "Proceder al Pago"
4. Click "Procesar Pago Seguro"
5. Usa tarjeta test: `4111 1111 1111 1111` (exp: 11/25, CVV: 123)
6. Completa pago

### **Verifica en Firestore:**

1. Firebase Console → Firestore
2. Deberías ver colección **"orders"** con tu documento

---

## 📊 Estructura de Datos Guardada

```
Firestore
└── orders/
    └── {autoID}
        ├── orderId: "order-1714008000000-xyz"
        ├── preferenceId: "1234567890"
        ├── items: [
        │   {
        │     title: "Guitarra Acústica",
        │     unit_price: 5000,
        │     quantity: 1
        │   }
        │ ]
        ├── total: 5000
        ├── status: "approved"
        ├── paymentData: {
        │   paymentId: "12345",
        │   transactionAmount: 5000,
        │   paymentStatus: "approved"
        │ }
        ├── createdAt: "2026-04-15T10:30:00Z"
        └── updatedAt: "2026-04-15T10:31:00Z"
```

---

## ✅ Checklist Completo

- [ ] Crear proyecto en Firebase Console
- [ ] Obtener Project ID
- [ ] Crear Firestore Database
- [ ] Configurar credenciales (CLI o JSON)
- [ ] Configurar variables `.env`
- [ ] Ejecutar `npm run test-firebase`
- [ ] Configurar reglas de seguridad
- [ ] Probar flujo completo
- [ ] ¡Órdenes guardándose en Firestore! 🎉

---

## 🆘 Troubleshooting

### Error: "PERMISSION_DENIED"
```
❌ Problema: Reglas de Firestore muy restrictivas

✅ Solución:
   1. Firebase Console → Firestore → Reglas
   2. Cambia a modo prueba (permitir todo)
   3. Publica
```

### Error: "UNAUTHENTICATED"
```
❌ Problema: Credenciales de Google no configuradas

✅ Soluciones:
   1. Ejecuta: gcloud auth application-default login
   2. O descarga JSON y configura GOOGLE_APPLICATION_CREDENTIALS
```

### Error: "Cannot find module"
```
❌ Problema: firebase-admin no instalado

✅ Solución:
   npm install firebase-admin
```

### Las órdenes no se guardan
```
❌ Problema: Firestore no inicializado correctamente

✅ Soluciones:
   1. Ejecuta: npm run test-firebase
   2. Revisa logs del servidor: npm run server
   3. Verifica FIREBASE_PROJECT_ID en .env
```

---

## 🎯 Próximas Mejoras

Después de tener Firestore funcionando, puedes:

1. **Consultar órdenes de un usuario:**
   ```javascript
   const orders = await ordersService.getUserOrders(userId);
   ```

2. **Crear endpoint para ver órdenes:**
   ```javascript
   GET /api/orders/:userId → Retorna todas sus órdenes
   ```

3. **Panel de Admin:**
   - Ver todas las órdenes
   - Filtrar por estado (pending, approved, rejected)
   - Exportar reportes

4. **Emails automáticos:**
   - Confirmación de pago
   - Envío de factura
   - Notificación de preparación

---

## 📚 Referencias

- [Firebase Setup](https://firebase.google.com/docs/admin/setup)
- [Firestore Node.js](https://firebase.google.com/docs/firestore/quickstart)
- [Google Cloud Auth](https://cloud.google.com/docs/authentication)
- [Firestore Reglas de Seguridad](https://firebase.google.com/docs/firestore/security/start)

---

## ✨ ¡Listo!

Una vez completado todos los pasos, tu proyecto tendrá:

✅ Pagos con Mercado Pago  
✅ Órdenes guardadas en Firestore  
✅ Webhooks actualizando estado de órdenes  
✅ Base de datos lista para escalar  

¡Ahora a vender guitarras! 🎸
