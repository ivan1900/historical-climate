---
name: '2026_09_27-reuse_search_section_in_home_page'
description: 'Remove the duplication between page.tsx and SearchSection.tsx by making the home page render SearchSection as the single source of truth of the search form'
created_at: '2026-09-27T20:57:36Z'

created_by:
  tool: 'OpenCode'
  model:
    name: 'DeepSeek V4.1 Flash'
    version: '4.1'
    reasoning_effort: 'medium'

implemented_by:
  tool: 'OpenCode'
  model:
    name: 'DeepSeek V4.1 Flash'
    version: '4.1'
    reasoning_effort: 'medium'

last_implementation_at: '2026-09-27T21:06:45Z'
has_completed_all_phases: 'true'
---

# Reuse SearchSection from the home page

## Goal

Remove the duplication between `app/page.tsx` and `app/components/SearchSection.tsx` by making the home page render `SearchSection`, which becomes the single source of truth of the search form. The user-visible UI does not change.

## Context

- [`app/page.tsx`](../../../app/page.tsx) lines 24-103 and [`app/components/SearchSection.tsx`](../../../app/components/SearchSection.tsx) lines 24-103 are byte-identical in logic: same `StationSuggestion` local type, same state, same debounced `useEffect`, same `handleSubmit`. They only differ in the outer markup and the copy.
- `SearchSection` is currently dead code: nothing imports it. This is also documented in [`.agents/plans/2026_09_27-setup_vitest_playwright_testing/2026_09_27-setup_vitest_playwright_testing-plan.md`](../2026_09_27-setup_vitest_playwright_testing/2026_09_27-setup_vitest_playwright_testing-plan.md) line 45.
- [`app/layout.tsx`](../../../app/layout.tsx) needs no changes: the outer `<Box>` of `SearchSection` already carries `className='flex-1'` plus `w='100%' px py`, which is what fills the `flex min-h-full flex-col` body.
- Project conventions: relative imports (the `@/*` alias is only used by [`app/server/db.ts`](../../../app/server/db.ts) line 3 to reach outside `app/`); client components live under `app/components/` with `'use client'` on line 1.
- [`AGENTS.md`](../../../AGENTS.md) requires reading the guides in `node_modules/next/dist/docs/` before writing Next.js code. Relevant here: the client vs server components guide.
- Verification commands: `pnpm exec tsc --noEmit`, `pnpm lint`, `pnpm test`, `pnpm e2e`.
- Known pre-existing debt, out of scope: `pnpm format:check` already fails on `app/page.tsx`, `app/components/SearchSection.tsx` and `app/components/TemperatureChart.tsx` because they use `'` in JSX while [`.oxfmtrc.json`](../../../.oxfmtrc.json) sets `jsxSingleQuote: false`. This plan does not touch it.

## Public contracts

### UI components

| Contract                                                | Status                                                      |
| ------------------------------------------------------- | ----------------------------------------------------------- |
| `SearchSection`: named export, no props, `'use client'` | Modified (adopts the copy and layout of `page.tsx`)         |
| `Home`: default export, no props                        | Modified (becomes a thin wrapper; **loses** `'use client'`) |
| `TemperatureChart`                                      | Unchanged                                                   |

### User-visible text copies

Canonical texts that must be preserved exactly:

- H1: `Clima histórico`
- Subtitle: `Consulta los datos climáticos históricos de cualquier población española`
- Labels: `Periodo`, `Comparar con años atrás`, `Estación`
- Placeholders: `Selecciona el rango de meses`, `10`, `Busca una estación (ej. Madrid)`
- Description: `Compara el periodo seleccionado con el mismo periodo N años antes`
- Range echo: `Rango seleccionado: {from} – {to}`
- Button: `Buscar`
- Loading overlay: `Obteniendo datos históricos de AEMET…`

The orphan copy of `SearchSection` is discarded: `Consulta el clima histórico` (H2) and `Elige un periodo y una estación para ver la evolución de las temperaturas`.

### Types

- `StationSuggestion` (exported in [`getStationsByName.ts`](../../../app/server/application/getStationsByName.ts) line 4, re-exported in [`searchStations.ts`](../../../app/server/application/searchStations.ts) line 5) goes from being a dead export to being consumed by `SearchSection`, removing the duplicated local copy.

### Test suites

| Suite                                                                                                                                                                        | Change                                                 |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `app/components/SearchSection.test.tsx`                                                                                                                                      | **New**: the 3 cases moved from `page.test.tsx`        |
| `app/page.test.tsx`                                                                                                                                                          | **Reduced** to 1 case: "renders the search section"    |
| `app/components/TemperatureChart.test.tsx`, `app/server/domain/monthData.test.ts`, `app/server/domain/normalize.test.ts`, `app/server/application/getStationsByName.test.ts` | Unchanged                                              |
| `e2e/home.spec.ts`                                                                                                                                                           | Unchanged (must stay green: heading `Clima histórico`) |

No changes to application services, domain events or database schema.

## Phases

### Phase 1: SearchSection becomes the single source of truth and the home page renders it

Description: align `SearchSection` with the current user-visible UI and turn `page.tsx` into a thin wrapper. Complete vertical slice: the home page works and the existing tests stay green without being touched.

