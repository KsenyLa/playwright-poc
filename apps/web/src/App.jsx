import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout/Layout'
import WarehouseList from './components/Warehouse/WarehouseList'
import WarehouseEditorPage from './components/Warehouse/WarehouseEditorPage'
import ProductList from './components/Product/ProductList'
import ProductEditorPage from './components/Product/ProductEditorPage'
import PositionList from './components/Position/PositionList'
import PositionEditorPage from './components/Position/PositionEditorPage'

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/warehouses" replace />} />
          <Route path="/warehouses" element={<WarehouseList />} />
          <Route path="/warehouses/create" element={<WarehouseEditorPage />} />
          <Route path="/warehouses/edit/:id" element={<WarehouseEditorPage />} />
          <Route path="/products" element={<ProductList />} />
          <Route path="/products/create" element={<ProductEditorPage />} />
          <Route path="/products/edit/:id" element={<ProductEditorPage />} />
          <Route path="/positions" element={<PositionList />} />
          <Route path="/positions/create" element={<PositionEditorPage />} />
          <Route path="/positions/edit/:id" element={<PositionEditorPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App
