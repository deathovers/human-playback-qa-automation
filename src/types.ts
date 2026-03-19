export interface BrowserConfig {
  headless: boolean;
  slowMo?: number;
}

export interface TestInput {
  testId: string;
  url: string;
  timeoutSeconds: number;
  browserConfig: BrowserConfig;
}

export interface TestMetrics {
  loadTimeMs: number;
  playbackStartTimeMs: number;
  durationValidatedSec: number;
}

export interface TestError {
  message: string | null;
  screenshotPath: string | null;
}

export interface TestOutput {
  testId: string;
  status: "SUCCESS" | "FAIL";
  metrics: TestMetrics;
  error: TestError;
  timestamp: string;
}