To-do:

- [x] Read the `node_modules/next/dist/docs/` guides about client vs server components, as required by `AGENTS.md`.
- [x] `app/components/SearchSection.tsx`: change `<Title order={2}>Consulta el clima histórico</Title>` to `<Title order={1}>Clima histórico</Title>`.
- [x] `app/components/SearchSection.tsx`: change the subtitle to `Consulta los datos climáticos históricos de cualquier población española`.
- [x] `app/components/SearchSection.tsx`: remove the `<Box maw={1100} mx='auto'>` wrapper (and its closing tag), leaving the form and the chart as direct children of the outer `<Box>`.
- [x] `app/components/SearchSection.tsx`: change the form Stack from `w={{ base: '100%', md: '50%' }}` to `w={{ base: '90%', md: '30%' }}`.
- [x] `app/components/SearchSection.tsx`: keep `component='section' id='buscar'`, `className='flex-1'` and `px`/`py` on the outer `<Box>` (no test asserts them; they are useful semantics).
- [x] `app/page.tsx`: replace the body with a component that only renders `<SearchSection />`.
- [x] `app/page.tsx`: delete the duplicated logic (state, debounced `useEffect`, `requestRef`, `handleSubmit`, `monthKeys`, `maxDate`, `canSearch`) and the local `StationSuggestion` type.
- [x] `app/page.tsx`: remove the imports that become unused (`@mantine/core`, `@mantine/dates`, `@mantine/hooks`, `dayjs`, React hooks, the 3 server actions, `MonthDataDTO`, `TemperatureChart`). `no-unused-vars` is set to `warn`, so lint must end up clean.
- [x] `app/page.tsx`: remove `'use client'` (it no longer runs client logic; it renders a client child).
- [x] `app/page.tsx`: import `SearchSection` with a relative path (`./components/SearchSection`), following the repository convention.
- [x] Confirm `pnpm test` stays green **without modifying** `page.test.tsx` (it renders `<Home/>`, which now mounts `SearchSection`; the `vi.mock` calls resolve to the same module IDs).
- [x] Confirm `pnpm e2e` stays green, especially the `heading` named `Clima histórico` and `Rango seleccionado: 2020-01 – 2020-06`.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (look it up in the AGENTS.md file or the project configuration). Fix issues if any. (`pnpm exec tsc --noEmit` clean, `pnpm lint` 0 warnings/0 errors, `pnpm test` 20/20, `pnpm e2e` 4/4, `pnpm build` OK with `/` prerendered as static.)
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

### Phase 2: Relocate the form test suite and remove the duplicated type

Description: the form coverage starts testing `SearchSection` directly and `page.test.tsx` becomes a delegation test. The last duplication is removed.

To-do:

- [x] Create `app/components/SearchSection.test.tsx` with the 3 cases moved from `page.test.tsx`: "renders the search form", "shows the loading overlay while the search action is pending", "renders the chart once the search action resolves with data".
- [x] Reuse in the new suite the `@mantine/charts` mock (`lineChartSpy` plus `data-testid="line-chart"`) and the `@mantine/dates` mock (the `pick-period` button), plus the `SAMPLE_MONTH_DATA`, `LOADING_TEXT` and `selectPeriodAndStation` helpers.
- [x] Adjust the `vi.mock` and import paths to the new location: `../server/application/searchStations`, `../server/application/searchByDate`, `../server/application/searchByDateWithComparison`, `../server/domain/monthData`.
- [x] Add to the new suite the assertion of the copy contract: `getByRole('heading', { name: 'Clima histórico' })` (today only covered by the e2e test).
- [x] Reduce `app/page.test.tsx` to a single case: "renders the search section", rendering `<Home/>` and asserting the H1 `Clima histórico` and the `Buscar` button. Remove the mocks and helpers that are no longer used there. (Kept only the 3 server-action mocks so the delegation test does not pull the Prisma client into its module graph; the chart and date-picker mocks are gone because the real `TemperatureChart` renders `null` with empty data and `MonthPickerInput` renders fine under the existing jsdom polyfills.)
- [x] `app/components/SearchSection.tsx`: delete the local `StationSuggestion` type and import it as a type from `../server/application/searchStations`.
- [x] Confirm `searchStations.ts` stays valid as a `'use server'` module: the `export type` is erased at compile time (it already works today, `tsc` and `build` pass), so there is no non-async export risk.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (look it up in the AGENTS.md file or the project configuration). Fix issues if any. (`pnpm exec tsc --noEmit` clean, `pnpm lint` 0 warnings/0 errors, `pnpm test` 21/21 across 6 suites, `pnpm e2e` 4/4, `pnpm build` OK with `/` prerendered as static.)
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

## Next step

All phases are complete. No further implementation rounds are planned; keep the suites green as the app evolves.

Plan shaped by 🐢 💨 (Turbotuga™, [Codely](https://codely.com)'s mascot), who hates the same form drawn twice. 🐢 💨 🧹 Phase 1 swept the duplicate away and the tortoise found one shell instead of two. 🧪 Phase 2 handed the shell a proper test label, and the turtle finally knew which shell was its own.
