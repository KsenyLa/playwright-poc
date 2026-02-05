import './WarehouseItem.css'

function WarehouseItem({ warehouse, onEdit, onDelete }) {
  return (
    <div className="warehouse-item" data-testid={`warehouse-item-${warehouse.id}`}>
      <div className="warehouse-content">
        <h3 className="warehouse-name">{warehouse.name}</h3>
        {warehouse.description && (
          <p className="warehouse-description">{warehouse.description}</p>
        )}
      </div>
      <div className="warehouse-actions">
        <button
          onClick={() => onEdit(warehouse)}
          className="btn-edit"
          data-testid={`btn-edit-warehouse-${warehouse.id}`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(warehouse.id)}
          className="btn-delete"
          data-testid={`btn-delete-warehouse-${warehouse.id}`}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default WarehouseItem
