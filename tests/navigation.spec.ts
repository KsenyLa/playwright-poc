import { test, expect } from '@playwright/test';
import { NavigationPage } from './pages/NavigationPage';
import { WarehousePage } from './pages/WarehousePage';
import { ProductPage } from './pages/ProductPage';
import { PositionPage } from './pages/PositionPage';

test.describe('Navigation Tests', () => {
  test.describe.configure({ mode: 'serial' });

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
    await test.step('navigate to warehouses page from navigation', async () => {
      await navigationPage.verifyNavigationVisible();
      await navigationPage.navigateToWarehouses();
      await warehousePage.verifyPageTitle();
    });

    await test.step('verify warehouses link is active', async () => {
      expect(await navigationPage.isActiveLink('warehouses')).toBe(true);
    });
  });

  test('should navigate to products page via navigation menu', async () => {
    await test.step('navigate to products page from navigation', async () => {
      await navigationPage.verifyNavigationVisible();
      await navigationPage.navigateToProducts();
      await productPage.verifyPageTitle();
    });

    await test.step('verify products link is active', async () => {
      expect(await navigationPage.isActiveLink('products')).toBe(true);
    });
  });

  test('should navigate to positions page via navigation menu', async () => {
    await test.step('navigate to positions page from navigation', async () => {
      await navigationPage.verifyNavigationVisible();
      await navigationPage.navigateToPositions();
      await positionPage.verifyPageTitle();
    });

    await test.step('verify positions link is active', async () => {
      expect(await navigationPage.isActiveLink('positions')).toBe(true);
    });
  });

  test('should navigate directly to warehouses URL', async () => {
    await test.step('open warehouses url directly', async () => {
      await navigationPage.goto('/warehouses');
      await navigationPage.waitForPageLoad();
      await warehousePage.verifyPageTitle();
    });

    await test.step('verify warehouses link is active', async () => {
      expect(await navigationPage.isActiveLink('warehouses')).toBe(true);
    });
  });

  test('should navigate directly to products URL', async () => {
    await test.step('open products url directly', async () => {
      await navigationPage.goto('/products');
      await navigationPage.waitForPageLoad();
      await productPage.verifyPageTitle();
    });

    await test.step('verify products link is active', async () => {
      expect(await navigationPage.isActiveLink('products')).toBe(true);
    });
  });

  test('should navigate directly to positions URL', async () => {
    await test.step('open positions url directly', async () => {
      await navigationPage.goto('/positions');
      await navigationPage.waitForPageLoad();
      await positionPage.verifyPageTitle();
    });

    await test.step('verify positions link is active', async () => {
      expect(await navigationPage.isActiveLink('positions')).toBe(true);
    });
  });

  test('should redirect root URL to warehouses', async () => {
    await test.step('open root url and wait for redirect', async () => {
      await navigationPage.goto('/');
      await navigationPage.waitForPageLoad();
      await warehousePage.verifyPageTitle();
    });

    await test.step('verify warehouses link is active after redirect', async () => {
      expect(await navigationPage.isActiveLink('warehouses')).toBe(true);
    });
  });

  test('should highlight active navigation link', async () => {
    await test.step('verify active link state on warehouses page', async () => {
      await navigationPage.navigateToWarehouses();
      expect(await navigationPage.isActiveLink('warehouses')).toBe(true);
      expect(await navigationPage.isActiveLink('products')).toBe(false);
      expect(await navigationPage.isActiveLink('positions')).toBe(false);
    });

    await test.step('verify active link state on products page', async () => {
      await navigationPage.navigateToProducts();
      expect(await navigationPage.isActiveLink('warehouses')).toBe(false);
      expect(await navigationPage.isActiveLink('products')).toBe(true);
      expect(await navigationPage.isActiveLink('positions')).toBe(false);
    });

    await test.step('verify active link state on positions page', async () => {
      await navigationPage.navigateToPositions();
      expect(await navigationPage.isActiveLink('warehouses')).toBe(false);
      expect(await navigationPage.isActiveLink('products')).toBe(false);
      expect(await navigationPage.isActiveLink('positions')).toBe(true);
    });
  });
});
