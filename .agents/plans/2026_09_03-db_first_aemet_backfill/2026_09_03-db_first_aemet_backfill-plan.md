---
name: 'db_first_aemet_backfill'
description: 'DB-first search by date with chunked AEMET backfill (2-year max per request), full persistence per station, nullable values, and a visible loader until completion'
created_at: '2026-09-03T17:43:03Z'

created_by:
  tool: 'Copilot'
  model:
    name: 'GLM'
    version: '5.2'
    reasoning_effort: 'high'

implemented_by:
  tool: 'Copilot'
  model:
    name: 'GLM'
    version: '5.2'
    reasoning_effort: 'high'

last_implementation_at: '2026-09-03T18:20:00Z'
has_completed_all_phases: 'true'
---

# Plan: DB-first search with AEMET station backfill

## Goal

On every data request, try the database first. If data is missing for the selected station (`idema`), fetch from AEMET splitting the range into chunks of at most 2 years per request, persist everything AEMET returns for that station, and finally return only the originally requested data. The UI must show a loader until the whole process finishes.

## Context

- [`app/page.tsx`](../../app/page.tsx): client component. Submits period + `selectedStationIdema` to the `searchByDate` server action inside `startTransition`. Currently only the submit button shows `loading={isPending}`; results are never rendered.
- [`app/lib/application/searchByDate.ts`](../../app/lib/application/searchByDate.ts): `'use server'`. Known defects: DB read has no station filter, incomplete data triggers a single full-range AEMET fetch (breaks the 2-year limit), the result is replaced instead of merged, and whole calendar years are returned instead of the requested months.
- [`app/lib/application/fetchMonthData.ts`](../../app/lib/application/fetchMonthData.ts): AEMET integration. Endpoint `${BASE_URL}/api/valores/climatologicos/mensualesanuales/datos/anioini/{ini}/aniofin/{fin}/estacion/{idema}` with the `api_key` header, two-step fetch (`datos` URL) and `iso-8859-1` decoding. Missing: `response.ok` check on the data fetch, handling of empty responses.
- [`app/lib/infrastructure/getDataByDate.ts`](../../app/lib/infrastructure/getDataByDate.ts): Prisma query without `idema` filter (root cause of wrong completeness checks).
- [`app/lib/domain/monthData.ts`](../../app/lib/domain/monthData.ts): `MonthData` domain class, `MonthDataDTO` type, `createMonthData` factory. Values are non-nullable numbers today; AEMET empty strings become 0.
- [`prisma/schema.prisma`](../../prisma/schema.prisma): `data_monthly` already supports nullable `Decimal`/`SmallInt` columns, so null support needs no schema change.
- Verified during exploration: December monthly rows are stored on day 1 and annual statistics (month 13) on Dec 31, so the `@@unique([idema, date])` index does **not** cause a collision. No migration needed for this.
- Conventions: `domain/` → `application/` → `infrastructure/` layering, `'use server'` only on client-facing entrypoints, default exports, `*DTO` camelCase types for the frontend, `import type` for types, Spanish UI copy, Mantine 9 (see `.agents/skills/mantine/SKILL.md` → https://mantine.dev/llms.txt).
- Verification: `pnpm lint` (oxlint), `pnpm format:check` (oxfmt), `pnpm tsc --noEmit`, `pnpm build`. No test framework configured.
- Environment vars: `AEMET_API_KEY`, `BASE_URL`, `DATABASE_URL`.

## Phases

### Phase 1: DB-first search per station (backend happy path)

Vertical slice: correct the data-access and search flow so each station's data is only fetched from AEMET when genuinely missing, in 2-year chunks, persisted, and filtered to the requested range.

Public contracts:

- Modified: `searchByDate(from: Date, to: Date, idema: string): Promise<MonthDataDTO[]>` (server action) — DB-first per station; AEMET backfill in ≤2-year chunks when months are missing; returns only the requested months.
- Modified: `getDataByDate(from: Date, to: Date, idema: string): Promise<MonthData[]>` — filters by `idema`.
- Modified: `fetchMonthData(anioInit: string, anioFinStr: string, idema: string): Promise<MonthData[]>` — internal chunking into ≤2-year AEMET requests.

To-do:

- [x] Add `idema` filter to `getDataByDate`'s Prisma `where` clause.
- [x] Detect missing months by comparing the DB row count for the station's range against the expected month count.
- [x] Compute the years needing backfill and chunk them into ≤2-year windows for AEMET requests.
- [x] Persist all rows AEMET returns for the station in each chunk via `updateMonthData` (upsert on `idema_date`).
- [x] After backfilling, re-read the DB and return only the months within `[from, to]`, mapped with `toDTO()`.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`pnpm lint`, `pnpm format:check`, `pnpm tsc --noEmit`, `pnpm build`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

### Phase 2: Nullable values (no silent zeros)

Vertical slice: stop corrupting missing AEMET values by storing them as 0; propagate nullability from AEMET parsing through domain, DTO and persistence.

Public contracts:

- Modified: `MonthDataDTO` — `tempMin`, `tempMax`, `tempAvg`, `rainfall`, `rainDays`, `snowDays` become `number | null`.
- Modified: `MonthData.createMonthData(idema, tempMin: number | null, tempMax: number | null, tempAvg: number | null, year: number, month: number, rainfall: number | null, rainDays: number | null, snowDays: number | null): MonthData` and corresponding getters.
- Modified: `fetchMonthData` raw DTO parsing — empty strings parse to `null` instead of 0.

To-do:

- [x] Make `MonthData` fields and getters nullable (`number | null`), update `toDTO()`.
- [x] Update `parseNumber` in `fetchMonthData` to return `null` for empty/missing raw values.
- [x] Adapt `updateMonthData` upserts to write nulls (schema already allows them).
- [x] Adapt `getDataByDate` reconstruction of `MonthData` (nullable DB columns).
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`pnpm lint`, `pnpm format:check`, `pnpm tsc --noEmit`, `pnpm build`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

### Phase 3: AEMET resilience (errors and permanently missing months)

Vertical slice: handle AEMET failures and months AEMET genuinely does not have, so requests don't fail wholesale and don't refetch forever.

Public contracts:

- Modified: `fetchMonthData` — checks `response.ok` on both requests, tolerates empty `datos`/empty arrays, surfaces AEMET errors with actionable messages instead of throwing opaque `JSON.parse` errors.
- New (internal, application layer): a helper that tracks which month/year chunks have been attempted so `searchByDate` can avoid retrying chunks that AEMET returned empty for the remainder of the request.

To-do:

- [x] Add `response.ok` checks and error handling with clear messages (including HTTP status) to both fetches in `fetchMonthData`.
- [x] Handle empty `datos` URL and empty data arrays gracefully (return empty list for the chunk).
- [x] Ensure `searchByDate` merges whatever is available instead of failing the whole request when one chunk errors.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`pnpm lint`, `pnpm format:check`, `pnpm tsc --noEmit`, `pnpm build`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

### Phase 4: Loader UX until completion (overlay + message)

Vertical slice: guarantee a visible loading state for the whole duration of the request, including long multi-chunk AEMET backfills, with Spanish UI copy.

Public contracts:

- Modified UI copy: overlay loader with message `Obteniendo datos históricos de AEMET…` (shown while data is being fetched, hidden when the request fully finishes; when all data comes from the DB the overlay may appear very briefly or be skipped).

To-do:

- [x] Broaden the loading state in `app/page.tsx` so it covers the full `startTransition` duration (loading state must remain true until `searchByDate` resolves or rejects).
- [x] Add a centered overlay loader (Mantine `Loader` + `Text` message) covering the page content while active.
- [x] Keep the submit button `loading`/`disabled` behavior consistent with the overlay.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (`pnpm lint`, `pnpm format:check`, `pnpm tsc --noEmit`, `pnpm build`). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

## Next step

All phases of this plan are complete. Consider exporting this conversation and storing it alongside the plan as `.agents/plans/2026_09_03-db_first_aemet_backfill/2026_09_03-db_first_aemet_backfill-conversation.md`.

All four phases sailed through storms on Turbotuga's shell, powered by [Codely](https://codely.com) 🐢 💨 🚀 🌧️ ⛈️ 🏁
