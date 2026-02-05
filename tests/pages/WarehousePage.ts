import { BasePage } from './BasePage';
import { Page, Locator } from '@playwright/test';

export class WarehousePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Click Add Warehouse button
   */
  async clickAddWarehouse() {
    await this.click('btn-add-warehouse');
    await this.waitForElement('form-warehouse');
  }

  /**
   * Fill warehouse form
   */
  async fillWarehouseForm(name: string, description: string = '') {
    await this.fillInput('input-name-warehouse', name);
    if (description) {
      await this.fillInput('input-description-warehouse', description);
    }
  }

  /**
   * Save warehouse form
   */
  async saveWarehouse() {
    await this.click('btn-save-warehouse');
    await this.page.waitForTimeout(500); // Wait for form to close
  }

  /**
   * Cancel warehouse form
   */
  async cancelWarehouseForm() {
    await this.click('btn-cancel-warehouse');
  }

  /**
   * Get all warehouse items
   */
  getWarehouseItems(): Locator {
    return this.page.locator('[data-testid^="warehouse-item-"]');
  }

  /**
   * Click edit button for a warehouse by ID
   */
  async clickEditWarehouse(id: string) {
    await this.click(`btn-edit-warehouse-${id}`);
    await this.waitForElement('form-warehouse');
  }

  /**
   * Click delete button for a warehouse by ID
   * Note: Dialog handler should be set up in the test before calling this method
   */
  async clickDeleteWarehouse(id: string) {
    await this.click(`btn-delete-warehouse-${id}`);
    await this.page.waitForTimeout(500); // Wait for deletion
  }

  /**
   * Check if warehouse is visible by name
   */
  async isWarehouseVisible(name: string): Promise<boolean> {
    const items = this.getWarehouseItems();
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
   * Get warehouse count
   */
  async getWarehouseCount(): Promise<number> {
    const items = this.getWarehouseItems();
    return await items.count();
  }

  /**
   * Get warehouse ID by name (returns first match)
   */
  async getWarehouseIdByName(name: string): Promise<string | null> {
    const items = this.getWarehouseItems();
    const count = await items.count();
    for (let i = 0; i < count; i++) {
      const item = items.nth(i);
      const text = await item.textContent();
      if (text?.includes(name)) {
        const testId = await item.getAttribute('data-testid');
        return testId?.replace('warehouse-item-', '') || null;
      }
    }
    return null;
  }

  /**
   * Verify page title is visible
   */
  async verifyPageTitle() {
    await this.waitForElement('page-title-warehouses');
  }

  /**
   * Verify empty state message
   */
  async verifyEmptyState() {
    const list = this.getByTestId('list-warehouses');
    const text = await list.textContent();
    return text?.includes('No warehouses found') || false;
  }
}
