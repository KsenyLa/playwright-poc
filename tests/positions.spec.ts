import { test, expect } from '@playwright/test';
import { NavigationPage } from './pages/NavigationPage';
import { WarehousePage } from './pages/WarehousePage';
import { ProductPage } from './pages/ProductPage';
import { PositionPage } from './pages/PositionPage';
import { dataFactory } from './fixtures/test-data';

test.describe('Position Management Tests', () => {
  test.describe.configure({ mode: 'serial' });

  const scenarioId = dataFactory.createScenarioScope('positions');
  const warehouse = dataFactory.createWarehouse(1, scenarioId);
  const product = dataFactory.createProduct(1, scenarioId);
  const originalPosition = dataFactory.createPosition(product.name, warehouse.name, 10);
  const updatedPosition = dataFactory.createPosition(product.name, warehouse.name, 25);

  let navigationPage: NavigationPage;
  let warehousePage: WarehousePage;
  let productPage: ProductPage;
  let positionPage: PositionPage;

  test.beforeEach(async ({ page }) => {
    navigationPage = new NavigationPage(page);
    warehousePage = new WarehousePage(page);
    productPage = new ProductPage(page);
    positionPage = new PositionPage(page);

    await navigationPage.goto('/positions');
    await navigationPage.waitForPageLoad();
    await positionPage.verifyPageTitle();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    const cleanupNavigationPage = new NavigationPage(page);
    const cleanupWarehousePage = new WarehousePage(page);
    const cleanupProductPage = new ProductPage(page);
    const cleanupPositionPage = new PositionPage(page);

    await cleanupNavigationPage.goto('/positions');
    await cleanupNavigationPage.waitForPageLoad();
    await cleanupPositionPage.deletePositionByNames(product.name, warehouse.name);

    await cleanupNavigationPage.navigateToProducts();
    await cleanupProductPage.deleteProductByName(product.name);

    await cleanupNavigationPage.navigateToWarehouses();
    await cleanupWarehousePage.deleteWarehouseByName(warehouse.name);
    await page.close();
  });

  test('should create prerequisite product and warehouse, then create a position', async () => {
    await navigationPage.navigateToWarehouses();
    await warehousePage.clickAddWarehouse();
    await warehousePage.fillWarehouseForm(warehouse.name, warehouse.description);
    await warehousePage.saveWarehouse();
    expect(await warehousePage.waitForWarehouseVisible(warehouse.name)).toBe(true);

    await navigationPage.navigateToProducts();
    await productPage.clickAddProduct();
    await productPage.fillProductForm(product.name, product.price);
    await productPage.saveProduct();
    expect(await productPage.waitForProductVisible(product.name)).toBe(true);

    await navigationPage.navigateToPositions();
    await positionPage.clickAddPosition();

    const productSelect = positionPage.getByTestId('input-product-position');
    const warehouseSelect = positionPage.getByTestId('input-warehouse-position');
    const amountInput = positionPage.getByTestId('input-amount-position');

    expect(await productSelect.getAttribute('required')).not.toBeNull();
    expect(await warehouseSelect.getAttribute('required')).not.toBeNull();
    expect(await amountInput.getAttribute('required')).not.toBeNull();
    expect(await amountInput.getAttribute('type')).toBe('number');
    expect(await amountInput.getAttribute('min')).toBe('0');

    await positionPage.fillPositionForm(
      originalPosition.productName,
      originalPosition.warehouseName,
      originalPosition.amount
    );
    await positionPage.savePosition();

    expect(
      await positionPage.waitForPositionVisible(
        originalPosition.productName,
        originalPosition.warehouseName,
        originalPosition.amount
      )
    ).toBe(true);
    expect(
      await positionPage.countPositionsByValues(
        originalPosition.productName,
        originalPosition.warehouseName,
        originalPosition.amount
      )
    ).toBe(1);

    await positionPage.page.reload();
    await navigationPage.waitForPageLoad();

    expect(
      await positionPage.waitForPositionVisible(
        originalPosition.productName,
        originalPosition.warehouseName,
        originalPosition.amount
      )
    ).toBe(true);
  });

  test('should edit the existing position amount', async () => {
    const positionId = await positionPage.getPositionIdByNames(
      originalPosition.productName,
      originalPosition.warehouseName
    );
    expect(positionId).not.toBeNull();

    await positionPage.clickEditPosition(positionId!);
    await positionPage.fillPositionForm(
      updatedPosition.productName,
      updatedPosition.warehouseName,
      updatedPosition.amount
    );
    await positionPage.savePosition();

    expect(
      await positionPage.waitForPositionVisible(
        updatedPosition.productName,
        updatedPosition.warehouseName,
        updatedPosition.amount
      )
    ).toBe(true);
    expect(
      await positionPage.isPositionVisible(
        originalPosition.productName,
        originalPosition.warehouseName,
        originalPosition.amount
      )
    ).toBe(false);
  });

  test('should delete the position and then remove its dependencies', async () => {
    await navigationPage.navigateToPositions();
    expect(await positionPage.deletePositionByNames(product.name, warehouse.name)).toBe(true);
    expect(
      await positionPage.isPositionVisible(
        updatedPosition.productName,
        updatedPosition.warehouseName,
        updatedPosition.amount
      )
    ).toBe(false);

    await navigationPage.navigateToProducts();
    expect(await productPage.deleteProductByName(product.name)).toBe(true);
    expect(await productPage.isProductVisible(product.name)).toBe(false);

    await navigationPage.navigateToWarehouses();
    expect(await warehousePage.deleteWarehouseByName(warehouse.name)).toBe(true);
    expect(await warehousePage.isWarehouseVisible(warehouse.name)).toBe(false);
  });
});
