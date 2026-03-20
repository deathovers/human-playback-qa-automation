import { PlaybackJobRunner } from './core/PlaybackJobRunner';
import { JobRequest } from './types';

async function main() {
  const runner = new PlaybackJobRunner();
  
  const sampleJob: JobRequest = {
    jobId: `job-${Date.now()}`,
    urls: [
      "https://test-videos.co.uk/vids/bigbuckbunny/mp4/h264/1080/Big_Buck_Bunny_1080_10s_1MB.mp4"
    ],
    config: {
      headless: false,
      timeoutSeconds: 15,
      playButtonSelector: "video" // For direct video links, clicking the video often plays it
    }
  };

  console.log(`Starting job: ${sampleJob.jobId}`);
  const result = await runner.runJob(sampleJob);
  console.log(JSON.stringify(result, null, 2));
}

if (require.main === module) {
  main().catch(console.error);
}