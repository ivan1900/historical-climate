---
name: "2026_09_27-setup_vitest_playwright_testing"
description: "Prepare the project for unit testing with Vitest and e2e testing with Playwright"
created_at: "2026-09-26T22:10:48Z"

created_by:
  tool: "opencode"
  model:
    name: "deepseek-v4.1-flash"
    version: "4.1"
    reasoning_effort: "medium"

implemented_by:
  tool: "opencode"
  model:
    name: "deepseek-v4.1-flash"
    version: "4.1"
    reasoning_effort: "medium"

last_implementation_at: "2026-09-27T20:07:00Z"
has_completed_all_phases: "false"
---

# Setup Vitest + Playwright testing

## Goal

Prepare the project with unit testing via Vitest and end-to-end testing via Playwright, leaving runnable example suites at each layer (server logic, client components, e2e flows).

## Context

- No test setup exists today: no test files, no test runner config, no `test` script. Clean slate.
- `package.json`: pnpm project (`packageManager: pnpm@11.21.0`), scripts `dev`, `build`, `start`, `lint` (oxlint), `format` (oxfmt), `prisma:*`. No test script yet.
- `tsconfig.json`: strict, `moduleResolution: "bundler"`, path alias `"@/*": ["./*"]` (repo-root relative, no `src/`).
- This is Next.js 16.3.1 with React 19.2.8. Per `AGENTS.md`, this Next version has breaking changes: read the official guide at `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` before writing test code.
- Mantine v9 UI. Relevant for component/e2e tests: `Autocomplete` debounced 300ms via `useDebouncedValue`, popover-based `MonthPickerInput type="range"`, SVG-based `LineChart` (recharts). UI text is Spanish with accessible labels.
- Env: `.env` (gitignored) with `AEMET_API_KEY`, `DATABASE_URL`, `BASE_URL`. `instrumentation.ts` seeds stations from AEMET at startup. E2E runs locally against the real local DB and AEMET (no CI integration, per user decision).
- Files under test:
  - `app/server/domain/normalize.ts`: pure accent-stripping `normalize`.
  - `app/server/domain/monthData.ts`: `MonthData` class, `createMonthData` (AEMET month 13 = annual statistics), `toDTO()`.
  - `app/server/domain/station.ts`: `Station` class (no getters, no observable behavior).
  - `app/server/application/getStationsByName.ts`: station suggestion filter (min 2 chars, max 10 results, accent-insensitive) using `getAllStations` from `app/server/infrastructure/stationsInMemory.ts`.
  - `app/components/TemperatureChart.tsx`: client component, comparison series alignment via private `sortByDate`.
  - `app/page.tsx`: client home page (search form + state) calling `'use server'` actions directly (needs `vi.mock`).
  - `app/components/SearchSection.tsx`: dead code, imported nowhere. Not tested; flagged for future deletion.

## Phases

### Phase 1: Vitest setup + unit tests for server logic

Description: install and configure Vitest following the official Next.js guide, add the `test` scripts, and cover the pure server-side logic with unit tests (first runnable feedback loop).

To-do:
- [x] Read `node_modules/next/dist/docs/01-app/02-guides/testing/vitest.md` (official guide for this Next version).
- [x] `pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom vite-tsconfig-paths`
- [x] Create `vitest.config.mts` (repo root): `tsconfigPaths()` and `react()` plugins, `test.environment: 'jsdom'`. (`.mts` instead of `.ts` to match the official guide and avoid the Vite "ESM syntax loaded as CommonJS" warning.)
- [x] Add scripts to `package.json`: `"test": "vitest run"`, `"test:watch": "vitest"`.
- [x] Suite `normalize.test.ts` (colocated with `app/server/domain/normalize.ts`):
  - [x] strips accents: "ÁVILA" resolves to "avila"
  - [x] trims surrounding whitespace
  - [x] lowercases uppercase input
  - [x] leaves already-normalized input unchanged
  - [x] combined case: "  MaDrId " resolves to "madrid"
