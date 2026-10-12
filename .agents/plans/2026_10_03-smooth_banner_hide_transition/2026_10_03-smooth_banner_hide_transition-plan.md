---
name: 'smooth_banner_hide_transition'
description: 'Hide the HowItWorksBanner with a smooth Collapse transition when it disappears after a search instead of unmounting abruptly'
created_at: '2026-10-03T19:45:55Z'

created_by:
  tool: 'OpenCode'
  model:
    name: 'Qwen3.8 Flash'
    version: 'flash'
    reasoning_effort: 'medium'

implemented_by:
  tool: 'OpenCode'
  model:
    name: 'Qwen3.8 Flash'
    version: 'flash'
    reasoning_effort: 'medium'

last_implementation_at: '2026-10-03T19:56:36Z'
has_completed_all_phases: 'true'
---

# Smooth banner hide transition

## Goal

When the informational "Cómo funciona" banner is hidden after a search, it should disappear with a smooth animation instead of vanishing abruptly. The current hide timing stays unchanged: the banner collapses when the search results arrive (when `hasSearched` becomes `true`).

## Context

- [app/components/SearchSection.tsx](../../../app/components/SearchSection.tsx): client component holding the search form and the `hasSearched` state (line 30). The banner is rendered with abrupt conditional rendering at line 108: `{!hasSearched && <HowItWorksBanner />}`. `setHasSearched(true)` runs inside `startTransition` after the awaited server function call (line 82). The "Buscar" button is the form submit button at lines 152-154.
- [app/components/HowItWorksBanner.tsx](../../../app/components/HowItWorksBanner.tsx): server component rendering the banner as a plain `Box` + `Stack` card (`Box w={{ base: '90%', md: '30%' }} mx="auto" mb="lg"`). Wrapping it in a `Collapse` from the client side works fine; no changes are needed inside it except if spacing adjustments are required.
- [app/components/MissingDataInfo.tsx](../../../app/components/MissingDataInfo.tsx): existing convention precedent. It already animates show/hide with Mantine `Collapse` (`<Collapse expanded={expanded}>`, line 185). Use the same primitive here.
- [app/components/SearchSection.test.tsx](../../../app/components/SearchSection.test.tsx): the test `'hides the how-it-works banner after the first search'` (line 132) asserts removal from the document. With `Collapse` the content may remain mounted while animating, so this assertion needs review.
- [e2e/home.spec.ts](../../../e2e/home.spec.ts): references the "Buscar" button (lines 34 and 56). Check it keeps passing if it asserts banner visibility.
- [AGENTS.md](../../../AGENTS.md) and [.agents/skills/mantine/SKILL.md](../../../.agents/skills/mantine/SKILL.md): the Mantine skill points to `https://mantine.dev/llms.txt` for component context. Consult it when implementing. Mantine version in use is `@mantine/core` 9.5.1. There is no animation library (no framer-motion) and no theme transition customization; do not add new dependencies.
- Verification commands (from `package.json`): `pnpm lint` (oxlint), `pnpm format:check` (oxfmt), `pnpm test` (vitest), `pnpm build` (typecheck via Next.js build).

Public contracts affected:

- Test suite `SearchSection.test.tsx`: the banner-hiding scenario changes semantics (animated collapse instead of instant unmount) and must be updated accordingly.
- UI behavior: the banner visibly collapses smoothly when the search completes. No user-facing text changes.

## Phases

### Phase 1: Animated banner collapse (vertical slice)

Wrap the banner in a Mantine `Collapse` driven by `hasSearched`, adapt the tests, and verify everything passes end to end.

To-do actions:

- [x] In `SearchSection.tsx`, replace `{!hasSearched && <HowItWorksBanner />}` with `<Collapse expanded={!hasSearched}>...</Collapse>` (import `Collapse` from `@mantine/core`; Mantine 9 uses the `expanded` prop), following the precedent in `MissingDataInfo.tsx`. Keep the current hide timing: collapse starts when `setHasSearched(true)` runs after the search resolves.
- [x] Verify the collapsed banner leaves no residual spacing: the `mb="lg"` lives on the `Box` inside `HowItWorksBanner`, so check whether the margin remains visible after the collapse finishes and, if so, move the spacing to a wrapper in `SearchSection.tsx` (also animated or conditionally applied) so the layout settles cleanly once the banner is gone.
- [x] Update `SearchSection.test.tsx`: adapt `'hides the how-it-works banner after the first search'` to the `Collapse` behavior (content stays in the DOM during/after the animation unless unmounted by Mantine). Assert the collapsed/hidden state with a visibility-oriented assertion (`expect(...).not.toBeVisible()` with `toBeVisible` accounting for `height: 0`, or query the Collapse wrapper state) that is deterministic under jsdom. If the current `not.toBeInTheDocument()` assertion still holds after the animation completes, leave it and instead add coverage that the transition wrapper exists.
- [x] Run the affected e2e specs (`pnpm e2e`, at least `e2e/home.spec.ts`) if the local environment allows; adjust only if they assert the banner disappears instantly.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification command (look it up in the AGENTS.md file or the project configuration). Fix issues if any. Concretely: `pnpm lint`, `pnpm format:check`, `pnpm test`, `pnpm build`.
- [x] STOP. Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

## Next step

All plan phases are implemented; the only step left is reviewing the presented changes and committing them.

Phase 1 collapsed and landed smoothly thanks to 🐢 💨 (Turbotuga™, [Codely](https://codely.com)'s mascot).
