import { useState } from 'react'
import Guitar from "./components/Guitar"
import Header from "./components/Header"
import Checkout from "./components/Checkout"
import { Login } from "./components/Login"
import { Register } from "./components/Register"
import { ShipmentsPage } from "./pages/ShipmentsPage"
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import { useCart } from './hooks/useCart'

// Componente interno que usa AuthContext
function AppContent() {
  const { currentUser, loading } = useAuth()
  const { data, cart, addToCart, removeFromCart, decreaseQuantity, increaseQuantity, clearCart, isEmpty, cartTotal } = useCart()
  const [showCheckout, setShowCheckout] = useState(false)
  const [showShipments, setShowShipments] = useState(false)
  // const [showLogin, setShowLogin] = useState(false)
  const [showRegister, setShowRegister] = useState(false)

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
          onShowShipments={() => setShowShipments(false)}
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
        />
        
        <Checkout 
          cart={cart}
          cartTotal={cartTotal}
          onSuccess={() => {
            clearCart()
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
        onShowShipments={() => setShowShipments(true)}
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