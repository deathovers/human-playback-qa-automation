# API Documentation: Playback QA Automation

This document defines the data structures and core logic interfaces for the Human-like Playback QA Automation tool.

## 1. Input Schema
The system expects a JSON object to initialize a test run.

| Field | Type | Description |
| :--- | :--- | :--- |
| `testId` | `string` | Unique identifier for the test case. |
| `url` | `string` | The target OTT page URL. |
| `timeoutSeconds` | `number` | Max time to wait for the play button (default: 15). |
| `browserConfig` | `object` | Playwright launch options. |
| `browserConfig.headless` | `boolean` | Must be `false` for human emulation. |
| `browserConfig.slowMo` | `number` | Delay in ms between actions (e.g., 50). |

**Example:**
```json
{
  "testId": "OTT-001",
  "url": "https://ott-platform.com/watch/123",
  "timeoutSeconds": 15,
  "browserConfig": {
    "headless": false,
    "slowMo": 50
  }
}
```

## 2. Output Schema
After execution, the system generates a report in the following format:

| Field | Type | Description |
| :--- | :--- | :--- |
| `testId` | `string` | The ID provided in the input. |
| `status` | `string` | `SUCCESS` or `FAIL`. |
| `metrics` | `object` | Performance data. |
| `metrics.loadTimeMs` | `number` | Time taken for DOMContentReady. |
| `metrics.playbackStartTimeMs` | `number` | Delay between click and playback start. |
| `metrics.durationValidatedSec` | `number` | Total seconds of continuous playback verified. |
| `error` | `object` | Error details (if status is FAIL). |
| `error.message` | `string` | Description of the failure (e.g., "DRM Error"). |
| `error.screenshotPath` | `string` | Path to the failure evidence image. |
| `timestamp` | `string` | ISO 8601 execution time. |

## 3. Core Logic Constants
- **Random Delay Range:** 1,000ms - 3,000ms.
- **Playback Threshold:** 10 seconds of `currentTime` progression.
- **Video ReadyState:** Must be `>= 3` (HAVE_FUTURE_DATA).
