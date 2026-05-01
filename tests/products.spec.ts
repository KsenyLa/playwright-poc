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
    await productPage.clickAddProduct();

    const nameInput = productPage.getByTestId('input-name-product');
    const priceInput = productPage.getByTestId('input-price-product');

    expect(await nameInput.getAttribute('required')).not.toBeNull();
    expect(await priceInput.getAttribute('required')).not.toBeNull();
    expect(await priceInput.getAttribute('type')).toBe('number');
    expect(await priceInput.getAttribute('min')).toBe('0');

    await productPage.fillProductForm(product.name, product.price);
    await productPage.saveProduct();

    expect(await productPage.waitForProductVisible(product.name)).toBe(true);
    expect(await productPage.getProductPrice(product.name)).toBe(product.price);
    expect(await productPage.countProductsByName(product.name)).toBe(1);

    await productPage.page.reload();
    await navigationPage.waitForPageLoad();

    expect(await productPage.waitForProductVisible(product.name)).toBe(true);
    expect(await productPage.getProductPrice(product.name)).toBe(product.price);
  });

  test('should edit the existing product', async () => {
    const productId = await productPage.getProductIdByName(product.name);
    expect(productId).not.toBeNull();

    await productPage.clickEditProduct(productId!);
    await productPage.fillProductForm(updatedProduct.name, updatedProduct.price);
    await productPage.saveProduct();

    expect(await productPage.waitForProductVisible(updatedProduct.name)).toBe(true);
    expect(await productPage.getProductPrice(updatedProduct.name)).toBe(updatedProduct.price);
    expect(await productPage.isProductVisible(product.name)).toBe(false);
  });

  test('should cancel an edit without changing the saved product', async () => {
    const productId = await productPage.getProductIdByName(updatedProduct.name);
    expect(productId).not.toBeNull();

    await productPage.clickEditProduct(productId!);
    await productPage.fillProductForm(draftProduct.name, draftProduct.price);
    await productPage.cancelProductForm();

    expect(await productPage.isProductVisible(draftProduct.name)).toBe(false);
    expect(await productPage.waitForProductVisible(updatedProduct.name)).toBe(true);
    expect(await productPage.getProductPrice(updatedProduct.name)).toBe(updatedProduct.price);
  });

  test('should delete the product at the end of the scenario', async () => {
    expect(await productPage.deleteProductByName(updatedProduct.name)).toBe(true);
    expect(await productPage.isProductVisible(updatedProduct.name)).toBe(false);
  });
});
