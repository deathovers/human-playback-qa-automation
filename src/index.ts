import { PlaybackJobRunner } from './core/PlaybackJobRunner';
import { JobRequest } from './types';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const runner = new PlaybackJobRunner();
  
  const sampleJob: JobRequest = {
    jobId: `job-${Date.now()}`,
    urls: [
      "https://test-videos.co.uk/vimeo/mp4" // Example URL, in reality would be OTT platform
    ],
    config: {
      headless: false,
      timeoutSeconds: 15,
      playButtonSelector: "button.play-action, .play-button, video" // Fallback selectors
    }
  };

  const result = await runner.runJob(sampleJob);
  
  const resultsDir = path.join(process.cwd(), 'results');
  if (!fs.existsSync(resultsDir)) {
    fs.mkdirSync(resultsDir, { recursive: true });
  }
  
  fs.writeFileSync(
    path.join(resultsDir, `${sampleJob.jobId}.json`), 
    JSON.stringify(result, null, 2)
  );
  
  console.log('Job execution finished. Results saved.');
}

if (require.main === module) {
  main().catch(console.error);
}