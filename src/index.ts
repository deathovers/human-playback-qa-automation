import { BrowserManager } from './core/BrowserManager';
import { InteractionEngine } from './humanizer/InteractionEngine';
import { PlaybackValidator } from './monitor/PlaybackValidator';
import { Reporter } from './utils/Reporter';
import { TestInput, TestOutput } from './types';
import * as path from 'path';

export async function runTest(input: TestInput): Promise<TestOutput> {
  const browserManager = new BrowserManager();
  const reporter = new Reporter();
  
  const output: TestOutput = {
    testId: input.testId,
    status: 'FAIL',
    metrics: {
      loadTimeMs: 0,
      playbackStartTimeMs: 0,
      durationValidatedSec: 0
    },
    error: {
      message: null,
      screenshotPath: null
    },
    timestamp: new Date().toISOString()
  };

  try {
    const page = await browserManager.launch(input.browserConfig);
    
    const loadStart = Date.now();
    await page.goto(input.url, { waitUntil: 'networkidle' });
    output.metrics.loadTimeMs = Date.now() - loadStart;

    const interactionEngine = new InteractionEngine(page);
    const clicked = await interactionEngine.findAndClickPlayButton(15);
    
    if (!clicked) {
      throw new Error('Failed to find or click play button within 15 seconds.');
    }

    const validator = new PlaybackValidator(page);
    
    const playStartWait = Date.now();
    const started = await validator.waitForPlaybackStart(5);
    
    if (!started) {
      throw new Error('Video failed to start playback within 5 seconds.');
    }
    output.metrics.playbackStartTimeMs = Date.now() - playStartWait;

    const continuous = await validator.validateContinuousPlayback(10);
    
    if (!continuous) {
      throw new Error('Video failed to sustain continuous playback for 10 seconds.');
    }
    
    output.metrics.durationValidatedSec = 10;
    output.status = 'SUCCESS';

  } catch (error: any) {
    output.error.message = error.message || 'Unknown error occurred';
    
    if (browserManager.page) {
      const screenshotName = `error_${input.testId}_${Date.now()}.png`;
      const screenshotPath = path.join(process.cwd(), 'results', screenshotName);
      await browserManager.page.screenshot({ path: screenshotPath, fullPage: true });
      output.error.screenshotPath = screenshotPath;
    }
  } finally {
    await browserManager.close();
    await reporter.saveReport(output);
  }

  return output;
}

// Example usage if run directly
if (require.main === module) {
  const sampleInput: TestInput = {
    testId: 'test-001',
    url: 'https://test-videos.co.uk/vimeo/mp4', // Example URL
    timeoutSeconds: 15,
    browserConfig: {
      headless: false,
      slowMo: 50
    }
  };

  runTest(sampleInput).then(result => {
    console.log('Test Execution Complete:', result);
  }).catch(console.error);
}