- [x] Suite `monthData.test.ts` (colocated with `app/server/domain/monthData.ts`):
  - [x] `createMonthData` with a regular month builds a UTC date (month - 1) and `isYearStatistics: false`
  - [x] `createMonthData` with month 13 marks annual statistics and date Dec 31 of that year (UTC)
  - [x] `toDTO()` maps all fields (idema, temps, date, isYearStatistics, rainfall, rainDays, snowDays)
  - [x] `null` temperature/rain values are preserved
- [x] Suite `getStationsByName.test.ts` (mock `app/server/infrastructure/stationsInMemory` with `vi.mock`):
  - [x] trimmed query shorter than 2 chars returns []
  - [x] 2-char or longer query returns matches
  - [x] match is accent-insensitive: query "almeria" matches station "Almería" (via its `normalized` field)
  - [x] results are capped at 10
  - [x] results have the `{ value, label }` shape
- [x] Deliberately NOT tested: `app/server/domain/station.ts` (`Station` has no getters or public behavior; an `instanceof` test adds no value).
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (look it up in the AGENTS.md file or the project configuration). Fix issues if any. (`pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, `pnpm format:check` — 14 tests green.)
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

### Phase 2: Client component tests (React Testing Library)

Description: cover the client components (chart and home page form) with DOM-level unit tests, mocking the `'use server'` actions.

To-do:
- [x] `pnpm add -D @testing-library/user-event @testing-library/jest-dom`
- [x] Added `vitest.setup.ts` (referenced from `vitest.config.mts`): registers jest-dom matchers, RTL `cleanup`, and jsdom polyfills for `ResizeObserver` / `matchMedia` required by Mantine.
- [x] Suite `TemperatureChart.test.tsx` (colocated with `app/components/TemperatureChart.tsx`), mocking `@mantine/charts` (the real chart measures a 0x0 container in jsdom) and asserting on the props it receives:
  - [x] renders without crashing with a single series
  - [x] renders comparison series aligned by date (assert on rendered chart output, keeping `sortByDate` private)
  - [x] handles empty data without crashing (renders nothing; shows the "no data" message when `hasSearched`)
- [x] Suite `page.test.tsx` (mock the server actions imported from `app/server/application/*` with `vi.mock`), stubbing `@mantine/dates`' `MonthPickerInput` with a deterministic range button (its calendar interaction is covered in Phase 3 e2e):
  - [x] renders the form labels "Periodo", "Estación", "Comparar con años atrás" and the "Buscar" button
  - [x] shows the loading overlay "Obteniendo datos históricos de AEMET…" while the mocked action is pending
  - [x] renders the chart once the mocked action resolves with data
- [x] Not tested: `app/components/SearchSection.tsx` (dead code, imported nowhere). Flag it to the user for future deletion.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (look it up in the AGENTS.md file or the project configuration). Fix issues if any. (`pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, `pnpm format:check` — 20 tests green.)
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

### Phase 3: E2E tests with Playwright

Description: install and configure Playwright against the local dev server and cover the main search flow end to end.

To-do:
- [ ] `pnpm add -D @playwright/test` and `pnpm exec playwright install` (browsers).
- [ ] Create `playwright.config.ts`: `webServer` running `next dev` on a fixed port with `reuseExistingServer: true`, `baseURL`, tests under `e2e/`.
- [ ] Add script to `package.json`: `"e2e": "playwright test"`.
- [ ] Suite `e2e/home.spec.ts`:
  - [ ] home page loads and shows the search form (Spanish labels visible)
  - [ ] typing a station name shows autocomplete suggestions (wait for the ~300ms debounce / listbox options)
  - [ ] month range picker opens and a period can be selected
  - [ ] happy path: station + period + "Buscar" shows the loading message and then renders the chart with data
- [ ] Document the prerequisite: a local `.env` with working `DATABASE_URL` and `AEMET_API_KEY` (stations seeded at startup via `instrumentation.ts`); tests run locally against real services (no CI, per scope decision).
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification command (look it up in the AGENTS.md file or the project configuration). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

## Next step

Complete Phase 3 (E2E tests with Playwright) in a single implementation round.

Plan created by 🐢 💨 (Turbotuga™, [Codely](https://codely.com)'s mascot). Phase 1 gave the turtle a green shell of tests thanks to [Codely](https://codely.com) AI tooling. 🐢 ✅ Phase 2 mounted the components on the shell and they held. 🧩 🐢 ✅
