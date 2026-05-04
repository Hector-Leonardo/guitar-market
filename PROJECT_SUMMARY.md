# 🎉 INTEGRACIÓN COMPLETA: Mercado Pago + Firestore

## ✅ Estado del Proyecto

```
╔════════════════════════════════════════════════════════════════╗
║         GUITARLA - TIENDA DE GUITARRAS CON PAGOS             ║
╚════════════════════════════════════════════════════════════════╝

┌──────────────┐                                    ┌─────────────────┐
│   FRONTEND   │  Componentes React + TypeScript  │  BACKEND        │
│   Vite       │                                    │  Node + Express │
│              │  ├─ Tienda (Gallery)              │                 │
│localhost:5173├──┤ Carrito (Cart)                 ├─ REST API       │
│              │  ├─ Checkout (Pago)              │  /api/create-   │
│              │  └─ Éxito/Fallo                  │  order          │
│              │                                    │  /api/webhook   │
└──────────────┘                                    │  /api/orders    │
                                                    │localhost:3000   │
                                                    └────────┬────────┘
                                                             │
                                    ┌────────────────────────┼────────────────────────┐
                                    │                        │                        │
                          ┌─────────▼─────────┐  ┌──────────▼──────────┐  ┌─────────▼──────────┐
                          │  MERCADO PAGO API │  │  FIRESTORE         │  │  WEBHOOKS         │
                          │                   │  │                    │  │                    │
                          │ ├─ Create Order  │  │ ├─ orders coll    │  │ ├─ Payment events  │
                          │ ├─ Preferences   │  │ ├─ users coll     │  │ ├─ Order updates   │
                          │ ├─ Payments      │  │ ├─ transactions   │  │ └─ Status changes  │
                          │ └─ Notifications │  │ └─ Reportes       │  │                    │
                          └─────────────────┘  └────────────────────┘  └────────────────────┘
                                    │
                          ┌─────────▼─────────────────┐
                          │   PASARELA DE PAGO MP     │
                          │   (Usuario entra datos    │
                          │    tarjeta, completa      │
                          │    transacción)           │
                          └──────────────────────────┘
```

---

## 📊 Estructura de Archivos

```
guitarla-ts-main/
│
├── 📁 src/                          (FRONTEND - React + TypeScript)
│   ├── 📁 components/
│   │   ├── 📄 Checkout.tsx          ← Página de pago
│   │   ├── 📄 PaymentSuccess.tsx    ← Éxito del pago
│   │   ├── 📄 PaymentFailure.tsx    ← Error del pago
│   │   ├── 📄 Header.tsx            ← Con botón "Proceder al Pago"
│   │   ├── 📄 Guitar.tsx            ← Guitarra individual
│   │   └── 📄 ...
│   ├── 📁 services/
│   │   └── 📄 paymentService.ts     ← Cliente API
│   ├── 📁 hooks/
│   │   └── 📄 useCart.ts            ← Manejo del carrito
│   ├── 📁 types/
│   │   └── 📄 index.ts              ← TypeScript types
│   ├── 📄 App.tsx                   ← Router checkout
│   ├── 📄 main.tsx
│   └── 📄 index.css
│
├── 📁 server/                       (BACKEND - Node.js + Express)
│   ├── 📁 controllers/
│   │   ├── 📄 payment.controller.js ← Lógica de pagos
│   │   └── 📄 orders.controller.js  ← Consulta de órdenes
│   ├── 📁 routes/
│   │   └── 📄 payment.routes.js     ← Rutas API
│   ├── 📁 services/
│   │   └── 📄 ordersService.js      ← Firestore queries
│   ├── 📁 config/
│   │   ├── 📄 config.js             ← Variables de entorno
│   │   └── 📄 firebase.js           ← Setup Firebase Admin
│   └── 📄 index.js                  ← Servidor Express
│
├── 📁 public/                       (Páginas estáticas)
│   ├── 📄 payment-success.html      ← Éxito (redirige MP)
│   ├── 📄 payment-failure.html      ← Error (redirige MP)
│   └── 📁 img/
│
├── 📁 scripts/                      (Ayudantes)
│   ├── 📄 setup-firebase.js         ← Setup interactivo
│   └── 📄 test-firebase.js          ← Probar conexión
│
├── 📁 node_modules/                 (Dependencias)
│
├── 📄 .env                          ← Configuración local
├── 📄 .env.example                  ← Plantilla
├── 📄 .gitignore
├── 📄 package.json                  ← Scripts + dependencias
├── 📄 tsconfig.json
├── 📄 vite.config.ts
│
├── 📚 README_COMPLETE.md            ← Documentación principal
├── 📚 QUICK_START_FIREBASE.md       ← Guía rápida (5 min)
├── 📚 FIREBASE_INTEGRATION_GUIDE.md ← Guía completa
├── 📚 FIREBASE_SETUP.md             ← Setup detallado
└── 📚 SERVER_README.md              ← Documentación backend

```

