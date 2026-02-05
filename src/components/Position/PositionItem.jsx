import './PositionItem.css'

function PositionItem({ position, onEdit, onDelete }) {
  return (
    <div className="position-item" data-testid={`position-item-${position.id}`}>
      <div className="position-content">
        <div className="position-info">
          <span className="position-label">Product:</span>
          <span className="position-value">{position.productName}</span>
        </div>
        <div className="position-info">
          <span className="position-label">Warehouse:</span>
          <span className="position-value">{position.warehouseName}</span>
        </div>
        <div className="position-info">
          <span className="position-label">Amount:</span>
          <span className="position-value amount">{position.amount}</span>
        </div>
      </div>
      <div className="position-actions">
        <button
          onClick={onEdit}
          className="btn-edit"
          data-testid={`btn-edit-position-${position.id}`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(position.id)}
          className="btn-delete"
          data-testid={`btn-delete-position-${position.id}`}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default PositionItem
