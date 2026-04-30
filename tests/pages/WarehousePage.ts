import { BasePage } from './BasePage';
import { Page, Locator } from '@playwright/test';

const escapeForRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

export class WarehousePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Click Add Warehouse button
   */
  async clickAddWarehouse() {
    await this.click('btn-add-warehouse');
    await this.page.waitForURL('**/warehouses/create');
    await this.waitForElement('form-warehouse');
  }

  /**
   * Fill warehouse form
   */
  async fillWarehouseForm(name: string, description: string = '') {
    await this.fillInput('input-name-warehouse', name);
    await this.fillInput('input-description-warehouse', description);
  }

  /**
   * Save warehouse form
   */
  async saveWarehouse() {
    await this.click('btn-save-warehouse');
    await this.page.waitForURL('**/warehouses');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Cancel warehouse form
   */
  async cancelWarehouseForm() {
    await this.click('btn-cancel-warehouse');
    await this.page.waitForURL('**/warehouses');
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
    await this.page.waitForURL(`**/warehouses/edit/${id}`);
    await this.waitForElement('form-warehouse');
  }

  /**
   * Click delete button for a warehouse by ID
   * Note: Dialog handler should be set up in the test before calling this method
   */
  async clickDeleteWarehouse(id: string) {
    await this.click(`btn-delete-warehouse-${id}`);
    await this.page.waitForLoadState('networkidle');
  }

  private getWarehouseItemLocator(name: string): Locator {
    const exactName = new RegExp(`^${escapeForRegex(name)}$`);

    return this.getWarehouseItems().filter({
      has: this.page.locator('.warehouse-name', { hasText: exactName }),
    });
  }

  private async waitForWarehouseItemByName(name: string, timeoutMs: number = 3000): Promise<Locator | null> {
    const deadline = Date.now() + timeoutMs;

    do {
      const locator = this.getWarehouseItemLocator(name);
      if (await locator.count()) {
        return locator.first();
      }

      await this.page.waitForTimeout(100);
    } while (Date.now() < deadline);

    return null;
  }

  private async waitForWarehouseToDisappear(name: string, timeoutMs: number = 3000): Promise<boolean> {
    const deadline = Date.now() + timeoutMs;

    do {
      if ((await this.getWarehouseItemLocator(name).count()) === 0) {
        return true;
      }

      await this.page.waitForTimeout(100);
    } while (Date.now() < deadline);

    return false;
  }

  /**
   * Check if warehouse is visible by name
   */
  async isWarehouseVisible(name: string): Promise<boolean> {
    return (await this.getWarehouseItemLocator(name).count()) > 0;
  }

  /**
   * Get warehouse count
   */
  async getWarehouseCount(): Promise<number> {
    const items = this.getWarehouseItems();
    return await items.count();
  }

  /**
   * Get warehouse ID by name (returns exact match)
   */
  async getWarehouseIdByName(name: string): Promise<string | null> {
    const item = await this.waitForWarehouseItemByName(name);
    if (!item) {
      return null;
    }

    const testId = await item.getAttribute('data-testid');
    return testId?.replace('warehouse-item-', '') || null;
  }

  /**
   * Delete a warehouse by exact visible name if it exists.
   */
  async deleteWarehouseByName(name: string): Promise<boolean> {
    const warehouseId = await this.getWarehouseIdByName(name);

    if (!warehouseId) {
      return false;
    }

    await this.acceptNextDialog();
    await this.clickDeleteWarehouse(warehouseId);
    return await this.waitForWarehouseToDisappear(name);
  }

  /**
   * Get warehouse description by exact name.
   */
  async getWarehouseDescription(name: string): Promise<string | null> {
    const item = await this.waitForWarehouseItemByName(name);
    if (!item) {
      return null;
    }

    const description = item.locator('.warehouse-description');
    if (await description.count() === 0) {
      return '';
    }

    return (await description.textContent())?.trim() || '';
  }

  /**
   * Count warehouses with exact name.
   */
  async countWarehousesByName(name: string): Promise<number> {
    return await this.getWarehouseItemLocator(name).count();
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
