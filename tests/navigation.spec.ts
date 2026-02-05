import { test, expect } from '@playwright/test';
import { NavigationPage } from './pages/NavigationPage';
import { WarehousePage } from './pages/WarehousePage';
import { ProductPage } from './pages/ProductPage';
import { PositionPage } from './pages/PositionPage';

test.describe('Navigation Tests', () => {
  let navigationPage: NavigationPage;
  let warehousePage: WarehousePage;
  let productPage: ProductPage;
  let positionPage: PositionPage;

  test.beforeEach(async ({ page }) => {
    navigationPage = new NavigationPage(page);
    warehousePage = new WarehousePage(page);
    productPage = new ProductPage(page);
    positionPage = new PositionPage(page);
    await navigationPage.goto('/');
    await navigationPage.waitForPageLoad();
  });

  test('should navigate to warehouses page via navigation menu', async () => {
    await navigationPage.verifyNavigationVisible();
    await navigationPage.navigateToWarehouses();
    await warehousePage.verifyPageTitle();
    expect(await navigationPage.isActiveLink('warehouses')).toBe(true);
  });

  test('should navigate to products page via navigation menu', async () => {
    await navigationPage.verifyNavigationVisible();
    await navigationPage.navigateToProducts();
    await productPage.verifyPageTitle();
    expect(await navigationPage.isActiveLink('products')).toBe(true);
  });

  test('should navigate to positions page via navigation menu', async () => {
    await navigationPage.verifyNavigationVisible();
    await navigationPage.navigateToPositions();
    await positionPage.verifyPageTitle();
    expect(await navigationPage.isActiveLink('positions')).toBe(true);
  });

  test('should navigate directly to warehouses URL', async () => {
    await navigationPage.goto('/warehouses');
    await navigationPage.waitForPageLoad();
    await warehousePage.verifyPageTitle();
    expect(await navigationPage.isActiveLink('warehouses')).toBe(true);
  });

  test('should navigate directly to products URL', async () => {
    await navigationPage.goto('/products');
    await navigationPage.waitForPageLoad();
    await productPage.verifyPageTitle();
    expect(await navigationPage.isActiveLink('products')).toBe(true);
  });

  test('should navigate directly to positions URL', async () => {
    await navigationPage.goto('/positions');
    await navigationPage.waitForPageLoad();
    await positionPage.verifyPageTitle();
    expect(await navigationPage.isActiveLink('positions')).toBe(true);
  });

  test('should redirect root URL to warehouses', async () => {
    await navigationPage.goto('/');
    await navigationPage.waitForPageLoad();
    await warehousePage.verifyPageTitle();
    expect(await navigationPage.isActiveLink('warehouses')).toBe(true);
  });

  test('should highlight active navigation link', async () => {
    // Start on warehouses
    await navigationPage.navigateToWarehouses();
    expect(await navigationPage.isActiveLink('warehouses')).toBe(true);
    expect(await navigationPage.isActiveLink('products')).toBe(false);
    expect(await navigationPage.isActiveLink('positions')).toBe(false);

    // Navigate to products
    await navigationPage.navigateToProducts();
    expect(await navigationPage.isActiveLink('warehouses')).toBe(false);
    expect(await navigationPage.isActiveLink('products')).toBe(true);
    expect(await navigationPage.isActiveLink('positions')).toBe(false);

    // Navigate to positions
    await navigationPage.navigateToPositions();
    expect(await navigationPage.isActiveLink('warehouses')).toBe(false);
    expect(await navigationPage.isActiveLink('products')).toBe(false);
    expect(await navigationPage.isActiveLink('positions')).toBe(true);
  });
});
