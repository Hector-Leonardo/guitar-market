import { ShipmentsManagement } from '../components/ShipmentsManagement'
import { useAuth } from '../hooks/useAuth'

/**
 * Página de Gestión de Envíos
 * Muestra todos los envíos del usuario autenticado
 */
export function ShipmentsPage() {
  const { currentUser } = useAuth()

  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f9f9f9',
    paddingTop: '20px',
    paddingBottom: '40px',
  }

  return (
    <div style={containerStyle}>
      {currentUser ? (
        <ShipmentsManagement userId={currentUser.uid} />
      ) : (
        <div
          style={{
            maxWidth: '600px',
            margin: '100px auto',
            textAlign: 'center',
            backgroundColor: '#fff',
            padding: '40px',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
            Autenticación Requerida
          </h2>
          <p style={{ fontSize: '16px', color: '#666', marginBottom: '24px' }}>
            Debes iniciar sesión para ver tus envíos
          </p>
          <a
            href="/login"
            style={{
              display: 'inline-block',
              padding: '12px 32px',
              backgroundColor: '#FFC107',
              color: '#1a1a1a',
              textDecoration: 'none',
              borderRadius: '4px',
              fontWeight: 'bold',
            }}
          >
            Ir a Login
          </a>
        </div>
      )}
    </div>
  )
}
