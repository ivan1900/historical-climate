---
name: 'add-not-scientific-study-disclaimer'
description: "Add a 'this is not a scientific study' disclaimer to the home page banner and the footer"
created_at: '2026-10-03T13:09:01Z'

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

last_implementation_at: '2026-10-03T13:12:36Z'
has_completed_all_phases: 'true'
---

# Add "not a scientific study" disclaimer

## Goal

Make it clear to users that the app is a personal outreach tool, not a scientific study. Show a disclaimer note inside the "Cómo funciona" banner on the home page (only before searching) and a short permanent line in the footer.

## Context

- [app/components/HowItWorksBanner.tsx](../../app/components/HowItWorksBanner.tsx): server component rendered by [SearchSection.tsx](../../app/components/SearchSection.tsx) when `!hasSearched`. Outer `Box` uses `w={{ base: '90%', md: '30%' }} mx="auto" mb="lg"`, inner `Stack` is a bordered card (`var(--mantine-color-default-border)`, `var(--mantine-radius-md)`) with a `Title` and three `Step` rows. The disclaimer note goes as a fourth unnumbered element inside the same bordered `Stack`, so it inherits banner width and styling.
- [app/components/Footer.tsx](../../app/components/Footer.tsx): currently one `<Text size="sm" c="dimmed">` line with the AEMET attribution inside `<Container size="lg">`. The new short line goes right below it with `size="xs" c="dimmed"`.
- [app/components/MissingDataInfo.tsx](../../app/components/MissingDataInfo.tsx): closest existing pattern for an info card (`Text fw={600} size="sm"` title plus `Text size="xs" c="dimmed"` body, hand-rolled inline styles with `var(--mantine-*)` CSS variables). Icons in this codebase are hand-rolled inline SVGs (no `@tabler/icons`, no `ThemeIcon`).
- Tests: Vitest + `@testing-library/react` + `jest-dom`. Convention per component test file: local `renderX()` helper wrapping the component in `<MantineProvider>`, `describe`/`it`, assertions with `screen.getByText(...)` / `getByRole('heading', ...)`. See [Footer.test.tsx](../../app/components/Footer.test.tsx) and [Header.test.tsx](../../app/components/Header.test.tsx). `HowItWorksBanner` has no test file yet.
- Conventions doc: `AGENTS.md` points to `.agents/skills/mantine/SKILL.md`, which only refers to https://mantine.dev/llms.txt for Mantine context. Follow the existing component patterns above.
- Verification commands (pnpm): `pnpm test`, `pnpm lint`, `pnpm format:check`, `pnpm exec tsc --noEmit` (the typecheck run by CI).

### Public contracts: user-facing copy (approved with the user)

- Home banner note (inside `HowItWorksBanner` card, unnumbered, `dimmed`, with a hand-rolled info icon):
  > Esta es una herramienta de divulgación personal. Los datos se muestran tal cual los publica AEMET, sin validación ni tratamiento adicional. No es un estudio científico ni pretende serlo.
- Footer line (below the AEMET attribution):
  > Proyecto personal de divulgación. No es un estudio científico ni pretende serlo.

## Phases

### Phase 1: Disclaimers on home banner and footer (with tests)

Vertical slice: both user-facing disclaimers and their test coverage, end to end.

- [x] Add the disclaimer note as a fourth element inside the bordered `Stack` of `HowItWorksBanner.tsx`. Render it as an unnumbered row (hand-rolled inline SVG info icon in a circular badge, following the existing `Step` badge pattern but without the number), using `Text size="xs" c="dimmed"` for the body. The exact copy must match the public contract above ("Esta es una herramienta de divulgación personal...").
- [x] Add the short disclaimer line in `Footer.tsx` below the AEMET attribution: `<Text size="xs" c="dimmed">Proyecto personal de divulgación. No es un estudio científico ni pretende serlo.</Text>`.
- [x] Create `app/components/HowItWorksBanner.test.tsx` following the local `renderBanner()` + `MantineProvider` convention:
  - `it('renders the three usage steps')`: assert the `Cómo funciona` heading and the three existing step texts.
  - `it('renders the not-a-scientific-study disclaimer')`: assert the new home copy is in the document.
- [x] Extend `app/components/Footer.test.tsx`:
  - keep the existing `it('attributes the data to AEMET')` passing untouched.
  - add `it('renders the personal project disclaimer')`: assert the new footer copy is in the document.
- [x] Check `app/page.test.tsx` and `app/components/SearchSection.test.tsx` for any assertions that could break with the new banner content; adjust only if needed. (No adjustments needed: all assertions use exact strings that do not collide with the new copy.)
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification commands: `pnpm test`, `pnpm lint`, `pnpm format:check` and `pnpm exec tsc --noEmit`. Fix issues if any. (29 tests pass, lint clean, tsc clean, format clean for all touched files. Note: `app/components/SearchSection.test.tsx` has a pre-existing `oxfmt` formatting issue unrelated to this change, left untouched.)
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

## Next step

All phases are complete: review the changes and commit them.

Disclaimers shipped straight from the shell, no lab coat required 🐢 💨 🔬🚫 ([Codely](https://codely.com)'s Turbotuga™ on duty)
