import './ProductItem.css'

function ProductItem({ product, onEdit, onDelete }) {
  return (
    <div className="product-item" data-testid={`product-item-${product.id}`}>
      <div className="product-content">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-price">${product.price.toFixed(2)}</p>
      </div>
      <div className="product-actions">
        <button
          onClick={() => onEdit(product)}
          className="btn-edit"
          data-testid={`btn-edit-product-${product.id}`}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(product.id)}
          className="btn-delete"
          data-testid={`btn-delete-product-${product.id}`}
        >
          Delete
        </button>
      </div>
    </div>
  )
}

export default ProductItem
