---
name: "buscar-button-loading-state"
description: "Wire the Buscar button to searchByDate with a Mantine loading state that locks the button while data loads, and disable it while inputs are incomplete"
created_at: "2026-09-02T15:34:18Z"

created_by:
  tool: "Copilot"
  model:
    name: "GitHub Copilot"
    version: "Current (VS Code Chat agent)"
    reasoning_effort: "medium"

implemented_by:
  tool: "Copilot"
  model:
    name: "GitHub Copilot"
    version: "Current (VS Code Chat agent)"
    reasoning_effort: "medium"

last_implementation_at: "2026-09-02T15:52:10Z"
has_completed_all_phases: "true"
---

# Plan: Loading state for the Buscar button

## 🎯 Goal

Wire the Idle `Buscar` button in `app/page.tsx` to the `searchByDate` server action so that, while data is loading, the button shows a Mantine loader and is locked (disabled), and it gets unlocked when loading finishes. The button must also stay locked while the period or the station inputs are empty.

## 👀 Context

- AGENTS.md: check `node_modules/next/dist/docs/` for the Next.js version docs (breaking changes in this project's Next.js) before writing code.
- UI conventions: `.agents/skills/mantine/SKILL.md` (Mantine 9). The docs state that when the `loading` prop is set, the `Button` is disabled and a `Loader` with overlay is rendered centered on the button. `loaderProps` can tune the `Loader`.
- `app/page.tsx`: `'use client'` home page, 94 lines. Contains a `MonthPickerInput type="range"` (Periodo, value `[string|null, string|null]` in `MM/YYYY` format), an `Autocomplete` (Población, value `stationQuery` text), and a static `<Button fullWidth size="md">Buscar</Button>` with NO handler, NO `<form>` element, and no `loading`/`disabled` props. It also debounces `searchStations(query)` with `useDebouncedValue`. Current code: `app/page.tsx`.
- `app/lib/application/searchByDate.ts`: `'use server'` function, currently unreferenced. Signature: `searchByDate(from: Date, to: Date, idema: string): Promise<MonthData[]>`.
- `app/lib/application/searchStations.ts` / `getStationsByName.ts`: `StationSuggestion = { value: string; label: string }` where `value` is the station `idema`. `searchStations` is a `'use server'` function already imported in the page.
- `app/lib/domain/monthData.ts`: check the returned shape when handling results.
- Memory: no `@mantine/form` dependency installed (only `@mantine/core`, `@mantine/dates`, `@mantine/hooks`, `@mantine/charts`) — use plain `useState`/`useActionState`, not `useForm`.

## 🪜 Phases

### Phase 1: Happy path with loading state

**Description**: Wire the `Buscar` button to `searchByDate` and add the loading state that locks the button while data loads.

**To-do actions**:

- [x] In `app/page.tsx`, track the selected station (`idema`) from the `Autocomplete` `onOptionSubmit` (or equivalent) in a new state, besides the existing `stationQuery`.
- [x] Convert the `Stack` content into a `<form>` element and make the `Buscar` button `<Button type="submit">` (form semantics will enable the pending state).
- [x] Call `searchByDate(from, to, idema)` server action on submit using React 19 `useActionState` (or `useTransition` + `onClick`), storing the returned data in state. `from`/`to` must be `dayjs(datestring, 'YYYY-MM').toDate()` dates.
- [x] Apply Mantine `<Button loading={pending}>Buscar</Button>` so the button shows the Loader overlay AND gets disabled while the request is in flight.
- [x] Unlock the button when the request finishes (the `loading` prop automatically unlocks when `pending` becomes `false`).
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command: `pnpm tsc --noEmit`, `pnpm lint`, `pnpm exec oxfmt --check` on the touched files (single quotes, import grouping; do NOT reformat `globals.css`, `next.config.ts`, `pnpm-workspace.yaml`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

### Phase 2: Lock the button while inputs are empty

**Description**: Disable the `Buscar` button while the required inputs (period range and station) are not selected.

**To-do actions**:

- [x] Derive a `canSearch = period[0] && period[1] && selectedStationIdema` condition in `app/page.tsx`.
- [x] Set `<Button disabled={!canSearch}>` so the button is locked (and stop the search early) when the period or the station is missing, in addition to the loading lock from Phase 1.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command: `pnpm tsc --noEmit`, `pnpm lint`, `pnpm exec oxfmt --check` on the touched files. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

## ⏭️ Next step

All phases are complete. The next step is to commit the changes (or open a pull request) and store the conversation next to the plan.

Bugs squashed thanks to [Codely](https://codely.com) AI tooling. 🐛 < 🐢 💨