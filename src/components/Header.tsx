import type { CartItem } from '../types'
import { UserMenu } from './UserMenu'
import { useState, useRef } from 'react'
    
type HeaderProps = {
    cart: CartItem[],
    removeFromCart: (id: CartItem['id']) => void,
    decreaseQuantity: (id: CartItem['id']) => void,
    increaseQuantity: (id: CartItem['id']) => void,
    clearCart: () => void,
    isEmpty: boolean,
    cartTotal: number,
    onCheckout?: () => void,
    onShowShipments?: () => void
}

export default function Header({cart, removeFromCart, decreaseQuantity, increaseQuantity, clearCart, isEmpty, cartTotal, onCheckout, onShowShipments}: HeaderProps) {
    const [showCart, setShowCart] = useState(false)
    const timeoutRef = useRef<number | null>(null)

    const handleCartMouseEnter = () => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
            timeoutRef.current = null
        }
        setShowCart(true)
    }

    const handleCartMouseLeave = () => {
        timeoutRef.current = setTimeout(() => {
            setShowCart(false)
        }, 300)
    }
    return (
        <header className="py-5 header">
            <div className="container-xl">
                <div className="row justify-content-center justify-content-md-between">
                    <div className="col-8 col-md-3">
                        <a href="/">
                            <img className="img-fluid" src="/img/logo.svg" alt="imagen logo" />
                        </a>
                    </div>
                    <nav className="col-md-6 a mt-5 d-flex align-items-start justify-content-end" style={{ gap: '15px' }}>
                        <UserMenu />
                        
                        {/* Botón de Envíos */}
                        {onShowShipments && (
                            <button
                                onClick={onShowShipments}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '4px',
                                    transition: 'transform 0.3s ease',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.1)'
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)'
                                }}
                                title="Mis Envíos"
                            >
                                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{color: '#FFC107'}}>
                                    <line x1="16.5" y1="9.4" x2="7.5" y2="4.21"></line>
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
                                    <line x1="12" y1="22.08" x2="12" y2="12"></line>
                                </svg>
                            </button>
                        )}
                        
                        <div 
                            className="carrito"
                            onMouseEnter={handleCartMouseEnter}
                            onMouseLeave={handleCartMouseLeave}
                        >
                            <img className="img-fluid" src="/img/carrito.png" alt="imagen carrito" />

                            {showCart && (
                            <div id="carrito" className="bg-white p-3">
                                {isEmpty ? (
                                    <p className="text-center">El carrito esta vacio</p>
                                ) : (
                                <>
                                    <table className="w-100 table">
                                        <thead>
                                            <tr>
                                                <th>Imagen</th>
                                                <th>Nombre</th>
                                                <th>Precio</th>
                                                <th>Cantidad</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map( guitar => (
                                                <tr key={guitar.id}>
                                                    <td>
                                                        <img 
                                                            className="img-fluid" 
                                                            src={`/img/${guitar.image}.jpg`}
                                                            alt="imagen guitarra" 
                                                        />
                                                    </td>
                                                    <td>{guitar.name}</td>
                                                    <td className="fw-bold">
                                                        ${guitar.price}
                                                    </td>
                                                    <td className="flex align-items-start gap-4">
                                                        <button
                                                            type="button"
                                                            className="btn btn-dark"
                                                            onClick={() => decreaseQuantity(guitar.id)}
                                                        >
                                                            -
                                                        </button>
                                                            {guitar.quantity}
                                                        <button
                                                            type="button"
                                                            className="btn btn-dark"
                                                            onClick={() => increaseQuantity(guitar.id)}
                                                        >
                                                            +
                                                        </button>
                                                    </td>
                                                    <td>
                                                        <button
                                                            className="btn btn-danger"
                                                            type="button"
                                                            onClick={() => removeFromCart(guitar.id)}
                                                        >
                                                            X
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>

                                    <p className="text-end">Total pagar: <span className="fw-bold">${cartTotal}</span></p>
                                </>
                                )}

                                <button 
                                    className="w-100"
                                    onClick={clearCart}
                                    style={{
                                        padding: '0.75rem',
                                        fontSize: '0.95rem',
                                        fontWeight: '700',
                                        backgroundColor: '#1a1a1a',
                                        color: '#FFC107',
                                        border: '2px solid #FFC107',
                                        borderRadius: '6px',
                                        cursor: 'pointer',
                                        transition: 'all 0.3s ease',
                                        textTransform: 'uppercase',
                                        letterSpacing: '1px',
                                        marginTop: '0.75rem',
                                        marginBottom: '0.625rem'
                                    }}
                                >
                                    Vaciar Carrito
                                </button>

                                {!isEmpty && onCheckout && (
                                    <button 
                                        className="w-100 mt-2"
                                        onClick={onCheckout}
                                        style={{
                                            padding: '0.75rem',
                                            fontSize: '0.95rem',
                                            fontWeight: '700',
                                            backgroundColor: '#1a1a1a',
                                            color: '#FFC107',
                                            border: '2px solid #FFC107',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                            transition: 'all 0.3s ease',
                                            textTransform: 'uppercase',
                                            letterSpacing: '1px'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.backgroundColor = '#FFC107'
                                            e.currentTarget.style.color = '#1a1a1a'
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.backgroundColor = '#1a1a1a'
                                            e.currentTarget.style.color = '#FFC107'
                                        }}
                                    >
                                        Proceder al Pago
                                    </button>
                                )}
                            </div>
                            )}
                        </div>
                    </nav>
                </div>
            </div>
        </header>
    )
}

