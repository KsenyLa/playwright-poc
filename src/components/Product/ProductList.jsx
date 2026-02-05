import { useState, useEffect } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { productStorage } from '../../services/storage'
import ProductForm from './ProductForm'
import ProductItem from './ProductItem'
import './ProductList.css'

function ProductList() {
  const [products, setProducts] = useLocalStorage('products', [])
  const [showForm, setShowForm] = useState(false)
  const [editingProduct, setEditingProduct] = useState(null)

  useEffect(() => {
    // Sync with storage service on mount
    const stored = productStorage.getAll()
    if (stored.length !== products.length || 
        JSON.stringify(stored) !== JSON.stringify(products)) {
      setProducts(stored)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = () => {
    setEditingProduct(null)
    setShowForm(true)
  }

  const handleEdit = (product) => {
    setEditingProduct(product)
    setShowForm(true)
  }

  const handleSave = (productData) => {
    if (editingProduct) {
      productStorage.update(editingProduct.id, productData)
    } else {
      productStorage.create(productData)
    }
    setProducts(productStorage.getAll())
    setShowForm(false)
    setEditingProduct(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      productStorage.delete(id)
      setProducts(productStorage.getAll())
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
