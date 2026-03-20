import { Page } from 'playwright';

export class HumanActionSimulator {
  constructor(private page: Page) {}

  private async randomDelay(min: number, max: number) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.page.waitForTimeout(delay);
  }

  async interactWithPlayButton(selector: string): Promise<void> {
    // 1. Wait for element
    const button = this.page.locator(selector).first();
    await button.waitFor({ state: 'visible', timeout: 5000 });

    // 2. Scroll into view
    await button.scrollIntoViewIfNeeded();

    // 3. Random delay 1000-3000ms
    await this.randomDelay(1000, 3000);

    // 4. Mouse movement (simulate human)
    const box = await button.boundingBox();
    if (box) {
      const targetX = box.x + box.width / 2;
      const targetY = box.y + box.height / 2;
      await this.page.mouse.move(targetX, targetY, { steps: 10 });
    }

    // 5. Click
    await button.click();
  }
}