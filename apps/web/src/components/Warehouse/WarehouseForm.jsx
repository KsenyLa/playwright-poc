import { useState, useEffect } from 'react'
import './WarehouseForm.css'

function WarehouseForm({ warehouse, onSave, onCancel }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (warehouse) {
      setName(warehouse.name || '')
      setDescription(warehouse.description || '')
    }
  }, [warehouse])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      alert('Name is required')
      return
    }
    onSave({ name: name.trim(), description: description.trim() })
  }

  return (
    <form className="warehouse-form" onSubmit={handleSubmit} data-testid="form-warehouse">
      <h3>{warehouse ? 'Edit Warehouse' : 'Add New Warehouse'}</h3>
      <div className="form-group">
        <label htmlFor="warehouse-name">
          Name <span className="required">*</span>
        </label>
        <input
          type="text"
          id="warehouse-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          data-testid="input-name-warehouse"
          required
        />
      </div>
      <div className="form-group">
        <label htmlFor="warehouse-description">Description</label>
        <textarea
          id="warehouse-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          data-testid="input-description-warehouse"
          rows="3"
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="btn-primary" data-testid="btn-save-warehouse">
          {warehouse ? 'Update' : 'Create'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="btn-secondary"
          data-testid="btn-cancel-warehouse"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}

export default WarehouseForm
