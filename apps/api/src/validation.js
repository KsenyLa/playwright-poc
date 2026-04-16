import { ApiError } from './errors.js'

export const validateWarehouseInput = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Payload must be an object')
  }

  if (!payload.name || typeof payload.name !== 'string' || !payload.name.trim()) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Warehouse name is required')
  }

  if (payload.description !== undefined && typeof payload.description !== 'string') {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Warehouse description must be a string')
  }
}

export const validateProductInput = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Payload must be an object')
  }

  if (!payload.name || typeof payload.name !== 'string' || !payload.name.trim()) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Product name is required')
  }

  if (payload.price === undefined || payload.price === null || Number.isNaN(Number(payload.price))) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Product price must be a valid number')
  }

  if (Number(payload.price) < 0) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Product price must be non-negative')
  }
}

export const validatePositionInput = (payload) => {
  if (!payload || typeof payload !== 'object') {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Payload must be an object')
  }

  if (!payload.productId || typeof payload.productId !== 'string') {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Position productId is required')
  }

  if (!payload.warehouseId || typeof payload.warehouseId !== 'string') {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Position warehouseId is required')
  }

  if (payload.amount === undefined || payload.amount === null || Number.isNaN(Number(payload.amount))) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Position amount must be a valid number')
  }

  if (!Number.isInteger(Number(payload.amount)) || Number(payload.amount) < 0) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Position amount must be a non-negative integer')
  }
}

export const assertIdParam = (id) => {
  if (!id || typeof id !== 'string') {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Resource id is required')
  }
}
