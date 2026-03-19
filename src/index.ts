import { BrowserManager } from './core/BrowserManager';
import { InteractionEngine } from './humanizer/InteractionEngine';
import { PlaybackValidator } from './monitor/PlaybackValidator';
import { Reporter } from './utils/Reporter';
import { TestInput, TestOutput } from './types';

export async function runTest(input: TestInput): Promise<TestOutput> {
  const browserManager = new BrowserManager();
  const reporter = new Reporter();
  
  let status: 'SUCCESS' | 'FAIL' = 'FAIL';
  let metrics = { loadTimeMs: 0, playbackStartTimeMs: 0, durationValidatedSec: 0 };
  let errorDetails = { message: null as string | null, screenshotPath: null as string | null };

  const startLoadTime = Date.now();
  let page;

  try {
    page = await browserManager.launch(input.browserConfig);
    
    // Navigation
    await page.goto(input.url, { waitUntil: 'domcontentloaded' });
    metrics.loadTimeMs = Date.now() - startLoadTime;

    const interactionEngine = new InteractionEngine(page);
    const playbackValidator = new PlaybackValidator(page);

    // Human-like interaction
    await interactionEngine.findAndClickPlayButton(input.timeoutSeconds);

    // Playback validation
    const validationResults = await playbackValidator.validatePlayback(5); // 5 seconds to start
    metrics.playbackStartTimeMs = validationResults.playbackStartTimeMs;
    metrics.durationValidatedSec = validationResults.durationValidatedSec;

    status = 'SUCCESS';
  } catch (error: any) {
    status = 'FAIL';
    errorDetails.message = error.message || 'Unknown error occurred';
    
    if (page) {
      try {
        errorDetails.screenshotPath = await reporter.captureScreenshot(page, input.testId);
      } catch (screenshotError) {
        console.error('Failed to capture screenshot:', screenshotError);
      }
    }
  } finally {
    await browserManager.close();
  }

  return reporter.generateReport(input.testId, status, metrics, errorDetails);
}

// Example usage if run directly
if (require.main === module) {
  const sampleInput: TestInput = {
    testId: 'test-123',
    url: 'https://test-video-url.com', // Replace with a real test URL
    timeoutSeconds: 15,
    browserConfig: {
      headless: false,
      slowMo: 50
    }
  };

  runTest(sampleInput).then(report => {
    console.log('Test Report:', JSON.stringify(report, null, 2));
  }).catch(console.error);
}