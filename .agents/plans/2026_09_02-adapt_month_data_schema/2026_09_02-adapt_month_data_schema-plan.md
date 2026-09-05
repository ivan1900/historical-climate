---
name: 'adapt_month_data_schema'
description: 'Adapt the MonthData domain model, the AEMET DTO parsing and the Prisma persistence/read layers to the new data_monthly schema that stores a single date column plus an is_year_statistics flag.'
created_at: '2026-09-02T00:00:00Z'

created_by:
  tool: 'Copilot'
  model:
    name: 'GitHub Copilot'
    version: 'DeepSeek V4 Flash'
    reasoning_effort: 'medium'

implemented_by:
  tool: 'Copilot'
  model:
    name: 'GitHub Copilot'
    version: 'DeepSeek V4 Flash'
    reasoning_effort: 'medium'

last_implementation_at: '2026-09-02T00:00:00Z'
has_completed_all_phases: 'true'
---

# 🧠 Plan: Adapt domain and DTOs to the new data_monthly schema

## 🎯 Goal

Rework the `MonthData` domain model, the AEMET DTO parsing and the Prisma persistence/read layers to match the new `data_monthly` schema, which replaces the separate `month`/`year` columns with a single `date` (unique together with `idema`) plus a new `is_year_statistics` flag.

## 👀 Context

The `data_monthly` schema was pulled and now looks like this:

- [`prisma/schema.prisma`](../../../../prisma/schema.prisma): `data_monthly` model with `idema`, `date` (`@db.Date`), `is_year_statistics Boolean?`, and a `@@unique([idema, date], map: "data_monthly_idema_idx")`. The old `month`/`year` columns are gone.

Relevant files to consider:

- [`app/lib/domain/monthData.ts`](../../../../app/lib/domain/monthData.ts): `MonthData` domain class with `month`/`year` fields and `createMonthData` factory.
- [`app/lib/application/fetchMonthData.ts`](../../../../app/lib/application/fetchMonthData.ts): AEMET DTO parsing with `monthDataDTO` (field `fecha` = `yyyy-mm`), `parseMonth`/`parseYear`.
- [`app/lib/infrastructure/updateMonthData.ts`](../../../../app/lib/infrastructure/updateMonthData.ts): Prisma `upsert` keyed on the removed `idema_month_year` compound, writes `month`/`year`.
- [`app/lib/infrastructure/getDataByDate.ts`](../../../../app/lib/infrastructure/getDataByDate.ts): Maps rows back to `MonthData` using `row.month`/`row.year`.
- [`app/lib/application/searchByDate.ts`](../../../../app/lib/application/searchByDate.ts): Counts months via `dayjs` diff to decide whether to fetch from AEMET.
- [`generated/prisma/`](../../../../generated/prisma): Stale generated client still exposing `month`/`year`/`idema_month_year`; requires `prisma generate`.

Conventions to follow (from [`AGENTS.md`](../../../../AGENTS.md)):

- The app follows a clean-architecture-ish split: `app/lib/domain` (models), `app/lib/application` (use cases/services), `app/lib/infrastructure` (Prisma/DB access). Keep changes within these boundaries.
- Verification commands from [`package.json`](../../../../package.json): `lint` (`oxlint`), `format:check` (`oxfmt --check`), and `build` (`next build`).

### Date derivation rule (decided with the user)

AEMET returns `fecha` as `yyyy-mm`:

- If the month is `13`, it stands for the annual statistics: persist with `date` = `December 31` of that year and `is_year_statistics = true`.
- For any other month, persist with `date` = day 1 of that month and `is_year_statistics = false`.

The derivation lives in the **domain factory** `MonthData.createMonthData(...)`. Rows flagged as `is_year_statistics` are **excluded** from month-range queries.

## 📜 Public contracts

- **Domain model**
  - `MonthData.createMonthData(idema, tempMin, tempMax, tempAvg, year, month, rainfall, rainDays, snowDays): MonthData` - replace `month`/`year` fields with `date: Date` and `isYearStatistics: boolean`, derived inside the factory (month `13` ⇒ Dec 31 + flag, otherwise day 1 + flag false).

