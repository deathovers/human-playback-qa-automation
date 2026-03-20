import { Page } from 'playwright';

export class VideoStateMonitor {
  constructor(private page: Page) {}

  async validatePlayback(timeoutSeconds: number): Promise<{ success: boolean; duration: number; error?: string }> {
    const videoSelector = 'video';
    
    // Wait for video element
    try {
      await this.page.waitForSelector(videoSelector, { state: 'attached', timeout: 5000 });
    } catch (e) {
      return { success: false, duration: 0, error: 'Timeout: Video element not found within 5 seconds' };
    }

    // Wait for playback to start (currentTime > 0 and not paused)
    const startTime = Date.now();
    let isPlaying = false;
    while (Date.now() - startTime < 5000) {
      isPlaying = await this.page.$eval(videoSelector, (vid: HTMLVideoElement) => !vid.paused && vid.currentTime > 0);
      if (isPlaying) break;
      await this.page.waitForTimeout(500);
    }

    if (!isPlaying) {
      return { success: false, duration: 0, error: 'Timeout: Video failed to start playing within 5 seconds' };
    }

    // Poll for 10 seconds to ensure monotonic increase
    let previousTime = await this.page.$eval(videoSelector, (vid: HTMLVideoElement) => vid.currentTime);
    let durationValidated = 0;
    const pollInterval = 1000;
    const validationDuration = 10000; // 10 seconds

    for (let i = 0; i < validationDuration / pollInterval; i++) {
      await this.page.waitForTimeout(pollInterval);
      const currentTime = await this.page.$eval(videoSelector, (vid: HTMLVideoElement) => vid.currentTime);
      
      if (currentTime <= previousTime) {
        return { success: false, duration: durationValidated, error: `Playback stalled at ${currentTime}s` };
      }
      
      durationValidated += (currentTime - previousTime);
      previousTime = currentTime;
    }

    return { success: true, duration: durationValidated };
  }
}