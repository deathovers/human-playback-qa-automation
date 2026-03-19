# Project Knowledge Base: Human-like Playback QA Automation

## 1. Executive Summary
An automated QA system designed to replicate human behavior for validating video playback on OTT web platforms. It bypasses basic bot detection by utilizing real browser instances (non-headless) and randomized interaction patterns.

## 2. Architecture & Directory Structure
- `src/core/`: Playwright logic, browser setup (`BrowserManager`).
- `src/humanizer/`: Random delays, scrolling, mouse movements (`InteractionEngine`).
- `src/monitor/`: Video state polling logic (`PlaybackValidator`).
- `src/utils/`: Logging, file system helpers.
- `tests/`: Test definitions/scenarios.
- `config/`: Environment and test configs.
- `results/`: Screenshots and JSON reports (`Reporter`).

## 3. Core Technical Requirements
- **Browser:** Playwright Chromium launched in **non-headless** mode.
- **Human Emulation:** 
  - Pre-interaction delay: 1,000ms - 3,000ms.
  - Smooth scrolling to bring elements into the viewport.
- **Playback Validation:**
  - Start detection: `<video>` transitions to `paused: false` and `readyState >= 3` within 5 seconds.
  - Continuity: `currentTime` must increase by at least 10 seconds continuously.
- **Error Handling:** Capture high-resolution screenshots and browser console logs on failure (timeout, DRM error, stall).

## 4. Data Models

### Input Schema (JSON)
```json
{
  "testId": "string",
  "url": "string",
  "timeoutSeconds": 10,
  "browserConfig": {
    "headless": false,
    "slowMo": 50
  }
}
```

### Output Schema (JSON)
```json
{
  "testId": "string",
  "status": "SUCCESS | FAIL",
  "metrics": {
    "loadTimeMs": 1200,
    "playbackStartTimeMs": 2500,
    "durationValidatedSec": 10
  },
  "error": {
    "message": "string | null",
    "screenshotPath": "string | null"
  },
  "timestamp": "2026-03-19T..."
}
```

## 5. Known Risks & Mitigations
- **Bot Detection:** Mitigated by non-headless mode, standard User-Agents, and randomized delays.
- **DRM/EME Issues:** Must explicitly catch and log DRM-related console errors.
- **Flakiness:** Handled via robust auto-waiting and retry mechanisms in Playwright.
