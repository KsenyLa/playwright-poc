import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { productStorage } from '../../services/storage'
import '../EntityEditor/EntityEditorPage.css'
import ProductForm from './ProductForm'

function ProductEditorPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEditing = Boolean(id)
  const [product, setProduct] = useState(null)
  const [isLoading, setIsLoading] = useState(isEditing)
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    if (!isEditing) {
      setProduct(null)
      setIsLoading(false)
      setLoadError('')
      return
    }

    const loadProduct = async () => {
      try {
        setIsLoading(true)
        const currentProduct = await productStorage.getById(id)

        if (!currentProduct) {
          setLoadError('Product not found.')
          return
        }

        setProduct(currentProduct)
        setLoadError('')
      } catch (error) {
        console.error('Failed to load product', error)
        setLoadError(error.message || 'Could not load product from backend.')
      } finally {
        setIsLoading(false)
      }
    }

    loadProduct()
  }, [id, isEditing])

  const handleSave = async (productData) => {
    try {
      if (isEditing) {
        await productStorage.update(id, productData)
      } else {
        await productStorage.create(productData)
      }

      navigate('/products')
    } catch (error) {
      console.error('Failed to save product', error)
      window.alert(error.message || 'Failed to save product')
    }
  }

  const handleCancel = () => {
    navigate('/products')
  }

  return (
    <div className="entity-editor-page" data-testid="page-product-editor">
      <div className="entity-editor-header">
        <div>
          <p className="entity-editor-kicker">Products</p>
          <h2 data-testid="page-title-product-editor">
            {isEditing ? 'Edit Product' : 'Create Product'}
          </h2>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleCancel}
          data-testid="btn-back-products"
        >
          Back to Products
        </button>
      </div>

      {isLoading ? (
        <p className="entity-editor-state" data-testid="product-editor-loading">
          Loading product...
        </p>
      ) : loadError ? (
        <p className="entity-editor-state error" data-testid="product-editor-error">
          {loadError}
        </p>
      ) : (
        <ProductForm
          product={product}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

export default ProductEditorPage
