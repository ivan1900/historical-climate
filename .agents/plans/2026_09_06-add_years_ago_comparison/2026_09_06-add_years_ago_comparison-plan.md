---
name: 'add_years_ago_comparison'
description: "Add a 'years ago' comparison to the climate search: fetch the same period shifted back N years and overlay it on the temperature chart with soft colors."
created_at: '2026-09-06T00:00:00Z'

created_by:
  tool: 'Copilot'
  model:
    name: 'GLM'
    version: '5.3'
    reasoning_effort: 'high'

implemented_by:
  tool: 'Copilot'
  model:
    name: 'GLM'
    version: '5.3'
    reasoning_effort: 'high'

last_implementation_at: '2026-09-06T12:15:00Z'
has_completed_all_phases: 'false'
---

# Add "years ago" comparison to the climate search

## 🎯 Goal

Add a new form field that lets the user compare the selected period with the same period N years earlier. When the user searches a date range (e.g., 2025-01 to 2025-12) with `10` in the new field, the app also fetches the data for the shifted range (2015-01 to 2015-12) and draws it on the same temperature chart using soft/muted colors.

## 👀 Context

Important files and folders to consider:

- [`app/page.tsx`](../../app/page.tsx): Client component with the search form (Mantine `MonthPickerInput type='range'`, `Autocomplete` for station, `Button "Buscar"`). Holds `period`, `selectedStationIdema`, `searchResult` state and calls the `searchByDate` server action inside `startTransition`.
- [`app/components/TemperatureChart.tsx`](../../app/components/TemperatureChart.tsx): Mantine `LineChart` (`@mantine/charts`) with props `{ data: MonthDataDTO[]; hasSearched?: boolean }`. Currently renders 2 series: `'Temperatura media'` (`blue.6`) and `'Temperatura media máxima'` (`red.6`), keyed by `month` (`MM/YYYY`).
- [`app/lib/application/searchByDate.ts`](../../app/lib/application/searchByDate.ts): Existing server action. DB-first lookup (`getDataByDate`) plus AEMET gap-filling (`fetchMonthData`, chunked by 2 years). Returns `MonthDataDTO[]`.
- [`app/lib/domain/monthData.ts`](../../app/lib/domain/monthData.ts): `MonthDataDTO` shape (`idema`, `tempMin`, `tempMax`, `tempAvg`, `date`, `isYearStatistics`, `rainfall`, `rainDays`, `snowDays`). No changes needed.
- [`app/lib/infrastructure/`](../../app/lib/infrastructure/): `getDataByDate`, `updateMonthData`, etc. The comparison fetch reuses the whole existing pipeline with shifted `Date` boundaries.
- [`AGENTS.md`](../../AGENTS.md): Warns that this is a newer Next.js with breaking changes; relevant docs live in `node_modules/next/dist/docs/`. Key finding: **server actions are dispatched sequentially per client**, so both ranges (current + comparison) must be fetched inside a single server action.
- Mantine UI conventions: see `.agents/skills/mantine/SKILL.md` (delegates to https://mantine.dev/llms.txt) and the repo conventions: single quotes, import ordering (oxlint/oxfmt).
- No database schema changes, no domain model changes, no existing test suites (the project has no tests).

## 🪜 Phases

### Phase 1: Form field (frontend state only)

Add the new "years ago" input to the search form and wire its state, without any fetching changes yet.

- [x] Add a Mantine `NumberInput` to the form in [`app/page.tsx`](../../app/page.tsx), below the period picker:
  - Label: `Comparar con años atrás`
  - Placeholder: `10`
  - `min={0}`, integer step, `hideControls` optional per Mantine conventions
- [x] Add `yearsAgo` state (`number | null` or `string` as Mantine `NumberInput` requires) and bind it to the input
- [x] Keep `searchByDate` as the fetch path for now; the `yearsAgo` value is stored but not yet used
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification commands (`pnpm tsc --noEmit`, `pnpm lint`, `pnpm format:check`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 2: New server action `searchByDateWithComparison`

Create a dedicated server action that fetches both the current and the shifted period in a single request, and wire it into the form submission.

- [x] Create [`app/lib/application/searchByDateWithComparison.ts`](../../app/lib/application/searchByDateWithComparison.ts) with the `'use server'` directive
- [x] Public contract:
  ```ts
  export default async function searchByDateWithComparison(
    from: Date,
    to: Date,
    idema: string,
    yearsAgo: number,
  ): Promise<{ current: MonthDataDTO[]; comparison: MonthDataDTO[] | null }>;
  ```
- [x] Internally shift `from`/`to` back `yearsAgo` years using dayjs (already a project dependency) and reuse the existing pipeline (`getDataByDate` DB-first + `fetchMonthData` AEMET gap-filling) for the comparison range
- [x] Return `comparison: null` when `yearsAgo` is `0`, empty or the shifted range is invalid
- [x] Update `handleSubmit` in [`app/page.tsx`](../../app/page.tsx):
  - When `yearsAgo` is set and positive, call `searchByDateWithComparison` instead of `searchByDate`
  - Store the result in new state: `searchResult` (current data) + `comparisonResult` (`MonthDataDTO[] | null`)
  - Both ranges are fetched inside the single server action (server-side), complying with Next.js 16 sequential server-action dispatch
- [x] The chart still renders only the main data in this phase
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification commands (`pnpm tsc --noEmit`, `pnpm lint`, `pnpm format:check`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 3: Chart rendering with soft colors

Overlay the comparison data on the existing chart as extra muted series.

- [ ] Extend the `TemperatureChart` props in [`app/components/TemperatureChart.tsx`](../../app/components/TemperatureChart.tsx):
  ```ts
  type TemperatureChartProps = {
    data: MonthDataDTO[];
    comparisonData?: MonthDataDTO[] | null;
    comparisonLabel?: string; // e.g. "hace 10 años", used in series names
    hasSearched?: boolean;
  };
  ```
- [ ] Merge the comparison months into the chart points, joining by month index/`MM` so both series align on the shared `month` (`MM/YYYY`) x-axis keys of the current period
- [ ] Add 2 soft-colored series to the `series` prop:
  - `'Temperatura media (comparación)'` with color `blue.2`
  - `'Temperatura media máxima (comparación)'` with color `red.2`
- [ ] Show the comparison series (and their legend entries) only when `comparisonData` is present and non-empty
- [ ] Filter out `isYearStatistics` rows from the comparison data, as done for the main data
- [ ] Verify the changes in terms of typechecking, linting and tests using the project's verification commands (`pnpm tsc --noEmit`, `pnpm lint`, `pnpm format:check`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

## ⏭️ Next step

Complete Phase 3 (overlay the comparison data on the chart as extra soft-colored series and pass `comparisonData` from the form).

The flame of progress burns brighter thanks to [Codely](https://codely.com) AI tooling. 🔥 🐢 💨
