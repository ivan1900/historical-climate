---
name: 'fetch_month_data'
description: 'Implement fetchMonthData(anioInitStr, anioFinStr, idema) in app/lib/application/fetchMonthData.ts to fetch AEMET monthly climatology data, parse it into the MonthData domain model and persist it to the data_monthly table, following the existing fetchAemetStations pattern.'
created_at: '2026-08-24T00:00:00Z'

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

last_implementation_at: '2026-08-24T00:00:00Z'
has_completed_all_phases: 'true'
---

# 🧠 Plan: Fetch monthly data

## 🎯 Goal

Implement `fetchMonthData(anioInitStr, anioFinStr, idema)` that fetches AEMET monthly climatology data for a station and year range, decodes it, maps it to the `MonthData` domain model, and (in a later phase) persists it to the `data_monthly` table — following the two-step AEMET fetch pattern already used by `fetchAemetStations`.

## 👀 Context

- **Reference implementation**: [`app/lib/application/fetchAemetStations.ts`](app/lib/application/fetchAemetStations.ts) - two-step fetch (`preFetch` → `data.datos`), `iso-8859-1` decoding via `TextDecoder`, DTO mapping, domain factory, persistence.
- **Stub to complete**: [`app/lib/application/fetchMonthData.ts`](app/lib/application/fetchMonthData.ts) - currently only a `monthDataDTO` type.
- **Domain model**: [`app/lib/domain/monthData.ts`](app/lib/domain/monthData.ts) - `MonthData.createMonthData(idema, tempMin, tempMax, tempAvg, month, year, rainfall, rainDays, snowDays)`.
- **Infrastructure**: [`app/lib/infrastructure/updateStations.ts`](app/lib/infrastructure/updateStations.ts) - Prisma persistence pattern. No `updateMonthData` exists yet.
- **Schema**: `prisma/schema.prisma` → `data_monthly` model (`idema`, `temp_min`, `temp_max`, `temp_avg`, `month`, `year`, `rainfall_med`, `rain_days`, `snow_days`).
- **Env**: `process.env.BASE_URL`, `process.env.AEMET_API_KEY` (with `|| ''` fallback).
- **Endpoint**: `${BASE_URL}/api/valores/climatologicos/mensualesanuales/datos/anioini/{anioInitStr}/aniofin/{anioFinStr}/estacion/{idema}` (GET, path params).
- **Conventions**: read `AGENTS.md`; UI changes follow `.agents/skills/mantine/SKILL.md`. Next.js 16.3.1. Verification: `pnpm lint` (oxlint), `pnpm format:check` (oxfmt), `pnpm build` (no test framework/typecheck script exists).

## 📜 Public contracts

- **Application service**
  - Modify: `fetchMonthData(anioInitStr: string, anioFinStr: string, idema: string): Promise<MonthData[]>` - fetches, decodes, maps the DTO (splitting `fecha` into `month`/`year`, parsing numeric strings) and (in Phase 2) persists.
  - Create (Phase 2): `updateMonthData(monthData: MonthData[]): Promise<void>` in `app/lib/infrastructure/updateMonthData.ts`.
- **Domain**: no changes to `MonthData` (reuse `createMonthData` factory).
- **Database**: no schema changes; reuse existing `data_monthly` table.
- **Tests / UI text**: none in scope (no test framework configured; no UI change).

## 🪜 Phases (Intermediate)

**Phase 1: Fetch, parse & map `MonthData[]` (happy path)**

- [x] Add to `fetchMonthData.ts`: two-step AEMET fetch builder for the monthly endpoint (`preFetch` → `data.datos`) with the three path params.
- [x] Decode response with `new TextDecoder('iso-8859-1')` (existing convention).
- [x] Map each `monthDataDTO` to a `MonthData` via `MonthData.createMonthData`, deriving `month`/`year` from `fecha` and parsing numeric strings.
- [x] Return `Promise<MonthData[]>`.
- [x] Verify: `pnpm lint`, `pnpm format:check`, `pnpm build`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do not proceed until the user asks.

**Phase 2: Persistence via `updateMonthData`**

- [x] Create `app/lib/infrastructure/updateMonthData.ts` with `updateMonthData(monthData: MonthData[]): Promise<void>` using `prisma.data_monthly` (delete/replace pattern analogous to `updateStations`).
- [x] Wire it into `fetchMonthData` so the happy path persists end-to-end.
- [x] Verify: `pnpm lint`, `pnpm format:check`, `pnpm build`. Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages. Do not proceed until the user asks.

## ⏭️ Next step

All phases are complete. The remaining step is to commit Phase 2 (or the whole task) once the user reviews the changes.

---

Data safely stored thanks to [Codely](https://codely.com) AI tooling. 🐢 💨 🥇 🗄️
