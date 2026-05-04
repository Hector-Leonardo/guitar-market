# 🧪 Guía de Prueba - Sistema de Gestión de Envíos

## 📋 Requisitos Previos

- [x] Backend corriendo en `http://localhost:3000`
- [x] Frontend corriendo en `http://localhost:5173` (o puerto Vite)
- [x] Autenticación funcional (Firebase)
- [x] Mercado Pago configurado (token en `.env`)
- [x] Sistema de órdenes funcional

## 🚀 Pasos de Prueba

### PASO 1: Registrarse o Iniciar Sesión
```
1. Ir a http://localhost:5173
2. Hacer clic en "Registrarse" o "Iniciar Sesión"
3. Crear una cuenta o iniciar sesión con credenciales existentes
4. Verificar que estés autenticado
```

### PASO 2: Agregar Producto al Carrito
```
1. Ver la colección de guitarras
2. Hacer clic en una guitarra
3. Hacer clic en "Agregar al Carrito"
4. Ver que se agregó al carrito (ícono del carrito muestra cantidad)
```

### PASO 3: Proceder al Pago
```
1. Hacer clic en el ícono del carrito 🛒
2. Ver los productos agregados
3. Hacer clic en "Proceder al Pago"
```

### PASO 4: Completar Formulario de Envío
```
1. Se muestra ShippingForm.tsx
2. Llenar los siguientes campos:
   - Nombre completo: Juan Pérez
   - Teléfono: 5551234567
   - Calle: Av. Principal 123
   - Apartamento: Apto 10 (opcional)
   - Ciudad: Mexico City
   - Estado: CDMX
   - Código Postal: 06500
   - Método de envío: Standard ($50), Express ($150), Overnight ($300)
3. Hacer clic en "Continuar"
```

### PASO 5: Revisar Orden Antes de Pagar
```
1. Se muestra CheckoutReview.tsx
2. Verificar:
   - Productos listados correctamente
   - Total sin envío
   - Costo de envío según método seleccionado
   - Total final (productos + envío)
   - Información de envío
3. Hacer clic en "Pagar" o "Editar" para cambiar
```

### ✅ PASO 6: CREAR ORDEN Y ENVÍO (Backend)
```
Backend (autom ático):
1. Frontend envía:
   POST /api/create-order
   {
     items: [...],
     userId: "user123",
     shippingData: {...},
     total: 1250
   }

2. payment.controller.js (createOrder):
   - Crea preferencia en Mercado Pago
   - Llama a ordersService.createOrder({
       orderId,
       preferenceId,
       items,
       total,
       status: 'pending',
       userId,
       shippingData,  ← CLAVE
       metadata: {...}
     })

3. ordersService.js (createOrder):
   - Guarda orden en Firestore ✅
   - AUTOMÁTICAMENTE crea envío:
     await shipmentsService.createShipment(
       orderId,
       userId,
       shippingData
     )
   
4. shipmentsService.js (createShipment):
   - Crea documento de envío:
     {
       id: "uuid",
       orderId: "order-123",
       userId: "user123",
       shippingData: {...},
       status: "pending",
       trackingNumber: null,
       carrier: null,
       createdAt: "2026-04-30T...",
       updatedAt: "2026-04-30T..."
     }
   - RETORNA el envío al cliente

5. Cliente recibe:
   {
     success: true,
     init_point: "https://www.mercadopago.com.mx/...",
     preference_id: "123456789",
     order_id: "order-123"
   }

6. Sesión Storage:
   - guitarmarket_order guardado con:
     {
       orderId,
       preferenceId,
       items,
       subtotal,
       shippingCost,
       total,
       shippingData,
       timestamp
     }
```

### PASO 7: Procesar Pago en Mercado Pago (TEST)
```
1. Se abre Mercado Pago
2. Redirigido a checkout de MP
3. Para PRUEBAS:
   - Email: test@test.com
   - Método: Tarjeta de crédito (TEST)
   - Tarjeta: 4111 1111 1111 1111
   - Vencimiento: 11/25
   - CVV: 123
   - Documento: 12345678
4. Hacer clic en "Pagar"
```

### PASO 8: Webhook y Actualización de Orden
```
Backend (automático después del pago):
1. Mercado Pago envía webhook:
   POST /api/webhook
   {
     type: "payment",
     data: { id: "payment123" }
   }

2. payment.controller.js (receiveWebhook):
   - Obtiene información del pago
   - Verifica estado: approved, rejected, pending
   - Llama a ordersService.updateOrderStatus(
       orderId,
       "approved",  ← Estado actualizado
       { paymentId, amount, ... }
     )

3. ordersService.js (updateOrderStatus):
   - Actualiza orden en Firestore
   - status: "approved"
```

