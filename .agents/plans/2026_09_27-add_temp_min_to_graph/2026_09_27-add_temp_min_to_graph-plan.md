---
name: 'add-temp-min-to-graph'
description: "Add a 'Temperatura media mínima' series (mapped to data_monthly.temp_min / MonthDataDTO.tempMin) to the climate chart, using Mantine's blue.6 color, with a matching comparison series."
created_at: '2026-09-27T00:00:00Z'

created_by:
  tool: 'opencode'
  model:
    name: 'MiniMax-M3'
    version: 'MiniMax-M3'
    reasoning_effort: 'medium'

implemented_by:
  tool: 'opencode'
  model:
    name: 'MiniMax-M3'
    version: 'MiniMax-M3'
    reasoning_effort: 'medium'

last_implementation_at: '2026-09-27T23:23:13Z'
has_completed_all_phases: true
---

# 🎯 Goal

Add a new series to the climate chart showing the historical minimum temperature (`data_monthly.temp_min` / `MonthDataDTO.tempMin`) under the Spanish label **"Temperatura media mínima"**, drawn with Mantine's `blue.6` color, plus the matching comparison-period twin. No backend or schema changes are needed: the data is already plumbed end-to-end.

# 👀 Context

## Files to modify

- [`/home/ivan/entornos/history-climate/app/components/TemperatureChart.tsx`](../../app/components/TemperatureChart.tsx): the only chart in the app. Built with `LineChart` from `@mantine/charts` (which wraps Recharts). Currently renders two series (`'Temperatura media'` in `green.6`, `'Temperatura media máxima'` in `red.6`) plus, when a comparison period is selected, two dashed twins in `green.2` / `red.2`. Series names double as the data-key Mantine looks up on each chart point — both must use the same Spanish string.
- [`/home/ivan/entornos/history-climate/app/components/TemperatureChart.test.tsx`](../../app/components/TemperatureChart.test.tsx): asserts on `LineChart` props via a `vi.mock` spy. Both existing test cases need to be updated to include the new series and the new data-key.

## Files NOT changed (already correct)

- [`/home/ivan/entornos/history-climate/app/server/domain/monthData.ts`](../../app/server/domain/monthData.ts): `MonthDataDTO.tempMin: number | null` already exists; `MonthData` class already exposes it via `getTempMin()` and `toDTO()`.
- [`/home/ivan/entornos/history-climate/prisma/schema.prisma`](../../prisma/schema.prisma): the `data_monthly` model already has the `temp_min` column.
- [`/home/ivan/entornos/history-climate/app/server/infrastructure/getDataByDate.ts`](../../app/server/infrastructure/getDataByDate.ts) and [`updateMonthData.ts`](../../app/server/infrastructure/updateMonthData.ts): already read/write `temp_min`.

## Documentation / skills to consult

- [`.agents/skills/mantine/SKILL.md`](../../.agents/skills/mantine/SKILL.md) (UI skill — points to `https://mantine.dev/llms.txt` for Mantine context).
- [`/home/ivan/entornos/history-climate/node_modules/@mantine/charts/lib/LineChart/LineChart.d.ts`](../../node_modules/@mantine/charts/lib/LineChart/LineChart.d.ts) and [`types.d.ts`](../../node_modules/@mantine/charts/lib/types.d.ts) for the `ChartSeries` shape (`name`, `color` as `MantineColor`).
- [`AGENTS.md`](../../AGENTS.md) notes this is a non-standard Next.js install (`node_modules/next/dist/docs/`). Not directly relevant here — the chart is purely React/Mantine and no Next-specific code is touched.

## Conventions to follow

1. Spanish series labels in lowercase: `'Temperatura media'` (avg), `'Temperatura media máxima'` (max). The new one must follow the same pattern: `'Temperatura media mínima'`.
2. Color convention: shade `.6` for current-period series, shade `.2` plus `strokeDasharray: '6 4'` and `strokeWidth: 1` for comparison twins.
3. `lineProps` callback must recognize the new comparison name and apply the same recede treatment (no per-point label, smaller dot).
4. `connectNulls={false}` and the year-shifted join-by-month logic must continue to apply for the new series (no special-casing needed: same shape as `tempMax`).

# 🪜 Phases

## Phase 1: Add the current-period minimum series

**Description**
Wire the `tempMin` field into the chart as a new current-period series, including its data point and its entry in the `currentSeries` array, drawn with Mantine's `blue.6`. Update the unit tests to match. The comparison-period twin is intentionally **not** added yet — that lets the user verify the visual impact (a third colored line, distinct from avg/max) before we mirror it for the comparison period.

### To-do

