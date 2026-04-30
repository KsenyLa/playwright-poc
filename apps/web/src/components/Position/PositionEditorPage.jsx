import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { positionStorage, warehouseStorage, productStorage } from '../../services/storage'
import '../EntityEditor/EntityEditorPage.css'
import PositionForm from './PositionForm'

function PositionEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const [position, setPosition] = useState(null)
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const loadEditorData = async () => {
      try {
        setIsLoading(true)

        const [warehouseData, productData, positionData] = await Promise.all([
          warehouseStorage.getAll(),
          productStorage.getAll(),
          isEditing ? positionStorage.getById(id) : Promise.resolve(null)
        ])

        setWarehouses(warehouseData)
        setProducts(productData)

        if (isEditing && !positionData) {
          setLoadError('Position not found.')
          return
        }

        setPosition(positionData)
        setLoadError('')
      } catch (error) {
        console.error('Failed to load position editor data', error)
        setLoadError(error.message || 'Could not load position editor data from backend.')
      } finally {
        setIsLoading(false)
      }
    }

    loadEditorData()
  }, [id, isEditing])

  const handleSave = async (positionData) => {
    try {
      if (isEditing) {
        await positionStorage.update(id, positionData)
      } else {
        await positionStorage.create(positionData)
      }

      navigate('/positions')
    } catch (error) {
      console.error('Failed to save position', error)
      window.alert(error.message || 'Failed to save position')
    }
  }

  const handleCancel = () => {
    navigate('/positions')
  }

  return (
    <div className="entity-editor-page" data-testid="page-position-editor">
      <div className="entity-editor-header">
        <div>
          <p className="entity-editor-kicker">Positions</p>
          <h2 data-testid="page-title-position-editor">
            {isEditing ? 'Edit Position' : 'Create Position'}
          </h2>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleCancel}
          data-testid="btn-back-positions"
        >
          Back to Positions
        </button>
      </div>

      {isLoading ? (
        <p className="entity-editor-state" data-testid="position-editor-loading">
          Loading position details...
        </p>
      ) : loadError ? (
        <p className="entity-editor-state error" data-testid="position-editor-error">
          {loadError}
        </p>
      ) : (
        <PositionForm
          position={position}
          warehouses={warehouses}
          products={products}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

export default PositionEditorPage
