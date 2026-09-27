---
name: 'improve-ui-header-banner-footer'
description: 'Improve the UI by adding a header, an explanatory banner above the form, an info section below the chart, and an AEMET-attribution footer.'
created_at: '2026-09-27T00:00:00Z'

created_by:
  tool: 'opencode'
  model:
    name: 'MiniMax-M3'
    version: '1.0'
    reasoning_effort: 'medium'

implemented_by:
  tool: 'opencode'
  model:
    name: 'MiniMax-M3'
    version: '1.0'
    reasoning_effort: 'medium'

last_implementation_at: '2026-09-27T23:42:43Z'
has_completed_all_phases: true
---

# Improve UI: header, banner, info section and footer

## 🎯 Goal

Improve the front page of `history-climate` with four new UI elements: a header with the site title, an explanatory banner above the form, an informational section below the chart about missing historical data, and a footer that attributes the data to AEMET.

## 👀 Context

Important files and folders:

- [app/layout.tsx](../../app/layout.tsx): root layout. Renders `<MantineProvider>` inside `<body className="flex min-h-full flex-col">`. Mounts Google fonts and the Mantine color scheme script. **This is the natural place to mount the new `<Header />` and `<Footer />` because `body` is already a vertical flex column.**
- [app/page.tsx](../../app/page.tsx): the only route. Renders `<SearchSection />` as its sole child.
- [app/components/SearchSection.tsx](../../app/components/SearchSection.tsx): the `'use client'` component that holds the form and the chart inside a single `<Box component="section" id="buscar" className="flex-1">`. **The banner will go above the inner `<Stack>` (inside the same section); the info section will go below `<TemperatureChart />` (still inside the same section).**
- [app/components/TemperatureChart.tsx](../../app/components/TemperatureChart.tsx): chart component. Unchanged structurally; we only add a sibling info section below it.
- [app/page.test.tsx](../../app/page.test.tsx) and [app/components/SearchSection.test.tsx](../../app/components/SearchSection.test.tsx): existing tests. They wrap with `<MantineProvider>`. **Existing assertions must still pass.** We'll add a couple of small assertions for the new strings.
- [app/globals.css](../../app/globals.css): only defines `--background` / `--foreground` CSS vars. Unchanged.
- [AGENTS.md](../../AGENTS.md): warns "This is NOT the Next.js you know" and points to `node_modules/next/dist/docs/` for Next.js conventions, and to [`.agents/skills/mantine/SKILL.md`](../../.agents/skills/mantine/SKILL.md) for Mantine. The Mantine skill says: "If you are an llm you can get context about mantine ui from: https://mantine.dev/llms.txt". **During implementation, fetch `https://mantine.dev/llms.txt` before writing Mantine JSX** so we use Mantine 9 conventions, not training-data ones.
- [package.json](../../package.json): Next 16.3.1, React 19.2.8, Mantine 9.5.1, Vitest + Testing Library. The verify commands are `pnpm lint`, `pnpm test`, `pnpm format:check`, and `pnpm build` (see "To-do actions").

Stack to follow:

- Mantine 9 (verify API at `https://mantine.dev/llms.txt`).
- Server components by default. `AppShell` / `<Notifications />` are _not_ needed for this task (the user asked for plain header, banner, info section and footer).
- Localization convention: the project is in Spanish (`lang="es"`, existing strings like "Clima histórico", "Buscar"). All new user-facing text stays in Spanish.
- Styling: prefer Mantine props (`w=`, `px=`, `py=`, `mx=`, `mt=`, `ta=`, etc.); Tailwind only for the existing loader overlay utility classes.

## 🪜 Phases

### Phase 1: Add header, banner, info section and footer

**Description.** Vertical slice covering all four new UI additions in one go: a `<Header />` at the top of the page, a `<Banner />` above the form, an informational section below the chart about missing data, and a `<Footer />` with AEMET attribution. Touches only UI; no backend, domain, or API contract changes. Updates existing tests so they still pass and asserts the new user-visible strings.

#### Public contracts

These are the only contracts that change (UI text copies shown to end users):

- **Header title:** `"Clima histórico de España"` (rendered as `<Title order={1}>` inside `app/components/Header.tsx`).
- **Header subtitle (small, dimmed):** `"Visualiza y compara la evolución del clima en cualquier estación meteorológica española."`.
- **Banner title:** `"Cómo funciona"`.
- **Banner body:** `"Selecciona una estación meteorológica, indica el periodo de meses que quieres consultar y, opcionalmente, introduce el número de años para compararlo con el mismo periodo del pasado."`.
- **Info-section title (below the chart):** `"¿Por qué no veo datos?"`.
- **Info-section body:** `"No todas las estaciones de AEMET disponen de datos históricos completos. Si no aparecen datos para el periodo seleccionado, prueba con otra estación o con un rango de meses diferente."`.
- **Footer attribution:** `"Datos obtenidos de AEMET — Agencia Estatal de Meteorología"`.

#### To-do actions

