---
name: 'extract_temperature_chart_component'
description: 'Extract the temperature LineChart from app/page.tsx into a reusable TemperatureChart component and make it fill 80% of the screen width on desktop'
created_at: '2026-09-05T00:00:00Z'

created_by:
  tool: 'Copilot'
  model:
    name: 'GLM'
    version: '5.3'
    reasoning_effort: 'low'

implemented_by:
  tool: 'Copilot'
  model:
    name: 'GLM'
    version: '5.3'
    reasoning_effort: 'low'

last_implementation_at: '2026-09-05T00:00:00Z'
has_completed_all_phases: 'true'
---

# Extract TemperatureChart component

## 🎯 Goal

Extract the temperature `LineChart` from `app/page.tsx` into a dedicated `TemperatureChart` component that owns its data mapping, and make it fill 80% of the screen width on desktop while keeping the current mobile layout intact.

## 👀 Context

- `app/page.tsx`: Current page. Derives `chartData` from `searchResult: MonthDataDTO[]` (filters `isYearStatistics`, sorts by `date`, maps to `{ month, 'Temperatura media': tempAvg, 'Temperatura máxima': tempMax }`) and renders `LineChart` from `@mantine/charts` directly. Also renders the empty-state text `"No hay datos de temperaturas para el período seleccionado"` when `hasSearched && chartData.length === 0`.
- `app/lib/domain/monthData.ts`: `MonthDataDTO` type (fields used: `date`, `tempAvg`, `tempMax`, `isYearStatistics`).
- Styling conventions: Mantine style props with responsive object syntax (e.g. `size={{ base: 'sm', md: 'xl' }}`, `h={{ base: 300, md: 480 }}`); Tailwind only for the loading overlay.
- Components convention: no `app/components` folder exists yet; creating it with `app/components/TemperatureChart.tsx` establishes the convention (Next.js App Router style). Since the chart uses Mantine `LineChart` (client-only), the new component must be a client component (`'use client'`).
- Docs to consider: `AGENTS.md` (Next.js agent-rules block: breaking changes, check `node_modules/next/dist/docs/` before writing code) and `AGENTS.md` custom skill `UI` (`./agents/skills/mantine/SKILL.md`, points to Mantine docs).
- No test framework in the project; verification is `pnpm lint`, `pnpm format:check`, `pnpm build`.

## 🪜 Phases

### Phase 1: Extract `TemperatureChart` and apply desktop 80% width

**Description:** Create `app/components/TemperatureChart.tsx` as a client component that receives `MonthDataDTO[]`, performs the filter/sort/map internally, and renders the `LineChart` wrapped in a Mantine `Box` with `w={{ base: '100%', md: '80%' }} mx='auto'`. Update `app/page.tsx` to use the new component, removing the local mapping and chart JSX.

**Contract (new/modified):**

- Public contract created: component `TemperatureChart` at `app/components/TemperatureChart.tsx` with props `{ data: MonthDataDTO[] }` (single required prop). It renders the empty-state text internally, so it also needs the `hasSearched` signal: add optional prop `hasSearched?: boolean` (default `false`) to decide between empty message and chart.
- Text copies: unchanged, only relocated (`'Temperatura media'`, `'Temperatura máxima'`, `'No hay datos de temperaturas para el período seleccionado'`, axis labels).
- Application services, domain events, tests, database schemas: no changes.

**To-do actions:**

- [x] Create `app/components/TemperatureChart.tsx` (`'use client'`) exporting `TemperatureChart({ data, hasSearched })`:
  - [x] Internally filter non-year statistics, sort by date, and map to `{ month, 'Temperatura media', 'Temperatura máxima' }`
  - [x] Render empty-state `Text` when `hasSearched && data yields empty chart`
  - [x] Wrap `LineChart` in `Box` with `w={{ base: '100%', md: '80%' }}` and `mx='auto'`; preserve current chart props (`h`, legend, unit, labels, series, etc.)
- [x] Update `app/page.tsx`:
  - [x] Remove `chartData` mapping, chart state derivation (keep `searchResult` and `hasSearched`), and `LineChart` JSX
  - [x] Render `<TemperatureChart data={searchResult} hasSearched={hasSearched} />`
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`pnpm lint`, `pnpm format:check`, `pnpm build`; fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

## ⏭️ Next step

All phases are complete. Review the changes and, if satisfied, commit them.

Bugs squashed thanks to [Codely](https://codely.com) AI tooling. 🐛 < 🐢 💨
