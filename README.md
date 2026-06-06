# Jarvis

A local-first personal assistant prototype inspired by Jarvis from Iron Man. The first version runs in your browser and includes chat, browser voice input, spoken replies, memory, tasks, reminders, and a math study focus helper.

## Install

Install Node.js first if you do not already have it:

https://nodejs.org/

Then clone the repository:

```powershell
git clone https://github.com/vedwebsites-eng/Jarvis.git
cd Jarvis
```

No app dependencies are required for the prototype itself. The run command uses a tiny Node static server included in this repo.

## Run

```powershell
npm start
```

Open this URL in your browser:

```text
http://localhost:3000
```

You can also open `jarvis-v1/index.html` directly, but the local server route is better as the project grows.

## Try

```text
remember that I study math at night
what can you remember?
add task revise integration by parts
remind me to check my notes in 20 minutes
start a 25 minute focus session
plan my next 45 minutes of math study
```

## Verify

```powershell
npm run check
```

## Current Status

This is version 1: a local browser prototype. It does not yet use an AI backend, database, desktop packaging, or real system integrations.

Next planned upgrades:

- Add a Node backend
- Add OpenAI-powered assistant responses
- Store memory and reminders in SQLite
- Connect the automation plugin scaffold
- Package the assistant as a desktop app
