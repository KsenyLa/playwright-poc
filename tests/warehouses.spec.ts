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
    await test.step('open warehouse create form and verify required fields', async () => {
      await warehousePage.clickAddWarehouse();
      const nameInput = warehousePage.getByTestId('input-name-warehouse');
      expect(await nameInput.getAttribute('required')).not.toBeNull();
    });

    await test.step('create a new warehouse', async () => {
      await warehousePage.fillWarehouseForm(warehouse.name, warehouse.description);
      await warehousePage.saveWarehouse();
    });

    await test.step('verify created warehouse is visible in the list', async () => {
      expect(await warehousePage.waitForWarehouseVisible(warehouse.name)).toBe(true);
      expect(await warehousePage.getWarehouseDescription(warehouse.name)).toBe(warehouse.description);
      expect(await warehousePage.countWarehousesByName(warehouse.name)).toBe(1);
    });

    await test.step('verify warehouse search is visible and usable', async () => {
      await warehousePage.verifySearchIsVisible();
      await warehousePage.searchWarehouse(warehouse.name);
      expect(await warehousePage.waitForWarehouseVisible(warehouse.name)).toBe(true);
      expect(await warehousePage.countWarehousesByName(warehouse.name)).toBe(1);
    });

    await test.step('reload page and verify warehouse still exists', async () => {
      await warehousePage.page.reload();
      await navigationPage.waitForPageLoad();
      expect(await warehousePage.waitForWarehouseVisible(warehouse.name)).toBe(true);
    });
  });

  test('should edit the existing warehouse', async () => {
    let warehouseId: string | null;

    await test.step('find existing warehouse and open edit form', async () => {
      warehouseId = await warehousePage.getWarehouseIdByName(warehouse.name);
      expect(warehouseId).not.toBeNull();
      await warehousePage.clickEditWarehouse(warehouseId!);
    });

    await test.step('update warehouse details', async () => {
      await warehousePage.fillWarehouseForm(updatedWarehouse.name, updatedWarehouse.description);
      await warehousePage.saveWarehouse();
    });

    await test.step('verify updated warehouse is shown and original name is gone', async () => {
      expect(await warehousePage.waitForWarehouseVisible(updatedWarehouse.name)).toBe(true);
      expect(await warehousePage.getWarehouseDescription(updatedWarehouse.name)).toBe(updatedWarehouse.description);
      expect(await warehousePage.isWarehouseVisible(warehouse.name)).toBe(false);
    });
  });

  test('should cancel an edit without changing the saved warehouse', async () => {
    let warehouseId: string | null;

    await test.step('open edit form for updated warehouse', async () => {
      warehouseId = await warehousePage.getWarehouseIdByName(updatedWarehouse.name);
      expect(warehouseId).not.toBeNull();
      await warehousePage.clickEditWarehouse(warehouseId!);
    });

    await test.step('change values and cancel editing', async () => {
      await warehousePage.fillWarehouseForm(draftWarehouse.name, draftWarehouse.description);
      await warehousePage.cancelWarehouseForm();
    });

    await test.step('verify canceled changes were not saved', async () => {
      expect(await warehousePage.isWarehouseVisible(draftWarehouse.name)).toBe(false);
      expect(await warehousePage.waitForWarehouseVisible(updatedWarehouse.name)).toBe(true);
      expect(await warehousePage.getWarehouseDescription(updatedWarehouse.name)).toBe(updatedWarehouse.description);
    });
  });

  test('should delete the warehouse at the end of the scenario', async () => {
    await test.step('delete the updated warehouse', async () => {
      expect(await warehousePage.deleteWarehouseByName(updatedWarehouse.name)).toBe(true);
    });

    await test.step('verify the warehouse is no longer visible', async () => {
      expect(await warehousePage.isWarehouseVisible(updatedWarehouse.name)).toBe(false);
    });
  });
});
