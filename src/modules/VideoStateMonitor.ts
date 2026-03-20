import { Page } from 'playwright';
import { logger } from '../utils/logger';

export class VideoStateMonitor {
  private page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  public async validatePlayback(timeoutSeconds: number): Promise<{ success: boolean; durationValidated: number; error: string | null }> {
    logger.info('Starting playback validation...');
    
    const videoSelector = 'video';
    
    try {
      // Wait for video element to be present
      await this.page.waitForSelector(videoSelector, { state: 'attached', timeout: timeoutSeconds * 1000 });
      
      // Wait for playback to start (currentTime > 0 and not paused)
      const startTime = Date.now();
      let isPlaying = false;
      
      while (Date.now() - startTime < 5000) {
        isPlaying = await this.page.$eval(videoSelector, (video: HTMLVideoElement) => {
          return video.currentTime > 0 && !video.paused && !video.ended && video.readyState > 2;
        });
        
        if (isPlaying) break;
        await this.page.waitForTimeout(500);
      }

      if (!isPlaying) {
        return { success: false, durationValidated: 0, error: 'Timeout: Video failed to transition to playing state within 5 seconds.' };
      }

      logger.info('Video started playing. Monitoring continuity for 10 seconds...');
      
      let previousTime = await this.page.$eval(videoSelector, (video: HTMLVideoElement) => video.currentTime);
      let durationValidated = 0;

      for (let i = 0; i < 10; i++) {
        await this.page.waitForTimeout(1000);
        
        const currentTime = await this.page.$eval(videoSelector, (video: HTMLVideoElement) => video.currentTime);
        const isPaused = await this.page.$eval(videoSelector, (video: HTMLVideoElement) => video.paused);
        
        if (isPaused) {
           return { success: false, durationValidated, error: 'Playback stalled: Video is paused.' };
        }

        if (currentTime <= previousTime) {
          return { success: false, durationValidated, error: `Playback stalled: currentTime (${currentTime}) did not increase from previousTime (${previousTime}).` };
        }

        previousTime = currentTime;
        durationValidated += 1;
        logger.info(`Playback continuous. Current time: ${currentTime.toFixed(2)}s`);
      }

      return { success: true, durationValidated, error: null };

    } catch (error: any) {
      return { success: false, durationValidated: 0, error: `Validation error: ${error.message}` };
    }
  }
}