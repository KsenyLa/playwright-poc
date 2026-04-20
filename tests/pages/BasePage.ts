import { Page, Locator, expect } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  /**
   * Navigate to a specific URL
   */
  async goto(url: string = '/') {
    await this.page.goto(url);
  }

  /**
   * Wait for page to load
   */
  async waitForPageLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Get element by test ID
   */
  getByTestId(testId: string): Locator {
    return this.page.getByTestId(testId);
  }

  /**
   * Accept the next browser dialog, usually a delete confirmation.
   */
  async acceptNextDialog(expectedType: 'alert' | 'beforeunload' | 'confirm' | 'prompt' = 'confirm') {
    this.page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe(expectedType);
      await dialog.accept();
    });
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(testId: string) {
    await this.getByTestId(testId).waitFor({ state: 'visible' });
  }

  /**
   * Get text content of an element
   */
  async getText(testId: string): Promise<string> {
    return await this.getByTestId(testId).textContent() || '';
  }

  /**
   * Check if element is visible
   */
  async isVisible(testId: string): Promise<boolean> {
    return await this.getByTestId(testId).isVisible();
  }

  /**
   * Click an element by test ID
   */
  async click(testId: string) {
    await this.getByTestId(testId).click();
  }

  /**
   * Fill input field by test ID
   */
  async fillInput(testId: string, value: string) {
    await this.getByTestId(testId).fill(value);
  }

  /**
   * Select option in select element by test ID
   */
  async selectOption(testId: string, value: string) {
    await this.getByTestId(testId).selectOption(value);
  }
}
