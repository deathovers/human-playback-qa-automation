import { chromium, Browser, BrowserContext } from 'playwright';
import { JobRequest, JobResponse, TestResult } from '../types';
import { HumanActionSimulator } from '../modules/HumanActionSimulator';
import { VideoStateMonitor } from '../modules/VideoStateMonitor';
import * as path from 'path';
import * as fs from 'fs';

export class PlaybackJobRunner {
  async runJob(job: JobRequest): Promise<JobResponse> {
    const results: TestResult[] = [];
    
    const browser: Browser = await chromium.launch({
      headless: job.config.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const url of job.urls) {
      const context: BrowserContext = await browser.newContext();
      const page = await context.newPage();
      
      const result: TestResult = {
        url,
        status: 'FAIL',
        playbackStartTime: null,
        durationValidated: 0,
        error: null,
        screenshotPath: null
      };

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: job.config.timeoutSeconds * 1000 });
        
        const simulator = new HumanActionSimulator(page);
        await simulator.interactWithPlayButton(job.config.playButtonSelector);

        const monitor = new VideoStateMonitor(page);
        const validation = await monitor.validatePlayback(job.config.timeoutSeconds);

        if (validation.success) {
          result.status = 'SUCCESS';
          result.playbackStartTime = new Date().toISOString();
          result.durationValidated = validation.duration;
        } else {
          result.error = validation.error || 'Unknown playback error';
          result.durationValidated = validation.duration;
          await this.captureFailure(page, result, job.jobId);
        }
      } catch (error: any) {
        result.error = error.message;
        await this.captureFailure(page, result, job.jobId);
      } finally {
        results.push(result);
        await context.close();
      }
    }

    await browser.close();
    return { jobId: job.jobId, results };
  }

  private async captureFailure(page: any, result: TestResult, jobId: string) {
    const screenshotsDir = path.join(process.cwd(), 'results', 'screenshots');
    if (!fs.existsSync(screenshotsDir)) {
      fs.mkdirSync(screenshotsDir, { recursive: true });
    }
    const filename = `err_${jobId}_${Date.now()}.png`;
    const filepath = path.join(screenshotsDir, filename);
    await page.screenshot({ path: filepath });
    result.screenshotPath = filepath;
  }
}