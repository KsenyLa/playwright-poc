/**
 * Test data fixtures for generating test entities
 */

const appendScope = (value: string, scope?: string): string =>
  scope ? `${value} [${scope}]` : value;

const normalizeScopeLabel = (label: string): string =>
  label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'scenario';

const buildScenarioScope = (label: string): string => {
  const timestamp = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  return `${normalizeScopeLabel(label)}-${timestamp}-${randomSuffix}`;
};

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
  createScenarioScope(label: string): string {
    return buildScenarioScope(label);
  },

  createWarehouse(index: number = 1, scope?: string): WarehouseData {
    const baseName = `Test Warehouse ${index}`;

    return {
      name: appendScope(baseName, scope),
      description: appendScope(`Description for ${baseName}`, scope),
    };
  },

  createProduct(index: number = 1, scope?: string): ProductData {
    return {
      name: appendScope(`Test Product ${index}`, scope),
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

  createWarehouses(count: number, scope?: string): WarehouseData[] {
    return Array.from({ length: count }, (_, i) => dataFactory.createWarehouse(i + 1, scope));
  },

  createProducts(count: number, scope?: string): ProductData[] {
    return Array.from({ length: count }, (_, i) => dataFactory.createProduct(i + 1, scope));
  },
};
