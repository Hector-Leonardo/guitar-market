# ⚡ Guía Rápida: Integrar Firebase (5 minutos)

## 🔥 TL;DR - Resumen Ejecutivo

Si solo quieres que funcione rápido:

```bash
# 1. Ejecutar setup interactivo
npm run setup-firebase

# 2. Responder las preguntas
# 3. Probar conexión
npm run test-firebase

# 4. ¡Listo! Las órdenes se guardan automáticamente
```

---

## 📋 Lista de Tareas

### **1️⃣ Obtener Project ID de Firebase (2 min)**

- [ ] Ve a https://console.firebase.google.com/
- [ ] Crea un proyecto o selecciona uno existente
- [ ] Project Settings → copia **Project ID**
  ```
  Ejemplo: guitarmarket-db-abc123
  ```

### **2️⃣ Configurar Google Cloud Credentials (3 min)**

**OPCIÓN A: Google Cloud CLI** (Recomendado - simplissimo)

```bash
gcloud auth application-default login
```

Eso es. Permiso concedido automáticamente.

**OPCIÓN B: Archivo JSON**

- Firebase Console → Project Settings → Service Accounts
- Click "Generate new private key"
- Descarga el archivo
- Guarda en: `/path/to/guitarla-ts/firebase-credentials.json`

### **3️⃣ Configurar `.env` (1 min)**

```env
FIREBASE_PROJECT_ID=guitarmarket-db-abc123

# Opcional si usas JSON en lugar de CLI:
# GOOGLE_APPLICATION_CREDENTIALS=/ruta/al/archivo.json
```

### **4️⃣ Crear Firestore Database (1 min)**

- Firebase Console → Firestore Database
- Click "Create database"
- Modo: **Prueba** (desarrollo)
- Región: **us-central1**
- Click "Create"

### **5️⃣ Configurar Seguridad (1 min)**

Firestore → Reglas → Copiar y pegar:

```javascript
rules_version = '2';
match /databases/{database}/documents {
  match /{document=**} {
    allow read, write: if true;
  }
}
```

Click "Publish"

### **6️⃣ Probar Conexión (1 min)**

```bash
npm run test-firebase
```

✅ Deberías ver:
```
✅ Firebase Admin inicializado correctamente
✅ Conexión a Firestore exitosa!
✅ Escritura exitosa!
```

---

## 🚀 ¡Ya Está Funcionando!

Ahora cuando proceses pagos:

1. Usuario compra guitarra
2. Paga con Mercado Pago
3. Backend crea Preference + **guarda en Firestore** ✅
4. Mercado Pago redirige a success
5. Webhook actualiza orden → **"approved"** ✅

---

## 📍 Verificar en Firebase Console

Firestore → Collections → **orders** → Ver documento

```json
{
  "orderId": "order-1714008000000-xyz",
  "items": [...],
  "total": 5000,
  "status": "approved",  ← Updated by webhook
  "paymentData": {...},
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

## 📱 Endpoints para Consultar Órdenes

```bash
# Ver órdenes de un usuario
GET /api/orders?userId=user123

# Ver orden específica
GET /api/orders/order-1714008000000-xyz

# Ver órdenes aprobadas de un usuario
GET /api/orders?userId=user123&status=approved&limit=10
```

---

## ✨ Comandos Útiles

```bash
# Setup interactivo
npm run setup-firebase

# Probar conexión
npm run test-firebase

# Iniciar servidor (con Firestore automático)
npm run server

# Iniciar frontend
npm run dev
```

---

## 🆘 Si Algo Falla

```bash
# 1. Verificar conexión
npm run test-firebase

# 2. Ver logs del servidor
npm run server

# 3. Verificar variables .env
cat .env

# 4. Revisar documentación completa
less FIREBASE_SETUP.md
```

---

## 🎯 Próximas Features

Después de esto, puedes agregar:

- [ ] Endpoint para ver historial de órdenes del usuario
- [ ] Emails de confirmación
- [ ] Panel de admin con reportes
- [ ] Integración con sistema de envíos
- [ ] Historial de transacciones

---

¡Done! 🎉 Tu base de datos está lista para escalar.
