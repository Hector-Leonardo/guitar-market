# 🎸 Guitar Market - Backend (Mercado Pago + Node.js)

## Descripción

Backend que integra **Mercado Pago** como pasarela de pagos para la tienda de guitarras. Maneja:
- ✅ Creación de órdenes de pago
- ✅ Webhooks de Mercado Pago
- ✅ Persistencia de órdenes en Firestore (opcional)
- ✅ Redirecciones post-pago (éxito/fallo)

---

## 📁 Estructura

```
server/
├── index.js                      # Servidor Express principal
├── config/
│   ├── config.js                 # Variables de entorno
│   └── firebase.js               # Configuración de Firebase (opcional)
├── routes/
│   └── payment.routes.js         # Rutas de API
├── controllers/
│   └── payment.controller.js     # Lógica de pagos
└── services/
    └── ordersService.js          # Servicio de órdenes (Firestore)
```

---

## 🚀 Quick Start

### **1. Instalar Dependencias**

```bash
npm install
```

### **2. Configurar `.env`**

```bash
cp .env.example .env
```

Edita `.env` con:
```env
MP_ACCESS_TOKEN=APP_USR-xxxx...    # Token de Mercado Pago
APP_URL=http://localhost:3000       # URL del servidor
PORT=3000
```

### **3. Iniciar Servidor**

```bash
npm run server
```

Verás:
```
🚀 Servidor Mercado Pago ejecutándose en http://localhost:3000
```

---

## 🔌 Endpoints API

### **POST /api/create-order**

Crear una orden de pago.

**Request:**
```json
{
  "items": [
    {
      "title": "Guitarra Acústica",
      "unit_price": 5000,
      "quantity": 1,
      "currency_id": "MXN"
    }
  ],
  "userId": "user123" // Opcional
}
```

**Response (Éxito):**
```json
{
  "success": true,
  "init_point": "https://www.mercadopago.com/checkout/v1/...",
  "preference_id": "1234567890",
  "order_id": "order-1714008000000-xyz123"
}
```

**Response (Error):**
```json
{
  "success": false,
  "error": "El carrito está vacío",
  "details": "No se puede crear una orden sin productos"
}
```

---

### **GET /api/success**

Redirect tras pago exitoso.

**URL:** `http://localhost:3000/api/success?order_id=order-xxx`

**Retorna:** `payment-success.html`

---

### **GET /api/failure**

Redirect tras pago fallido.

**URL:** `http://localhost:3000/api/failure?order_id=order-xxx`

**Retorna:** `payment-failure.html`

---

### **POST/GET /api/webhook**

Recibe notificaciones de Mercado Pago.

**Tipos de notificación:**
- `payment` - Estado del pago cambió
- `merchant_order` - Orden de comerciante

**Ejemplo - Mercado Pago envía:**
```json
{
  "type": "payment",
  "data": {
    "id": "12345678901234"
  }
}
```

**Backend procesa:**
1. Obtiene detalles del pago
2. Actualiza orden en Firestore
3. Responde con 200 OK

---

## 🔄 Flujo Completo

```
┌─────────────────┐
│  Cliente React  │
└────────┬────────┘
         │ Haz clic en "Proceder al Pago"
         ↓
┌─────────────────────────────────────┐
│ POST /api/create-order              │
│ { items, userId }                   │
└────────┬────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────────────┐
│ Backend: payment.controller.js                   │
│ 1. Crea Preference en Mercado Pago              │
│ 2. Guarda orden en Firestore (pending)          │
│ 3. Retorna init_point                           │
└────────┬─────────────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│ Respuesta:                               │
│ {                                        │
│   init_point: "https://mercadopago..." │
│   order_id: "order-xxx"                │
│ }                                        │
└────────┬─────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│ Cliente redirige a Mercado Pago         │
│ Usuario ingresa datos de tarjeta        │
│ Completa el pago                        │
└────────┬─────────────────────────────────┘
         │
         ├─→ Éxito → Redirige a /api/success
         │
         └─→ Fracaso → Redirige a /api/failure
         
         ↓ (Simultáneo)
         
┌──────────────────────────────────────────┐
│ Mercado Pago → POST /api/webhook        │
│ Notifica: payment status changed        │
└────────┬─────────────────────────────────┘
         │
         ↓
┌──────────────────────────────────────────┐
│ Backend: payment.controller.js           │
│ 1. Obtiene detalles del pago            │
│ 2. Actualiza orden en Firestore         │
│   status: "approved" / "rejected"       │
│ 3. Responde con 200 OK                  │
└──────────────────────────────────────────┘
```

