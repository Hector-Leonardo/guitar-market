# 🎸 GuitarLA - Tienda de Guitarras con Mercado Pago + Firestore

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Una tienda e-commerce de guitarras construida con **React + TypeScript (Vite)** en el frontend y **Node.js + Express** en el backend.

**Características principales:**
- 🛒 Carrito de compras dinámico
- 💳 Integración con Mercado Pago (pagos seguros)
- 🔔 Webhooks en tiempo real
- 💾 Persistencia en Firestore
- 📱 Responsive design
- 🚀 Optimizado para producción

---

## 📸 Demo

```
Frontend (Vite)                Backend (Express)              Firestore
localhost:5173   ←→   localhost:3000   ←→   Firebase
  │                        │
  ├─ Carrito               ├─ Mercado Pago API
  ├─ Checkout             ├─ Órdenes
  └─ Tienda               └─ Webhooks
```

---

## 🚀 Quick Start (5 minutos)

### **Instalación**

```bash
# 1. Clonar proyecto
git clone [repo-url]
cd guitarla-ts-main

# 2. Instalar dependencias
npm install

# 3. Configurar Mercado Pago
# Obtén token en: https://www.mercadopago.com/developers/panel/credentials
# Copia en .env:
MP_ACCESS_TOKEN=APP_USR-xxxx...

# 4. Configurar Firebase (OPCIONAL pero RECOMENDADO)
npm run setup-firebase

# 5. Iniciar servidores
# Terminal 1:
npm run server

# Terminal 2:
npm run dev
```

Listo! Abierto en: `http://localhost:5173`

---

## 📁 Estructura del Proyecto

```
guitarla-ts-main/
├── client/
│   └── src/
│       ├── components/      # React components
│       │   ├── Checkout.tsx # Página de pago
│       │   └── ...
│       ├── services/        # API clients
│       └── App.tsx
├── server/
│   ├── controllers/         # Lógica de negocio
│   │   ├── payment.controller.js
│   │   └── orders.controller.js
│   ├── routes/              # Rutas API
│   ├── services/            # Firestore
│   ├── config/              # Variables
│   └── index.js             # Express setup
├── public/                  # HTML estáticos
│   ├── payment-success.html
│   └── payment-failure.html
├── scripts/                 # Ayudantes
│   ├── setup-firebase.js
│   └── test-firebase.js
├── .env                     # Tu configuración
└── package.json
```

---

## 🔧 Configuración

### **Variables de Entorno (.env)**

```env
# ========== MERCADO PAGO ==========
MP_ACCESS_TOKEN=APP_USR-xxxx...          # Token de MP
CLIENT_ID=xxx                            # ID de cliente MP
CLIENT_SECRET=xxx                        # Secret de cliente MP
APP_URL=http://localhost:3000            # URL del servidor

# ========== SERVIDOR ==========
PORT=3000

# ========== FIREBASE (OPCIONAL) ==========
FIREBASE_PROJECT_ID=tu_proyecto
GOOGLE_APPLICATION_CREDENTIALS=/ruta/credenciales.json
```

### **Obtener Credenciales**

#### Mercado Pago
1. Ve a: https://www.mercadopago.com/developers/panel/credentials
2. Copia el **Access Token**
3. Pégalo en `.env`

#### Firebase (Opcional)
Ver: [QUICK_START_FIREBASE.md](./QUICK_START_FIREBASE.md)

---

## 🔌 API Endpoints

### **Pagos**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/create-order` | POST | Crear orden de pago |
| `/api/success` | GET | Callback éxito |
| `/api/failure` | GET | Callback error |
| `/api/webhook` | POST | Notificaciones Mercado Pago |

### **Órdenes**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/orders` | GET | Listar órdenes (filtros) |
| `/api/orders/:orderId` | GET | Obtener orden específica |

---

## 🧪 Testing

### **Prueba Local**

1. Terminal 1:
   ```bash
   npm run server
   ```

2. Terminal 2:
   ```bash
   npm run dev
   ```

3. Abre: `http://localhost:5173`

4. Agrega guitarra → Click "Proceder al Pago" → Usa tarjeta test

### **Tarjetas de Prueba (Sandbox)**

| Número | Estado |
|--------|--------|
| 4111 1111 1111 1111 | ✅ Aprobada |
| 5555 5555 5555 4444 | ✅ Aprobada |

Vencimiento: `11/25`, CVV: `123`

### **Verificar Firestore**

```bash
npm run test-firebase
```

