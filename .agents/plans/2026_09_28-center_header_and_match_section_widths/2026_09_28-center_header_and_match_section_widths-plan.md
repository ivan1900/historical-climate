---
name: 'center_header_and_match_section_widths'
description: 'Center the SearchSection heading, hide HowItWorksBanner after the first search, and align MissingDataInfo width with HowItWorksBanner (80%).'
created_at: '2026-09-28T20:25:04Z'

created_by:
  tool: 'OpenCode'
  model:
    name: 'MiniMax-M3'
    version: '1.0'
    reasoning_effort: 'medium'

implemented_by:
  tool: 'OpenCode'
  model:
    name: 'MiniMax-M3'
    version: '1.0'
    reasoning_effort: 'medium'

last_implementation_at: '2026-09-28T20:50:00Z'
has_completed_all_phases: 'true'
---

# 🎯 Goal

Polish the layout of the search section so that its inner heading reads as a centered title, the "How it works" helper disappears once the user has performed their first search, and the "Missing data" info section shares the same width as the rest of the content (80% on desktop).

# 👀 Context

The change is purely visual / presentational and lives entirely in the `app/components/` folder. Relevant files:

- [`app/components/SearchSection.tsx`](../../app/components/SearchSection.tsx): owns the section layout, the inner heading (`<Title order={1}>Clima histórico</Title>` at line 112), renders `HowItWorksBanner` unconditionally at line 108, and `MissingDataInfo` unconditionally at line 173. Holds the existing `hasSearched` state (line 30) that we will reuse to hide the banner.
- [`app/components/HowItWorksBanner.tsx`](../../app/components/HowItWorksBanner.tsx): the informational banner rendered above the form. Currently `w={{ base: '90%', md: '30%' }}`.
- [`app/components/MissingDataInfo.tsx`](../../app/components/MissingDataInfo.tsx): the bottom informational banner. Currently `w={{ base: '90%', md: '80%' }}` to match the chart.
- [`app/components/TemperatureChart.tsx`](../../app/components/TemperatureChart.tsx): uses `w={{ base: '90%', md: '80%' }}` (line 102), the reference width we want `MissingDataInfo` to match.
- [`app/components/SearchSection.test.tsx`](../../app/components/SearchSection.test.tsx): existing tests assert that both banners are present before any search (`renders the how-it-works banner and the missing-data info section`, line 105). The new behavior will need a test that confirms `HowItWorksBanner` disappears after a search while `MissingDataInfo` remains.
- [`app/page.test.tsx`](../../app/page.test.tsx) and [`app/components/Header.test.tsx`](../../app/components/Header.test.tsx): unaffected.

Conventions to follow:

- [`AGENTS.md`](../../AGENTS.md) points at `./agents/skills/mantine/SKILL.md` for Mantine UI guidance (note: this skill file is not present in the repo at the time of writing, so we rely on the existing Mantine v7 idioms already used in the codebase: `Box` + `w`/`mx`/`ta` props, `<Stack gap>`).
- Use Mantine `ta="center"` (Mantine prop alias for `text-align`) on the heading `Stack`, and reuse the existing `w`/`mx="auto"` pattern instead of introducing a new layout primitive.
- For hiding the banner, prefer conditional rendering (`{!hasSearched && <HowItWorksBanner />}`) over CSS visibility, matching the project's straightforward style.

# 🪜 Phases

## Phase 1: Center heading, hide banner after first search, align widths

### Description

End-to-end UI tweak in `SearchSection.tsx` plus the small width alignment in `MissingDataInfo.tsx`. After this phase the page reads as: centered inner title on the search section, helper banner that fades away once the user has actually searched, and a consistent 80% width for the bottom info section on desktop.

### To-do actions

- [x] In `app/components/SearchSection.tsx`, wrap the inner heading `<Title order={1}>` and its `<Text c="dimmed">` subtitle in a `Stack gap={4}` that is centered (`ta="center"` on the `Stack`).
- [x] In `app/components/SearchSection.tsx`, render `HowItWorksBanner` conditionally based on the existing `hasSearched` state so it disappears after the first search (e.g. `{!hasSearched && <HowItWorksBanner />}`).
- [x] In `app/components/MissingDataInfo.tsx`, change the outer `Box` width from `w={{ base: '90%', md: '80%' }}` to `w={{ base: '90%', md: '30%' }}` so it matches `HowItWorksBanner`.
- [x] In `app/components/SearchSection.test.tsx`, update the existing `renders the how-it-works banner and the missing-data info section` test (line 105) to reflect that the banner is still present before searching and to add an assertion that it is no longer present after a search is performed (using the existing `selectPeriodAndStation` helper). Also add or adjust assertions covering the centered heading if the heading structure changes meaningfully.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (look it up in the AGENTS.md file or the project configuration). Fix issues if any. (`pnpm lint` 0/0, `pnpm exec tsc --noEmit` clean, `pnpm test` 25/25 across 8 suites including the new `hides the how-it-works banner after the first search while keeping the missing-data info section`, `pnpm format:check` clean.)
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

# ⏭️ Next step

All phases are complete. Review the diff and commit when ready.

Headers aligned, banners balanced 🐢 💨 ✨ (Turbotuga™, [Codely](https://codely.com)'s mascot).
