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

export const dataFactory = {
  createWarehouse(index: number = 1): WarehouseData {
    return {
      name: `Test Warehouse ${index}`,
      description: `Description for Test Warehouse ${index}`,
    };
  },

  createProduct(index: number = 1): ProductData {
    return {
      name: `Test Product ${index}`,
      price: 10.99 * index,
    };
  },

  createPosition(
    productName: string,
    warehouseName: string,
    amount: number = 10
  ): PositionData {
    return {
      productName,
      warehouseName,
      amount,
    };
  },

  createWarehouses(count: number): WarehouseData[] {
    return Array.from({ length: count }, (_, i) => dataFactory.createWarehouse(i + 1));
  },

  createProducts(count: number): ProductData[] {
    return Array.from({ length: count }, (_, i) => dataFactory.createProduct(i + 1));
  },
};