---

## 🔄 Flujo Completo de Datos

```
┌─────────────────────────────────────────────────────────────────────────┐
│ 1. USUARIO EN TIENDA (React Frontend)                                   │
│    - Ve guitarras disponibles                                           │
│    - Agrega al carrito (localStorage)                                   │
├─────────────────────────────────────────────────────────────────────────┤
│ 2. ABRE CARRITO (Header Component)                                      │
│    - Ve items + total                                                   │
│    - Click en "🔒 Proceder al Pago"                                     │
├─────────────────────────────────────────────────────────────────────────┤
│ 3. COMPONENTE CHECKOUT (React Component)                                │
│    - Muestra resumen del pedido                                         │
│    - Tabla: Producto | Precio | Cantidad | Subtotal                    │
│    - Total a pagar                                                      │
│    - Click en "Procesar Pago Seguro"                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ 4. CLIENTE → BACKEND (paymentService.ts)                                │
│    POST /api/create-order                                              │
│    {                                                                    │
│      items: [{ title, unit_price, quantity, currency_id }],           │
│      userId: "user123"                                                 │
│    }                                                                    │
├─────────────────────────────────────────────────────────────────────────┤
│ 5. BACKEND PROCESA (payment.controller.js)                              │
│    ├─ Valida items (no vacío)                                          │
│    ├─ Genera orderId único                                             │
│    ├─ Calcula total                                                    │
│    ├─ 💾 Guarda en Firestore (status: "pending")                       │
│    ├─ Crea Preference en Mercado Pago API                              │
│    └─ Retorna init_point (URL de pago)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│ 6. FRONTEND REDIRIGE A MERCADO PAGO                                      │
│    window.location.href = init_point                                    │
│    ↓                                                                    │
│    Usuario ve pasarela Mercado Pago                                    │
│    Ingresa datos de tarjeta                                            │
│    Completa pago                                                       │
├─────────────────────────────────────────────────────────────────────────┤
│ 7. MERCADO PAGO - RESULTADO DEL PAGO                                    │
│    ├─ ÉXITO (approved):                                                │
│    │  └─ Redirige a: /api/success → payment-success.html              │
│    │     Usuario ve: "¡Pago Exitoso!"                                 │
│    │                                                                   │
│    ├─ FALLO (rejected):                                               │
│    │  └─ Redirige a: /api/failure → payment-failure.html             │
│    │     Usuario ve: "¡Pago No Completado!"                          │
│    │                                                                   │
│    └─ PENDIENTE (pending):                                            │
│       └─ Redirige a: /api/pending                                     │
│          Usuario ve: "Pago Pendiente de Confirmación"                │
├─────────────────────────────────────────────────────────────────────────┤
│ 8. WEBHOOKS EN TIEMPO REAL (Simultáneo, no espera usuario)             │
│    Mercado Pago → POST /api/webhook                                     │
│    {                                                                    │
│      type: "payment",                                                  │
│      data: { id: "12345678901234" }                                   │
│    }                                                                    │
│                                                                        │
│    Backend procesa:                                                    │
│    ├─ Obtiene detalles del pago                                       │
│    ├─ Valida transacción                                              │
│    ├─ 💾 Actualiza en Firestore:                                      │
│    │   ├─ status: "approved"  (si pago exitoso)                      │
│    │   ├─ status: "rejected"  (si pago falló)                        │
│    │   └─ paymentData: {...}                                         │
│    ├─ ✉️ Enviaría email (TODO)                                        │
│    └─ Responde 200 OK a Mercado Pago                                  │
├─────────────────────────────────────────────────────────────────────────┤
│ 9. BASE DE DATOS - ORDEN FINAL EN FIRESTORE                             │
│    orders/documento123                                                 │
│    {                                                                    │
│      orderId: "order-1714008000000-xyz",                              │
│      preferenceId: "1234567890",                                      │
│      items: [...],                                                    │
│      total: 5000,                                                     │
│      status: "approved",          ← Updated by webhook                │
│      paymentData: {                                                   │
│        paymentId: "12345678901234",                                   │
│        transactionAmount: 5000,                                       │
│        paymentStatus: "approved"                                      │
│      },                                                               │
│      createdAt: "2026-04-15...",                                      │
│      updatedAt: "2026-04-15..."                ← Updated by webhook   │
│    }                                                                    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 Stack Tecnológico

```
FRONTEND (Vite + React)
├─ React 19
├─ TypeScript 5.9
├─ Vite 7.1
└─ Tailwind CSS (styling)

