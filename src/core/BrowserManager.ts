import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { BrowserConfig } from '../types';

export class BrowserManager {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  async launch(config: BrowserConfig): Promise<Page> {
    this.browser = await chromium.launch({
      headless: config.headless,
      slowMo: config.slowMo || 50,
      args: ['--start-maximized', '--disable-blink-features=AutomationControlled']
    });

    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
    });

    this.page = await this.context.newPage();
    return this.page;
  }

  async close(): Promise<void> {
    if (this.page) await this.page.close();
    if (this.context) await this.context.close();
    if (this.browser) await this.browser.close();
  }
}