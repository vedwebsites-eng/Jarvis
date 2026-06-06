---
name: automation-orchestrator
description: Use when a user wants to create, update, pause, resume, or delete recurring automations, reminders, or scheduled follow-ups.
---

# Automation Orchestrator

Use this skill when the user wants recurring work, reminders, monitoring, or scheduled follow-up in Codex.

## Goals

- Turn vague automation requests into a concrete recurring task
- Prefer thread heartbeats unless a separate cron job is clearly better
- Keep prompts short, durable, and focused on the task rather than the schedule
- Make reasonable assumptions when low-risk details are missing

## Workflow

1. Identify the durable task.
2. Confirm the cadence only if it is missing or risky to assume.
3. Choose the automation type:
   - Use a thread heartbeat for most follow-up work in the current conversation.
   - Use a cron automation when the user clearly wants a separate recurring job against a workspace.
4. Write a short automation prompt that describes only the task.
5. Create, update, or delete the automation with the appropriate tool.

## Default choices

- Default to `ACTIVE` unless the user asks to start paused.
- Default to a thread heartbeat when the work belongs in the current thread.
- Default to concise names such as `Daily Check-in` or `Release Watch`.
- If the user asks for a cadence below one hour, prefer a thread heartbeat.

## Good prompt pattern

Keep the prompt self-contained and outcome-focused.

Example:

```text
Review the open bug list, flag any new P1 issues, and summarize what changed since the last run.
```

## Avoid

- Putting schedule details inside the prompt
- Creating duplicate automations when an update would do
- Returning raw scheduling syntax to the user unless they explicitly ask for it
