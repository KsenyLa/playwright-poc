import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { positionStorage, warehouseStorage, productStorage } from '../../services/storage'
import ListControls from '../ListControls/ListControls'
import PositionItem from './PositionItem'
import './PositionList.css'

function PositionList() {
  const navigate = useNavigate()
  const [positions, setPositions] = useState([])
  const [warehouses, setWarehouses] = useState([])
  const [products, setProducts] = useState([])
  const [loadError, setLoadError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortDirection, setSortDirection] = useState('asc')
  const [selectedWarehouses, setSelectedWarehouses] = useState([])

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
    navigate('/positions/create')
  }

  const handleEdit = (position) => {
    navigate(`/positions/edit/${position.id}`)
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

  const getPositionWithNames = (position) => {
    const product = products.find((candidate) => candidate.id === position.productId)
    const warehouse = warehouses.find((candidate) => candidate.id === position.warehouseId)

    return {
      ...position,
      productName: product?.name || 'Unknown Product',
      warehouseName: warehouse?.name || 'Unknown Warehouse'
    }
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase()
  const warehouseOptions = [...warehouses]
    .sort((left, right) => left.name.localeCompare(right.name))
    .map((warehouse) => ({
      value: String(warehouse.id),
      label: warehouse.name
    }))
  const selectedWarehouseOptions = warehouseOptions.filter((warehouse) =>
    selectedWarehouses.includes(warehouse.value)
  )

  const filteredPositions = positions
    .map((position) => getPositionWithNames(position))
    .filter((position) => {
      const matchesSearch = position.productName
        .toLowerCase()
        .includes(normalizedSearchTerm)
      const matchesWarehouse =
        selectedWarehouses.length === 0 ||
        selectedWarehouses.includes(String(position.warehouseId))

      return matchesSearch && matchesWarehouse
    })
    .sort((left, right) => {
      const comparison = left.productName.localeCompare(right.productName)
      return sortDirection === 'asc' ? comparison : comparison * -1
    })

  const hasActiveFilters = normalizedSearchTerm.length > 0 || selectedWarehouses.length > 0

  return (
    <div className="position-list-container">
      <div className="page-header">
        <h2 data-testid="page-title-positions">Position Management</h2>
        <button
          onClick={handleAdd}
          className="btn-primary"
          data-testid="btn-add-position"
        >
          Add Position
        </button>
      </div>

      <ListControls
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search positions by product name"
        sortValue={sortDirection}
        onSortChange={setSortDirection}
        filterValue={selectedWarehouses}
        onFilterChange={setSelectedWarehouses}
        filterOptions={warehouseOptions}
        filterLabel="Warehouse"
        filterPlaceholder="All warehouses"
        filterMode="multiple"
        testIdPrefix="position-controls"
      />

      {selectedWarehouseOptions.length > 0 && (
        <div className="selected-filters" data-testid="selected-position-warehouses">
          {selectedWarehouseOptions.map((warehouse) => (
            <button
              key={warehouse.value}
              type="button"
              className="selected-filter-chip"
              onClick={() =>
                setSelectedWarehouses((currentValues) =>
                  currentValues.filter((value) => value !== warehouse.value)
                )
              }
              data-testid={`selected-position-warehouse-${warehouse.value}`}
            >
              <span>{warehouse.label}</span>
              <span aria-hidden="true">x</span>
            </button>
          ))}
        </div>
      )}

      <div className="list-container" data-testid="list-positions">
        {loadError && (
          <p className="empty-message" data-testid="error-positions">
            {loadError}
          </p>
        )}
        {!loadError && positions.length === 0 ? (
          <p className="empty-message">No positions found. Add your first position!</p>
        ) : !loadError && filteredPositions.length === 0 ? (
          <p className="empty-message">
            {hasActiveFilters
              ? 'No positions match your current search and filters.'
              : 'No positions available.'}
          </p>
        ) : (
          filteredPositions.map((position) => (
            <PositionItem
              key={position.id}
              position={position}
              onEdit={() => handleEdit(position)}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default PositionList
