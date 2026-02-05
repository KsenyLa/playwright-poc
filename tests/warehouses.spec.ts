import { test, expect } from '@playwright/test';
import { NavigationPage } from './pages/NavigationPage';
import { WarehousePage } from './pages/WarehousePage';
import { testWarehouse } from './fixtures/test-data';

test.describe('Warehouse Management Tests', () => {
  let navigationPage: NavigationPage;
  let warehousePage: WarehousePage;

  test.beforeEach(async ({ page }) => {
    navigationPage = new NavigationPage(page);
    warehousePage = new WarehousePage(page);
    await navigationPage.goto('/warehouses');
    await navigationPage.waitForPageLoad();
    await warehousePage.clearLocalStorage();
    await page.reload();
    await navigationPage.waitForPageLoad();
  });

  test('should display empty state when no warehouses exist', async () => {
    await warehousePage.verifyPageTitle();
    const isEmpty = await warehousePage.verifyEmptyState();
    expect(isEmpty).toBe(true);
    const count = await warehousePage.getWarehouseCount();
    expect(count).toBe(0);
  });

  test('should create a new warehouse', async () => {
    const warehouse = testWarehouse(1);
    
    await warehousePage.clickAddWarehouse();
    await warehousePage.fillWarehouseForm(warehouse.name, warehouse.description);
    await warehousePage.saveWarehouse();
    
    const isVisible = await warehousePage.isWarehouseVisible(warehouse.name);
    expect(isVisible).toBe(true);
    const count = await warehousePage.getWarehouseCount();
    expect(count).toBe(1);
  });

  test('should create warehouse with only name (no description)', async () => {
    const warehouse = testWarehouse(2);
    
    await warehousePage.clickAddWarehouse();
    await warehousePage.fillWarehouseForm(warehouse.name);
    await warehousePage.saveWarehouse();
    
    const isVisible = await warehousePage.isWarehouseVisible(warehouse.name);
    expect(isVisible).toBe(true);
  });

  test('should edit an existing warehouse', async () => {
    // Create a warehouse first
    const originalWarehouse = testWarehouse(3);
    await warehousePage.clickAddWarehouse();
    await warehousePage.fillWarehouseForm(originalWarehouse.name, originalWarehouse.description);
    await warehousePage.saveWarehouse();
    
    // Get the warehouse ID
    const warehouseId = await warehousePage.getWarehouseIdByName(originalWarehouse.name);
    expect(warehouseId).not.toBeNull();
    
    // Edit the warehouse
    const updatedName = 'Updated Warehouse Name';
    const updatedDescription = 'Updated Description';
    await warehousePage.clickEditWarehouse(warehouseId!);
    await warehousePage.fillWarehouseForm(updatedName, updatedDescription);
    await warehousePage.saveWarehouse();
    
    // Verify changes
    const isUpdatedVisible = await warehousePage.isWarehouseVisible(updatedName);
    expect(isUpdatedVisible).toBe(true);
    const isOriginalVisible = await warehousePage.isWarehouseVisible(originalWarehouse.name);
    expect(isOriginalVisible).toBe(false);
  });

  test('should delete an existing warehouse', async () => {
    // Create a warehouse first
    const warehouse = testWarehouse(4);
    await warehousePage.clickAddWarehouse();
    await warehousePage.fillWarehouseForm(warehouse.name, warehouse.description);
    await warehousePage.saveWarehouse();
    
    const initialCount = await warehousePage.getWarehouseCount();
    expect(initialCount).toBe(1);
    
    // Get the warehouse ID and delete
    const warehouseId = await warehousePage.getWarehouseIdByName(warehouse.name);
    expect(warehouseId).not.toBeNull();
    
    // Set up dialog handler before clicking delete
    warehousePage.page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    
    await warehousePage.clickDeleteWarehouse(warehouseId!);
    await warehousePage.page.waitForTimeout(500);
    
    // Verify deletion
    const finalCount = await warehousePage.getWarehouseCount();
    expect(finalCount).toBe(0);
    const isVisible = await warehousePage.isWarehouseVisible(warehouse.name);
    expect(isVisible).toBe(false);
  });

  test('should cancel warehouse form without saving', async () => {
    await warehousePage.clickAddWarehouse();
    await warehousePage.fillWarehouseForm('Test Warehouse', 'Test Description');
    await warehousePage.cancelWarehouseForm();
    
    // Verify form is closed and warehouse was not created
    const isFormVisible = await warehousePage.isVisible('form-warehouse');
    expect(isFormVisible).toBe(false);
    const count = await warehousePage.getWarehouseCount();
    expect(count).toBe(0);
  });

  test('should validate required name field', async () => {
    await warehousePage.clickAddWarehouse();
    
    // Try to submit without filling name
    const nameInput = warehousePage.getByTestId('input-name-warehouse');
    await nameInput.fill('');
    
    // HTML5 validation should prevent submission
    const isRequired = await nameInput.getAttribute('required');
    expect(isRequired).not.toBeNull();
  });

  test('should create multiple warehouses', async () => {
    const warehouses = [testWarehouse(5), testWarehouse(6), testWarehouse(7)];
    
    for (const warehouse of warehouses) {
      await warehousePage.clickAddWarehouse();
      await warehousePage.fillWarehouseForm(warehouse.name, warehouse.description);
      await warehousePage.saveWarehouse();
    }
    
    const count = await warehousePage.getWarehouseCount();
    expect(count).toBe(3);
    
    // Verify all warehouses are visible
    for (const warehouse of warehouses) {
      const isVisible = await warehousePage.isWarehouseVisible(warehouse.name);
      expect(isVisible).toBe(true);
    }
  });

  test('should persist warehouses after page refresh', async () => {
    const warehouse = testWarehouse(8);
    
    await warehousePage.clickAddWarehouse();
    await warehousePage.fillWarehouseForm(warehouse.name, warehouse.description);
    await warehousePage.saveWarehouse();
    
    // Reload page
    await warehousePage.page.reload();
    await navigationPage.waitForPageLoad();
    
    // Verify warehouse still exists
    const isVisible = await warehousePage.isWarehouseVisible(warehouse.name);
    expect(isVisible).toBe(true);
    const count = await warehousePage.getWarehouseCount();
    expect(count).toBe(1);
  });
});
