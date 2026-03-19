import { Page } from 'playwright';

export class PlaybackValidator {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async validatePlayback(timeoutSeconds: number): Promise<{ playbackStartTimeMs: number, durationValidatedSec: number }> {
    const startTime = Date.now();
    
    // Wait for video element to be ready and playing
    const isPlaying = await this.page.evaluate(async (timeout) => {
      const video = document.querySelector('video');
      if (!video) return false;

      return new Promise<boolean>((resolve) => {
        const checkInterval = setInterval(() => {
          if (!video.paused && video.readyState >= 3) {
            clearInterval(checkInterval);
            resolve(true);
          }
        }, 500);

        setTimeout(() => {
          clearInterval(checkInterval);
          resolve(false);
        }, timeout * 1000);
      });
    }, timeoutSeconds);

    if (!isPlaying) {
      throw new Error('Video failed to start playing within timeout.');
    }

    const playbackStartTimeMs = Date.now() - startTime;

    // Monitor continuity for 10 seconds
    const durationValidatedSec = await this.page.evaluate(async () => {
      const video = document.querySelector('video');
      if (!video) return 0;

      let lastTime = video.currentTime;
      let accumulatedTime = 0;
      
      return new Promise<number>((resolve, reject) => {
        const checkInterval = setInterval(() => {
          if (video.error) {
            clearInterval(checkInterval);
            reject(new Error(`Video error: ${video.error.message || video.error.code}`));
            return;
          }

          if (video.paused) {
            // Might be buffering or ad, but for strict 10s continuous playback:
            clearInterval(checkInterval);
            reject(new Error('Video paused unexpectedly.'));
            return;
          }

          const currentTime = video.currentTime;
          if (currentTime > lastTime) {
            accumulatedTime += (currentTime - lastTime);
          }
          lastTime = currentTime;

          if (accumulatedTime >= 10) {
            clearInterval(checkInterval);
            resolve(accumulatedTime);
          }
        }, 1000);

        // Fail-safe timeout for the 10s check (e.g., 20 seconds max wait)
        setTimeout(() => {
          clearInterval(checkInterval);
          reject(new Error('Failed to accumulate 10 seconds of playback.'));
        }, 20000);
      });
    });

    return {
      playbackStartTimeMs,
      durationValidatedSec
    };
  }
}