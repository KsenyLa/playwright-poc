import { useState, useEffect } from 'react'
import './ProductForm.css'

function ProductForm({ product, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')

  useEffect(() => {
    if (product) {
      setName(product.name || '')
      setPrice(product.price?.toString() || '')
    }
  }, [product])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Name is required')
      return
    }
    const priceNum = parseFloat(price)
    if (isNaN(priceNum) || priceNum < 0) {
      alert('Please enter a valid price')
      return
    }
    onSave({ name: name.trim(), price: priceNum })
  }

  return (
    <form className="product-form" onSubmit={handleSubmit} data-testid="form-product">
      <h3>{product ? 'Edit Product' : 'Add New Product'}</h3>
      <div className="form-group">
        <label htmlFor="product-name">
          Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="product-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="input-name-product"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="product-price">
          Price <span className="required">*</span>
        </label>
        <input
          type="number"
          id="product-price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          data-testid="input-price-product"
          min="0"
          step="0.01"
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary" data-testid="btn-save-product">
          {product ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          data-testid="btn-cancel-product"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default ProductForm
