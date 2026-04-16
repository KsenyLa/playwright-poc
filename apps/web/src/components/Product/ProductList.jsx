import { useEffect, useState } from 'react'
import { productStorage } from '../../services/storage'
import ProductForm from './ProductForm'
import ProductItem from './ProductItem'
import './ProductList.css'

function ProductList() {
  const [products, setProducts] = useState([])
  const [loadError, setLoadError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

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
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleSave = async (productData) => {
    try {
      if (editingProduct) {
        await productStorage.update(editingProduct.id, productData)
      } else {
        await productStorage.create(productData)
      }

      await loadProducts()
      setShowForm(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Failed to save product', error)
      window.alert(error.message || 'Failed to save product')
    }
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

  const handleCancel = () => {
    setShowForm(false)
    setEditingProduct(null)
  }

  return (
    <div className="product-list-container">
      <div className="page-header">
        <h2 data-testid="page-title-products">Product Management</h2>
        {!showForm && (
          <button
            onClick={handleAdd}
            className="btn-primary"
            data-testid="btn-add-product"
          >
            Add Product
          </button>
        )}
      </div>

      {showForm && (
        <ProductForm
          product={editingProduct}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="list-container" data-testid="list-products">
        {loadError && (
          <p className="empty-message" data-testid="error-products">
            {loadError}
          </p>
        )}
        {products.length === 0 ? (
          <p className="empty-message">No products found. Add your first product!</p>
        ) : (
          products.map((product) => (
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
