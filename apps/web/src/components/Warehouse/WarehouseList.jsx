import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { warehouseStorage } from '../../services/storage'
import ListControls from '../ListControls/ListControls'
import WarehouseItem from './WarehouseItem'
import './WarehouseList.css'

function WarehouseList() {
  const navigate = useNavigate()
  const [warehouses, setWarehouses] = useState([])
  const [loadError, setLoadError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')

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
    navigate('/warehouses/create')
  }

  const handleEdit = (warehouse) => {
    navigate(`/warehouses/edit/${warehouse.id}`)
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

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const filteredWarehouses = [...warehouses]
    .filter((warehouse) => warehouse.name.toLowerCase().includes(normalizedSearchTerm))
    .sort((left, right) => {
      const comparison = left.name.localeCompare(right.name)
      return sortDirection === 'asc' ? comparison : comparison * -1
    })

  const hasActiveFilters = normalizedSearchTerm.length > 0

  return (
    <div className="warehouse-list-container">
      <div className="page-header">
        <h2 data-testid="page-title-warehouses">Warehouse Management</h2>
        <button
          onClick={handleAdd}
          className="btn-primary"
          data-testid="btn-add-warehouse"
        >
          Add Warehouse
        </button>
      </div>

      <ListControls
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search warehouses by name"
        sortValue={sortDirection}
        onSortChange={setSortDirection}
        testIdPrefix="warehouse-controls"
      />

      <div className="list-container" data-testid="list-warehouses">
        {loadError && (
          <p className="empty-message" data-testid="error-warehouses">
            {loadError}
          </p>
        )}
        {!loadError && warehouses.length === 0 ? (
          <p className="empty-message">No warehouses found. Add your first warehouse!</p>
        ) : !loadError && filteredWarehouses.length === 0 ? (
          <p className="empty-message">
            {hasActiveFilters
              ? 'No warehouses match your current search.'
              : 'No warehouses available.'}
          </p>
        ) : (
          filteredWarehouses.map((warehouse) => (
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
