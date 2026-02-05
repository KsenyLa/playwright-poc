import { useState, useEffect } from 'react'
import './PositionForm.css'

function PositionForm({ position, warehouses, products, onSave, onCancel }) {
  const [productId, setProductId] = useState('')
  const [warehouseId, setWarehouseId] = useState('')
  const [amount, setAmount] = useState('')

  useEffect(() => {
    if (position) {
      setProductId(position.productId || '')
      setWarehouseId(position.warehouseId || '')
      setAmount(position.amount?.toString() || '')
    }
  }, [position])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!productId) {
      alert('Please select a product')
      return
    }
    if (!warehouseId) {
      alert('Please select a warehouse')
      return
    }
    const amountNum = parseInt(amount)
    if (isNaN(amountNum) || amountNum < 0) {
      alert('Please enter a valid amount')
      return
    }
    onSave({ productId, warehouseId, amount: amountNum })
  }

  return (
    <form className="position-form" onSubmit={handleSubmit} data-testid="form-position">
      <h3>{position ? 'Edit Position' : 'Add New Position'}</h3>
      <div className="form-group">
        <label htmlFor="position-product">
          Product <span className="required">*</span>
        </label>
        <select
          id="position-product"
          value={productId}
          onChange={(e) => setProductId(e.target.value)}
          data-testid="input-product-position"
          required
        >
          <option value="">Select a product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="position-warehouse">
          Warehouse <span className="required">*</span>
        </label>
        <select
          id="position-warehouse"
          value={warehouseId}
          onChange={(e) => setWarehouseId(e.target.value)}
          data-testid="input-warehouse-position"
          required
        >
          <option value="">Select a warehouse</option>
          {warehouses.map((warehouse) => (
            <option key={warehouse.id} value={warehouse.id}>
              {warehouse.name}
            </option>
          ))}
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="position-amount">
          Amount <span className="required">*</span>
        </label>
        <input
          type="number"
          id="position-amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          data-testid="input-amount-position"
          min="0"
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary" data-testid="btn-save-position">
          {position ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          data-testid="btn-cancel-position"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default PositionForm
