import { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../config/firebase-client'

interface LoginProps {
  onLoginSuccess?: () => void
  onToggleRegister?: () => void
}

export function Login({ onLoginSuccess, onToggleRegister }: LoginProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!email || !password) {
        setError('Por favor completa todos los campos')
        return
      }

      console.log('🔐 Iniciando sesión...')
      await signInWithEmailAndPassword(auth, email, password)
      
      console.log('✅ Sesión iniciada')
      onLoginSuccess?.()
      
    } catch (err) {
      let errorMsg = 'Error al iniciar sesión'
      
      if (err instanceof Error) {
        if (err.message.includes('user-not-found')) {
          errorMsg = 'Usuario no encontrado'
        } else if (err.message.includes('wrong-password')) {
          errorMsg = 'Contraseña incorrecta'
        } else if (err.message.includes('invalid-email')) {
          errorMsg = 'Email inválido'
        } else if (err.message.includes('too-many-requests')) {
          errorMsg = 'Demasiados intentos, intenta más tarde'
        } else {
          errorMsg = err.message
        }
      }
      
      setError(errorMsg)
      console.error('❌ Error de login:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundImage: 'url(/img/guitar-background.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      position: 'relative'
    }}>
      {/* Overlay oscuro */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(26, 26, 26, 0.85)',
        zIndex: 1
      }} />
      <div style={{
        width: '100%',
        maxWidth: '500px',
        position: 'relative',
        zIndex: 2
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <img src="/img/logo.svg" alt="GuitarLA" style={{ maxWidth: '220px', marginBottom: '30px' }} />
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: '36px',
          fontWeight: 'bold',
          color: '#fff',
          textAlign: 'center',
          marginBottom: '10px',
          textTransform: 'uppercase',
          letterSpacing: '2px'
        }}>
          Inicia Sesión
        </h1>

        <p style={{
          fontSize: '14px',
          color: '#999',
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          Accede a tu tienda de guitaras premium
        </p>

        {/* Error Alert */}
        {error && (
          <div style={{
            backgroundColor: '#8B0000',
            border: '2px solid #FF6B6B',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px',
            color: '#fff',
            fontSize: '14px',
            textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} style={{ marginBottom: '30px' }}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#FFC107',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#2a2a2a',
                border: '2px solid #444',
                borderRadius: '6px',
                color: '#fff',
                fontSize: '14px',
                boxSizing: 'border-box',
                outline: 'none',
                transition: 'border-color 0.3s'
              }}
              onFocus={(e) => e.target.style.borderColor = '#FFC107'}
              onBlur={(e) => e.target.style.borderColor = '#444'}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: 'bold',
              color: '#FFC107',
              marginBottom: '8px',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Contraseña
            </label>
            <div style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center'
            }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tu contraseña"
                disabled={loading}
                style={{
                  width: '100%',
                  padding: '14px',
                  paddingRight: '45px',
                  backgroundColor: '#2a2a2a',
                  border: '2px solid #444',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '14px',
                  boxSizing: 'border-box',
                  outline: 'none',
                  transition: 'border-color 0.3s'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#FFC107'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#444'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  color: '#FFC107',
                  cursor: 'pointer',
                  fontSize: '18px',
                  padding: '0',
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {showPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFC107" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#FFC107" strokeWidth="2" style={{ width: '20px', height: '20px' }}>
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                )}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              backgroundColor: '#1a1a1a',
              border: '2px solid #FFC107',
              color: '#FFC107',
              fontSize: '16px',
              fontWeight: 'bold',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              textTransform: 'uppercase',
              letterSpacing: '1px',
              transition: 'all 0.3s',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#FFC107', e.currentTarget.style.color = '#1a1a1a')}
            onMouseLeave={(e) => !loading && (e.currentTarget.style.backgroundColor = '#1a1a1a', e.currentTarget.style.color = '#FFC107')}
          >
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          position: 'relative'
        }}>
          <hr style={{ borderColor: '#444', marginBottom: '15px' }} />
          <p style={{ color: '#999', fontSize: '13px' }}>¿No tienes cuenta?</p>
        </div>

        {/* Register Button */}
        <button 
          onClick={onToggleRegister}
          style={{
            width: '100%',
            padding: '14px',
            backgroundColor: 'transparent',
            border: '2px solid #FFC107',
            color: '#FFC107',
            fontSize: '16px',
            fontWeight: 'bold',
            borderRadius: '6px',
            cursor: 'pointer',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#FFC107', e.currentTarget.style.color = '#1a1a1a')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent', e.currentTarget.style.color = '#FFC107')}
        >
          Crear Cuenta
        </button>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          color: '#666',
          fontSize: '12px',
          marginTop: '30px'
        }}>
          GuitarLA © 2024 - Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}

