import { Link, useLocation } from 'react-router-dom'
import './Navigation.css'

function Navigation() {
  const location = useLocation()

  return (
    <nav className="navigation" data-testid="navigation">
      <div className="nav-container">
        <h1 className="nav-title">Warehouse CRM</h1>
        <ul className="nav-menu">
          <li>
            <Link
              to="/warehouses"
              className={location.pathname === '/warehouses' ? 'active' : ''}
              data-testid="nav-link-warehouses"
            >
              Warehouses
            </Link>
          </li>
          <li>
            <Link
              to="/products"
              className={location.pathname === '/products' ? 'active' : ''}
              data-testid="nav-link-products"
            >
              Products
            </Link>
          </li>
          <li>
            <Link
              to="/positions"
              className={location.pathname === '/positions' ? 'active' : ''}
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
