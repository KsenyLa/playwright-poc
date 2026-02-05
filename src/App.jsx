import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import WarehouseList from './components/Warehouse/WarehouseList'
import ProductList from './components/Product/ProductList'
import PositionList from './components/Position/PositionList'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/warehouses" replace />} />
          <Route path="/warehouses" element={<WarehouseList />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/positions" element={<PositionList />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
