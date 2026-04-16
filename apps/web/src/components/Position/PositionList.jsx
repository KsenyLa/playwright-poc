import { useEffect, useState } from 'react'
import { positionStorage, warehouseStorage, productStorage } from '../../services/storage'
import PositionForm from './PositionForm'
import PositionItem from './PositionItem'
import './PositionList.css'

function PositionList() {
  const [positions, setPositions] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [loadError, setLoadError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingPosition, setEditingPosition] = useState(null)

  const loadData = async () => {
    try {
      const [positionData, warehouseData, productData] = await Promise.all([
        positionStorage.getAll(),
        warehouseStorage.getAll(),
        productStorage.getAll()
      ])

      setPositions(positionData)
      setWarehouses(warehouseData)
      setProducts(productData)
      setLoadError('')
    } catch (error) {
      console.error('Failed to load positions page data', error)
      setLoadError(error.message || 'Could not load positions data from backend.')
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleAdd = () => {
    setEditingPosition(null)
    setShowForm(true)
  }

  const handleEdit = (position) => {
    setEditingPosition(position)
    setShowForm(true)
  }

  const handleSave = async (positionData) => {
    try {
      if (editingPosition) {
        await positionStorage.update(editingPosition.id, positionData)
      } else {
        await positionStorage.create(positionData)
      }

      await loadData()
      setShowForm(false)
      setEditingPosition(null)
    } catch (error) {
      console.error('Failed to save position', error)
      window.alert(error.message || 'Failed to save position')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this position?')) {
      return
    }

    try {
      await positionStorage.delete(id)
      await loadData()
    } catch (error) {
      console.error('Failed to delete position', error)
      window.alert(error.message || 'Failed to delete position')
    }
  }

  const handleCancel = () => {
    setShowForm(false)
    setEditingPosition(null)
  }

  const getPositionWithNames = (position) => {
    const product = products.find((candidate) => candidate.id === position.productId)
    const warehouse = warehouses.find((candidate) => candidate.id === position.warehouseId)

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
        {loadError && (
          <p className="empty-message" data-testid="error-positions">
            {loadError}
          </p>
        )}
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
