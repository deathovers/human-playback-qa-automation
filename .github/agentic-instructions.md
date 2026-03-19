# Agentic Instructions: Human-like Playback QA Automation

## Project Overview
This repository contains the "Human-like Playback QA Automation (Web)" system. The goal is to develop an automated Quality Assurance (QA) system that replicates human behavior to validate video playback on Over-The-Top (OTT) web platforms using Playwright in non-headless mode.

## Tech Stack
- **Runtime:** Node.js v20+
- **Language:** TypeScript
- **Automation Framework:** Playwright (Chromium, Non-headless)
- **CI/CD:** GitHub Actions / Jenkins (with XVFB for Linux)

## Standard Commands
- **Install Dependencies:** `npm install && npx playwright install chromium`
- **Build:** `npm run build` (Compiles TypeScript to JavaScript)
- **Lint:** `npm run lint` (ESLint & Prettier)
- **Test:** `npm test` (Runs unit tests)
- **Run Automation:** `npm start -- --config=config/default.json`

## Agents & Skills Reference Table

| Agent / Skill | File Path | Description |
| --- | --- | --- |
| **Orchestrator Agent** | `.github/agents/orchestrator.agent.md` | Manages workflow, accepts ClickUp Task IDs, and delegates sub-tasks. |
| **DevOps Agent** | `.github/agents/devops.agent.md` | Handles environment setup, CI/CD pipelines, and dependency management. |
| **TypeScript Agent** | `.github/agents/typescript.agent.md` | Core developer agent for writing Playwright automation and TS logic. |
| **ClickUp Task Parsing** | `.github/skills/clickup-task-parsing/SKILL.md` | Skill to fetch and parse ClickUp tasks into actionable agent sub-tasks. |
