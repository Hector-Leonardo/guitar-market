# 🔐 Configuración de Firebase + Firestore

## Introducción

Esta guía te ayuda a configurar Firebase Admin SDK para que el backend pueda guardar órdenes en Firestore.

---

## 📋 Opciones de Setupeo

### **OPCIÓN 1: Desarrollo Local (Sin Firebase configurado)**

✅ **Fácil para empezar**
- El servidor funciona sin Firebase
- Las órdenes NO se guardan en BD (solo en memoria)
- Los webhooks siguen funcionando
- Perfecto para testing inicial

**Pasos:**
```bash
# Ya está hecho - solo ejecuta:
npm run server
```

---

### **OPCIÓN 2: Con Firebase (Recomendado para Producción)**

Para guardar órdenes en Firestore:

#### **Paso 1: Obtener Credenciales de Firebase**

1. Ve a: https://console.firebase.google.com/
2. Crea un proyecto o selecciona uno existente
3. Ve a **"Project Settings" → "Service Accounts"**
4. Click en **"Generate new private key"**
5. Descarga el archivo JSON

#### **Paso 2: Configurar Google Cloud Credentials**

**En Windows:**

```bash
# Guarda el archivo JSON en una carpeta segura
# Por ejemplo: C:\firebase-credentials.json

# Configura la variable de entorno:
set GOOGLE_APPLICATION_CREDENTIALS=C:\firebase-credentials.json

# En .env también puedes agregar:
FIREBASE_PROJECT_ID=tu_project_id
```

**En macOS/Linux:**

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/credentials.json
echo $GOOGLE_APPLICATION_CREDENTIALS
```

**En tu `.env`:**
```env
FIREBASE_PROJECT_ID=mi_proyecto_firebase
GOOGLE_APPLICATION_CREDENTIALS=/ruta/a/credenciales.json
```

#### **Paso 3: Verificar Connection**

Ejecuta el servidor:
```bash
npm run server
```

Deberías ver:
```
✅ Firebase inicializado correctamente
```

---

## 📊 Schema de Firestore

El backend crea automáticamente esta estructura:

```
Firestore Database
└── orders/ (Colección)
    └── {documento}
        ├── orderId: "order-1714008000000-xyz123"
        ├── preferenceId: "1234567890"
        ├── items: [
        │   {
        │     title: "Guitarra Acústica",
        │     unit_price: 5000,
        │     quantity: 1,
        │     currency_id: "MXN"
        │   }
        │ ]
        ├── total: 5000
        ├── status: "pending" | "approved" | "rejected"
        ├── userId: "user-id-opcional"
        ├── paymentData: {
        │   paymentId: "12345678901234",
        │   transactionAmount: 5000,
        │   currency: "MXN",
        │   paymentMethod: "credit_card",
        │   paymentStatus: "approved",
        │   updatedAt: timestamp
        │ }
        ├── metadata: {
        │   source: "guitarmarket-checkout",
        │   userAgent: "Mozilla/5.0..."
        │ }
        ├── createdAt: timestamp
        └── updatedAt: timestamp
```

---

## 🧪 Testing con Firebase Emulator

Para testing local sin cuenta Google real:

```bash
# 1. Instalar Firebase CLI
npm install -g firebase-tools

# 2. Login
firebase login

# 3. Inicializar proyecto (si no lo hiciste)
firebase init

# 4. Iniciar emulador
firebase emulator:start

# 5. En otra terminal:
export FIRESTORE_EMULATOR_HOST=localhost:8080
npm run server
```

---

## 🔄 Cómo Funciona el Flujo

### **Sin Firebase:**
```
Cliente → /api/create-order → Backend crea Preference MP → Devuelve init_point
                              ⚠️ Orden NO se guarda en BD
```

### **Con Firebase:**
```
Cliente → /api/create-order → Backend crea Preference MP
                              ✅ Backend guarda orden en Firestore (pending)
                              → Devuelve init_point

(Usuario paga)

Mercado Pago → /api/webhook → Backend obtiene Payment info
                              ✅ Backend actualiza orden en Firestore (approved)
                              → Estado final guardado
```

---

## 🚀 Próximos Pasos

- [ ] Configurar autenticación de usuarios
- [ ] Implementar endpoint para que usuarios vean sus órdenes
- [ ] Agregar emails de confirmación
- [ ] Crear panel de admin para ver todas las órdenes
- [ ] Implementar reintento automático de webhooks

---

## ❓ Troubleshooting

### Error: "GOOGLE_APPLICATION_CREDENTIALS not found"
```
✅ Solución: Verifica que la ruta al archivo JSON existe
              firebase init firestore
```

### Error: "Permission denied" en Firestore
```
✅ Solución: Revisa las reglas de seguridad en Firebase Console
              rules_version = '2';
              match /databases/{database}/documents {
                match /{document=**} {
                  allow read, write: if request.auth != null;
                }
              }
```

### Error: "Cannot read property 'db' of undefined"
```
✅ Solución: Firestore no está inicializado correctamente
              Verifica FIREBASE_PROJECT_ID en .env
              firebase emulator:start
```

---

## 📚 Referencias

- [Firebase Admin Setup](https://firebase.google.com/docs/admin/setup)
- [Firestore Node.js](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Emulator Suite](https://firebase.google.com/docs/emulator-suite)
