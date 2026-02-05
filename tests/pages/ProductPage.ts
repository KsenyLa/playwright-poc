import { BasePage } from './BasePage';
import { Page, Locator } from '@playwright/test';

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
    await this.page.waitForTimeout(500); // Wait for form to close
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
    await this.page.waitForTimeout(500); // Wait for deletion
  }

  /**
   * Check if product is visible by name
   */
  async isProductVisible(name: string): Promise<boolean> {
    const items = this.getProductItems();
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const text = await item.textContent();
      if (text?.includes(name)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get product price by name
   */
  async getProductPrice(name: string): Promise<number | null> {
    const items = this.getProductItems();
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const text = await item.textContent();
      if (text?.includes(name)) {
        const priceMatch = text.match(/\$(\d+\.?\d*)/);
        if (priceMatch) {
          return parseFloat(priceMatch[1]);
        }
      }
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
   * Get product ID by name (returns first match)
   */
  async getProductIdByName(name: string): Promise<string | null> {
    const items = this.getProductItems();
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const text = await item.textContent();
      if (text?.includes(name)) {
        const testId = await item.getAttribute('data-testid');
        return testId?.replace('product-item-', '') || null;
      }
    }
    return null;
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
