import { Page } from 'playwright';

export class PlaybackValidator {
  constructor(private page: Page) {}

  async validatePlayback(timeoutSeconds: number): Promise<{ playbackStartTimeMs: number, durationValidatedSec: number }> {
    const startTime = Date.now();
    
    // 1. Start Detection: Wait for video to not be paused and readyState >= 3
    const startDetectionTimeout = 5000;
    let playbackStarted = false;
    
    try {
      await this.page.waitForFunction(() => {
        const video = document.querySelector('video');
        return video && !video.paused && video.readyState >= 3;
      }, { timeout: startDetectionTimeout });
      playbackStarted = true;
    } catch (e) {
      throw new Error('Video failed to start within 5 seconds.');
    }

    const playbackStartTimeMs = Date.now() - startTime;

    // 2. Continuity Check: Monitor currentTime for 10 seconds
    let durationValidatedSec = 0;
    let previousTime = -1;

    for (let i = 0; i < 10; i++) {
      await this.page.waitForTimeout(1000); // Poll every 1s
      
      const state = await this.page.evaluate(() => {
        const video = document.querySelector('video');
        if (!video) return { error: 'Video element lost' };
        if (video.error) return { error: `Video error: ${video.error.code}` };
        if (video.paused) return { error: 'Video paused unexpectedly' };
        return { currentTime: video.currentTime };
      });

      if (state.error) {
        throw new Error(state.error);
      }

      if (state.currentTime !== undefined) {
        if (state.currentTime <= previousTime) {
          throw new Error('Video playback stalled (currentTime not increasing).');
        }
        previousTime = state.currentTime;
        durationValidatedSec++;
      }
    }

    return { playbackStartTimeMs, durationValidatedSec };
  }
}