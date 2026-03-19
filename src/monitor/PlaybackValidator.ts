import { Page } from 'playwright';

export class PlaybackValidator {
  constructor(private page: Page) {}

  async waitForPlaybackStart(timeoutSeconds: number): Promise<boolean> {
    try {
      const startTime = Date.now();
      const timeoutMs = timeoutSeconds * 1000;

      while (Date.now() - startTime < timeoutMs) {
        const isPlaying = await this.page.evaluate(() => {
          const video = document.querySelector('video');
          if (!video) return false;
          return !video.paused && video.readyState >= 3;
        });

        if (isPlaying) return true;
        await this.page.waitForTimeout(500);
      }
      return false;
    } catch (error) {
      console.error('Error waiting for playback start:', error);
      return false;
    }
  }

  async validateContinuousPlayback(durationSeconds: number): Promise<boolean> {
    try {
      let previousTime = -1;
      let consecutiveIncreases = 0;
      const requiredIncreases = durationSeconds; // 1 check per second

      for (let i = 0; i < durationSeconds + 5; i++) { // Allow some buffer
        const currentTime = await this.page.evaluate(() => {
          const video = document.querySelector('video');
          return video ? video.currentTime : -1;
        });

        if (currentTime > previousTime) {
          consecutiveIncreases++;
          if (consecutiveIncreases >= requiredIncreases) {
            return true;
          }
        } else {
          // Playback stalled or paused
          consecutiveIncreases = 0;
        }

        previousTime = currentTime;
        await this.page.waitForTimeout(1000);
      }

      return false;
    } catch (error) {
      console.error('Error validating continuous playback:', error);
      return false;
    }
  }
}