---

## 📦 Scripts Disponibles

```bash
# Frontend & Backend
npm run dev              # Inicia Vite (frontend)
npm run server           # Inicia Express (backend)
npm run build            # Build para producción
npm run lint             # Verificar código

# Firebase
npm run setup-firebase   # Setup interactivo
npm run test-firebase    # Probar conexión a Firestore
```

---

## 🔄 Flujo de Pagos

```
1. Usuario añade guitarra al carrito
   ↓
2. Hace click en "Proceder al Pago"
   ↓
3. Ve resumen de compra en Checkout
   ↓
4. Click "Procesar Pago Seguro"
   ↓
5. Frontend → POST /api/create-order
   ↓
6. Backend → Crea Preference en Mercado Pago
   ↓
7. Backend → Guarda orden en Firestore (pending)
   ↓
8. Cliente redirige a Mercado Pago
   ↓
9. Usuario paga
   ↓
   ├─→ ÉXITO:  Redirige a /api/success ✅
   │           Backend actualiza: status = "approved"
   │
   └─→ FALLO:  Redirige a /api/failure ❌
               Backend no actualiza

10. Webhook notifica al backend
    └─→ Backend actualiza orden en Firestore
```

---

## 🗄️ Datos en Firestore

```json
{
  "collection": "orders",
  "document": {
    "orderId": "order-1714008000000-xyz",
    "preferenceId": "1234567890",
    "items": [
      {
        "title": "Guitarra Acústica",
        "unit_price": 5000,
        "quantity": 1
      }
    ],
    "total": 5000,
    "status": "approved",
    "paymentData": {
      "paymentId": "12345",
      "transactionAmount": 5000,
      "paymentStatus": "approved"
    },
    "createdAt": "2026-04-15T10:30:00Z",
    "updatedAt": "2026-04-15T10:31:00Z"
  }
}
```

---

## 📚 Documentación

- **[QUICK_START_FIREBASE.md](./QUICK_START_FIREBASE.md)** - Guía rápida Firestore (5 min)
- **[FIREBASE_INTEGRATION_GUIDE.md](./FIREBASE_INTEGRATION_GUIDE.md)** - Guía completa Firestore
- **[FIREBASE_SETUP.md](./FIREBASE_SETUP.md)** - Setup detallado
- **[SERVER_README.md](./SERVER_README.md)** - Documentación del backend

---

## 🚀 Deployment

### **Heroku**

```bash
heroku create mi-guitarla
heroku config:set MP_ACCESS_TOKEN=APP_USR-...
heroku config:set FIREBASE_PROJECT_ID=...
git push heroku main
```

### **Railway**

Similar a Heroku - Configurar variables y deploy.

### **Vercel + Backend en Heroku**

- Frontend: Vercel
- Backend: Heroku
- DB: Firebase Firestore (gratis)

---

## 🛠️ Tecnologías

### Frontend
- React 19 + TypeScript
- Vite (bundler)
- Tailwind CSS
- Responsive design

### Backend
- Node.js + Express
- Mercado Pago SDK
- Firebase Admin SDK
- Firestore

### Database
- Google Cloud Firestore
- Collections: `orders`, `users` (futuro)

---

## 🔐 Seguridad

✅ Variables sensitivas en `.env`  
✅ Token de Mercado Pago solo en servidor  
✅ Webhooks validados (implementar firma)  
✅ CORS configurado  
✅ Firestore con reglas de seguridad  

---

## 🐛 Troubleshooting

### "MP_ACCESS_TOKEN not configured"
```
Solución: Configura en .env y reinicia npm run server
```

### "Cannot connect to Firestore"
```
Solución: Ejecuta npm run test-firebase
```

### "CORS error"
```
Solución: Asegúrate que APP_URL es correcto en .env
```

---

## 📈 Roadmap

- [ ] Sistema de usuarios (login/register)
- [ ] Historial de órdenes por usuario
- [ ] Panel de admin
- [ ] Sistema de envíos
- [ ] Emails automáticos
- [ ] Descuentos y cupones
- [ ] Reviews de productos
- [ ] Wishlist

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas! Abre un PR.

---

## 📄 Licencia

MIT - Ver [LICENSE](LICENSE)

---

## 📧 Soporte

- 📖 Revisa la documentación
- 🐛 Abre un issue
- 💬 Contacta: support@guitarmarket.com

---

## ⭐ Si te fue útil, marca con ⭐!

Made with ❤️ for guitarists everywhere 🎸
