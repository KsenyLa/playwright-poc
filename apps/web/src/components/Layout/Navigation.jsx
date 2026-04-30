import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  const location = useLocation()
  const isWarehousesActive = location.pathname.startsWith('/warehouses')
  const isProductsActive = location.pathname.startsWith('/products')
  const isPositionsActive = location.pathname.startsWith('/positions')

  return (
    <nav className="navigation" data-testid="navigation">
      <div className="nav-container">
        <h1 className="nav-title">Warehouse CRM</h1>
        <ul className="nav-menu">
          <li>
            <Link
              to="/warehouses"
              className={isWarehousesActive ? 'active' : ''}
              data-testid="nav-link-warehouses"
            >
              Warehouses
            </Link>
          </li>
          <li>
            <Link
              to="/products"
              className={isProductsActive ? 'active' : ''}
              data-testid="nav-link-products"
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              to="/positions"
              className={isPositionsActive ? 'active' : ''}
              data-testid="nav-link-positions"
            >
              Positions
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navigation
