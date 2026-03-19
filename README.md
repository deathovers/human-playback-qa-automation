# Human-like Playback QA Automation (Web)

## Overview
The **Human-like Playback QA Automation** system is a specialized testing framework designed to validate video playback on Over-The-Top (OTT) web platforms. Unlike standard automated scripts, this system emulates genuine human behavior—including randomized delays, smooth scrolling, and non-headless browser interactions—to bypass bot detection and ensure a realistic user experience validation.

## Key Features
- **Human Emulation:** Uses non-headless Chromium instances with randomized pre-interaction delays (1-3s).
- **Intelligent Interaction:** Smooth scrolling to elements and visibility-based clicking.
- **Robust Playback Validation:** Monitors HTML5 `<video>` properties (`currentTime`, `readyState`, `paused`) to ensure 10s of continuous playback.
- **Automated Evidence:** Captures high-resolution screenshots on failure and generates detailed JSON reports.
- **CI/CD Ready:** Compatible with Linux environments using XVFB.

## Architecture
The system is built on **Playwright** and **TypeScript**. 
1. **Browser Layer:** Launches Chromium in headed mode with custom User-Agents.
2. **Interaction Layer:** Handles randomized sleeps and element stability checks.
3. **Validation Engine:** Polls the video element state every second to verify playback progression.
4. **Reporting Layer:** Aggregates metrics and errors into a timestamped JSON output.

## Prerequisites
- **Node.js:** v20 or higher
- **NPM:** v9 or higher
- **Operating System:** Windows, macOS, or Linux (with XVFB for headed simulation)

## Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/ott-playback-qa.git
   cd ott-playback-qa
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

## Usage
To run a playback test, provide a configuration JSON or use the CLI:
```bash
npm start -- --url="https://example.com/video" --testId="TEST-101"
```

## Configuration
The system accepts a JSON input for test parameters. See `docs/API.md` for schema details.

## License
Proprietary - Internal QA Tool.
