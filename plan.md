# Implementation Plan

## 1) Scope and goals

- Build a mobile-first practice tracker app with four screens: Home, Practice Session, Stats, Settings.
- Keep it static-hostable and local-first: all persistence in IndexedDB.
- Use Bun + React + React Router + Zustand + Tailwind + shadcn/ui.
- Prioritize testability: unit tests for core logic and Playwright e2e for key flows.

## 1.1) Current repo baseline (to build on)

- Existing stack is already aligned: Bun + React 19 + React Router + Zustand + Tailwind + shadcn/ui.
- Infra to preserve while rebuilding screens:
  - Bun entry/build flow: `dev.ts`, `build.ts`, `src/frontend.tsx`, `src/index.html`
  - package scripts in `package.json` (`dev`, `build`, `lint`, `format`, `format:check`)
  - GitHub Pages deployment pipeline: `.github/workflows/deploy.yml`
  - lint/format/hook setup: `eslint.config.js`, `.prettierrc`, `.husky/*`
- We can fully replace current route/page implementations as needed.

## 2) Architecture

- Frontend-only application served by Bun HTML imports.
- Layering:
  - `catalog` layer: static JSON content (authoring source for exercises/variations).
  - `storage` layer: IndexedDB adapter implementing app data interface.
  - `domain` layer: session generation, completion recording, stats/streak calculations.
  - `ui` layer: route-based screens and reusable components.
- State management:
  - Zustand store for current session runtime state and UI controls (mute, tempo, active exercise index).
  - Storage adapter for persisted data and historical records.
- Replacement approach:
  - keep infra and tooling intact (scripts, build, deploy, lint)
  - replace app routes/pages with the new product flow directly
  - define new domain/store/storage modules without needing compatibility layers for old screens.

## 3) Data model and IDs

- Mutable runtime entities use UUIDs:
  - `Session.id` UUID
  - `Completion.id` UUID
- Static catalog entities use human-stable IDs:
  - `Exercise.id` string slug (e.g. `piano-c-major-scale`)
  - `Variation.id` string slug (e.g. `staccato`)
- Main entities:
  - `Exercise`, `Variation`, `Session`, `Completion`
  - optional `Meta` store for schema and seed versions.

## 4) IndexedDB strategy (Option B)

- JSON is source of truth for static content, but static content is seeded into IndexedDB.
- On startup:
  - open DB with schema version migrations
  - run `seedIfNeeded(CURRENT_SEED_VERSION)`
  - upsert exercises/variations by stable IDs
  - persist seed version in `meta` store
- Benefits for this app:
  - one query path for catalog + runtime data
  - easier future customizations and API migration
  - deterministic local behavior offline

### 4.1) Legacy state stance

- Do not preserve behavior/data model from old screen-specific Zustand flows.
- If legacy local data exists, it is acceptable to ignore/reset it during the new app rollout.

## 5) Storage adapter contract

- Implement `StorageAdapter` with methods for:
  - static catalog: seed, list exercises, list variations
  - sessions: create/get/list/end
  - completions: create/list-by-session/list-by-exercise
  - stats: summary metrics
- Create `IndexedDbStorageAdapter` implementation first.
- Keep interface backend-agnostic for eventual Next.js API swap.

## 6) Routing and screens

- Routes:
  - `/` Home
  - `/session` Practice Session
  - `/stats` Stats
  - `/settings` Settings
- Route replacement details:
  - remove legacy instrument edit/practice routes
  - implement new routes directly without compatibility redirects.
- Home:
  - title, stats/settings buttons
  - instrument toggle (guitar/piano)
  - duration selector (short/long/unlimited)
  - rotating CTA text
- Practice Session:
  - current exercise and variation badge
  - fingering visualization area (keyboard/fretboard components)
  - tempo controls (+/-)
  - mute button and close session button
  - exercise progress marker (`n/3`, `n/5`, or `n/?`)
  - done flow with fullscreen difficulty card (0-4 mapping)
- Stats:
  - card 1: total sessions, total practice time, average session length
  - card 2: daily and weekly streaks
  - card 3: exercise progress chart (date vs tempo, difficulty as point color)
- Settings:
  - easter-egg text placeholder.

## 7) Session orchestration rules

- Session lengths:
  - short = 3 exercises
  - long = 5 exercises
  - unlimited = open-ended (`?`)
- Start session:
  - create `Session` with start timestamp and selected instrument/length
  - build exercise queue from seeded catalog, filtered by instrument
- Complete exercise:
  - record `Completion` with start/end, tempo, difficulty, exercise/variation refs
  - advance to next exercise (or generate next in unlimited mode)
- End session:
  - set `Session.end`
  - return to Home
  - support immediate early-end from top-right close button.

## 8) UI component plan

- shadcn/ui primitives:
  - `Button`, `Card`, `Badge`, `Dialog`/`Sheet`, `Select`/`ToggleGroup`, `Chart` wrappers.
- Custom components:
  - `InstrumentToggle`
  - `PracticeLengthSelector`
  - `RotatingCtaButton`
  - `TempoControl`
  - `DifficultyOverlay`
  - `ExerciseHeader`
  - `SessionProgressIndicator`
  - `FingeringDisplay` (switches between keyboard/fretboard visuals)
- Reuse policy:
  - reuse existing shadcn primitives and utilities where helpful
  - do not constrain UI to existing page/component structure.
- Styling:
  - mobile-first Tailwind layout, then desktop enhancements.

## 9) Testing strategy

- Unit tests (`bun test`):
  - session queue generation logic
  - streak calculations (daily/weekly)
  - stats aggregations (total/average durations)
  - seed idempotency/upsert behavior
- E2E tests (Playwright):
  - home -> start short session -> complete 3 exercises -> return home
  - early close session path
  - stats cards update after completions
  - chart data appears for selected exercise
- Existing tests:
  - replace outdated route tests with tests aligned to the new app flow.

## 10) Implementation sequence

- Phase 1: Foundation and guardrails
  - preserve Bun app/runtime setup and existing styling pipeline
  - preserve scripts, lint/format, and GitHub Pages deploy behavior
  - add new domain types, route constants, and folder structure for the new app
  - introduce storage adapter interface and IndexedDB wiring
- Phase 2: Data foundations
  - type definitions, storage interface, IndexedDB schema, seeding.
- Phase 3: Build Home and session flow
  - Home screen controls, session start, practice session screen, completion overlay.
- Phase 4: Build Stats and Settings
  - stats aggregation and chart screen, simple settings page.
- Phase 5: Stabilize and ship
  - unit + e2e coverage, responsive fixes, UX refinements
  - verify `bun run lint`, `bun run build`, and GitHub Pages artifact output remain healthy.

## 11) Risks and mitigations

- IndexedDB migration complexity:
  - mitigate with explicit version constants and migration tests.
- Catalog/seed drift:
  - mitigate with `seedVersion` and deterministic upserts by stable IDs.
- Unlimited mode edge cases:
  - mitigate with dedicated unit tests for queue rollover behavior.
- Fingering visualization scope creep:
  - start with clear text/diagram fallback, then iterate on richer visuals.
