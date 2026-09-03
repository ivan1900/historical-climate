---
name: 'monthly_temperatures_line_chart'
description: 'Draw a Mantine LineChart with monthly average and maximum temperatures when a search returns data'
created_at: '2026-09-03T18:04:12Z'

created_by:
  tool: 'Copilot'
  model:
    name: 'GitHub Copilot'
    version: 'GLM-5.2'
    reasoning_effort: 'high'

implemented_by:
  tool: 'Copilot'
  model:
    name: 'GitHub Copilot'
    version: 'GLM-5.2'
    reasoning_effort: 'high'

last_implementation_at: '2026-09-03T18:08:57Z'
has_completed_all_phases: 'true'
---

# Monthly temperatures line chart

## Goal

When a station/period search returns data, render a Mantine `LineChart` showing the monthly average temperature (`tempAvg`) and the monthly maximum temperature (`tempMax`) as two lines in the same graph. Only these two series, in Spanish, consistent with the rest of the UI copy.

## Context

- `app/page.tsx`: client component with the search form (month range picker + station autocomplete). The result of the server action is stored in the `searchResult` state (`MonthDataDTO[]`) but **currently nothing is rendered with it**. The chart goes below the form.
- `app/lib/application/searchByDate.ts`: server action returning `Promise<MonthDataDTO[]>`. No changes needed: the DTO already contains both required fields.
- `app/lib/domain/monthData.ts`: `MonthDataDTO` with `tempAvg: number | null`, `tempMax: number | null`, `date: Date`, `isYearStatistics: boolean` (annual summary rows; `getDataByDate` already excludes them from the DB, but the chart mapping should defensively skip them too).
- `app/layout.tsx`: imports `@mantine/core/styles.css` and `@mantine/dates/styles.css`, but **not** `@mantine/charts/styles.css`, which is required for the chart to look right.
- `app/globals.css` and `postcss.config.mjs`: Mantine PostCSS presets must come before Tailwind's plugin.
- Dependencies: `@mantine/charts@^9.5.1` and `recharts@^3.10.1` are already installed, no new packages needed.
- Mantine chart docs: <https://mantine.dev/charts/line-chart/> (LLM docs: <https://mantine.dev/llms/charts-line-chart.md>). Key props: `data`, `dataKey`, `series` (name/label/color), `withLegend`, `unit`, `connectNulls`, `xAxisLabel`/`yAxisLabel`, `valueFormatter`.
- Custom skill: `.agents/skills/mantine/SKILL.md` (points to <https://mantine.dev/llms.txt>).
- Next.js 16.3.1: check `node_modules/next/dist/docs/` guides referenced in `AGENTS.md` (server actions, client components) before writing code.
- Verification: no test framework configured. Use `pnpm tsc --noEmit` and `pnpm lint` (oxlint). Format touched files with `pnpm exec oxfmt <files>` (single quotes, import reordering).

## Public contracts: UI text copies

Text shown to end users in the chart (all in Spanish, matching the existing UI: "Población", "Buscar"):

- Series labels (legend + tooltip):
  - `Temperatura media`
  - `Temperatura máxima`
- Axis labels:
  - X axis: `Mes`
  - Y axis: `Temperatura (°C)`
- Unit suffix shown next to y-axis ticks and tooltip values: `°C`
- Empty state when a search returns no data: `No hay datos de temperaturas para el período seleccionado`

These copies are introduced progressively: the series labels in Phase 1, the axis labels and unit in Phase 2, the empty state in Phase 3.

## Phases

### Phase 1: Minimal functional chart (visible result)

End-to-end slice: search result → mapped data → chart on screen. Deliver something the user can see and interact with immediately after a search.

To-do actions:

- [x] Import `@mantine/charts/styles.css` in `app/layout.tsx` (after `@mantine/dates/styles.css`).
- [x] In `app/page.tsx`, map `searchResult` to the chart data shape: one entry per month with a `month` key (formatted date, e.g. `MM/YYYY`) and one key per series:
  - `tempAvg` → `Temperatura media`
  - `tempMax` → `Temperatura máxima`
- [x] Defensively skip entries with `isYearStatistics === true` when mapping.
- [x] Render a `LineChart` from `@mantine/charts` below the form when `searchResult` has data:
  - `dataKey="month"`
  - `series` with both series (`Temperatura media` in `blue.6`, `Temperatura máxima` in `red.6`)
  - a fixed height (e.g. `h={300}`)
- [x] Make sure the chart is not clipped by the form container width (form uses `maw={480}` / `Container size="sm"`; give the chart enough room, e.g. render it outside the narrow form box or widen the container for results).
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`pnpm tsc --noEmit` and `pnpm lint`, then `pnpm exec oxfmt` on touched files). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

### Phase 2: Chart legend, styling and units

Polish the chart so both series are clearly distinguishable and values are readable.

To-do actions:

- [x] Add `withLegend` so the user can identify (and toggle/highlight) each series; consider `legendProps={{ verticalAlign: 'bottom' }}` to keep the layout tidy.
- [x] Add `unit="°C"` so the unit shows next to y-axis ticks and tooltip values.
- [x] Add axis labels: `xAxisLabel="Mes"`, `yAxisLabel="Temperatura (°C)"` (or rely on `unit` for the y-axis, choose whichever reads better and keep the agreed copies).
- [x] Pick `curveType` (e.g. `linear` or `monotone`) and a sensible `strokeWidth` for readability.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`pnpm tsc --noEmit` and `pnpm lint`, then `pnpm exec oxfmt` on touched files). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

### Phase 3: Edge cases and empty state

Handle the non-happy paths: missing temperatures, no results, and data robustness.

To-do actions:

- [x] Handle `null` temperatures: decide between `connectNulls` (default `true`) or leaving gaps, based on how sparse AEMET data looks in practice; keep both series consistent.
- [x] Sort `searchResult` chronologically before mapping so the x-axis is always ordered even if the server action order changes.
- [x] When a search returns an empty array, render the empty state text `No hay datos de temperaturas para el período seleccionado` instead of the chart.
- [x] Check tooltip behavior when one of the series has a `null` value at the hovered month (values should not show misleading `0`s).
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`pnpm tsc --noEmit` and `pnpm lint`, then `pnpm exec oxfmt` on touched files). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

## Next step

All phases are complete: the chart renders average and maximum monthly temperatures with legend, units and empty state handling. Review the full diff and commit when ready.

Feature locked in, temperatures tracked, turbocharged by 🐢 💨 (Turbotuga™, [Codely](https://codely.com)'s mascot)