- [x] In [`TemperatureChart.tsx`](../../app/components/TemperatureChart.tsx), add the key `'Temperatura media mínima': item.tempMin` to the `point` object built inside `chartData.map`.
- [x] In the same file, append `{ name: 'Temperatura media mínima', color: 'blue.6' }` to the `currentSeries` array.
- [x] In [`TemperatureChart.test.tsx`](../../app/components/TemperatureChart.test.tsx):
  - [x] Update the `monthData` factory's default `tempMin` only if needed (currently `0`; keep as-is so existing tests don't drift).
  - [x] In the "renders without crashing with a single series" test, add `'Temperatura media mínima'` to the expected `data` and `series` entries.
  - [x] In the "aligns the comparison series by shifted date" test, add the same key to every `data` entry's expectation. The `series.map` assertion does **not** get a third comparison entry in this phase — only the current series grows by one.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (look it up in the AGENTS.md file or the project configuration). Fix issues if any.
- [x] **STOP.** Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

### Public contracts (Phase 1)

- **UI text copy** (new, current period only): `'Temperatura media mínima'` — Spanish label rendered in the chart legend and used as the data-key inside `chartData` points.
- **Component series definition** (new, current period only):
  ```ts
  { name: 'Temperatura media mínima', color: 'blue.6' }
  ```
  appended to the `currentSeries` array in `TemperatureChart.tsx`.
- **Test cases** (modified):
  - `TemperatureChart.test.tsx` → "renders without crashing with a single series": expected `data[0]` gains the key `'Temperatura media mínima'` (value taken from the `tempMin` of the fixture); expected `series.map((s) => s.name)` gains `'Temperatura media mínima'` between `'Temperatura media'` and `'Temperatura media máxima'` to match insertion order.
  - `TemperatureChart.test.tsx` → "aligns the comparison series by shifted date, leaving gaps as null": every `data` entry gains the key `'Temperatura media mínima'` (current period only — the comparison-period twin is not asserted here yet).
- **MonthDataDTO schema**: unchanged. `MonthDataDTO.tempMin: number | null` already exists.

## Phase 2: Add the comparison-period minimum series

**Description**
Mirror the `tempMax` pattern for `tempMin`: build the dynamic `minComparisonName`, add it as a key to each `chartData` point when `hasComparison` is true, append the dashed `blue.2` entry to `comparisonSeries`, and recognize it inside the `lineProps` callback so it inherits the no-label / thin-line treatment. Update tests for the comparison twin.

### To-do

- [x] In [`TemperatureChart.tsx`](../../app/components/TemperatureChart.tsx):
  - [x] Add `const minComparisonName = \`Temperatura media mínima (${comparisonLabel ?? 'comparación'})\`;`next to the existing`avgComparisonName`/`maxComparisonName` constants.
  - [x] Inside `chartData.map`, when `hasComparison`, set `point[minComparisonName] = comparison?.tempMin ?? null;`.
  - [x] In `comparisonSeries`, append `{ name: minComparisonName, color: 'blue.2', strokeDasharray: '6 4' }`.
  - [x] In the `lineProps` callback, extend the comparison-recognition condition to include `s.name === minComparisonName` alongside the existing two checks.
- [x] In [`TemperatureChart.test.tsx`](../../app/components/TemperatureChart.test.tsx):
  - [x] In the "aligns the comparison series by shifted date" test, define `const minComparison = 'Temperatura media mínima (hace 10 años)';` alongside the existing `averageComparison` / `maxComparison`.
  - [x] Add `[minComparison]` to each expected `data` entry (using the fixture's `tempMin` values, `null` for the missing March entry).
  - [x] Append `minComparison` to the expected `series.map((s) => s.name)` array, after `maxComparison`, to match insertion order.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (look it up in the AGENTS.md file or the project configuration). Fix issues if any.
- [x] **STOP.** Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

### Public contracts (Phase 2)

- **UI text copy** (new, comparison period only): `'Temperatura media mínima (<label>)'` where `<label>` is `comparisonLabel ?? 'comparación'`. Built dynamically as `minComparisonName`.
- **Component series definition** (new, comparison period only):
  ```ts
  { name: minComparisonName, color: 'blue.2', strokeDasharray: '6 4' }
  ```
  appended to `comparisonSeries` in `TemperatureChart.tsx`. Drawn dashed to recede behind the current-period lines, matching the `green.2` / `red.2` twins.
- **Test cases** (modified):
  - `TemperatureChart.test.tsx` → "aligns the comparison series by shifted date, leaving gaps as null": expected `data` entries gain the `[minComparison]` key; expected `series.map((s) => s.name)` gains `'Temperatura media mínima (hace 10 años)'`.
- **MonthDataDTO schema**: unchanged.

# ⏭️ Next step

All phases implemented. The chart now renders a `blue.6` current-period line for the minimum temperature and a dashed `blue.2` comparison twin when a comparison year is selected, mirroring the existing `green` / `red` patterns. Awaiting user review and commit.

Blue line cooling the chart down with 🐢 💨 (Turbotuga™, [Codely](https://codely.com)'s mascot). Full sweep locked in. ✅ 🐢 💨
