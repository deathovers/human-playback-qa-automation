import * as fs from 'fs';
import * as path from 'path';
import { TestOutput } from '../types';

export class Reporter {
  private resultsDir: string;

  constructor() {
    this.resultsDir = path.join(process.cwd(), 'results');
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  async saveReport(output: TestOutput): Promise<void> {
    const filePath = path.join(this.resultsDir, `report_${output.testId}_${Date.now()}.json`);
    fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
    console.log(`Report saved to ${filePath}`);
  }
}