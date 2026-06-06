# Jarvis v1

A local-first personal assistant prototype inspired by Jarvis.

## Run Directly

Open `index.html` in a browser.

For the recommended project-level run command, use:

```powershell
npm start
```

Then open `http://localhost:3000`.

The prototype uses browser features only:
- `localStorage` for memory, tasks, reminders, and recent chat
- Web Speech API for voice input where supported
- Speech synthesis for spoken replies
- Browser notifications for reminders after permission is granted

## Try

```text
remember that I study math at night
what can you remember?
add task revise integration by parts
remind me to check my notes in 20 minutes
start a 25 minute focus session
plan my next 45 minutes of math study
```

## Next Up

- Add a real LLM backend
- Store memory in SQLite
- Add calendar and file tools
- Connect the existing automation plugin scaffold
- Package this as a desktop app
