# Skill: ClickUp Task Parsing

## Description
This skill allows agents to interface with the ClickUp API to fetch task details, descriptions, and acceptance criteria using a provided ClickUp Task ID, and parse them into actionable development sub-tasks.

## Inputs
- `taskId` (string): The unique identifier of the ClickUp task (e.g., `abc123x`).
- `clickupApiToken` (string): The authentication token for the ClickUp API (injected via environment variables).

## Outputs
- `taskDetails` (JSON Object):
  - `title`: Task title.
  - `description`: Full markdown description of the task.
  - `status`: Current task status.
  - `subTasks`: Array of parsed actionable items for the agents.

## Execution Steps
1. Make a GET request to `https://api.clickup.com/api/v2/task/{taskId}` using the provided `clickupApiToken` in the `Authorization` header.
2. Extract the `name`, `text_content` (or `description`), and `status` fields.
3. Parse the `text_content` to identify technical requirements, constraints, and acceptance criteria.
4. Format the extracted data into the standardized `taskDetails` JSON output.
5. Return the JSON object to the calling agent (typically the Orchestrator) for planning and delegation.
