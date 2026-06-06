const STORAGE_KEYS = {
  memory: "jarvis.memory",
  tasks: "jarvis.tasks",
  reminders: "jarvis.reminders",
  messages: "jarvis.messages",
};

const state = {
  memory: load(STORAGE_KEYS.memory, []),
  tasks: load(STORAGE_KEYS.tasks, []),
  reminders: load(STORAGE_KEYS.reminders, []),
  messages: load(STORAGE_KEYS.messages, []),
  speaking: true,
  focusTimer: null,
};

const elements = {
  messages: document.querySelector("#messages"),
  form: document.querySelector("#commandForm"),
  input: document.querySelector("#commandInput"),
  voiceButton: document.querySelector("#voiceButton"),
  speakToggle: document.querySelector("#speakToggle"),
  clock: document.querySelector("#clock"),
  systemState: document.querySelector("#systemState"),
  memoryList: document.querySelector("#memoryList"),
  taskList: document.querySelector("#taskList"),
  reminderList: document.querySelector("#reminderList"),
  clearMemory: document.querySelector("#clearMemory"),
  clearTasks: document.querySelector("#clearTasks"),
  clearReminders: document.querySelector("#clearReminders"),
};

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition = null;

if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = "en-US";

  recognition.addEventListener("start", () => {
    elements.voiceButton.classList.add("listening");
    elements.systemState.textContent = "Listening";
  });

  recognition.addEventListener("end", () => {
    elements.voiceButton.classList.remove("listening");
    elements.systemState.textContent = "Studying with you";
  });

  recognition.addEventListener("result", (event) => {
    const transcript = Array.from(event.results)
      .map((result) => result[0].transcript)
      .join(" ");
    runCommand(transcript);
  });
} else {
  elements.voiceButton.disabled = true;
  elements.voiceButton.title = "Voice input is not supported in this browser";
}