BACKEND (Node.js)
├─ Express 5.1
├─ mercadopago SDK 2.5
├─ firebase-admin 13.8
└─ morgan (logging)

DATABASE
├─ Firebase Firestore
│  ├─ Collections: orders, users
│  └─ Real-time sync
└─ Google Cloud Storage (futuro)

DEPLOYMENT
├─ Frontend: Vercel / Netlify
├─ Backend: Heroku / Railway
└─ Database: Google Cloud Firestore (gratis)
```

---

## 🎯 Comandos Ejecutables

```bash
# ============= INSTALACIÓN =============
npm install                 # Instala todas las dependencias

# ============= DESARROLLO =============
npm run dev                # Inicia frontend (Vite) - Puerto 5173
npm run server             # Inicia backend (Express) - Puerto 3000

# ============= FIREBASE =============
npm run setup-firebase     # Setup interactivo
npm run test-firebase      # Prueba conexión a Firestore

# ============= PRODUCCIÓN =============
npm run build              # Build frontend + backend
npm run preview            # Preview de build
npm run lint               # Lint código

# ============= OTROS =============
npm run start              # Inicia app (producción)
```

---

## ✅ Checklist: ¿Qué Tengo Listo?

```
MERCADO PAGO
  ✅ Backend Express en puerto 3000
  ✅ Endpoint POST /api/create-order
  ✅ Creación de Preferences
  ✅ Redirección a pasarela
  ✅ Manejo de callbacks (success/failure)
  ✅ Webhooks en /api/webhook

FIRESTORE
  ✅ Firebase Admin SDK instalado
  ✅ Config en server/config/firebase.js
  ✅ Service: ordersService.js
  ✅ Guardado de órdenes (create)
  ✅ Actualización de órdenes (webhook)
  ✅ Consulta de órdenes (getOrders)
  ✅ Endpoints /api/orders

FRONTEND
  ✅ React + TypeScript
  ✅ Componente Checkout
  ✅ Componentes éxito/error
  ✅ Integración con carrito
  ✅ PaymentService (cliente API)
  ✅ Botón "Proceder al Pago"

DOCUMENTACIÓN
  ✅ README_COMPLETE.md (principal)
  ✅ QUICK_START_FIREBASE.md (rápido)
  ✅ FIREBASE_INTEGRATION_GUIDE.md (completo)
  ✅ SERVER_README.md (backend)
  ✅ .env.example (template)
```

---

## 🚀 ¿Qué Hacer Ahora?

### **Opción 1: Empezar con Firebase**
```bash
npm run setup-firebase
npm run test-firebase
```

### **Opción 2: Probar sin Firebase primero**
```bash
npm run server  # Terminal 1
npm run dev     # Terminal 2
```

### **Opción 3: Leer documentación**
- Guía rápida: `QUICK_START_FIREBASE.md`
- Guía completa: `FIREBASE_INTEGRATION_GUIDE.md`

---

## 🎉 ¡Proyecto Completado!

Has logrado:
1. ✅ Tienda de guitaras (Frontend React)
2. ✅ Sistema de carrito dinámico
3. ✅ Pagos con Mercado Pago (seguro)
4. ✅ Backend con Node.js + Express
5. ✅ Webhooks en tiempo real
6. ✅ Base de datos con Firestore
7. ✅ Documentación completa

**¿Listo para vender guitaras? 🎸**
