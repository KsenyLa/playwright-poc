import { useState, useEffect } from 'react'
import { useLocalStorage } from '../../hooks/useLocalStorage'
import { positionStorage, warehouseStorage, productStorage } from '../../services/storage'
import PositionForm from './PositionForm'
import PositionItem from './PositionItem'
import './PositionList.css'

function PositionList() {
  const [positions, setPositions] = useLocalStorage('positions', [])
  const [warehouses, setWarehouses] = useLocalStorage('warehouses', [])
  const [products, setProducts] = useLocalStorage('products', [])
  const [showForm, setShowForm] = useState(false)
  const [editingPosition, setEditingPosition] = useState(null)

  useEffect(() => {
    // Sync with storage service on mount
    const storedPositions = positionStorage.getAll()
    const storedWarehouses = warehouseStorage.getAll()
    const storedProducts = productStorage.getAll()
    
    if (storedPositions.length !== positions.length || 
        JSON.stringify(storedPositions) !== JSON.stringify(positions)) {
      setPositions(storedPositions)
    }
    if (storedWarehouses.length !== warehouses.length || 
        JSON.stringify(storedWarehouses) !== JSON.stringify(warehouses)) {
      setWarehouses(storedWarehouses)
    }
    if (storedProducts.length !== products.length || 
        JSON.stringify(storedProducts) !== JSON.stringify(products)) {
      setProducts(storedProducts)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleAdd = () => {
    setEditingPosition(null)
    setShowForm(true)
  }

  const handleEdit = (position) => {
    setEditingPosition(position)
    setShowForm(true)
  }

  const handleSave = (positionData) => {
    if (editingPosition) {
      positionStorage.update(editingPosition.id, positionData)
    } else {
      positionStorage.create(positionData)
    }
    setPositions(positionStorage.getAll())
    setShowForm(false)
    setEditingPosition(null)
  }

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this position?')) {
      positionStorage.delete(id)
      setPositions(positionStorage.getAll())
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingPosition(null)
  }

  // Get position with resolved names for display
  const getPositionWithNames = (position) => {
    const product = products.find(p => p.id === position.productId)
    const warehouse = warehouses.find(w => w.id === position.warehouseId)
    return {
      ...position,
      productName: product?.name || 'Unknown Product',
      warehouseName: warehouse?.name || 'Unknown Warehouse'
    }
  }

  return (
    <div className="position-list-container">
      <div className="page-header">
        <h2 data-testid="page-title-positions">Position Management</h2>
        {!showForm && (
          <button
            onClick={handleAdd}
            className="btn-primary"
            data-testid="btn-add-position"
          >
            Add Position
          </button>
        )}
      </div>

      {showForm && (
        <PositionForm
          position={editingPosition}
          warehouses={warehouses}
          products={products}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      <div className="list-container" data-testid="list-positions">
        {positions.length === 0 ? (
          <p className="empty-message">No positions found. Add your first position!</p>
        ) : (
          positions.map((position) => {
            const positionWithNames = getPositionWithNames(position)
            return (
              <PositionItem
                key={position.id}
                position={positionWithNames}
                onEdit={() => handleEdit(position)}
                onDelete={handleDelete}
              />
            )
          })
        )}
      </div>
    </div>
  )
}

export default PositionList
