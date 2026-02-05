import { useState, useEffect } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { warehouseStorage } from '../../services/storage'
import WarehouseForm from './WarehouseForm'
import WarehouseItem from './WarehouseItem'
import './WarehouseList.css'

function WarehouseList() {
  const [warehouses, setWarehouses] = useLocalStorage('warehouses', [])
  const [showForm, setShowForm] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState(null)

  useEffect(() => {
    // Sync with storage service on mount
    const stored = warehouseStorage.getAll()
    if (stored.length !== warehouses.length || 
        JSON.stringify(stored) !== JSON.stringify(warehouses)) {
      setWarehouses(stored)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = () => {
    setEditingWarehouse(null)
    setShowForm(true)
  }

  const handleEdit = (warehouse) => {
    setEditingWarehouse(warehouse)
    setShowForm(true)
  }

  const handleSave = (warehouseData) => {
    if (editingWarehouse) {
      warehouseStorage.update(editingWarehouse.id, warehouseData)
    } else {
      warehouseStorage.create(warehouseData)
    }
    setWarehouses(warehouseStorage.getAll())
    setShowForm(false)
    setEditingWarehouse(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this warehouse?')) {
      warehouseStorage.delete(id)
      setWarehouses(warehouseStorage.getAll())
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
