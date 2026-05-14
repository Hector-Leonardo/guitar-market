import { useEffect, useState } from 'react'
import Guitar from "./components/Guitar"
import Header from "./components/Header"
import Checkout from "./components/Checkout"
import { Login } from "./components/Login"
import { Register } from "./components/Register"
import { ShipmentsPage } from "./pages/ShipmentsPage"
import { BecomeSeller } from "./components/BecomeSeller"
import { SellerDashboard } from "./components/SellerDashboard"
import { ProductForm } from "./components/ProductForm"
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { useCart } from './hooks/useCart'
import { shipmentService } from './services/shipmentService'

// Componente interno que usa AuthContext
function AppContent() {
  const { currentUser, loading } = useAuth()
  const { data, cart, addToCart, removeFromCart, decreaseQuantity, increaseQuantity, clearCart, isEmpty, cartTotal } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)
  const [showShipments, setShowShipments] = useState(false)
  const [showRegister, setShowRegister] = useState(false)
  const [showBecomeSeller, setShowBecomeSeller] = useState(false)
  const [showSellerDashboard, setShowSellerDashboard] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | undefined>(undefined)

  useEffect(() => {
    const syncPaymentReturn = async () => {
      if (!currentUser) {
        return
      }

      const params = new URLSearchParams(window.location.search)
      const paymentStatus = params.get('payment')
      const orderId = params.get('order_id')
      const collectionId = params.get('collection_id') || params.get('payment_id')

      if (paymentStatus !== 'approved' || !orderId || !collectionId) {
        return
      }

      try {
        const shipment = await shipmentService.getShipmentByOrderId(orderId)

        if (shipment && shipment.userId === currentUser.uid) {
          await shipmentService.updateShipmentByOrderId(orderId, {
            paymentId: collectionId,
          })
        }

        window.history.replaceState({}, '', window.location.pathname)
      } catch (error) {
        console.error('Error al sincronizar el pago aprobado:', error)
      }
    }

    syncPaymentReturn()
  }, [currentUser])

  // Mostrar loading mientras se verifica autenticación
  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', fontSize: '18px' }}>
        ⏳ Cargando...
      </div>
    )
  }

  // Si no hay usuario, mostrar login/register
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

  // Vista: Convertirse en Vendedor
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
          onShowShipments={() => {
            setShowSellerDashboard(false)
            setShowBecomeSeller(false)
            setShowProductForm(false)
            setShowCheckout(false)
            setShowShipments(true)
          }}
          onShowSellerDashboard={() => { setShowBecomeSeller(false); setShowSellerDashboard(true); }}
          onShowBecomeSeller={() => setShowBecomeSeller(false)}
          onCheckout={() => {
            setShowSellerDashboard(false)
            setShowBecomeSeller(false)
            setShowProductForm(false)
            setShowShipments(false)
            setShowCheckout(true)
          }}
        />
        <BecomeSeller 
          onSuccess={() => {
            setShowBecomeSeller(false)
            setShowSellerDashboard(true)
          }}
        />
        <footer className="bg-dark mt-5 py-5">
          <div className="container-xl">
            <p className="text-white text-center fs-4 mt-4 m-md-0">GuitarLA - Todos los derechos Reservados</p>
          </div>
        </footer>
      </>
    )
  }

  // Vista: Dashboard del Vendedor
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
          onShowShipments={() => {
            setShowSellerDashboard(false)
            setShowBecomeSeller(false)
            setShowProductForm(false)
            setShowCheckout(false)
            setShowShipments(true)
          }}
          onShowSellerDashboard={() => {}}
          onShowBecomeSeller={() => setShowBecomeSeller(true)}
          onCheckout={() => {
            setShowSellerDashboard(false)
            setShowBecomeSeller(false)
            setShowProductForm(false)
            setShowShipments(false)
            setShowCheckout(true)
          }}
        />
        <SellerDashboard 
          onShowProductForm={() => { setEditingProductId(undefined); setShowSellerDashboard(false); setShowProductForm(true); }}
          onEditProduct={(id: string) => { setEditingProductId(id); setShowSellerDashboard(false); setShowProductForm(true); }}
        />
        <footer className="bg-dark mt-5 py-5">
          <div className="container-xl">
            <p className="text-white text-center fs-4 mt-4 m-md-0">GuitarLA - Todos los derechos Reservados</p>
          </div>
        </footer>
      </>
    )
  }

  // Vista: Crear/Editar Producto
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
          onShowShipments={() => {
            setShowSellerDashboard(false)
            setShowBecomeSeller(false)
            setShowProductForm(false)
            setShowCheckout(false)
            setShowShipments(true)
          }}
          onShowSellerDashboard={() => { setShowProductForm(false); setShowSellerDashboard(true); }}
          onShowBecomeSeller={() => setShowBecomeSeller(true)}
          onCheckout={() => {
            setShowSellerDashboard(false)
            setShowBecomeSeller(false)
            setShowProductForm(false)
            setShowShipments(false)
            setShowCheckout(true)
          }}
        />
        <ProductForm productId={editingProductId} onBack={() => { setEditingProductId(undefined); setShowProductForm(false); setShowSellerDashboard(true); }} />
        <footer className="bg-dark mt-5 py-5">
          <div className="container-xl">
            <p className="text-white text-center fs-4 mt-4 m-md-0">GuitarLA - Todos los derechos Reservados</p>
          </div>
        </footer>
      </>
    )
  }

  // Si está viendo envíos, mostrar esa página
  if (showShipments) {
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
          onShowShipments={() => {
            setShowSellerDashboard(false)
            setShowBecomeSeller(false)
            setShowProductForm(false)
            setShowCheckout(false)
            setShowShipments(true)
          }}
          onShowSellerDashboard={() => {
            setShowShipments(false)
            setShowBecomeSeller(false)
            setShowProductForm(false)
            setShowCheckout(false)
            setShowSellerDashboard(true)
          }}
          onShowBecomeSeller={() => {
            setShowShipments(false)
            setShowSellerDashboard(false)
            setShowProductForm(false)
            setShowCheckout(false)
            setShowBecomeSeller(true)
          }}
          onCheckout={() => {
            setShowSellerDashboard(false)
            setShowBecomeSeller(false)
            setShowProductForm(false)
            setShowShipments(false)
            setShowCheckout(true)
          }}
        />
        
        <ShipmentsPage />

        <footer className="bg-dark mt-5 py-5">
          <div className="container-xl">
            <p className="text-white text-center fs-4 mt-4 m-md-0">GuitarLA - Todos los derechos Reservados</p>
          </div>
        </footer>
      </>
    )
  }

  // Si está viendo checkout, mostrar ese componente
  if (showCheckout) {
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
          onShowSellerDashboard={() => setShowSellerDashboard(true)}
          onShowBecomeSeller={() => setShowBecomeSeller(true)}
        />
        
        <Checkout 
          cart={cart}
          cartTotal={cartTotal}
          onSuccess={() => {
            clearCart()
            setShowCheckout(false)
          }}
          onError={(error) => {
            console.error('Error en pago:', error)
          }}
        />

        <footer className="bg-dark mt-5 py-5">
          <div className="container-xl">
            <p className="text-white text-center fs-4 mt-4 m-md-0">GuitarLA - Todos los derechos Reservados</p>
          </div>
        </footer>
      </>
    )
  }

  // Vista normal: tienda con productos (usuario autenticado)
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
        onCheckout={() => setShowCheckout(true)}
          onShowShipments={() => {
            setShowSellerDashboard(false)
            setShowBecomeSeller(false)
            setShowProductForm(false)
            setShowCheckout(false)
            setShowShipments(true)
          }}
          onShowSellerDashboard={() => {
            setShowShipments(false)
            setShowBecomeSeller(false)
            setShowProductForm(false)
            setShowCheckout(false)
            setShowSellerDashboard(true)
          }}
          onShowBecomeSeller={() => {
            setShowShipments(false)
            setShowSellerDashboard(false)
            setShowProductForm(false)
            setShowCheckout(false)
            setShowBecomeSeller(true)
          }}
      />
      
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
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App