---
name: 'redesign-how-it-works-steps'
description: "Redesign the 'Cómo funciona' banner into a graphical section showing the 3 usage steps with custom inline SVG icons, stacked vertically inside the existing 30% column"
created_at: '2026-09-28T00:00:00Z'

created_by:
  tool: 'OpenCode'
  model:
    name: 'Qwen'
    version: '3.8 Flash'
    reasoning_effort: 'medium'

implemented_by:
  tool: 'OpenCode'
  model:
    name: 'Qwen'
    version: '3.8 Flash'
    reasoning_effort: 'medium'

last_implementation_at: '2026-09-28T23:20:00Z'
has_completed_all_phases: 'true'
---

# Redesign the "Cómo funciona" banner as a graphical 3-step section

## 🎯 Goal

Replace the plain `Alert` in `HowItWorksBanner` with a graphical section that presents the three usage steps vertically, each with a custom inline SVG icon and a step badge. Keep the existing mount point, visibility rule, and column width untouched so the section stays aligned with the search form.

## 👀 Context

- [`app/components/HowItWorksBanner.tsx`](../../app/components/HowItWorksBanner.tsx): current zero-props server component rendering `<Box w={{ base: '90%', md: '30%' }} mx="auto" mb="lg">` around a `<Alert color="blue" title="Cómo funciona">` with a single body paragraph. No icon library exists in the repo (`package.json` has no `@tabler/icons-react` or `lucide-react`), so icons will be hand-written inline SVG.
- [`app/components/SearchSection.tsx`](../../app/components/SearchSection.tsx): mounts the banner at line 108 via `{!hasSearched && <HowItWorksBanner />}`, directly above the form `<Stack w={{ base: '90%', md: '30%' }} mx="auto">`. This mount point and the `hasSearched` logic stay unchanged.
- [`app/components/SearchSection.test.tsx`](../../app/components/SearchSection.test.tsx):
  - `renders the how-it-works banner and the missing-data info section` (line 104): asserts `getByText('Cómo funciona')` and the full current body string (lines 108-112). The full-string assertion must be rewritten into three per-step assertions.
  - `hides the how-it-works banner after the first search while keeping the missing-data info section` (line 122): asserts `queryByText('Cómo funciona')` is absent after a search. Survives as long as the title string is kept.
- Conventions to follow (derived from existing code and plans [`2026_09_27-improve_ui_header_banner_footer`](../2026_09_27-improve_ui_header_banner_footer/2026_09_27-improve_ui_header_banner_footer-plan.md) and [`2026_09_28-center_header_and_match_section_widths`](../2026_09_28-center_header_and_match_section_widths/2026_09_28-center_header_and_match_section_widths-plan.md)):
  - Mantine ^9.5.1, props-based styling, named function exports, server components unless hooks/state are needed (`HowItWorksBanner` stays a server component, no `'use client'`).
  - Responsive width pattern `w={{ base: '90%', md: '30%' }} mx="auto"` shared by the form, banner, and `MissingDataInfo`. The new section keeps `md: '30%'` and stacks steps vertically.
  - Raw CSS-variable borders via `style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}`, precedent in `Header.tsx:9` and `Footer.tsx:10`.
  - [`agents/skills/mantine/SKILL.md`](../../agents/skills/mantine/SKILL.md) points to `https://mantine.dev/llms.txt` for Mantine API guidance.
  - Verification commands: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm format:check`.

### Public contracts

**UI text copies** (Spanish, replacing the current single paragraph):

- Section title: `"Cómo funciona"` (unchanged).
- Step 1: badge `1`, map-pin SVG icon, text `"Selecciona una estación meteorológica"`.
- Step 2: badge `2`, calendar SVG icon, text `"Indica el periodo de meses que quieres consultar"`.
- Step 3: badge `3`, comparison-arrows SVG icon, text `"Introduce el número de años para comparar con el mismo periodo del pasado (opcional)"`.

**Component contract** (internal, unchanged surface):

- `HowItWorksBanner`: named export, zero props, server component. Same file, same mount point in `SearchSection.tsx`.

**Test suite contract** (`SearchSection.test.tsx`):

- Existing test `renders the how-it-works banner and the missing-data info section`: keep the `Cómo funciona` title assertion, replace the full-paragraph assertion with three assertions, one per step text.
- Existing test `hides the how-it-works banner after the first search...`: unchanged, keeps passing via the preserved title string.
- All other existing assertions keep passing.

## 🪜 Phases

### Phase 1: Graphical 3-step "Cómo funciona" section

Brief description: Rewrite `HowItWorksBanner` as a card with three vertically stacked steps (inline SVG icon + numbered badge + text per step), update the split copy, and adjust `SearchSection.test.tsx` accordingly. Single vertical slice: component, copy, and tests land together with the app building and all tests green.

To-do actions:

- [x] Rewrite [`app/components/HowItWorksBanner.tsx`](../../app/components/HowItWorksBanner.tsx) as a zero-props server component that keeps the outer `<Box w={{ base: '90%', md: '30%' }} mx="auto" mb="lg">` wrapper and a visible `"Cómo funciona"` heading, replacing the `Alert` body with a `<Stack>` of three step rows.
- [x] Define a small internal `Step` helper (same file) rendering one row: rounded icon container (SVG inside, `color="blue"` tones via Mantine props or CSS variables), numbered badge, and step text. Separate consecutive rows with the `var(--mantine-color-default-border)` divider precedent from Header/Footer.
- [x] Hand-write three inline SVG icons in the same file (no new dependencies), each accepting a `size` prop and using `stroke="currentColor"` so Mantine color props apply:
  - Map pin / location marker for step 1.
  - Calendar for step 2.
  - Two opposing arrows (comparison) for step 3.
- [x] Set the three step texts exactly as the public contracts specify (Spanish copies, including the `(opcional)` suffix on step 3).
- [x] Update [`app/components/SearchSection.test.tsx`](../../app/components/SearchSection.test.tsx): in the test `renders the how-it-works banner and the missing-data info section`, keep the `getByText('Cómo funciona')` assertion and replace the full-paragraph assertion with one `getByText(...)` per step text. Leave the hide-after-search test and all other tests untouched.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification commands: `pnpm lint`, `pnpm exec tsc --noEmit`, `pnpm test`, `pnpm format:check` (run `pnpm format` first if `format:check` fails). Fix issues if any.
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

## ⏭️ Next step

All phases are complete. Review the changes and commit them.

One graphical three-step guide now shines on the search page, delivered by 🐢 💨 (Turbotuga™, [Codely](https://codely.com)'s mascot) with a ✨ spark of polish.
