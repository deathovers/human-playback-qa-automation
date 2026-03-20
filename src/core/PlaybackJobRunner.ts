import { chromium, Browser, BrowserContext, Page } from 'playwright';
import { JobRequest, JobResult, TestResult } from '../types';
import { HumanActionSimulator } from '../modules/HumanActionSimulator';
import { VideoStateMonitor } from '../modules/VideoStateMonitor';
import { logger } from '../utils/logger';
import * as path from 'path';
import * as fs from 'fs';

export class PlaybackJobRunner {
  public async runJob(job: JobRequest): Promise<JobResult> {
    logger.info(`Starting job: ${job.jobId}`);
    
    const results: TestResult[] = [];
    
    const browser: Browser = await chromium.launch({
      headless: job.config.headless,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--autoplay-policy=no-user-gesture-required']
    });

    for (const url of job.urls) {
      logger.info(`Processing URL: ${url}`);
      const context: BrowserContext = await browser.newContext();
      const page: Page = await context.newPage();
      
      let status: 'SUCCESS' | 'FAIL' = 'FAIL';
      let playbackStartTime: string | null = null;
      let durationValidated = 0;
      let errorMsg: string | null = null;
      let screenshotPath: string | null = null;

      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: job.config.timeoutSeconds * 1000 });
        
        const simulator = new HumanActionSimulator(page);
        await simulator.interactWithPlayButton(job.config.playButtonSelector);
        
        const monitor = new VideoStateMonitor(page);
        const validationResult = await monitor.validatePlayback(job.config.timeoutSeconds);
        
        if (validationResult.success) {
          status = 'SUCCESS';
          playbackStartTime = new Date().toISOString();
          durationValidated = validationResult.durationValidated;
        } else {
          errorMsg = validationResult.error;
        }
      } catch (error: any) {
        errorMsg = `Execution error: ${error.message}`;
      }

      if (status === 'FAIL') {
        const screenshotsDir = path.join(process.cwd(), 'results', 'screenshots');
        if (!fs.existsSync(screenshotsDir)) {
          fs.mkdirSync(screenshotsDir, { recursive: true });
        }
        const filename = `err_${job.jobId}_${Date.now()}.png`;
        screenshotPath = path.join(screenshotsDir, filename);
        await page.screenshot({ path: screenshotPath, fullPage: true });
        logger.error(`Test failed for ${url}. Screenshot saved to ${screenshotPath}. Error: ${errorMsg}`);
      } else {
        logger.info(`Test succeeded for ${url}.`);
      }

      results.push({
        url,
        status,
        playbackStartTime,
        durationValidated,
        error: errorMsg,
        screenshotPath
      });

      await context.close();
    }

    await browser.close();
    
    const jobResult: JobResult = {
      jobId: job.jobId,
      results
    };

    logger.info(`Job ${job.jobId} completed.`);
    return jobResult;
  }
}