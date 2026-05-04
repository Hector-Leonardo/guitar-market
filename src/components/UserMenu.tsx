import { useState, useRef } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../config/firebase-client'
import { useAuth } from '../hooks/useAuth'

interface UserMenuProps {
  onLogout?: () => void
}

export function UserMenu({ onLogout }: UserMenuProps) {
  const { currentUser } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const timeoutRef = useRef<number | null>(null)

  const handleLogout = async () => {
    try {
      console.log('🚪 Cerrando sesión...')
      await signOut(auth)
      console.log('✅ Sesión cerrada')
      onLogout?.()
    } catch (error) {
      console.error('❌ Error al cerrar sesión:', error)
    }
  }

  const handleMouseEnter = () => {
    // Cancelar el timeout si existe
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setShowMenu(true)
  }

  const handleMouseLeave = () => {
    // Agregar delay de 300ms antes de cerrar el menu
    timeoutRef.current = setTimeout(() => {
      setShowMenu(false)
    }, 300)
  }

  if (!currentUser) {
    return null
  }

  return (
    <div 
      className="usuario"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <img 
        className="img-fluid" 
        src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFC107' stroke-width='2'%3E%3Cpath d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'%3E%3C/path%3E%3Ccircle cx='12' cy='7' r='4'%3E%3C/circle%3E%3C/svg%3E"
        alt="usuario" 
        style={{ width: '28px', height: '28px' }}
      />

      {showMenu && (
        <div 
          className="bg-white p-3"
          style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            marginTop: '8px',
            minWidth: '250px',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            zIndex: 1000,
          }}
        >
          <div style={{
            paddingBottom: '10px',
            borderBottom: '2px solid #FFC107',
            marginBottom: '10px'
          }}>
            <div style={{
              fontSize: '12px',
              color: '#666',
              marginBottom: '4px'
            }}>
              Bienvenido/a
            </div>
            <div style={{
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#1a1a1a',
              wordBreak: 'break-word'
            }}>
              {currentUser.displayName || 'Usuario'}
            </div>
            <div style={{
              fontSize: '12px',
              color: '#999'
            }}>
              {currentUser.email}
            </div>
          </div>

          <button 
            onClick={handleLogout}
            style={{
              width: '100%',
              padding: '10px',
              background: '#1a1a1a',
              color: '#FFC107',
              border: '2px solid #FFC107',
              borderRadius: '6px',
              fontWeight: 'bold',
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}
          >
            Cerrar Sesión
          </button>
        </div>
      )}
    </div>
  )
}
