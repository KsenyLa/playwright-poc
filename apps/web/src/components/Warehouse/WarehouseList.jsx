import { useEffect, useState } from 'react'
import { warehouseStorage } from '../../services/storage'
import WarehouseForm from './WarehouseForm'
import WarehouseItem from './WarehouseItem'
import './WarehouseList.css'

function WarehouseList() {
  const [warehouses, setWarehouses] = useState([])
  const [loadError, setLoadError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState(null)

  const loadWarehouses = async () => {
    try {
      const data = await warehouseStorage.getAll()
      setWarehouses(data)
      setLoadError('')
    } catch (error) {
      console.error('Failed to load warehouses', error)
      setLoadError(error.message || 'Could not load warehouses from backend.')
    }
  }

  useEffect(() => {
    loadWarehouses()
  }, [])

  const handleAdd = () => {
    setEditingWarehouse(null)
    setShowForm(true)
  }

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse)
    setShowForm(true)
  }

  const handleSave = async (warehouseData) => {
    try {
      if (editingWarehouse) {
        await warehouseStorage.update(editingWarehouse.id, warehouseData)
      } else {
        await warehouseStorage.create(warehouseData)
      }

      await loadWarehouses()
      setShowForm(false)
      setEditingWarehouse(null)
    } catch (error) {
      console.error('Failed to save warehouse', error)
      window.alert(error.message || 'Failed to save warehouse')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this warehouse?')) {
      return
    }

    try {
      await warehouseStorage.delete(id)
      await loadWarehouses()
    } catch (error) {
      console.error('Failed to delete warehouse', error)
      window.alert(error.message || 'Failed to delete warehouse')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingWarehouse(null)
  }

  return (
    <div className="warehouse-list-container">
      <div className="page-header">
        <h2 data-testid="page-title-warehouses">Warehouse Management</h2>
        {!showForm && (
          <button
            onClick={handleAdd}
            className="btn-primary"
            data-testid="btn-add-warehouse"
          >
            Add Warehouse
          </button>
        )}
      </div>

      {showForm && (
        <WarehouseForm
          warehouse={editingWarehouse}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="list-container" data-testid="list-warehouses">
        {loadError && (
          <p className="empty-message" data-testid="error-warehouses">
            {loadError}
          </p>
        )}
        {warehouses.length === 0 ? (
          <p className="empty-message">No warehouses found. Add your first warehouse!</p>
        ) : (
          warehouses.map((warehouse) => (
            <WarehouseItem
              key={warehouse.id}
              warehouse={warehouse}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default WarehouseList
