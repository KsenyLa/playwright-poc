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
    await this.page.waitForURL('**/positions/create');
    await this.waitForElement('form-position');
  }

  /**
   * Fill position form
   */
  async fillPositionForm(productName: string, warehouseName: string, amount: number) {
    await this.waitForElement('form-position');

    const productSelect = this.getByTestId('input-product-position');
    await productSelect.waitFor({ state: 'visible' });

    await this.page.waitForFunction(
      (testId) => {
        const select = document.querySelector(`[data-testid="${testId}"]`) as HTMLSelectElement;
        if (!select) return false;
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

    await productSelect.selectOption(productValue);

    const selectedProduct = await productSelect.inputValue();
    if (selectedProduct !== productValue) {
      throw new Error(`Failed to select product "${productName}". Selected value: ${selectedProduct}, Expected: ${productValue}`);
    }
    await this.page.waitForTimeout(200);

    const warehouseSelect = this.getByTestId('input-warehouse-position');
    await warehouseSelect.waitFor({ state: 'visible' });

    await this.page.waitForFunction(
      (testId) => {
        const select = document.querySelector(`[data-testid="${testId}"]`) as HTMLSelectElement;
        if (!select) return false;
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

    await warehouseSelect.selectOption(warehouseValue);

    const selectedWarehouse = await warehouseSelect.inputValue();
    if (selectedWarehouse !== warehouseValue) {
      throw new Error(`Failed to select warehouse "${warehouseName}". Selected value: ${selectedWarehouse}, Expected: ${warehouseValue}`);
    }
    await this.page.waitForTimeout(200);

    const amountInput = this.getByTestId('input-amount-position');
    await amountInput.clear();
    await amountInput.fill(amount.toString());
  }

  /**
   * Save position form
   */
  async savePosition() {
    await this.click('btn-save-position');
    await this.page.waitForURL('**/positions');
    await this.waitForElement('page-title-positions');
  }

  /**
   * Cancel position form
   */
  async cancelPositionForm() {
    await this.click('btn-cancel-position');
    await this.page.waitForURL('**/positions');
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
    await this.page.waitForURL(`**/positions/edit/${id}`);
    await this.waitForElement('form-position');
  }

  /**
   * Click delete button for a position by ID
   * Note: Dialog handler should be set up in the test before calling this method
   */
  async clickDeletePosition(id: string) {
    await this.click(`btn-delete-position-${id}`);
    await this.page.waitForTimeout(500);
  }

  private async findPositionItemByValues(
    productName: string,
    warehouseName: string,
    amount?: number
  ): Promise<Locator | null> {
    const items = this.getPositionItems();
    const count = await items.count();

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const values = item.locator('.position-value');
      const productValue = (await values.nth(0).textContent())?.trim();
      const warehouseValue = (await values.nth(1).textContent())?.trim();
      const amountValue = (await values.nth(2).textContent())?.trim();
      const amountMatches = amount === undefined || amountValue === amount.toString();

      if (productValue === productName && warehouseValue === warehouseName && amountMatches) {
        return item;
      }
    }

    return null;
  }

  private async waitForPositionItemByValues(
    productName: string,
    warehouseName: string,
    amount?: number,
    timeoutMs: number = 3000
  ): Promise<Locator | null> {
    const deadline = Date.now() + timeoutMs;

    do {
      const item = await this.findPositionItemByValues(productName, warehouseName, amount);
      if (item) {
        return item;
      }

      await this.page.waitForTimeout(100);
    } while (Date.now() < deadline);

    return null;
  }

  private async waitForPositionToDisappear(
    productName: string,
    warehouseName: string,
    timeoutMs: number = 3000
  ): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;

    do {
      if ((await this.findPositionItemByValues(productName, warehouseName)) === null) {
        return true;
      }

      await this.page.waitForTimeout(100);
    } while (Date.now() < deadline);

    return false;
  }

  /**
   * Check if position is visible by product name, warehouse name, and amount
   */
  async isPositionVisible(productName: string, warehouseName: string, amount: number): Promise<boolean> {
    const item = await this.findPositionItemByValues(productName, warehouseName, amount);
    return item !== null;
  }

  /**
   * Get position count
   */
  async getPositionCount(): Promise<number> {
    const items = this.getPositionItems();
    return await items.count();
  }

  /**
   * Get position ID by product and warehouse names (returns exact match)
   */
  async getPositionIdByNames(productName: string, warehouseName: string): Promise<string | null> {
    const item = await this.waitForPositionItemByValues(productName, warehouseName);
    if (!item) {
      return null;
    }

    const testId = await item.getAttribute('data-testid');
    return testId?.replace('position-item-', '') || null;
  }

  /**
   * Delete a position by exact product and warehouse names if it exists.
   */
  async deletePositionByNames(productName: string, warehouseName: string): Promise<boolean> {
    const positionId = await this.getPositionIdByNames(productName, warehouseName);

    if (!positionId) {
      return false;
    }

    await this.acceptNextDialog();
    await this.clickDeletePosition(positionId);
    return await this.waitForPositionToDisappear(productName, warehouseName);
  }

  /**
   * Count positions with exact values.
   */
  async countPositionsByValues(productName: string, warehouseName: string, amount: number): Promise<number> {
    const items = this.getPositionItems();
    const count = await items.count();
    let matches = 0;

    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const values = item.locator('.position-value');
      const productValue = (await values.nth(0).textContent())?.trim();
      const warehouseValue = (await values.nth(1).textContent())?.trim();
      const amountValue = (await values.nth(2).textContent())?.trim();

      if (
        productValue === productName &&
        warehouseValue === warehouseName &&
        amountValue === amount.toString()
      ) {
        matches += 1;
      }
    }

    return matches;
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
