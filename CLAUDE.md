# Ecomm King

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

- JSON file stores at `~/Library/Application Support/ecomm-king/data/`
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
