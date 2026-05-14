# 🚀 GUÍA DE INTEGRACIÓN - SISTEMA DE VENDEDORES

## ✅ LO QUE YA ESTÁ HECHO

1. **Tipos actualizados** - `src/types/index.ts`
   - SellerProfile, Product, Order, SellerStats, ProductCategory

2. **Servicios creados**
   - `src/services/sellerService.ts` - Gestión de vendedores
   - `src/services/productService.ts` - Búsqueda de productos
   - `src/services/orderService.ts` - Gestión de órdenes

3. **Contexto y hooks actualizados**
   - `src/context/AuthContext.tsx` - Integración de perfil vendedor
   - `src/hooks/useAuth.ts` - Hook mejorado

4. **Componentes creados**
   - `src/components/BecomeSeller.tsx` - Formulario convertirse en vendedor
   - `src/components/SellerDashboard.tsx` - Dashboard del vendedor
   - `src/components/ProductForm.tsx` - Crear/editar productos

5. **Reglas de Firestore**
   - `FIRESTORE_SELLER_RULES.txt` - Listo para copiar/pegar

---

## ⏳ PASOS FINALES (RÁPIDO)

### PASO 1: Actualizar App.tsx

Tu `App.tsx` actualmente no usa React Router. Tienes dos opciones:

#### **OPCIÓN A: Mantener el enfoque actual (Recomendado para MVP)**

Agrega estos estados y condicionales en `AppContent()`:

```tsx
// Línea ~18, después de const [showShipments, setShowShipments] = useState(false)

const [showBecomeSeller, setShowBecomeSeller] = useState(false)
const [showSellerDashboard, setShowSellerDashboard] = useState(false)
const [showProductForm, setShowProductForm] = useState(false)
const [editingProductId, setEditingProductId] = useState<string | null>(null)
```

Luego, agrega estas líneas ANTES del "return normal" (antes de la vista de tienda):

```tsx
// Si está creando/siendo vendedor
if (showBecomeSeller) {
  return (
    <>
      <Header 
        cart={cart}
        removeFromCart={removeFromCart}
        decreaseQuantity={decreaseQuantity}
        increaseQuantity={increaseQuantity}
        clearCart={clearCart}
        isEmpty={isEmpty}
        cartTotal={cartTotal}
        onShowShipments={() => setShowShipments(true)}
      />
      <BecomeSeller />
      <footer className="bg-dark mt-5 py-5">
        <div className="container-xl">
          <p className="text-white text-center fs-4 mt-4 m-md-0">GuitarLA - Todos los derechos Reservados</p>
        </div>
      </footer>
    </>
  )
}

// Si está en dashboard del vendedor
if (showSellerDashboard) {
  return (
    <>
      <Header 
        cart={cart}
        removeFromCart={removeFromCart}
        decreaseQuantity={decreaseQuantity}
        increaseQuantity={increaseQuantity}
        clearCart={clearCart}
        isEmpty={isEmpty}
        cartTotal={cartTotal}
        onShowShipments={() => setShowShipments(true)}
      />
      <SellerDashboard />
      <footer className="bg-dark mt-5 py-5">
        <div className="container-xl">
          <p className="text-white text-center fs-4 mt-4 m-md-0">GuitarLA - Todos los derechos Reservados</p>
        </div>
      </footer>
    </>
  )
}

// Si está creando/editando producto
if (showProductForm) {
  return (
    <>
      <Header 
        cart={cart}
        removeFromCart={removeFromCart}
        decreaseQuantity={decreaseQuantity}
        increaseQuantity={increaseQuantity}
        clearCart={clearCart}
        isEmpty={isEmpty}
        cartTotal={cartTotal}
        onShowShipments={() => setShowShipments(true)}
      />
      <ProductForm />
      <footer className="bg-dark mt-5 py-5">
        <div className="container-xl">
          <p className="text-white text-center fs-4 mt-4 m-md-0">GuitarLA - Todos los derechos Reservados</p>
        </div>
      </footer>
    </>
  )
}
```

Agrega imports al inicio del archivo:

```tsx
import { BecomeSeller } from "./components/BecomeSeller"
import { SellerDashboard } from "./components/SellerDashboard"
import { ProductForm } from "./components/ProductForm"
```

#### **OPCIÓN B: Migrar a React Router (Mejor a largo plazo)**

Si prefieres usar React Router, instala:

```bash
npm install react-router-dom
```

Luego reemplaza el `App.tsx` completo con:

```tsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { useCart } from './hooks/useCart'
import { useState } from 'react'

// Componentes
import Guitar from "./components/Guitar"
import Header from "./components/Header"
import Checkout from "./components/Checkout"
import { Login } from "./components/Login"
import { Register } from "./components/Register"
import { ShipmentsPage } from "./pages/ShipmentsPage"
import { BecomeSeller } from "./components/BecomeSeller"
import { SellerDashboard } from "./components/SellerDashboard"
import { ProductForm } from "./components/ProductForm"

function AppContent() {
  const { currentUser, loading } = useAuth()
  const { data, cart, addToCart, removeFromCart, decreaseQuantity, increaseQuantity, clearCart, isEmpty, cartTotal } = useCart()
  const [showRegister, setShowRegister] = useState(false)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px' }}>
        ⏳ Cargando...
      </div>
    )
  }

  if (!currentUser) {
    if (showRegister) {
      return (
        <Register 
          onRegisterSuccess={() => setShowRegister(false)}
          onToggleLogin={() => setShowRegister(false)}
        />
      )
    }
    return (
      <Login 
        onLoginSuccess={() => {}}
        onToggleRegister={() => setShowRegister(true)}
      />
    )
  }

  return (
    <>
      <Header 
        cart={cart}
        removeFromCart={removeFromCart}
        decreaseQuantity={decreaseQuantity}
        increaseQuantity={increaseQuantity}
        clearCart={clearCart}
        isEmpty={isEmpty}
        cartTotal={cartTotal}
      />
      
      <Routes>
        <Route path="/" element={
          <main className="container-xl mt-5">
            <h2 className="text-center">Nuestra Colección</h2>
            <p className="text-center text-muted">¡Bienvenido {currentUser.displayName || currentUser.email}!</p>
            <div className="row mt-5">
              {data.map((guitar) => (
                <Guitar 
                  key={guitar.id}
                  guitar={guitar}
                  addToCart={addToCart}
                />
              ))}
            </div>
          </main>
        } />
        <Route path="/checkout" element={<Checkout cart={cart} cartTotal={cartTotal} onSuccess={() => clearCart()} onError={(e) => console.error(e)} />} />
        <Route path="/shipments" element={<ShipmentsPage />} />
        <Route path="/become-seller" element={<BecomeSeller />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/new-product" element={<ProductForm />} />
        <Route path="/seller/edit-product/:productId" element={<ProductForm />} />
      </Routes>

      <footer className="bg-dark mt-5 py-5">
        <div className="container-xl">
          <p className="text-white text-center fs-4 mt-4 m-md-0">GuitarLA - Todos los derechos Reservados</p>
        </div>
      </footer>
    </>
  )
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  )
}

export default App
```

---

### PASO 2: Actualizar Header.tsx

Agrega botones en el Header para acceder a las nuevas funcionalidades. Modifica `src/components/Header.tsx`:

```tsx
// En la parte donde muestras el menú del usuario, agrega:

{isSeller && (
  <>
    <li className="nav-item">
      <a className="nav-link" href="/seller/dashboard">📊 Mi Tienda</a>
    </li>
  </>
)}

{!isSeller && (
  <li className="nav-item">
    <a className="nav-link" href="/become-seller">🏪 Ser Vendedor</a>
  </li>
)}
```

Agrega el import:

```tsx
import { useAuth } from '../hooks/useAuth'

// Dentro del componente:
const { isSeller } = useAuth()
```

---

### PASO 3: Actualizar Firestore Rules

1. Abre [Firebase Console](https://console.firebase.google.com)
2. Ve a tu proyecto **guitarmarket-b033a**
3. En el menú izquierdo: **Firestore Database** → **Rules**
4. Copia TODO el contenido de `FIRESTORE_SELLER_RULES.txt`
5. Reemplaza el contenido actual en Firebase Console
6. Haz clic en **Publicar**

---

### PASO 4: Prueba Local

```bash
npm run dev
```

Luego:
1. Regístrate como usuario normal
2. Haz clic en "🏪 Ser Vendedor"
3. Completa el formulario
4. Accede a "📊 Mi Tienda"
5. Crea un producto

---

## 📌 VARIABLES DE ENTORNO (Verifica que existan)

En tu `.env` o variables de Vercel necesitas:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=guitarmarket-b033a
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_CLOUDINARY_CLOUD_NAME=dtkwn8jao
VITE_CLOUDINARY_API_KEY=524377538286147
VITE_CLOUDINARY_UPLOAD_PRESET=...  (Si usas upload sin backend)
```

---

## 🎯 PRÓXIMOS PASOS OPCIONALES

- Integrar `orderService.createOrder()` en `Checkout.tsx`
- Agregar página de detalles del producto con opción de compra
- Crear sistema de reseñas/calificaciones
- Implementar búsqueda de productos con `productService.searchProducts()`

---

## 🐛 TROUBLESHOOTING

**Error: "useAuth debe ser usado dentro de AuthProvider"**
- Asegúrate de que tu componente está dentro de `<AuthProvider>`

**Error: No se puede crear producto**
- Verifica que las Firestore Rules estén actualizadas
- Comprueba la consola del navegador (F12)

**Imágenes no se suben**
- Verifica que Cloudinary está configurado correctamente
- Revisa `cloudinaryService.ts`

¿Necesitas ayuda con algún paso?
