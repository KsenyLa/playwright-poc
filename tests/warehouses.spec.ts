import { test, expect } from '@playwright/test';
import { NavigationPage } from './pages/NavigationPage';
import { WarehousePage } from './pages/WarehousePage';
import { dataFactory } from './fixtures/test-data';

test.describe('Warehouse Management Tests', () => {
  test.describe.configure({ mode: 'serial' });

  const scenarioId = dataFactory.createScenarioScope('warehouses');
  const warehouse = dataFactory.createWarehouse(1, scenarioId);
  const draftWarehouse = dataFactory.createWarehouse(2, scenarioId);
  const updatedWarehouse = {
    name: `${warehouse.name} Updated`,
    description: `Updated description for ${scenarioId}`,
  };

  let navigationPage: NavigationPage;
  let warehousePage: WarehousePage;

  test.beforeEach(async ({ page }) => {
    navigationPage = new NavigationPage(page);
    warehousePage = new WarehousePage(page);

    await navigationPage.goto('/warehouses');
    await navigationPage.waitForPageLoad();
    await warehousePage.verifyPageTitle();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    const cleanupNavigationPage = new NavigationPage(page);
    const cleanupWarehousePage = new WarehousePage(page);

    await cleanupNavigationPage.goto('/warehouses');
    await cleanupNavigationPage.waitForPageLoad();
    await cleanupWarehousePage.deleteWarehouseByName(updatedWarehouse.name);
    await cleanupWarehousePage.deleteWarehouseByName(warehouse.name);
    await page.close();
  });

  test('should create a new warehouse and keep it after refresh', async () => {
    await warehousePage.clickAddWarehouse();

    const nameInput = warehousePage.getByTestId('input-name-warehouse');
    expect(await nameInput.getAttribute('required')).not.toBeNull();

    await warehousePage.fillWarehouseForm(warehouse.name, warehouse.description);
    await warehousePage.saveWarehouse();

    expect(await warehousePage.waitForWarehouseVisible(warehouse.name)).toBe(true);
    expect(await warehousePage.getWarehouseDescription(warehouse.name)).toBe(warehouse.description);
    expect(await warehousePage.countWarehousesByName(warehouse.name)).toBe(1);

    await warehousePage.page.reload();
    await navigationPage.waitForPageLoad();

    expect(await warehousePage.waitForWarehouseVisible(warehouse.name)).toBe(true);
  });

  test('should edit the existing warehouse', async () => {
    const warehouseId = await warehousePage.getWarehouseIdByName(warehouse.name);
    expect(warehouseId).not.toBeNull();

    await warehousePage.clickEditWarehouse(warehouseId!);
    await warehousePage.fillWarehouseForm(updatedWarehouse.name, updatedWarehouse.description);
    await warehousePage.saveWarehouse();

    expect(await warehousePage.waitForWarehouseVisible(updatedWarehouse.name)).toBe(true);
    expect(await warehousePage.getWarehouseDescription(updatedWarehouse.name)).toBe(updatedWarehouse.description);
    expect(await warehousePage.isWarehouseVisible(warehouse.name)).toBe(false);
  });

  test('should cancel an edit without changing the saved warehouse', async () => {
    const warehouseId = await warehousePage.getWarehouseIdByName(updatedWarehouse.name);
    expect(warehouseId).not.toBeNull();

    await warehousePage.clickEditWarehouse(warehouseId!);
    await warehousePage.fillWarehouseForm(draftWarehouse.name, draftWarehouse.description);
    await warehousePage.cancelWarehouseForm();

    expect(await warehousePage.isWarehouseVisible(draftWarehouse.name)).toBe(false);
    expect(await warehousePage.waitForWarehouseVisible(updatedWarehouse.name)).toBe(true);
    expect(await warehousePage.getWarehouseDescription(updatedWarehouse.name)).toBe(updatedWarehouse.description);
  });

  test('should delete the warehouse at the end of the scenario', async () => {
    expect(await warehousePage.deleteWarehouseByName(updatedWarehouse.name)).toBe(true);
    expect(await warehousePage.isWarehouseVisible(updatedWarehouse.name)).toBe(false);
  });
});
