# 📦 Sistema de Gestión de Envíos

Sistema completo de rastreo y gestión de envíos para Guitar Market.

## 📋 Estructura Implementada

### Backend (Node.js + Express)

#### Servicio: `server/services/shipmentsService.js`
- `getUserShipments(userId)` - Obtener todos los envíos del usuario
- `getShipmentDetails(shipmentId)` - Detalles de un envío
- `getShipmentTracking(shipmentId)` - Información de rastreo
- `createShipment(orderId, userId, shippingData)` - Crear nuevo envío
- `updateShipment(shipmentId, updates)` - Actualizar estado/tracking
- `cancelShipment(shipmentId)` - Cancelar envío
- `getShipmentByOrderId(orderId)` - Buscar por orden

#### Controlador: `server/controllers/shipments.controller.js`
Manejo de todas las peticiones HTTP con validaciones

#### Rutas: `server/routes/shipments.routes.js`
```
GET    /api/shipments/user/:userId
GET    /api/shipments/order/:orderId
GET    /api/shipments/:shipmentId
GET    /api/shipments/:shipmentId/tracking
POST   /api/shipments
PUT    /api/shipments/:shipmentId
POST   /api/shipments/:shipmentId/cancel
```

### Frontend (React + TypeScript)

#### Servicio: `src/services/shipmentService.ts`
Cliente HTTP para comunicarse con el backend

#### Componentes:
1. **ShipmentsManagement.tsx** - Componente principal con lista y filtros
2. **ShipmentCard.tsx** - Card individual para cada envío
3. **ShipmentTracker.tsx** - Vista detallada con timeline de estados

#### Página: `src/pages/ShipmentsPage.tsx`
Página para integrar en el router

#### Tipos: `src/types/index.ts`
- `Shipment` - Estructura completa del envío
- `ShipmentStatus` - Estados posibles
- `ShipmentListItem` - Para listar
- `CarrierType` - Transportistas

## 🚀 Cómo Integrar

### 1. En el App.tsx

```tsx
import { ShipmentsPage } from './pages/ShipmentsPage'

// Dentro del router
<Route path="/shipments" element={<ShipmentsPage />} />
```

### 2. En el Menú de Usuario

```tsx
<a href="/shipments">📦 Mis Envíos</a>
```

### 3. Al Crear una Orden (Próximo Paso)

```ts
// En payment.controller.js
import shipmentsService from '../services/shipmentsService.js'

// Después de crear la orden:
const shipmentResult = await shipmentsService.createShipment(
  order.id,
  userId,
  shippingData
)
```

## 📊 Estados de Envío

| Estado | Icono | Descripción |
|--------|-------|-------------|
| pending | ⏳ | Orden confirmada, pendiente procesamiento |
| processing | ⚙️ | En preparación |
| shipped | 📦 | Entregado al transportista |
| in_transit | 🚚 | En camino |
| delivered | ✅ | Entregado |
| cancelled | ❌ | Cancelado |

## 🔄 Flujo Completo

```
ShippingForm → Checkout → createOrder
                         ↓
                    createShipment
                         ↓
                  status: 'pending'
                         ↓
                  Usuario ve en /shipments
```

## 📱 Características

✅ Lista de envíos con filtros por estado
✅ Vista detallada con timeline
✅ Información de rastreo
✅ Dirección de envío completa
✅ Cancelación de envíos pendientes
✅ Diseño responsive
✅ Estilos consistentes

## 🛠️ Próximos Pasos

1. **Integrar con la creación de órdenes**
   - Crear envío automáticamente al confirmar pago

2. **Panel de Admin**
   - Actualizar estados de envíos
   - Asignar números de rastreo
   - Ver todos los envíos

3. **Integración con Transportistas**
   - API de Estafeta, DHL, FedEx
   - Sincronización de tracking

4. **Notificaciones**
   - Email al cambiar estado
   - Push notifications
   - SMS (opcional)

5. **Base de Datos Persistente**
   - Migrar de Map en memoria a Firestore o SQL
   - Índices y optimización

## 💾 Base de Datos (Próximamente)

### Firestore
```
shipments/
  {shipmentId}/
    orderId: string
    userId: string
    shippingData: ShippingData
    status: ShipmentStatus
    trackingNumber: string
    carrier: CarrierType
    estimatedDelivery: Timestamp
    actualDelivery: Timestamp
    createdAt: Timestamp
    updatedAt: Timestamp
```

### SQL
```sql
CREATE TABLE shipments (
  id VARCHAR(36) PRIMARY KEY,
  orderId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'in_transit', 'delivered', 'cancelled'),
  trackingNumber VARCHAR(100) UNIQUE,
  carrier VARCHAR(50),
  estimatedDelivery DATETIME,
  actualDelivery DATETIME,
  createdAt DATETIME,
  updatedAt DATETIME,
  FOREIGN KEY (orderId) REFERENCES orders(id),
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX (userId, status),
  INDEX (orderId),
  INDEX (trackingNumber)
);
```

## 📝 Ejemplo de Uso del API

### Crear Envío
```bash
POST /api/shipments
{
  "orderId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user123",
  "shippingData": {
    "fullName": "Juan Pérez",
    "phone": "5551234567",
    "street": "Av. Principal 123",
    "city": "Mexico City",
    "state": "CDMX",
    "postalCode": "06500"
  }
}
```

### Obtener Envíos del Usuario
```bash
GET /api/shipments/user/{userId}?status=shipped&limit=10
```

### Actualizar Estado
```bash
PUT /api/shipments/{shipmentId}
{
  "status": "shipped",
  "trackingNumber": "EST123456789",
  "carrier": "estafeta",
  "estimatedDelivery": "2026-05-05T00:00:00Z"
}
```

### Obtener Rastreo
```bash
GET /api/shipments/{shipmentId}/tracking
```

---

**Estado**: Sistema básico implementado ✅
**Próximo**: Integración con creación de órdenes
