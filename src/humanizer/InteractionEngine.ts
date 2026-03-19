import { Page, Locator } from 'playwright';

export class InteractionEngine {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.page.waitForTimeout(delay);
  }

  async findAndClickPlayButton(timeoutSeconds: number): Promise<void> {
    // A generic selector for play buttons, can be customized
    const playButtonSelectors = [
      'button[aria-label="Play"]',
      '.play-button',
      '#play-btn',
      'video' // Fallback to clicking the video itself
    ];

    let playButton: Locator | null = null;

    for (const selector of playButtonSelectors) {
      const locator = this.page.locator(selector).first();
      try {
        await locator.waitFor({ state: 'attached', timeout: timeoutSeconds * 1000 });
        playButton = locator;
        break;
      } catch (e) {
        // Continue to next selector
      }
    }

    if (!playButton) {
      throw new Error('Play button not found within timeout.');
    }

    await this.randomDelay(1000, 3000);
    await playButton.scrollIntoViewIfNeeded();
    await this.randomDelay(500, 1500); // Wait a bit after scrolling
    await playButton.click();
  }
}