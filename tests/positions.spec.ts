import { test, expect } from '@playwright/test';
import { NavigationPage } from './pages/NavigationPage';
import { WarehousePage } from './pages/WarehousePage';
import { ProductPage } from './pages/ProductPage';
import { PositionPage } from './pages/PositionPage';
import { testWarehouse, testProduct, testPosition } from './fixtures/test-data';

test.describe('Position Management Tests', () => {
  let navigationPage: NavigationPage;
  let warehousePage: WarehousePage;
  let productPage: ProductPage;
  let positionPage: PositionPage;

  test.beforeEach(async ({ page }) => {
    navigationPage = new NavigationPage(page);
    warehousePage = new WarehousePage(page);
    productPage = new ProductPage(page);
    positionPage = new PositionPage(page);
    
    // Clear all data
    await positionPage.clearLocalStorage();
    await page.reload();
    await navigationPage.waitForPageLoad();
    
    // Set up test data: create at least one warehouse and one product
    await navigationPage.navigateToWarehouses();
    const warehouse = testWarehouse(1);
    await warehousePage.clickAddWarehouse();
    await warehousePage.fillWarehouseForm(warehouse.name, warehouse.description);
    await warehousePage.saveWarehouse();
    
    await navigationPage.navigateToProducts();
    const product = testProduct(1);
    await productPage.clickAddProduct();
    await productPage.fillProductForm(product.name, product.price);
    await productPage.saveProduct();
    
    // Navigate to positions page
    await navigationPage.navigateToPositions();
    await navigationPage.waitForPageLoad();
  });

  test('should display empty state when no positions exist', async () => {
    await positionPage.verifyPageTitle();
    const isEmpty = await positionPage.verifyEmptyState();
    expect(isEmpty).toBe(true);
    const count = await positionPage.getPositionCount();
    expect(count).toBe(0);
  });

  test('should create a new position', async () => {
    // Get warehouse and product names from setup
    await navigationPage.navigateToWarehouses();
    const warehouseName = testWarehouse(1).name;
    await navigationPage.navigateToProducts();
    const productName = testProduct(1).name;
    
    await navigationPage.navigateToPositions();
    const position = testPosition(productName, warehouseName, 10);
    
    await positionPage.clickAddPosition();
    await positionPage.fillPositionForm(position.productName, position.warehouseName, position.amount);
    await positionPage.savePosition();
    
    const isVisible = await positionPage.isPositionVisible(
      position.productName,
      position.warehouseName,
      position.amount
    );
    expect(isVisible).toBe(true);
    const count = await positionPage.getPositionCount();
    expect(count).toBe(1);
  });

  test('should edit an existing position', async () => {
    // Create a position first
    await navigationPage.navigateToWarehouses();
    const warehouse1 = testWarehouse(1).name;
    await navigationPage.navigateToProducts();
    const product1 = testProduct(1).name;
    
    await navigationPage.navigateToPositions();
    const originalPosition = testPosition(product1, warehouse1, 10);
    
    await positionPage.clickAddPosition();
    await positionPage.fillPositionForm(
      originalPosition.productName,
      originalPosition.warehouseName,
      originalPosition.amount
    );
    await positionPage.savePosition();
    
    // Get the position ID
    const positionId = await positionPage.getPositionIdByNames(
      originalPosition.productName,
      originalPosition.warehouseName
    );
    expect(positionId).not.toBeNull();
    
    // Edit the position - change amount
    await positionPage.clickEditPosition(positionId!);
    await positionPage.fillPositionForm(product1, warehouse1, 25);
    await positionPage.savePosition();
    
    // Verify changes
    const isUpdatedVisible = await positionPage.isPositionVisible(product1, warehouse1, 25);
    expect(isUpdatedVisible).toBe(true);
    const isOriginalVisible = await positionPage.isPositionVisible(
      originalPosition.productName,
      originalPosition.warehouseName,
      originalPosition.amount
    );
    expect(isOriginalVisible).toBe(false);
  });

  test('should delete an existing position', async () => {
    // Create a position first
    await navigationPage.navigateToWarehouses();
    const warehouseName = testWarehouse(1).name;
    await navigationPage.navigateToProducts();
    const productName = testProduct(1).name;
    
    await navigationPage.navigateToPositions();
    const position = testPosition(productName, warehouseName, 15);
    
    await positionPage.clickAddPosition();
    await positionPage.fillPositionForm(position.productName, position.warehouseName, position.amount);
    await positionPage.savePosition();
    
    const initialCount = await positionPage.getPositionCount();
    expect(initialCount).toBe(1);
    
    // Get the position ID and delete
    const positionId = await positionPage.getPositionIdByNames(position.productName, position.warehouseName);
    expect(positionId).not.toBeNull();
    
    // Set up dialog handler before clicking delete
    positionPage.page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    
    await positionPage.clickDeletePosition(positionId!);
    await positionPage.page.waitForTimeout(500);
    
    // Verify deletion
    const finalCount = await positionPage.getPositionCount();
    expect(finalCount).toBe(0);
    const isVisible = await positionPage.isPositionVisible(
      position.productName,
      position.warehouseName,
      position.amount
    );
    expect(isVisible).toBe(false);
  });

  test('should cancel position form without saving', async () => {
    await navigationPage.navigateToWarehouses();
    const warehouseName = testWarehouse(1).name;
    await navigationPage.navigateToProducts();
    const productName = testProduct(1).name;
    
    await navigationPage.navigateToPositions();
    await positionPage.clickAddPosition();
    await positionPage.fillPositionForm(productName, warehouseName, 10);
    await positionPage.cancelPositionForm();
    
    // Verify form is closed and position was not created
    const isFormVisible = await positionPage.isVisible('form-position');
    expect(isFormVisible).toBe(false);
    const count = await positionPage.getPositionCount();
    expect(count).toBe(0);
  });

  test('should validate required fields', async () => {
    await positionPage.clickAddPosition();
    
    // Check product field is required
    const productSelect = positionPage.getByTestId('input-product-position');
    const isProductRequired = await productSelect.getAttribute('required');
    expect(isProductRequired).not.toBeNull();
    
    // Check warehouse field is required
    const warehouseSelect = positionPage.getByTestId('input-warehouse-position');
    const isWarehouseRequired = await warehouseSelect.getAttribute('required');
    expect(isWarehouseRequired).not.toBeNull();
    
    // Check amount field is required
    const amountInput = positionPage.getByTestId('input-amount-position');
    const isAmountRequired = await amountInput.getAttribute('required');
    expect(isAmountRequired).not.toBeNull();
  });

  test('should validate amount is a number', async () => {
    await positionPage.clickAddPosition();
    
    const amountInput = positionPage.getByTestId('input-amount-position');
    const inputType = await amountInput.getAttribute('type');
    expect(inputType).toBe('number');
    
    const minValue = await amountInput.getAttribute('min');
    expect(minValue).toBe('0');
  });

  test('should create multiple positions with different products and warehouses', async () => {
    // Create additional warehouses and products
    await navigationPage.navigateToWarehouses();
    const warehouse2 = testWarehouse(2);
    await warehousePage.clickAddWarehouse();
    await warehousePage.fillWarehouseForm(warehouse2.name, warehouse2.description);
    await warehousePage.saveWarehouse();
    
    await navigationPage.navigateToProducts();
    const product2 = testProduct(2);
    await productPage.clickAddProduct();
    await productPage.fillProductForm(product2.name, product2.price);
    await productPage.saveProduct();
    
    // Create multiple positions
    await navigationPage.navigateToPositions();
    const positions = [
      testPosition(testProduct(1).name, testWarehouse(1).name, 10),
      testPosition(testProduct(1).name, warehouse2.name, 20),
      testPosition(product2.name, testWarehouse(1).name, 30),
    ];
    
    for (const position of positions) {
      await positionPage.clickAddPosition();
      await positionPage.fillPositionForm(position.productName, position.warehouseName, position.amount);
      await positionPage.savePosition();
    }
    
    const count = await positionPage.getPositionCount();
    expect(count).toBe(3);
    
    // Verify all positions are visible
    for (const position of positions) {
      const isVisible = await positionPage.isPositionVisible(
        position.productName,
        position.warehouseName,
        position.amount
      );
      expect(isVisible).toBe(true);
    }
  });

  test('should persist positions after page refresh', async () => {
    await navigationPage.navigateToWarehouses();
    const warehouseName = testWarehouse(1).name;
    await navigationPage.navigateToProducts();
    const productName = testProduct(1).name;
    
    await navigationPage.navigateToPositions();
    const position = testPosition(productName, warehouseName, 50);
    
    await positionPage.clickAddPosition();
    await positionPage.fillPositionForm(position.productName, position.warehouseName, position.amount);
    await positionPage.savePosition();
    
    // Reload page
    await positionPage.page.reload();
    await navigationPage.waitForPageLoad();
    
    // Verify position still exists
    const isVisible = await positionPage.isPositionVisible(
      position.productName,
      position.warehouseName,
      position.amount
    );
    expect(isVisible).toBe(true);
    const count = await positionPage.getPositionCount();
    expect(count).toBe(1);
  });

  test('should display product and warehouse names in position list', async () => {
    await navigationPage.navigateToWarehouses();
    const warehouseName = testWarehouse(1).name;
    await navigationPage.navigateToProducts();
    const productName = testProduct(1).name;
    
    await navigationPage.navigateToPositions();
    const position = testPosition(productName, warehouseName, 100);
    
    await positionPage.clickAddPosition();
    await positionPage.fillPositionForm(position.productName, position.warehouseName, position.amount);
    await positionPage.savePosition();
    
    // Verify the position displays product and warehouse names (not IDs)
    const items = positionPage.getPositionItems();
    const firstItem = items.first();
    const text = await firstItem.textContent();
    expect(text).toContain(productName);
    expect(text).toContain(warehouseName);
    expect(text).toContain('100');
  });
});
