import { test, expect } from '@playwright/test';
import { NavigationPage } from './pages/NavigationPage';
import { ProductPage } from './pages/ProductPage';
import { testProduct } from './fixtures/test-data';

test.describe('Product Management Tests', () => {
  let navigationPage: NavigationPage;
  let productPage: ProductPage;

  test.beforeEach(async ({ page }) => {
    navigationPage = new NavigationPage(page);
    productPage = new ProductPage(page);
    await navigationPage.goto('/products');
    await navigationPage.waitForPageLoad();
    await productPage.clearLocalStorage();
    await page.reload();
    await navigationPage.waitForPageLoad();
  });

  test('should display empty state when no products exist', async () => {
    await productPage.verifyPageTitle();
    const isEmpty = await productPage.verifyEmptyState();
    expect(isEmpty).toBe(true);
    const count = await productPage.getProductCount();
    expect(count).toBe(0);
  });

  test('should create a new product', async () => {
    const product = testProduct(1);
    
    await productPage.clickAddProduct();
    await productPage.fillProductForm(product.name, product.price);
    await productPage.saveProduct();
    
    const isVisible = await productPage.isProductVisible(product.name);
    expect(isVisible).toBe(true);
    const price = await productPage.getProductPrice(product.name);
    expect(price).toBe(product.price);
    const count = await productPage.getProductCount();
    expect(count).toBe(1);
  });

  test('should edit an existing product', async () => {
    // Create a product first
    const originalProduct = testProduct(2);
    await productPage.clickAddProduct();
    await productPage.fillProductForm(originalProduct.name, originalProduct.price);
    await productPage.saveProduct();
    
    // Get the product ID
    const productId = await productPage.getProductIdByName(originalProduct.name);
    expect(productId).not.toBeNull();
    
    // Edit the product
    const updatedName = 'Updated Product Name';
    const updatedPrice = 99.99;
    await productPage.clickEditProduct(productId!);
    await productPage.fillProductForm(updatedName, updatedPrice);
    await productPage.saveProduct();
    
    // Verify changes
    const isUpdatedVisible = await productPage.isProductVisible(updatedName);
    expect(isUpdatedVisible).toBe(true);
    const updatedPriceValue = await productPage.getProductPrice(updatedName);
    expect(updatedPriceValue).toBe(updatedPrice);
    const isOriginalVisible = await productPage.isProductVisible(originalProduct.name);
    expect(isOriginalVisible).toBe(false);
  });

  test('should delete an existing product', async () => {
    // Create a product first
    const product = testProduct(3);
    await productPage.clickAddProduct();
    await productPage.fillProductForm(product.name, product.price);
    await productPage.saveProduct();
    
    const initialCount = await productPage.getProductCount();
    expect(initialCount).toBe(1);
    
    // Get the product ID and delete
    const productId = await productPage.getProductIdByName(product.name);
    expect(productId).not.toBeNull();
    
    // Set up dialog handler before clicking delete
    productPage.page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
    
    await productPage.clickDeleteProduct(productId!);
    await productPage.page.waitForTimeout(500);
    
    // Verify deletion
    const finalCount = await productPage.getProductCount();
    expect(finalCount).toBe(0);
    const isVisible = await productPage.isProductVisible(product.name);
    expect(isVisible).toBe(false);
  });

  test('should cancel product form without saving', async () => {
    await productPage.clickAddProduct();
    await productPage.fillProductForm('Test Product', 10.99);
    await productPage.cancelProductForm();
    
    // Verify form is closed and product was not created
    const isFormVisible = await productPage.isVisible('form-product');
    expect(isFormVisible).toBe(false);
    const count = await productPage.getProductCount();
    expect(count).toBe(0);
  });

  test('should validate required fields', async () => {
    await productPage.clickAddProduct();
    
    // Check name field is required
    const nameInput = productPage.getByTestId('input-name-product');
    const isNameRequired = await nameInput.getAttribute('required');
    expect(isNameRequired).not.toBeNull();
    
    // Check price field is required
    const priceInput = productPage.getByTestId('input-price-product');
    const isPriceRequired = await priceInput.getAttribute('required');
    expect(isPriceRequired).not.toBeNull();
  });

  test('should validate price is a number', async () => {
    await productPage.clickAddProduct();
    
    const priceInput = productPage.getByTestId('input-price-product');
    const inputType = await priceInput.getAttribute('type');
    expect(inputType).toBe('number');
    
    const minValue = await priceInput.getAttribute('min');
    expect(minValue).toBe('0');
  });

  test('should create multiple products', async () => {
    const products = [testProduct(4), testProduct(5), testProduct(6)];
    
    for (const product of products) {
      await productPage.clickAddProduct();
      await productPage.fillProductForm(product.name, product.price);
      await productPage.saveProduct();
    }
    
    const count = await productPage.getProductCount();
    expect(count).toBe(3);
    
    // Verify all products are visible with correct prices
    for (const product of products) {
      const isVisible = await productPage.isProductVisible(product.name);
      expect(isVisible).toBe(true);
      const price = await productPage.getProductPrice(product.name);
      expect(price).toBe(product.price);
    }
  });

  test('should persist products after page refresh', async () => {
    const product = testProduct(7);
    
    await productPage.clickAddProduct();
    await productPage.fillProductForm(product.name, product.price);
    await productPage.saveProduct();
    
    // Reload page
    await productPage.page.reload();
    await navigationPage.waitForPageLoad();
    
    // Verify product still exists
    const isVisible = await productPage.isProductVisible(product.name);
    expect(isVisible).toBe(true);
    const price = await productPage.getProductPrice(product.name);
    expect(price).toBe(product.price);
    const count = await productPage.getProductCount();
    expect(count).toBe(1);
  });

  test('should handle decimal prices correctly', async () => {
    const product = {
      name: 'Product with Decimal Price',
      price: 19.99,
    };
    
    await productPage.clickAddProduct();
    await productPage.fillProductForm(product.name, product.price);
    await productPage.saveProduct();
    
    const price = await productPage.getProductPrice(product.name);
    expect(price).toBe(product.price);
  });
});
