import { Page, Locator } from 'playwright';
import { logger } from '../utils/logger';

export class HumanActionSimulator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  private async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    logger.info(`Waiting for ${delay}ms to simulate human behavior...`);
    await this.page.waitForTimeout(delay);
  }

  public async interactWithPlayButton(selector: string): Promise<void> {
    logger.info(`Locating play button with selector: ${selector}`);
    const playButton: Locator = this.page.locator(selector).first();
    
    await playButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Scroll into view if needed
    await playButton.scrollIntoViewIfNeeded();
    logger.info('Scrolled play button into view.');

    // Random delay before interaction
    await this.randomDelay();

    // Simulate mouse movement to the button
    const box = await playButton.boundingBox();
    if (box) {
      const x = box.x + box.width / 2;
      const y = box.y + box.height / 2;
      logger.info(`Moving mouse to coordinates: (${x}, ${y})`);
      await this.page.mouse.move(x, y, { steps: 10 });
    }

    // Click the button
    logger.info('Clicking the play button.');
    await playButton.click();
  }
}