# Ora — multi-persona, multi-LLM desktop chatbot

An Electron + React + Vite desktop chat app. Switch between several **personas**
(each is a system prompt) and several **LLMs** from one UI. Models run on
**Groq's free API tier** — create a free key, no billing setup. API calls run in
the Electron main process so your key stays out of the renderer bundle.

## Setup

1. Install deps:
   ```
   npm install
   ```
2. Add your key — copy the example and paste in a free Groq key from
   https://console.groq.com/keys:
   ```
   cp .env.example .env    # then set GROQ_API_KEY
   ```
   The key is read only by the Electron main process (`app/`), never by the UI.

## Run

The app needs two processes: the Vite dev server (serves the UI) and Electron
(the desktop window). In two terminals:

```
npm run dev      # terminal 1 — Vite on http://localhost:5173
npm start        # terminal 2 — Electron window
```

Open in a plain browser (`npm run dev` only) and it runs in **preview mode**:
persona/model switching and streaming all work, but replies are simulated until
you run it under Electron with keys set.

## How it fits together

| Area | Files |
| --- | --- |
| Personas (system prompts) | `src/lib/personas.js` |
| Model catalog / switcher | `src/lib/models.js` |
| Renderer → main bridge | `src/lib/chat.js`, `app/preload.cjs` |
| Main process + IPC | `app/index.js` |
| Provider adapter | `app/llm/openai-compatible.js`, `app/llm/index.js` |

### Add a persona
Append an entry to `PERSONAS` in `src/lib/personas.js` — `id`, `name`, and a
`system` prompt are what matter.

### Add / change a model
Edit `MODELS` in `src/lib/models.js`. Each entry's `id` is the exact string sent
to the provider API — if a call 404s, fix the `id` there. To add a whole new
provider, drop a `stream()` adapter in `app/llm/` and register it in
`app/llm/index.js`.
