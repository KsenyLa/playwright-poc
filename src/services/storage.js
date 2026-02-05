// Storage keys
const STORAGE_KEYS = {
  WAREHOUSES: 'warehouses',
  PRODUCTS: 'products',
  POSITIONS: 'positions'
}

// Helper functions for localStorage operations
const getFromStorage = (key) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : []
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error)
    return []
  }
}

const saveToStorage = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error saving to localStorage key "${key}":`, error)
  }
}

// Warehouse operations
export const warehouseStorage = {
  getAll: () => getFromStorage(STORAGE_KEYS.WAREHOUSES),
  getById: (id) => {
    const warehouses = getFromStorage(STORAGE_KEYS.WAREHOUSES)
    return warehouses.find(w => w.id === id)
  },
  create: (warehouse) => {
    const warehouses = getFromStorage(STORAGE_KEYS.WAREHOUSES)
    const newWarehouse = {
      ...warehouse,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
    warehouses.push(newWarehouse)
    saveToStorage(STORAGE_KEYS.WAREHOUSES, warehouses)
    return newWarehouse
  },
  update: (id, updates) => {
    const warehouses = getFromStorage(STORAGE_KEYS.WAREHOUSES)
    const index = warehouses.findIndex(w => w.id === id)
    if (index !== -1) {
      warehouses[index] = { ...warehouses[index], ...updates }
      saveToStorage(STORAGE_KEYS.WAREHOUSES, warehouses)
      return warehouses[index]
    }
    return null
  },
  delete: (id) => {
    const warehouses = getFromStorage(STORAGE_KEYS.WAREHOUSES)
    const filtered = warehouses.filter(w => w.id !== id)
    saveToStorage(STORAGE_KEYS.WAREHOUSES, filtered)
    return filtered.length < warehouses.length
  }
}

// Product operations
export const productStorage = {
  getAll: () => getFromStorage(STORAGE_KEYS.PRODUCTS),
  getById: (id) => {
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS)
    return products.find(p => p.id === id)
  },
  create: (product) => {
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS)
    const newProduct = {
      ...product,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
    products.push(newProduct)
    saveToStorage(STORAGE_KEYS.PRODUCTS, products)
    return newProduct
  },
  update: (id, updates) => {
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS)
    const index = products.findIndex(p => p.id === id)
    if (index !== -1) {
      products[index] = { ...products[index], ...updates }
      saveToStorage(STORAGE_KEYS.PRODUCTS, products)
      return products[index]
    }
    return null
  },
  delete: (id) => {
    const products = getFromStorage(STORAGE_KEYS.PRODUCTS)
    const filtered = products.filter(p => p.id !== id)
    saveToStorage(STORAGE_KEYS.PRODUCTS, filtered)
    return filtered.length < products.length
  }
}

// Position operations
export const positionStorage = {
  getAll: () => getFromStorage(STORAGE_KEYS.POSITIONS),
  getById: (id) => {
    const positions = getFromStorage(STORAGE_KEYS.POSITIONS)
    return positions.find(pos => pos.id === id)
  },
  create: (position) => {
    const positions = getFromStorage(STORAGE_KEYS.POSITIONS)
    const newPosition = {
      ...position,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
    }
    positions.push(newPosition)
    saveToStorage(STORAGE_KEYS.POSITIONS, positions)
    return newPosition
  },
  update: (id, updates) => {
    const positions = getFromStorage(STORAGE_KEYS.POSITIONS)
    const index = positions.findIndex(pos => pos.id === id)
    if (index !== -1) {
      positions[index] = { ...positions[index], ...updates }
      saveToStorage(STORAGE_KEYS.POSITIONS, positions)
      return positions[index]
    }
    return null
  },
  delete: (id) => {
    const positions = getFromStorage(STORAGE_KEYS.POSITIONS)
    const filtered = positions.filter(pos => pos.id !== id)
    saveToStorage(STORAGE_KEYS.POSITIONS, filtered)
    return filtered.length < positions.length
  }
}
