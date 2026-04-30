import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { productStorage } from '../../services/storage'
import ListControls from '../ListControls/ListControls'
import ProductItem from './ProductItem'
import './ProductList.css'

function ProductList() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [loadError, setLoadError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')

  const loadProducts = async () => {
    try {
      const data = await productStorage.getAll()
      setProducts(data)
      setLoadError('')
    } catch (error) {
      console.error('Failed to load products', error)
      setLoadError(error.message || 'Could not load products from backend.')
    }
  }

  useEffect(() => {
    loadProducts()
  }, [])

  const handleAdd = () => {
    navigate('/products/create')
  }

  const handleEdit = (product) => {
    navigate(`/products/edit/${product.id}`)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return
    }

    try {
      await productStorage.delete(id)
      await loadProducts()
    } catch (error) {
      console.error('Failed to delete product', error)
      window.alert(error.message || 'Failed to delete product')
    }
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredProducts = [...products]
    .filter((product) => product.name.toLowerCase().includes(normalizedSearchTerm))
    .sort((left, right) => {
      const comparison = left.name.localeCompare(right.name)
      return sortDirection === 'asc' ? comparison : comparison * -1
    })

  const hasActiveFilters = normalizedSearchTerm.length > 0

  return (
    <div className="product-list-container">
      <div className="page-header">
        <h2 data-testid="page-title-products">Product Management</h2>
        <button
          onClick={handleAdd}
          className="btn-primary"
          data-testid="btn-add-product"
        >
          Add Product
        </button>
      </div>

      <ListControls
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search products by name"
        sortValue={sortDirection}
        onSortChange={setSortDirection}
        testIdPrefix="product-controls"
      />

      <div className="list-container" data-testid="list-products">
        {loadError && (
          <p className="empty-message" data-testid="error-products">
            {loadError}
          </p>
        )}
        {!loadError && products.length === 0 ? (
          <p className="empty-message">No products found. Add your first product!</p>
        ) : !loadError && filteredProducts.length === 0 ? (
          <p className="empty-message">
            {hasActiveFilters
              ? 'No products match your current search.'
              : 'No products available.'}
          </p>
        ) : (
          filteredProducts.map((product) => (
            <ProductItem
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ProductList
