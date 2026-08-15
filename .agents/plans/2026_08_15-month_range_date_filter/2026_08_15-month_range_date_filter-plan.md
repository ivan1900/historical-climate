---
name: 'month_range_date_filter'
description: 'Replace the day-range date picker with a month-range picker (MonthPickerInput) so users can filter historical climate data by month ranges (e.g. 2025-01 to 2025-07), with controlled state ready for the future AEMET query.'
created_at: '2026-08-15T09:49:40Z'

created_by:
  tool: 'Copilot'
  model:
    name: 'DeepSeek V4 Flash'
    version: '2x usage'
    reasoning_effort: 'medium'

implemented_by:
  tool: 'Copilot'
  model:
    name: 'DeepSeek V4 Flash'
    version: '2x usage'
    reasoning_effort: 'medium'

last_implementation_at: '2026-08-15T09:53:52Z'
has_completed_all_phases: 'true'
---

# 🧠 Plan: Month-range date filter

## 🎯 Goal

Replace the current day-range picker (`DatePickerInput`) with a month-range picker (`MonthPickerInput`) so users filter historical climate data by month ranges (e.g. `2025-01` to `2025-07`), with controlled state ready for the future AEMET query.

## 👀 Context

- `app/page.tsx`: `"use client"` home page; currently `DatePickerInput type="range"` with `valueFormat="DD/MM/YYYY"` and `firstDayOfWeek={1}`. Markup only, no state.
- `app/layout.tsx`: `MantineProvider` and `@mantine/dates/styles.css` already wired.
- `AGENTS.md` → UI changes must follow `.skills/mantine/SKILL.md` (which points to `https://mantine.dev/llms.txt`).
- Mantine 9.5.1 docs: `MonthPickerInput` (`@mantine/dates`) supports `type="range"`, `valueFormat` (dayjs string), `clearable`, `labelSeparator`, `presets`, `minDate`/`maxDate`. In Mantine 9 date values are `YYYY-MM-DD` strings (`DateValue = string | Date | null`).
- Conventions (repo memory + package.json): lint `oxlint`, format `oxfmt` (single quotes, import ordering), typecheck `pnpm tsc --noEmit`. No test suite configured.

## 📜 Public contracts

**Modified:**

- `app/page.tsx` UI component: `DatePickerInput` → `MonthPickerInput` with `type="range"`, `valueFormat="MM/YYYY"`, `clearable`, placeholder `"Selecciona el rango de meses"` (remove `firstDayOfWeek={1}`, day-level concern).
- Controlled state: `period: [string | null, string | null]` via `useState`, wired to `value`/`onChange` (Mantine 9 range values are `YYYY-MM-DD` strings).
- Derived API-ready month keys: `[string | null, string | null]` in `YYYY-MM` format (dayjs), e.g. `2025-01` / `2025-07`, for the future AEMET request.
- Text copies: updated placeholder; new helper text showing the derived range (verifiable in browser).

**Unchanged:** application services, domain events, DB schema, test suites (none exist in the project).

## 🪜 Phases (1 - minimum, as chosen)

**Phase 1: Month-range picker with controlled state** - the whole task.

- [x] In `app/page.tsx`, swap `DatePickerInput` for `MonthPickerInput` (`@mantine/dates`) with `type="range"`, `valueFormat="MM/YYYY"`, `clearable`, label `"Periodo"`, placeholder `"Selecciona el rango de meses"`, removing `firstDayOfWeek={1}`.
- [x] Add `useState<[string | null, string | null]>` and wire `value`/`onChange`.
- [x] Derive `YYYY-MM` month keys with dayjs from the selected range (e.g. `2025-01`...`2025-07`) for the future AEMET request.
- [x] Render a small helper `Text` with the derived range (only when both months are selected) so the phase is verifiable in the browser.
- [x] Run `pnpm exec oxfmt app/page.tsx` to comply with formatting conventions.
- [x] Verify: `pnpm tsc --noEmit` and `pnpm lint`. Fix issues if any.
- [x] STOP. Present the changes to the user and suggest 3 alternative commit messages. Do not proceed until the user asks.

## ⏭️ Next step

All phases are complete. The remaining step is to commit Phase 1 (or the whole task) once the user reviews the changes.

---

Bugs squashed thanks to [Codely](https://codely.com) AI tooling. 🐛 < 🐢 💨
