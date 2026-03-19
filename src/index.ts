import { BrowserManager } from './core/BrowserManager';
import { InteractionEngine } from './humanizer/InteractionEngine';
import { PlaybackValidator } from './monitor/PlaybackValidator';
import { Reporter } from './utils/Reporter';
import { TestInput, TestMetrics, TestError } from './types';

export async function runTest(input: TestInput) {
  const browserManager = new BrowserManager();
  const reporter = new Reporter();
  
  const metrics: TestMetrics = {
    loadTimeMs: 0,
    playbackStartTimeMs: 0,
    durationValidatedSec: 0
  };
  
  const error: TestError = {
    message: null,
    screenshotPath: null
  };

  let status: "SUCCESS" | "FAIL" = "FAIL";
  const startLoadTime = Date.now();

  try {
    const page = await browserManager.launch(input.browserConfig);
    
    // Navigation
    await page.goto(input.url, { waitUntil: 'networkidle' });
    metrics.loadTimeMs = Date.now() - startLoadTime;

    // Interaction
    const interactionEngine = new InteractionEngine(page);
    // Assuming a generic play button selector, can be customized
    await interactionEngine.humanLikeClick('button[aria-label="Play"], .play-button, video', 15000);

    // Monitoring
    const validator = new PlaybackValidator(page);
    const validationResult = await validator.validatePlayback(input.timeoutSeconds);
    
    metrics.playbackStartTimeMs = validationResult.playbackStartTimeMs;
    metrics.durationValidatedSec = validationResult.durationValidatedSec;
    
    status = "SUCCESS";

  } catch (err: any) {
    error.message = err.message || 'Unknown error occurred';
    if (browserManager.page) {
      try {
        error.screenshotPath = await reporter.captureFailure(browserManager.page, input.testId, error.message);
      } catch (screenshotErr) {
        console.error('Failed to capture screenshot:', screenshotErr);
      }
    }
  } finally {
    await browserManager.close();
    const report = reporter.generateReport(input.testId, status, metrics, error);
    console.log(JSON.stringify(report, null, 2));
    return report;
  }
}

// Example execution if run directly
if (require.main === module) {
  const sampleInput: TestInput = {
    testId: "test-123",
    url: "https://test-video-url.com",
    timeoutSeconds: 10,
    browserConfig: {
      headless: false,
      slowMo: 50
    }
  };
  runTest(sampleInput).catch(console.error);
}