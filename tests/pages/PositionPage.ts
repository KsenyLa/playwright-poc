import { BasePage } from './BasePage';
import { Page, Locator } from '@playwright/test';

export class PositionPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Click Add Position button
   */
  async clickAddPosition() {
    await this.click('btn-add-position');
    await this.waitForElement('form-position');
  }

  /**
   * Fill position form
   */
  async fillPositionForm(productName: string, warehouseName: string, amount: number) {
    // Wait for form to be ready
    await this.waitForElement('form-position');
    
    // Wait for dropdowns to have options loaded
    const productSelect = this.getByTestId('input-product-position');
    await productSelect.waitFor({ state: 'visible' });
    
    // Wait for product options to be available (at least one option besides "Select a product")
    await this.page.waitForFunction(
      (testId) => {
        const select = document.querySelector(`[data-testid="${testId}"]`) as HTMLSelectElement;
        if (!select) return false;
        // Check if there are options with actual values (not just the placeholder)
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].value && select.options[i].value !== '') {
            return true;
          }
        }
        return false;
      },
      'input-product-position',
      { timeout: 10000 }
    );
    
    // Get all product options and find the one matching the name
    const productOptions = productSelect.locator('option');
    const productOptionsCount = await productOptions.count();
    let productValue = null;
    
    for (let i = 0; i < productOptionsCount; i++) {
      const option = productOptions.nth(i);
      const text = await option.textContent();
      if (text?.trim() === productName.trim()) {
        productValue = await option.getAttribute('value');
        break;
      }
    }
    
    if (!productValue) {
      const allOptions = await productSelect.locator('option').allTextContents();
      throw new Error(`Product "${productName}" not found in dropdown. Available options: ${allOptions.join(', ')}`);
    }
    
    // Select product from dropdown by value
    await productSelect.selectOption(productValue);
    
    // Verify selection
    const selectedProduct = await productSelect.inputValue();
    if (selectedProduct !== productValue) {
      throw new Error(`Failed to select product "${productName}". Selected value: ${selectedProduct}, Expected: ${productValue}`);
    }
    await this.page.waitForTimeout(200);

    // Wait for warehouse options to be available
    const warehouseSelect = this.getByTestId('input-warehouse-position');
    await warehouseSelect.waitFor({ state: 'visible' });
    
    await this.page.waitForFunction(
      (testId) => {
        const select = document.querySelector(`[data-testid="${testId}"]`) as HTMLSelectElement;
        if (!select) return false;
        // Check if there are options with actual values (not just the placeholder)
        for (let i = 0; i < select.options.length; i++) {
          if (select.options[i].value && select.options[i].value !== '') {
            return true;
          }
        }
        return false;
      },
      'input-warehouse-position',
      { timeout: 10000 }
    );
    
    // Get all warehouse options and find the one matching the name
    const warehouseOptions = warehouseSelect.locator('option');
    const warehouseOptionsCount = await warehouseOptions.count();
    let warehouseValue = null;
    
    for (let i = 0; i < warehouseOptionsCount; i++) {
      const option = warehouseOptions.nth(i);
      const text = await option.textContent();
      if (text?.trim() === warehouseName.trim()) {
        warehouseValue = await option.getAttribute('value');
        break;
      }
    }
    
    if (!warehouseValue) {
      const allOptions = await warehouseSelect.locator('option').allTextContents();
      throw new Error(`Warehouse "${warehouseName}" not found in dropdown. Available options: ${allOptions.join(', ')}`);
    }
    
    // Select warehouse from dropdown by value
    await warehouseSelect.selectOption(warehouseValue);
    
    // Verify selection
    const selectedWarehouse = await warehouseSelect.inputValue();
    if (selectedWarehouse !== warehouseValue) {
      throw new Error(`Failed to select warehouse "${warehouseName}". Selected value: ${selectedWarehouse}, Expected: ${warehouseValue}`);
    }
    await this.page.waitForTimeout(200);

    // Fill amount - clear first in case editing
    const amountInput = this.getByTestId('input-amount-position');
    await amountInput.clear();
    await amountInput.fill(amount.toString());
  }

  /**
   * Save position form
   */
  async savePosition() {
    await this.click('btn-save-position');
    // Wait for form to disappear
    await this.page.waitForSelector('[data-testid="form-position"]', { state: 'hidden', timeout: 5000 }).catch(() => {
      // Form might already be hidden, that's okay
    });
    await this.page.waitForTimeout(300); // Additional wait for list to update
  }

  /**
   * Cancel position form
   */
  async cancelPositionForm() {
    await this.click('btn-cancel-position');
  }

  /**
   * Get all position items
   */
  getPositionItems(): Locator {
    return this.page.locator('[data-testid^="position-item-"]');
  }

  /**
   * Click edit button for a position by ID
   */
  async clickEditPosition(id: string) {
    await this.click(`btn-edit-position-${id}`);
    await this.waitForElement('form-position');
  }

  /**
   * Click delete button for a position by ID
   * Note: Dialog handler should be set up in the test before calling this method
   */
  async clickDeletePosition(id: string) {
    await this.click(`btn-delete-position-${id}`);
    await this.page.waitForTimeout(500); // Wait for deletion
  }

  /**
   * Check if position is visible by product name, warehouse name, and amount
   */
  async isPositionVisible(productName: string, warehouseName: string, amount: number): Promise<boolean> {
    const items = this.getPositionItems();
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const text = await item.textContent();
      if (
        text?.includes(productName) &&
        text?.includes(warehouseName) &&
        text?.includes(amount.toString())
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get position count
   */
  async getPositionCount(): Promise<number> {
    const items = this.getPositionItems();
    return await items.count();
  }

  /**
   * Get position ID by product and warehouse names (returns first match)
   */
  async getPositionIdByNames(productName: string, warehouseName: string): Promise<string | null> {
    const items = this.getPositionItems();
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const text = await item.textContent();
      if (text?.includes(productName) && text?.includes(warehouseName)) {
        const testId = await item.getAttribute('data-testid');
        return testId?.replace('position-item-', '') || null;
      }
    }
    return null;
  }

  /**
   * Verify page title is visible
   */
  async verifyPageTitle() {
    await this.waitForElement('page-title-positions');
  }

  /**
   * Verify empty state message
   */
  async verifyEmptyState() {
    const list = this.getByTestId('list-positions');
    const text = await list.textContent();
    return text?.includes('No positions found') || false;
  }
}
