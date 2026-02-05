/**
 * Test data fixtures for generating test entities
 */

export interface WarehouseData {
  name: string;
  description: string;
}

export interface ProductData {
  name: string;
  price: number;
}

export interface PositionData {
  productName: string;
  warehouseName: string;
  amount: number;
}

/**
 * Generate test warehouse data
 */
export function testWarehouse(index: number = 1): WarehouseData {
  return {
    name: `Test Warehouse ${index}`,
    description: `Description for Test Warehouse ${index}`,
  };
}

/**
 * Generate test product data
 */
export function testProduct(index: number = 1): ProductData {
  return {
    name: `Test Product ${index}`,
    price: 10.99 * index,
  };
}

/**
 * Generate test position data
 * Note: Requires product and warehouse to exist
 */
export function testPosition(
  productName: string,
  warehouseName: string,
  amount: number = 10
): PositionData {
  return {
    productName,
    warehouseName,
    amount,
  };
}

/**
 * Generate multiple test warehouses
 */
export function testWarehouses(count: number): WarehouseData[] {
  return Array.from({ length: count }, (_, i) => testWarehouse(i + 1));
}

/**
 * Generate multiple test products
 */
export function testProducts(count: number): ProductData[] {
  return Array.from({ length: count }, (_, i) => testProduct(i + 1));
}