### PASO 9: Ver Mis Envíos en el Frontend
```
1. Usuario regresa a la tienda
2. Hace clic en el botón 📦 (Mis Envíos) en el header
3. ShipmentsPage.tsx carga
4. ShipmentsManagement.tsx obtiene envíos:
   GET /api/shipments/user/{userId}

5. shipmentService.ts:
   - Llama al backend para obtener envíos

6. shipments.controller.js (getUserShipments):
   - Obtiene todos los envíos del usuario
   - Retorna lista formateada:
     [
       {
         id: "uuid",
         orderId: "order-123",
         status: "pending",
         trackingNumber: null,
         estimatedDelivery: null,
         createdAt: "2026-04-30T...",
         recipientName: "Juan Pérez",
         city: "Mexico City"
       }
     ]

7. ShipmentsManagement muestra:
   ✅ Lista de envíos
   ✅ Filtros por estado
   ✅ Tarjetas con información resumida
   ✅ Estado visual (ícono + color)
```

### PASO 10: Ver Detalles del Envío
```
1. Hace clic en "Ver Detalles" en una tarjeta
2. ShipmentTracker.tsx obtiene detalles:
   GET /api/shipments/{shipmentId}

3. Muestra:
   ✅ Número de rastreo (cuando se asigne)
   ✅ Transportista
   ✅ Entrega estimada
   ✅ Dirección de envío completa
   ✅ Timeline visual de estados:
      - Orden Confirmada ✅
      - Procesando ⚙️
      - Enviado 📦
      - En Tránsito 🚚
      - Entregado 🏠
   ✅ Botón para cancelar (si está permitido)
```

## 🔍 Verificación de Consola

### Cliente (Browser DevTools - Console)
```javascript
// Debería ver logs como:
✅ Datos de envío confirmados: {...}
✅ === INICIANDO PROCESO DE PAGO ===
📦 Artículos en el carrito: 1
💰 Total productos: 1000
🚚 Costo de envío: 50
💰 Total con envío: 1050
✅ === PAGO PROCESADO EXITOSAMENTE ===
📋 Preference ID: 123456789
🔗 Redirigiendo a Mercado Pago...
```

### Servidor (Backend Terminal)
```
✅ Solicitud recibida
✅ Token detectado
📦 Items recibidos: 1
📍 Datos de envío: Sí
💰 Total con envío: 1050
✅ Preferencia creada exitosamente
✅ Orden guardada en Firestore
📦 [ÓRDENES] Creando envío asociado a la orden...
✅ [ÓRDENES] Envío creado automáticamente: uuid
🔔 Webhook recibido
💰 Información del pago recibida
🔗 Webhook procesado
✅ Orden actualizada a approved
```

## 📊 Estados del Envío

Durante las pruebas, el envío estará en estado `pending`. Para cambiar el estado manualmente (simulación):

```javascript
// En el servidor (para desarrollo)
const shipment = shipmentsDB.get('shipmentId')
shipmentsDB.set(shipment.id, {
  ...shipment,
  status: 'processing',  // o 'shipped', 'in_transit', 'delivered'
  trackingNumber: 'EST123456789',
  carrier: 'estafeta',
  estimatedDelivery: '2026-05-05T00:00:00Z'
})
```

O usar el endpoint PUT:
```bash
curl -X PUT http://localhost:3000/api/shipments/{shipmentId} \
  -H "Content-Type: application/json" \
  -d '{
    "status": "shipped",
    "trackingNumber": "EST123456789",
    "carrier": "estafeta",
    "estimatedDelivery": "2026-05-05T00:00:00Z"
  }'
```

## 🐛 Problemas Comunes

### "No hay envíos" en ShipmentsManagement
- ✅ Verificar que estés autenticado
- ✅ Verificar que hayas completado una orden (hasta pago confirmado)
- ✅ Verificar userId coincida en orden y envío
- ✅ Revisar consola del servidor para errores en createShipment

### Envío no se crea automáticamente
- ✅ Verificar que shippingData se pase en createOrder
- ✅ Verificar que userId esté presente
- ✅ Revisar logs: "Creando envío asociado a la orden"
- ✅ Verificar que shipmentsService está importado en ordersService.js

### ShipmentsPage muestra "Autenticación Requerida"
- ✅ Asegurar que useAuth() retorna user correctamente
- ✅ Verificar que currentUser se pasa como userId
- ✅ Revisar que ShipmentsPage esté correctamente integrado en App.tsx

### Botón 📦 no aparece en Header
- ✅ Verificar que onShowShipments se pase como prop
- ✅ Verificar que está en el estado showShipments de App.tsx
- ✅ Revisar console para errores de TypeScript

## ✅ Checklist de Prueba Exitosa

- [ ] Usuario registrado/autenticado
- [ ] Producto agregado al carrito
- [ ] Formulario de envío completado
- [ ] Orden creada en Firestore
- [ ] Envío creado automáticamente
- [ ] Orden pagada en Mercado Pago
- [ ] Webhook procesado correctamente
- [ ] Botón 📦 visible en Header
- [ ] Envíos visibles en /shipments
- [ ] Detalles del envío se cargan correctamente
- [ ] Timeline visual funciona
- [ ] Filtros de estado funcionan
- [ ] Sin errores en consola

## 🎉 ¡Listo!

Si todos los pasos se completaron exitosamente, el sistema de gestión de envíos está **100% funcional**.

---

**Próximos pasos sugeridos:**
1. Crear panel de admin para gestionar envíos
2. Integración con APIs de transportistas
3. Sistema de notificaciones por email
4. Historial detallado de eventos
5. Generar etiquetas de envío