- **Application services**
  - `fetchMonthData(anioInitStr: string, anioFinStr: string, idema: string): Promise<MonthData[]>` - move the month/year splitting logic into `parseMonth`/`parseYear`/date parsing, pass `year`/`month` into the factory.
  - `searchByDate(from: Date, to: Date, idema: string): Promise<MonthData[]>` - ignore `is_year_statistics` rows when deciding whether to refetch (exclude them from month-range results).

- **Infrastructure**
  - `updateMonthData(monthData: MonthData[]): Promise<void>` - upsert on the `idema_date` compound key, persist `date` and `is_year_statistics`.
  - `getDataByDate(from: Date, to: Date): Promise<MonthData[]>` - map rows using `row.date`/`row.is_year_statistics`, exclude `is_year_statistics` rows from month-range results.

- **Database schema**
  - Update `prisma/schema.prisma` accordingly (already pulled) and regenerate the Prisma client (`prisma generate`) so all code compiles.

There are no UI text copies or domain events involved in this change.

## 🪜 Phases

### Phase 1: Data ingestion slice (DTO -> domain -> persistence)

**Description:** Make the app fetch, parse and persist AEMET monthly data against the new `date` + `is_year_statistics` schema. This is the end-to-end vertical slice that consumes the AEMET response and writes correct rows.

To-do actions:

- [x] Regenerate the Prisma client (`pnpm run prisma:generate`) so the pulled schema is reflected in `generated/prisma`.
- [x] Rework `app/lib/domain/monthData.ts`: replace `month`/`year` fields with `date: Date` and `isYearStatistics: boolean`.
- [x] In the `MonthData` factory, derive `date` and `isYearStatistics` from `year`/`month` (month 13 ⇒ `new Date(year, 11, 31)` + flag; otherwise `new Date(year, month - 1, 1)` + flag false).
- [x] Update `app/lib/application/fetchMonthData.ts`: keep `parseMonth`/`parseYear` (and a `parseDate`) and pass `year`/`month` into `MonthData.createMonthData`.
- [x] Update `app/lib/infrastructure/updateMonthData.ts`: upsert on the `idema_date` compound key; persist `date` and `is_year_statistics` on create (and update the mutable climate fields).
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification commands (`pnpm run lint`, `pnpm run format:check`, `pnpm run build`). Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 2: Read/query slice (consumers)

**Description:** Update the read path so `getDataByDate` and `searchByDate` work with the new `date`-based domain and filter out annual-year statistics rows from month-range queries.

To-do actions:

- [x] Update `app/lib/infrastructure/getDataByDate.ts` to construct `MonthData` from `row.date`/`row.is_year_statistics`.
- [x] Update `getDataByDate` and `app/lib/application/searchByDate.ts` to exclude `is_year_statistics` rows from month-range filters.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification commands. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages. Do NOT proceed to the next phase until the user explicitly asks.

### Phase 3: Cleanup and verification

**Description:** Remove any remaining stale `month`/`year` references and run a full verification pass to guarantee the build is green and the generated client is aligned.

To-do actions:

- [x] Grep the codebase for any remaining `month`/`year` references on `MonthData`/`data_monthly` and remove or update them.
- [x] Confirm `generated/prisma` no longer exposes `idema_month_year` and aligns with `schema.prisma`.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification commands. Fix issues if any.
- [ ] STOP. Present the changes to the user for review and suggest commit messages.

## ⏭️ Next step

All phases are complete. The plan fully adapted the `MonthData` domain, the AEMET DTO parsing and the Prisma persistence/read layers to the new `date`-based `data_monthly` schema, including excluding annual year-statistics from month-range queries.

Future-proof cleanup shipped, perfectly aligned with [Codely](https://codely.com) AI tooling. 🐢 💨 📅 🚫 🎯
