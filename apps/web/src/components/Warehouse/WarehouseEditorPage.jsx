import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { warehouseStorage } from '../../services/storage'
import '../EntityEditor/EntityEditorPage.css'
import WarehouseForm from './WarehouseForm'

function WarehouseEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const [warehouse, setWarehouse] = useState(null)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!isEditing) {
      setWarehouse(null)
      setIsLoading(false)
      setLoadError('')
      return
    }

    const loadWarehouse = async () => {
      try {
        setIsLoading(true)
        const currentWarehouse = await warehouseStorage.getById(id)

        if (!currentWarehouse) {
          setLoadError('Warehouse not found.')
          return
        }

        setWarehouse(currentWarehouse)
        setLoadError('')
      } catch (error) {
        console.error('Failed to load warehouse', error)
        setLoadError(error.message || 'Could not load warehouse from backend.')
      } finally {
        setIsLoading(false)
      }
    }

    loadWarehouse()
  }, [id, isEditing])

  const handleSave = async (warehouseData) => {
    try {
      if (isEditing) {
        await warehouseStorage.update(id, warehouseData)
      } else {
        await warehouseStorage.create(warehouseData)
      }

      navigate('/warehouses')
    } catch (error) {
      console.error('Failed to save warehouse', error)
      window.alert(error.message || 'Failed to save warehouse')
    }
  }

  const handleCancel = () => {
    navigate('/warehouses')
  }

  return (
    <div className="entity-editor-page" data-testid="page-warehouse-editor">
      <div className="entity-editor-header">
        <div>
          <p className="entity-editor-kicker">Warehouses</p>
          <h2 data-testid="page-title-warehouse-editor">
            {isEditing ? 'Edit Warehouse' : 'Create Warehouse'}
          </h2>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleCancel}
          data-testid="btn-back-warehouses"
        >
          Back to Warehouses
        </button>
      </div>

      {isLoading ? (
        <p className="entity-editor-state" data-testid="warehouse-editor-loading">
          Loading warehouse...
        </p>
      ) : loadError ? (
        <p className="entity-editor-state error" data-testid="warehouse-editor-error">
          {loadError}
        </p>
      ) : (
        <WarehouseForm
          warehouse={warehouse}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

export default WarehouseEditorPage
