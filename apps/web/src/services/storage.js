import { apiRequest } from './apiClient'

export const warehouseStorage = {
  getAll: () => apiRequest('/warehouses'),
  getById: async (id) => {
    const warehouses = await apiRequest('/warehouses')
    return warehouses.find((warehouse) => String(warehouse.id) === String(id)) || null
  },
  create: (warehouse) => apiRequest('/warehouses', {
    method: 'POST',
    body: JSON.stringify(warehouse)
  }),
  update: (id, updates) => apiRequest(`/warehouses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  delete: (id) => apiRequest(`/warehouses/${id}`, {
    method: 'DELETE'
  })
}

export const productStorage = {
  getAll: () => apiRequest('/products'),
  getById: async (id) => {
    const products = await apiRequest('/products')
    return products.find((product) => String(product.id) === String(id)) || null
  },
  create: (product) => apiRequest('/products', {
    method: 'POST',
    body: JSON.stringify(product)
  }),
  update: (id, updates) => apiRequest(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  delete: (id) => apiRequest(`/products/${id}`, {
    method: 'DELETE'
  })
}

export const positionStorage = {
  getAll: () => apiRequest('/positions'),
  getById: async (id) => {
    const positions = await apiRequest('/positions')
    return positions.find((position) => String(position.id) === String(id)) || null
  },
  create: (position) => apiRequest('/positions', {
    method: 'POST',
    body: JSON.stringify(position)
  }),
  update: (id, updates) => apiRequest(`/positions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates)
  }),
  delete: (id) => apiRequest(`/positions/${id}`, {
    method: 'DELETE'
  })
}
