import * as fs from 'fs';
import * as path from 'path';
import { Page } from 'playwright';
import { TestOutput, TestMetrics, TestError } from '../types';

export class Reporter {
  private resultsDir: string;

  constructor(resultsDir: string = 'results') {
    this.resultsDir = resultsDir;
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  async captureScreenshot(page: Page, testId: string): Promise<string> {
    const screenshotPath = path.join(this.resultsDir, `${testId}-error-${Date.now()}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: true });
    return screenshotPath;
  }

  generateReport(
    testId: string,
    status: 'SUCCESS' | 'FAIL',
    metrics: TestMetrics,
    error: TestError
  ): TestOutput {
    const report: TestOutput = {
      testId,
      status,
      metrics,
      error,
      timestamp: new Date().toISOString()
    };

    const reportPath = path.join(this.resultsDir, `${testId}-report.json`);
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    return report;
  }
}