- [x] Create [`app/components/Header.tsx`](../../app/components/Header.tsx) as a **server component** (no `'use client'`), exporting `Header`. It renders a Mantine `<Box component="header" py="md" px={{ base: 'md', md: 'xl' }}>` containing a container with `<Title order={1}>Clima histórico de España</Title>` and the dimmed subtitle from the public contracts. Add a subtle bottom border using the Mantine 9 default-border CSS variable so the header visually separates from the content.
- [x] Create [`app/components/Footer.tsx`](../../app/components/Footer.tsx) as a **server component**, exporting `Footer`. It renders a Mantine `<Box component="footer" py="md" px={{ base: 'md', md: 'xl' }} ta="center">` containing `<Text size="sm" c="dimmed">Datos obtenidos de AEMET — Agencia Estatal de Meteorología</Text>`. Optionally add a top border for visual separation.
- [x] Create [`app/components/HowItWorksBanner.tsx`](../../app/components/HowItWorksBanner.tsx) as a **server component**, exporting `HowItWorksBanner`. It renders a Mantine `<Banner>` (or equivalent, per Mantine 9 docs) with the title `"Cómo funciona"` and the body copy from the public contracts. Wrap the banner in a `<Box w={{ base: '90%', md: '30%' }} mx="auto" mb="lg">` so it aligns with the form's column.
- [x] Create [`app/components/MissingDataInfo.tsx`](../../app/components/MissingDataInfo.tsx) as a **server component**, exporting `MissingDataInfo`. It renders a Mantine `<Alert>` (or equivalent, per Mantine 9 docs) with the title `"¿Por qué no veo datos?"` and the body copy from the public contracts. Wrap it in a `<Box mt="xl" w={{ base: '90%', md: '80%' }} mx="auto">` so it aligns with the chart's width.
- [x] Update [`app/layout.tsx`](../../app/layout.tsx) to import and render `<Header />` **before** `<MantineProvider>`'s `{children}` (so it sits at the top of `body`) and `<Footer />` **after** `{children}` (so it sits at the bottom). Because `body` already has `flex min-h-full flex-col` and `SearchSection`'s section has `flex-1`, the layout will expand correctly: header at top, content grows, footer at bottom.
- [x] Update [`app/components/SearchSection.tsx`](../../app/components/SearchSection.tsx) to:
  - Import the two new components and render `<HowItWorksBanner />` **above** the inner `<Stack>` (lines 124–130) but **inside** the existing `<Box component="section">` so spacing stays consistent. The existing `<Title order={1}>Clima histórico</Title>` and the dimmed subtitle at lines 124–130 can stay as the form's local heading (they describe the form, the global header describes the site).
  - Render `<MissingDataInfo />` **below** `<TemperatureChart />` (after line 190), still inside the same section, so it aligns with the chart.
- [x] Verify Mantine 9 API for `Banner` and `Alert` against `https://mantine.dev/llms.txt` before writing the JSX (do not rely on training data — Mantine 9 conventions may differ). _Result: Mantine 9 does not ship a `Banner` component — used `<Alert>` (color="blue") for the banner and `<Alert>` (color="gray") for the info section._
- [x] Update [`app/page.test.tsx`](../../app/page.test.tsx) to assert that the page renders the new header title (`Clima histórico de España`) and the footer attribution (`Datos obtenidos de AEMET — Agencia Estatal de Meteorología`). Keep existing assertions working. _Result: the page test renders `<Home />` without going through `layout.tsx`, so Header and Footer are not in scope there. Created dedicated `app/components/Header.test.tsx` and `app/components/Footer.test.tsx` instead, and left `page.test.tsx` unchanged._
- [x] Update [`app/components/SearchSection.test.tsx`](../../app/components/SearchSection.test.tsx) to assert that the banner copy (`Cómo funciona`) and the info-section copy (`¿Por qué no veo datos?`) are rendered. Keep all existing assertions working — they currently look for the form's `Clima histórico` title and that must still be present.
- [x] Verify the changes in terms of typechecking, linting and tests using the project's verification commands. From `package.json`: run `pnpm lint`, `pnpm test`, `pnpm format:check`, and `pnpm build`. Fix issues if any. _Result: lint clean (0/0), 24/24 tests pass across 8 files, build succeeds, format clean (after running `pnpm format` to auto-fix)._
- [x] **STOP.** Present the changes to the user for review and suggest commit messages (or pull request titles, when the phases are implemented through pull requests). Do NOT proceed to the next phase until the user explicitly asks.

## ⏭️ Next step

All phases are complete. Suggested next actions for the user:

- Review the diff (`git status` / `git diff`) and run `pnpm dev` to inspect the new header, banner, info section and footer visually.
- Commit the changes (suggested commit messages below).
- Export this conversation (using your IDE) and store it as `.agents/plans/2026_09_27-improve_ui_header_banner_footer/2026_09_27-improve_ui_header_banner_footer-conversation.md` for future reference.

UI chrome in place, all tests green. 🐢 💨 🎉 (Turbotuga™, [Codely](https://codely.com)'s mascot).
