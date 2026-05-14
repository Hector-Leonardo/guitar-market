import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { sellerService } from '../services/sellerService'
import type { Product, SellerStats } from '../types'
import styles from './SellerDashboard.module.css'

interface SellerDashboardProps {
  onShowProductForm?: () => void
  onShowNewProduct?: () => void
  onEditProduct?: (productId: string) => void
}

export function SellerDashboard({ onShowProductForm, onShowNewProduct, onEditProduct }: SellerDashboardProps) {
  const { currentUser, sellerProfile, isSeller } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [stats, setStats] = useState<SellerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([])

  useEffect(() => {
    if (!currentUser || !isSeller) return

    const loadDashboard = async () => {
      try {
        setLoading(true)
        setError(null)

        // Cargar productos del vendedor
        const vendorProducts = await sellerService.getSellerProducts(
          currentUser.uid,
          20
        )
        setProducts(vendorProducts)

        // Cargar estadísticas
        const vendorStats = await sellerService.getSellerStats(
          currentUser.uid
        )
        setStats(vendorStats)

        // Cargar productos con stock bajo
        const lowStock = await sellerService.getLowStockProducts(
          currentUser.uid,
          5
        )
        setLowStockProducts(lowStock)
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error cargando dashboard'
        setError(errorMsg)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [currentUser, isSeller])

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este producto?')) {
      return
    }

    try {
      await sellerService.deleteProduct(currentUser!.uid, productId)
      setProducts((prev) => prev.filter((p) => p.id !== productId))
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error eliminando producto')
    }
  }

  if (!isSeller) {
    return (
      <div className={styles.notSeller}>
        <h1>No eres vendedor</h1>
        <p>
          <button onClick={onShowNewProduct} style={{background: 'none', border: 'none', color: '#FFC107', cursor: 'pointer', textDecoration: 'underline'}}>
            Conviértete en vendedor
          </button>
        </p>
      </div>
    )
  }

  if (loading) {
    return <div className={styles.loading}>Cargando dashboard...</div>
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>{sellerProfile?.storeName}</h1>
          <p>{sellerProfile?.description}</p>
        </div>
        <button onClick={onShowProductForm} className={styles.newProductBtn}>
          Nuevo Producto
        </button>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {/* Estadísticas */}
      {stats && (
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.totalSales}</div>
            <div className={styles.statLabel}>Ventas Totales</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>${stats.totalRevenue.toFixed(2)}</div>
            <div className={styles.statLabel}>Ingresos Totales</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.rating.toFixed(1)}</div>
            <div className={styles.statLabel}>Calificación ({stats.ratingCount})</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.productCount}</div>
            <div className={styles.statLabel}>Productos</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>${stats.monthlyRevenue.toFixed(2)}</div>
            <div className={styles.statLabel}>Este Mes</div>
          </div>
          <div className={styles.statCard}>
            <div className={styles.statValue}>{stats.pendingOrders}</div>
            <div className={styles.statLabel}>Órdenes Pendientes</div>
          </div>
        </div>
      )}

      {/* Alerta de stock bajo */}
      {lowStockProducts.length > 0 && (
        <div className={styles.alertBox}>
          <h3>⚠️ Productos con Stock Bajo</h3>
          <ul>
            {lowStockProducts.map((product) => (
              <li key={product.id}>
                {product.title} - {product.stock} unidades
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Lista de productos */}
      <div className={styles.section}>
        <h2>Tus Productos ({products.length})</h2>

        {products.length === 0 ? (
          <p className={styles.emptyState}>
            No tienes productos aún. <button onClick={onShowProductForm} style={{background: 'none', border: 'none', color: '#FFC107', cursor: 'pointer', textDecoration: 'underline'}}>Crear uno</button>
          </p>
        ) : (
          <div className={styles.productsGrid}>
            {products.map((product) => (
              <div key={product.id} className={styles.productCard}>
                <div className={styles.productImage}>
                  {product.images[0] ? (
                    <img src={product.images[0]} alt={product.title} />
                  ) : (
                    <div className={styles.noImage}>Sin imagen</div>
                  )}
                  {!product.visible && (
                    <span className={styles.hiddenBadge}>Oculto</span>
                  )}
                </div>
                <div className={styles.productInfo}>
                  <h3>{product.title}</h3>
                  <p className={styles.category}>{product.category}</p>
                  <div className={styles.priceStock}>
                    <span className={styles.price}>${product.price.toFixed(2)}</span>
                    <span className={styles.stock}>Stock: {product.stock}</span>
                  </div>
                  <div className={styles.actions}>
                    <button
                      onClick={() => onEditProduct?.(product.id)}
                      className={styles.actionBtn}
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(product.id)}
                      className={`${styles.actionBtn} ${styles.deleteBtn}`}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