---

## 🔐 Variables de Entorno

| Variable | Requerido | Descripción |
|----------|-----------|-------------|
| `MP_ACCESS_TOKEN` | ✅ | Token de Mercado Pago |
| `APP_URL` | ✅ | URL del servidor (para webhooks) |
| `PORT` | ❌ | Puerto (default: 3000) |
| `FIREBASE_PROJECT_ID` | ❌ | Project ID de Firebase (opcional) |

---

## 🧪 Testing

### **1. Con Postman/Insomnia**

```bash
POST http://localhost:3000/api/create-order
Content-Type: application/json

{
  "items": [
    {
      "title": "Guitarra de Prueba",
      "unit_price": 100,
      "quantity": 1,
      "currency_id": "MXN"
    }
  ]
}
```

### **2. Tarjetas de Prueba (Sandbox)**

| Número | Estado | Vencimiento | CVV |
|--------|--------|-------------|-----|
| 4111 1111 1111 1111 | ✅ Aprobada | 11/25 | 123 |
| 5555 5555 5555 4444 | ✅ Aprobada | 11/25 | 123 |

---

## 🔍 Logs y Debugging

El servidor imprime logs detallados:

```
🔔 Webhook recibido
Query: { type: "payment", id: "12345" }
Body: { data: { id: "12345" } }

💰 Información del pago recibida:
Estado: approved
Monto: 5000
ID de orden externa: order-1714008000000-xyz

✅ Orden guardada en Firestore: xyz789
✅ Orden actualizada a approved
```

---

## 📊 Órdenes en Firestore

Cuando Firebase está configurado, se guardan así:

```json
{
  "orderId": "order-1714008000000-xyz",
  "preferenceId": "1234567890",
  "items": [...],
  "total": 5000,
  "status": "approved",
  "userId": "user123",
  "paymentData": {
    "paymentId": "12345678901234",
    "transactionAmount": 5000,
    "paymentStatus": "approved"
  },
  "createdAt": "2026-04-15T10:30:00Z",
  "updatedAt": "2026-04-15T10:31:00Z"
}
```

---

## ⚠️ Troubleshooting

### "MP_ACCESS_TOKEN not configured"
```
❌ Error: No se ha configurado MP_ACCESS_TOKEN

✅ Solución:
   1. Obtén el token en: https://www.mercadopago.com/developers/panel/credentials
   2. Pégalo en .env: MP_ACCESS_TOKEN=APP_USR-...
   3. Reinicia: npm run server
```

### "Cannot POST /api/create-order"
```
❌ Error: 404 Not Found

✅ Solución:
   - Verifica que el servidor está corriendo
   - Usa http://localhost:3000, no https
   - La URL debe ser exacta: /api/create-order
```

### "Webhook not received"
```
❌ Error: Mercado Pago no envía notificaciones

✅ Soluciones:
   1. APP_URL debe ser público (usar ngrok en dev)
   2. Whitelist IP de Mercado Pago en firewall
   3. Verifica que /api/webhook no devuelve error 500
   4. Revisa logs del servidor: npm run server
```

---

## 🚀 Deployment

### **Heroku**

```bash
# 1. Crear app
heroku create mi-app

# 2. Configurar variables
heroku config:set MP_ACCESS_TOKEN=APP_USR-...
heroku config:set APP_URL=https://mi-app.herokuapp.com

# 3. Deploy
git push heroku main
```

### **Vercel (No recomendado para backend persistente)**

Usa Heroku, Railway, o AWS Lambda para backend.

---

## 📚 Documentación

- [Mercado Pago Docs](https://www.mercadopago.com.mx/developers/es/docs)
- [Firebase Setup](./FIREBASE_SETUP.md)
- [Express.js](https://expressjs.com/)

---

## 📧 Soporte

Para problemas:
1. Revisa los logs: `npm run server`
2. Consulta FIREBASE_SETUP.md
3. Verifica token de Mercado Pago
4. Usa ngrok para webhooks en dev