function load(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function boot() {
  if (state.messages.length === 0) {
    addMessage(
      "assistant",
      "Online. I can remember details, track tasks, set browser reminders, and help you structure a study session. Try: remember that I prefer algebra at night."
    );
  } else {
    renderMessages();
  }

  renderLists();
  updateClock();
  setInterval(updateClock, 1000);
  setInterval(checkReminders, 5000);
}

function addMessage(role, text) {
  state.messages.push({
    role,
    text,
    createdAt: new Date().toISOString(),
  });

  state.messages = state.messages.slice(-40);
  save(STORAGE_KEYS.messages, state.messages);
  renderMessages();

  if (role === "assistant" && state.speaking) {
    speak(text);
  }
}

function renderMessages() {
  elements.messages.innerHTML = "";

  state.messages.forEach((message) => {
    const item = document.createElement("article");
    item.className = `message ${message.role}`;
    item.innerHTML = `<small>${message.role === "assistant" ? "Jarvis" : "You"}</small>${escapeHtml(
      message.text
    )}`;
    elements.messages.appendChild(item);
  });

  elements.messages.scrollTop = elements.messages.scrollHeight;
}

function renderLists() {
  renderList(elements.memoryList, state.memory, "No memories yet.");
  renderList(elements.taskList, state.tasks, "No tasks yet.", (task) =>
    task.done ? `<s>${escapeHtml(task.text)}</s>` : escapeHtml(task.text)
  );
  renderList(elements.reminderList, state.reminders, "No reminders yet.", (reminder) => {
    const time = new Date(reminder.dueAt).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${escapeHtml(reminder.text)} <strong>${time}</strong>`;
  });
}

function renderList(target, items, emptyText, mapItem = (item) => escapeHtml(item.text || item)) {
  target.innerHTML = "";

  if (items.length === 0) {
    const empty = document.createElement("li");
    empty.className = "empty";
    empty.textContent = emptyText;
    target.appendChild(empty);
    return;
  }

  items.forEach((item, index) => {
    const li = document.createElement("li");
    li.dataset.index = index;
    li.innerHTML = mapItem(item);
    target.appendChild(li);
  });
}

function runCommand(rawCommand) {
  const command = rawCommand.trim();
  if (!command) return;

  addMessage("user", command);
  elements.input.value = "";

  const lower = command.toLowerCase();

  if (lower === "show command help" || lower.includes("command help")) {
    respondWithHelp();
    return;
  }

  if (lower.startsWith("remember that ") || lower.startsWith("remember ")) {
    const memory = command.replace(/^remember that\s+/i, "").replace(/^remember\s+/i, "").trim();
    remember(memory);
    return;
  }

  if (lower.includes("what can you remember") || lower.includes("recall memory")) {
    recallMemory();
    return;
  }

  if (lower.startsWith("add task ") || lower.startsWith("task ")) {
    const task = command.replace(/^add task\s+/i, "").replace(/^task\s+/i, "").trim();
    addTask(task);
    return;
  }

  if (lower.startsWith("remind me to ")) {
    createReminder(command);
    return;
  }

  if (lower.includes("focus session") || lower.includes("focus timer")) {
    startFocusTimer(command);
    return;
  }

  if (lower.includes("plan") && lower.includes("study")) {
    planStudy();
    return;
  }

  if (lower.includes("clear chat")) {
    state.messages = [];
    save(STORAGE_KEYS.messages, state.messages);
    addMessage("assistant", "Chat cleared. I kept memory, tasks, and reminders intact.");
    return;
  }

  addMessage("assistant", composeFallback(command));
}

function remember(memory) {
  if (!memory) {
    addMessage("assistant", "Tell me what to remember after the word remember.");
    return;
  }

  state.memory.unshift({ text: memory, createdAt: new Date().toISOString() });
  state.memory = state.memory.slice(0, 20);
  save(STORAGE_KEYS.memory, state.memory);
  renderLists();
  addMessage("assistant", `Remembered: ${memory}`);
}

function recallMemory() {
  if (state.memory.length === 0) {
    addMessage("assistant", "I do not have any saved memories yet.");
    return;
  }

  const memories = state.memory
    .slice(0, 5)
    .map((item, index) => `${index + 1}. ${item.text}`)
    .join(" ");
  addMessage("assistant", `Here is what I remember most recently: ${memories}`);
}

function addTask(task) {
  if (!task) {
    addMessage("assistant", "Give me the task after 'add task'.");
    return;
  }

  state.tasks.unshift({ text: task, done: false, createdAt: new Date().toISOString() });
  save(STORAGE_KEYS.tasks, state.tasks);
  renderLists();
  addMessage("assistant", `Task added: ${task}`);
}

function createReminder(command) {
  const match = command.match(/remind me to\s+(.+?)\s+in\s+(\d+)\s+(minute|minutes|hour|hours)/i);
  if (!match) {
    addMessage("assistant", "Use this format: remind me to revise calculus in 20 minutes.");
    return;
  }

  const [, text, amountRaw, unit] = match;
  const amount = Number(amountRaw);
  const multiplier = unit.startsWith("hour") ? 60 * 60 * 1000 : 60 * 1000;
  const dueAt = Date.now() + amount * multiplier;

  state.reminders.unshift({
    text,
    dueAt,
    fired: false,
    createdAt: new Date().toISOString(),
  });
  save(STORAGE_KEYS.reminders, state.reminders);
  renderLists();
  addMessage("assistant", `Reminder set: ${text} in ${amount} ${unit}.`);
}

function startFocusTimer(command) {
  const match = command.match(/(\d+)\s+minute/i);
  const minutes = match ? Number(match[1]) : 25;

  if (state.focusTimer) {
    clearTimeout(state.focusTimer);
  }

  elements.systemState.textContent = `${minutes} minute focus`;
  state.focusTimer = setTimeout(() => {
    elements.systemState.textContent = "Focus complete";
    addMessage("assistant", "Focus session complete. Take a short break, then we can choose the next math target.");
  }, minutes * 60 * 1000);

  addMessage(
    "assistant",
    `Focus timer started for ${minutes} minutes. For math, keep one target visible and write every stuck point as a question.`
  );
}

function planStudy() {
  const plan = [
    "First 5 minutes: choose one topic and write the exact question type you want to improve.",
    "Next 25 minutes: solve problems without checking answers until each attempt is complete.",
    "Next 10 minutes: review errors and name the pattern behind each one.",
    "Final 5 minutes: save one memory here about what clicked or what needs revision.",
  ].join(" ");
  addMessage("assistant", plan);
}

function respondWithHelp() {
  addMessage(
    "assistant",
    "Commands I understand: remember that..., what can you remember, add task..., remind me to... in 20 minutes, start a 25 minute focus session, plan my math study, and clear chat."
  );
}

function composeFallback(command) {
  const memoryHint =
    state.memory.length > 0 ? ` I am also carrying this context: ${state.memory[0].text}.` : "";

  return `I heard: "${command}". I am still a local prototype, so I can act on memory, tasks, reminders, focus timers, and study planning right now.${memoryHint}`;
}

function checkReminders() {
  const now = Date.now();
  let changed = false;

  state.reminders.forEach((reminder) => {
    if (!reminder.fired && reminder.dueAt <= now) {
      reminder.fired = true;
      changed = true;
      addMessage("assistant", `Reminder: ${reminder.text}`);
      notify(reminder.text);
    }
  });

  state.reminders = state.reminders.filter((reminder) => !reminder.fired);

  if (changed) {
    save(STORAGE_KEYS.reminders, state.reminders);
    renderLists();
  }
}

function notify(text) {
  if (!("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification("Jarvis reminder", { body: text });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification("Jarvis reminder", { body: text });
      }
    });
  }
}

function speak(text) {
  if (!("speechSynthesis" in window)) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.98;
  utterance.pitch = 0.86;
  speechSynthesis.cancel();
  speechSynthesis.speak(utterance);
}

function updateClock() {
  elements.clock.textContent = new Date().toLocaleString([], {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

elements.form.addEventListener("submit", (event) => {
  event.preventDefault();
  runCommand(elements.input.value);
});

document.querySelectorAll("[data-command]").forEach((button) => {
  button.addEventListener("click", () => runCommand(button.dataset.command));
});

elements.voiceButton.addEventListener("click", () => {
  if (recognition) {
    recognition.start();
  }
});

elements.speakToggle.addEventListener("click", () => {
  state.speaking = !state.speaking;
  elements.speakToggle.textContent = state.speaking ? "Voice on" : "Voice off";
  elements.speakToggle.setAttribute("aria-pressed", String(state.speaking));
  if (!state.speaking && "speechSynthesis" in window) {
    speechSynthesis.cancel();
  }
});

elements.clearMemory.addEventListener("click", () => {
  state.memory = [];
  save(STORAGE_KEYS.memory, state.memory);
  renderLists();
});

elements.clearTasks.addEventListener("click", () => {
  state.tasks = [];
  save(STORAGE_KEYS.tasks, state.tasks);
  renderLists();
});

elements.clearReminders.addEventListener("click", () => {
  state.reminders = [];
  save(STORAGE_KEYS.reminders, state.reminders);
  renderLists();
});

boot();
