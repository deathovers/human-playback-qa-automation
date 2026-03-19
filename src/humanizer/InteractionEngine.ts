import { Page, Locator } from 'playwright';

export class InteractionEngine {
  constructor(private page: Page) {}

  private async randomSleep(min: number, max: number): Promise<void> {
    const ms = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.page.waitForTimeout(ms);
  }

  async humanLikeClick(selector: string, timeoutMs: number): Promise<void> {
    // Wait for DOMContentReady equivalent (networkidle is used in main flow)
    await this.randomSleep(1000, 3000);

    const element: Locator = this.page.locator(selector).first();
    
    try {
      await element.waitFor({ state: 'visible', timeout: timeoutMs });
    } catch (e) {
      throw new Error(`Element ${selector} not found or visible within ${timeoutMs}ms`);
    }

    // Scroll into view if needed
    await element.scrollIntoViewIfNeeded();
    
    // Small delay before clicking
    await this.randomSleep(500, 1000);
    
    await element.click();
  }
}