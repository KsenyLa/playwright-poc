import { BasePage } from './BasePage';
import { Page } from '@playwright/test';

export class NavigationPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Warehouses page
   */
  async navigateToWarehouses() {
    await this.click('nav-link-warehouses');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Products page
   */
  async navigateToProducts() {
    await this.click('nav-link-products');
    await this.waitForPageLoad();
  }

  /**
   * Navigate to Positions page
   */
  async navigateToPositions() {
    await this.click('nav-link-positions');
    await this.waitForPageLoad();
  }

  /**
   * Check if a navigation link is active
   */
  async isActiveLink(linkName: 'warehouses' | 'products' | 'positions'): Promise<boolean> {
    const link = this.getByTestId(`nav-link-${linkName}`);
    const className = await link.getAttribute('class');
    return className?.includes('active') || false;
  }

  /**
   * Verify navigation is visible
   */
  async verifyNavigationVisible() {
    await this.waitForElement('navigation');
  }
}
