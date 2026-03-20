export interface JobConfig {
  headless: boolean;
  timeoutSeconds: number;
  playButtonSelector: string;
}

export interface JobRequest {
  jobId: string;
  urls: string[];
  config: JobConfig;
}

export interface TestResult {
  url: string;
  status: 'SUCCESS' | 'FAIL';
  playbackStartTime: string | null;
  durationValidated: number;
  error: string | null;
  screenshotPath: string | null;
}

export interface JobResponse {
  jobId: string;
  results: TestResult[];
}