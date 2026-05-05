import { test, expect } from '@playwright/test';
import { NavigationPage } from './pages/NavigationPage';
import { ProductPage } from './pages/ProductPage';
import { dataFactory } from './fixtures/test-data';

test.describe('Product Management Tests', () => {
  test.describe.configure({ mode: 'serial' });

  const scenarioId = dataFactory.createScenarioScope('products');
  const product = dataFactory.createProduct(1, scenarioId);
  const draftProduct = dataFactory.createProduct(2, scenarioId);
  const updatedProduct = {
    name: `${product.name} Updated`,
    price: 99.99,
  };

  let navigationPage: NavigationPage;
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    navigationPage = new NavigationPage(page);
    productPage = new ProductPage(page);

    await navigationPage.goto('/products');
    await navigationPage.waitForPageLoad();
    await productPage.verifyPageTitle();
  });

  test.afterAll(async ({ browser }) => {
    const page = await browser.newPage();
    const cleanupNavigationPage = new NavigationPage(page);
    const cleanupProductPage = new ProductPage(page);

    await cleanupNavigationPage.goto('/products');
    await cleanupNavigationPage.waitForPageLoad();
    await cleanupProductPage.deleteProductByName(updatedProduct.name);
    await cleanupProductPage.deleteProductByName(product.name);
    await page.close();
  });

  test('should create a new product and keep it after refresh', async () => {
    await test.step('open product create form and verify required fields', async () => {
      await productPage.clickAddProduct();
      const nameInput = productPage.getByTestId('input-name-product');
      const priceInput = productPage.getByTestId('input-price-product');

      expect(await nameInput.getAttribute('required')).not.toBeNull();
      expect(await priceInput.getAttribute('required')).not.toBeNull();
      expect(await priceInput.getAttribute('type')).toBe('number');
      expect(await priceInput.getAttribute('min')).toBe('0');
    });

    await test.step('create a new product', async () => {
      await productPage.fillProductForm(product.name, product.price);
      await productPage.saveProduct();
    });

    await test.step('verify created product is visible in the list', async () => {
      expect(await productPage.waitForProductVisible(product.name)).toBe(true);
      expect(await productPage.getProductPrice(product.name)).toBe(product.price);
      expect(await productPage.countProductsByName(product.name)).toBe(1);
    });

    await test.step('reload page and verify product still exists', async () => {
      await productPage.page.reload();
      await navigationPage.waitForPageLoad();
      expect(await productPage.waitForProductVisible(product.name)).toBe(true);
      expect(await productPage.getProductPrice(product.name)).toBe(product.price);
    });
  });

  test('should edit the existing product', async () => {
    let productId: string | null;

    await test.step('find existing product and open edit form', async () => {
      productId = await productPage.getProductIdByName(product.name);
      expect(productId).not.toBeNull();
      await productPage.clickEditProduct(productId!);
    });

    await test.step('update product details', async () => {
      await productPage.fillProductForm(updatedProduct.name, updatedProduct.price);
      await productPage.saveProduct();
    });

    await test.step('verify updated product is shown and original name is gone', async () => {
      expect(await productPage.waitForProductVisible(updatedProduct.name)).toBe(true);
      expect(await productPage.getProductPrice(updatedProduct.name)).toBe(updatedProduct.price);
      expect(await productPage.isProductVisible(product.name)).toBe(false);
    });
  });

  test('should cancel an edit without changing the saved product', async () => {
    let productId: string | null;

    await test.step('open edit form for updated product', async () => {
      productId = await productPage.getProductIdByName(updatedProduct.name);
      expect(productId).not.toBeNull();
      await productPage.clickEditProduct(productId!);
    });

    await test.step('change values and cancel editing', async () => {
      await productPage.fillProductForm(draftProduct.name, draftProduct.price);
      await productPage.cancelProductForm();
    });

    await test.step('verify canceled changes were not saved', async () => {
      expect(await productPage.isProductVisible(draftProduct.name)).toBe(false);
      expect(await productPage.waitForProductVisible(updatedProduct.name)).toBe(true);
      expect(await productPage.getProductPrice(updatedProduct.name)).toBe(updatedProduct.price);
    });
  });

  test('should delete the product at the end of the scenario', async () => {
    await test.step('delete the updated product', async () => {
      expect(await productPage.deleteProductByName(updatedProduct.name)).toBe(true);
    });

    await test.step('verify the product is no longer visible', async () => {
      expect(await productPage.isProductVisible(updatedProduct.name)).toBe(false);
    });
  });
});
