import { BasePage } from './BasePage';
import { Page, Locator } from '@playwright/test';

const escapeForRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class ProductPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Click Add Product button
   */
  async clickAddProduct() {
    await this.click('btn-add-product');
    await this.waitForElement('form-product');
  }

  /**
   * Fill product form
   */
  async fillProductForm(name: string, price: number) {
    await this.fillInput('input-name-product', name);
    await this.fillInput('input-price-product', price.toString());
  }

  /**
   * Save product form
   */
  async saveProduct() {
    await this.click('btn-save-product');
    await this.page.waitForSelector('[data-testid="form-product"]', {
      state: 'hidden',
      timeout: 5000,
    }).catch(() => {
      // Form might already be hidden by the time we start waiting.
    });
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Cancel product form
   */
  async cancelProductForm() {
    await this.click('btn-cancel-product');
  }

  /**
   * Get all product items
   */
  getProductItems(): Locator {
    return this.page.locator('[data-testid^="product-item-"]');
  }

  /**
   * Click edit button for a product by ID
   */
  async clickEditProduct(id: string) {
    await this.click(`btn-edit-product-${id}`);
    await this.waitForElement('form-product');
  }

  /**
   * Click delete button for a product by ID
   * Note: Dialog handler should be set up in the test before calling this method
   */
  async clickDeleteProduct(id: string) {
    await this.click(`btn-delete-product-${id}`);
    await this.page.waitForLoadState('networkidle');
  }

  private getProductItemLocator(name: string): Locator {
    const exactName = new RegExp(`^${escapeForRegex(name)}$`);

    return this.getProductItems().filter({
      has: this.page.locator('.product-name', { hasText: exactName }),
    });
  }

  private async waitForProductItemByName(name: string, timeoutMs: number = 3000): Promise<Locator | null> {
    const deadline = Date.now() + timeoutMs;

    do {
      const locator = this.getProductItemLocator(name);
      if (await locator.count()) {
        return locator.first();
      }

      await this.page.waitForTimeout(100);
    } while (Date.now() < deadline);

    return null;
  }

  private async waitForProductToDisappear(name: string, timeoutMs: number = 3000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;

    do {
      if ((await this.getProductItemLocator(name).count()) === 0) {
        return true;
      }

      await this.page.waitForTimeout(100);
    } while (Date.now() < deadline);

    return false;
  }

  /**
   * Check if product is visible by name
   */
  async isProductVisible(name: string): Promise<boolean> {
    return (await this.getProductItemLocator(name).count()) > 0;
  }

  /**
   * Get product price by name
   */
  async getProductPrice(name: string): Promise<number | null> {
    const item = await this.waitForProductItemByName(name);
    if (!item) {
      return null;
    }

    const priceText = (await item.locator('.product-price').textContent())?.trim() || '';
    const priceMatch = priceText.match(/\$(\d+\.?\d*)/);

    if (priceMatch) {
      return parseFloat(priceMatch[1]);
    }

    return null;
  }

  /**
   * Get product count
   */
  async getProductCount(): Promise<number> {
    const items = this.getProductItems();
    return await items.count();
  }

  /**
   * Get product ID by name (returns exact match)
   */
  async getProductIdByName(name: string): Promise<string | null> {
    const item = await this.waitForProductItemByName(name);
    if (!item) {
      return null;
    }

    const testId = await item.getAttribute('data-testid');
    return testId?.replace('product-item-', '') || null;
  }

  /**
   * Delete a product by exact visible name if it exists.
   */
  async deleteProductByName(name: string): Promise<boolean> {
    const productId = await this.getProductIdByName(name);

    if (!productId) {
      return false;
    }

    await this.acceptNextDialog();
    await this.clickDeleteProduct(productId);
    return await this.waitForProductToDisappear(name);
  }

  /**
   * Count products with exact name.
   */
  async countProductsByName(name: string): Promise<number> {
    return await this.getProductItemLocator(name).count();
  }

  /**
   * Verify page title is visible
   */
  async verifyPageTitle() {
    await this.waitForElement('page-title-products');
  }

  /**
   * Verify empty state message
   */
  async verifyEmptyState() {
    const list = this.getByTestId('list-products');
    const text = await list.textContent();
    return text?.includes('No products found') || false;
  }
}
