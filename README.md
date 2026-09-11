# Sahayak frontend prototype

Sahayak is a Vite + React + TypeScript prototype for a safe, trauma-sensitive first-contact experience for victims and complainants. It includes the public support journey and a separate NHAA officer workspace.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with:

```bash
npm run build
```

## Prototype routes

The app uses lightweight hash navigation so every screen can be opened directly:

- `#/` — landing page
- `#/help` — choose help
- `#/consent` → `#/chat` → `#/assessment` → `#/result` — AI-assisted support flow
- `#/report` — progressive incident report
- `#/support` — support service directory
- `#/officer` → `#/case-detail` — authorized officer workspace
- `#/analytics` — admin analytics

Mock data is isolated in `src/data/mockData.ts`, with domain types in `src/types`. Replace the mock arrays and button handlers with API calls when integrating a backend. No authentication, persistence, AI, or backend behavior is implemented.
