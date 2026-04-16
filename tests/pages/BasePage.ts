import { Page, Locator } from '@playwright/test';

const TEST_RESET_TOKEN = 'local-e2e-reset';

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
   * Reset backend data in test environment.
   */
  async clearTestData() {
    const response = await this.page.request.delete('http://localhost:3001/test/reset', {
      headers: {
        'x-test-reset-token': TEST_RESET_TOKEN,
      },
    });
    if (![200, 204].includes(response.status())) {
      throw new Error(`Failed to reset backend test data: ${response.status()}`);
    }
  }

  /**
   * Backward-compatible alias for existing tests.
   */
  async clearLocalStorage() {
    await this.clearTestData();
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
