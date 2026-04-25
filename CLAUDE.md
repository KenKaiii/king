# King

Electron desktop app for e-commerce content creation — AI image generation, product/character management, prompt templates, and API integrations.

## Tech Stack

Electron + Vite (`electron-vite` v5) + React 19 + Tailwind v4 + TypeScript + Zustand

## Project Structure

```
src/
├── main/                    # Electron main process
│   ├── index.ts             # Entry point, CSP, protocol setup
│   ├── ipc/                 # IPC handlers (images, entities, apiKeys, generate, files)
│   └── services/            # Business logic (stores, paths, file management)
├── preload/                 # Context bridge — typed window.api.*
│   └── index.ts
└── renderer/src/            # React + Vite frontend
    ├── App.tsx              # Root component, state-based routing
    ├── pages/               # Page components (Image, Products, Characters, Prompts, etc.)
    ├── components/          # UI components
    │   ├── ui/              # Reusable (modals, dropdowns, error boundary)
    │   ├── image/           # Image gallery (virtualized grid, cards, overlay)
    │   ├── entity/          # Entity management (upload, review, cards)
    │   ├── layout/          # Header with navigation
    │   └── icons/           # SVG icon components
    ├── hooks/               # Custom hooks (useImages, useEntityManagement)
    ├── stores/              # Zustand stores
    ├── lib/                 # Utilities, constants, prompt data
    └── types/               # TypeScript definitions (electron.d.ts, assets.d.ts)
```

## Organization Rules

- IPC handlers → `src/main/ipc/`, one file per domain
- Services/stores → `src/main/services/`, one file per concern
- Pages → `src/renderer/src/pages/`, one file per page
- Components → `src/renderer/src/components/`, grouped by feature
- Hooks → `src/renderer/src/hooks/`, one hook per file
- Types → `src/renderer/src/types/`
- Path alias: `@/` → `src/renderer/src/`

## Data Layer

- JSON file stores at `~/Library/Application Support/king/data/`
- Images served via custom `local-file://` protocol
- All renderer ↔ main communication through typed IPC (`window.api.*`)

## Code Quality — Zero Tolerance

After editing ANY file, run:

```bash
npm run lint && npm run format:check && npm run build
```

Fix ALL errors/warnings before continuing.

## Commands

- `npm run dev` — Start dev server (electron-vite dev)
- `npm run build` — Production build
- `npm run lint` — ESLint
- `npm run lint:fix` — ESLint with auto-fix
- `npm run format` — Prettier write
- `npm run format:check` — Prettier check

## Eyes

Perception probes live in `.gg/eyes/`. All headless. Artifacts → `.gg/eyes/out/` (gitignored). Invoke probes yourself; don't ask the user to verify what you can verify.

### Available probes

| Need | Run | Then |
|---|---|---|
| Screenshot the running Electron app window | `.gg/eyes/visual.sh --app King` (or no args for frontmost window) | Open the PNG path printed to stdout under `.gg/eyes/out/screenshot-window-*.png` and inspect the rendered UI. |
| Tail logs from `npm run dev` or any log file | `.gg/eyes/runtime_logs.sh --file <path> [--lines N] [--grep <pat>]` | Read stdout. Redirect dev output first: `npm run dev > .gg/eyes/out/dev.log 2>&1 &` then `--file .gg/eyes/out/dev.log`. |

### When to use these eyes (automatically, without being asked)

Reach for probes ON YOUR OWN INITIATIVE when any of these apply:

- After editing anything under `src/renderer/src/pages/` or `src/renderer/src/components/` (especially `image/`, `entity/`, `ui/`, `layout/`), and the dev app is running: screenshot with `.gg/eyes/visual.sh --app King` to confirm the UI renders correctly (no blank screen, no layout break, no React error overlay). The renderer is an Electron window — `visual` is the only way to actually *see* what your change produced.
- After editing Tailwind classes, `index.css`, or any styling-heavy `.tsx`: screenshot to verify the visual result rather than guessing from class names.
- After editing IPC handlers in `src/main/ipc/`, preload bindings in `src/preload/index.ts`, or main-process services in `src/main/services/`: tail the dev log with `.gg/eyes/runtime_logs.sh --file .gg/eyes/out/dev.log --grep -i error` to catch IPC registration errors, CSP violations, or protocol handler failures that only surface at runtime.
- When a change *might* fail silently in the renderer (async image load, store hydration, virtualized grid): screenshot + grep the dev log for `Uncaught`, `Error`, `Warning`.
- Before claiming a visual/UX fix is done: screenshot proof. A passing `npm run build` does not mean the pixels look right.

If a probe fails or returns unexpected results, investigate the artifact directly before assuming the probe itself is broken.

### When NOT to use

- Docs-only changes, comments, formatting, `README.md`, `CLAUDE.md`.
- Pure type-only edits in `src/renderer/src/types/` with no runtime effect.
- Refactors fully covered by `npm run lint && npm run build`.
- Dev app isn't running AND the task doesn't require runtime verification (e.g. wiring up a new file that isn't yet imported).
- Same probe already ran this turn on the same artifact — reuse the output.

### When to escalate a capability gap (the self-improvement loop)

If you're about to **guess**, **skip verification**, or **hand-wave** about something a better probe would show you — STOP and surface the tradeoff inline. Phrasing like:

> "I tried screenshotting but the failure is a JS error I can only see in the Electron DevTools console — and there's no `devtools_console` probe. Two paths: (a) ~3 min to add one (hook into main-process `webContents` logging to a file). (b) Workaround: I'd infer from the DOM screenshot and dev.log. Your call?"

Wait for the user's choice. **Don't escalate more than once per request** — if the user picked the workaround, don't re-ask in the same turn.

For minor friction (worked around it but wished it were better), don't interrupt — log it for later review:
- `ggcoder eyes log rough "<reason>" [--probe <name>]` — minor friction, you handled it
- `ggcoder eyes log wish "<gap>"` — capability you wished existed
- `ggcoder eyes log blocked "<reason>"` — call this AFTER the user approves an inline-escalation fix, for the audit trail

These accumulate quietly. The user reviews them periodically. Open signals will appear in your context on future turns until they're acked.
