import { Page, Locator } from 'playwright';

export class InteractionEngine {
  constructor(private page: Page) {}

  async randomDelay(min: number = 1000, max: number = 3000): Promise<void> {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    await this.page.waitForTimeout(delay);
  }

  async findAndClickPlayButton(timeoutSeconds: number): Promise<boolean> {
    try {
      // Common play button selectors
      const selectors = [
        'button[aria-label="Play"]',
        '.play-button',
        'video',
        '[class*="play"]'
      ];

      let playButton: Locator | null = null;

      for (const selector of selectors) {
        const element = this.page.locator(selector).first();
        try {
          await element.waitFor({ state: 'attached', timeout: timeoutSeconds * 1000 });
          playButton = element;
          break;
        } catch (e) {
          continue;
        }
      }

      if (!playButton) {
        throw new Error('Play button not found within timeout.');
      }

      await this.randomDelay(1000, 3000);
      
      // Scroll into view if needed
      await playButton.scrollIntoViewIfNeeded();
      
      // Wait for stability
      await this.randomDelay(500, 1000);
      
      await playButton.click();
      return true;
    } catch (error) {
      console.error('Error finding or clicking play button:', error);
      return false;
    }
  }
}