# User Guide: Human-like Playback QA

This guide explains how to set up and use the Playback QA tool to validate video streams.

## 1. Introduction
This tool is designed to test video playback exactly how a human would. It opens a real browser window, waits a few seconds, scrolls to the play button, and watches the video for 10 seconds to ensure there are no buffering or DRM issues.

## 2. Getting Started
### Running your first test
1. Open your terminal in the project directory.
2. Run the following command:
   ```bash
   npm run test --url="YOUR_VIDEO_URL"
   ```
3. A Chrome window will open. **Do not close it manually.** The script will control the mouse and keyboard.

## 3. Understanding Results
Once the test finishes, check the `results/` folder.
- **JSON Report:** Contains the technical details of whether the test passed.
- **Screenshots:** If a test fails (e.g., the video didn't start), a screenshot will be saved in `results/screenshots/` showing exactly what was on the screen at the time of failure.

## 4. Troubleshooting Common Issues
### "Play Button Not Found"
- **Cause:** The page took too long to load or the play button uses a non-standard selector.
- **Solution:** Check the screenshot. If the page is still loading, increase the `timeoutSeconds` in your config.

### "DRM Error"
- **Cause:** The browser context might be missing necessary CDM (Content Decryption Module) permissions.
- **Solution:** Ensure you are running the script in a headed environment (non-headless) as specified in the TRD.

### "Playback Stalled"
- **Cause:** The video started but stopped before reaching the 10-second mark.
- **Solution:** This usually indicates a real playback issue or a mid-roll ad that wasn't handled. Check the console logs in the JSON report.

## 5. Best Practices
- **Network Stability:** Ensure a stable internet connection as the tool measures real-time playback.
- **No Manual Interference:** Avoid moving the mouse or clicking inside the automated browser window while the test is running.
