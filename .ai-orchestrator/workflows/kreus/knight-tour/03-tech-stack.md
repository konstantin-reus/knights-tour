---
agent: tech-stack
sequence: 3
references: ["research"]
summary: "The stack is TypeScript 5.x on Vite 6.x with no frontend framework, using CSS Grid for chessboard rendering and Vitest 4.x for testing. This minimalist stack was selected to match the project's small, fixed scope (64 DOM elements, 4 counters, 1 slider) with zero framework runtime overhead. The primary trade-off accepted is manual DOM updates instead of framework-provided reactivity, which adds ~16 lines of code but eliminates all framework learning curve and runtime cost."
---

## Stack Overview

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Language | TypeScript | 5.x | Primary implementation language with static typing |
| Runtime | Browser (Chrome) | latest | Client-side execution — no server runtime needed |
| Build Tool | Vite | 6.x | Dev server, HMR, TypeScript transpilation, production bundling |
| Rendering | CSS Grid + HTML DOM | native | 8×8 chessboard layout and cell management |
| Testing | Vitest | 4.x | Unit tests for algorithm logic and DOM assertions |
| Testing DOM | jsdom | latest | Simulated browser environment for Vitest DOM tests |
| Package Manager | npm | 10.x | Dependency management (ships with Node.js) |

This stack follows a "no-framework" philosophy: the browser's native DOM APIs handle all rendering and interaction, Vite handles the build pipeline, and TypeScript provides type safety. There are zero runtime dependencies shipped to the browser — the production bundle contains only application code.

The stack naturally supports the vision's guiding principle of separating algorithm and presentation. The algorithm is a pure TypeScript module with no DOM imports, testable in Vitest's Node environment. The rendering layer uses standard DOM manipulation (`element.textContent`, `element.classList`) to update the CSS Grid board. These two layers communicate through a simple interface — the algorithm produces coordinates, the renderer updates cells.

This matches the project's fixed scope: 64 grid cells, 1 knight element, 4 text counters, and 1 range slider. At this scale, a framework's component lifecycle, virtual DOM, or reactivity system adds complexity without measurable benefit. Manual DOM updates for 4 counter values require ~16 lines of code — the exact amount of code a framework would save. The framework's own learning curve, configuration, and runtime cost far exceed this saving.

## Selection Criteria

| Criterion | Weight | Source | Definition |
|-----------|--------|--------|------------|
| Resource Efficiency | 5 | Vision G-5, Context Success Criteria | The stack must not cause the Chrome tab to exceed 200MB memory or become unresponsive over 64 traversals |
| Implementation Simplicity | 5 | Context "Having fun", Vision G-6 | The fewest concepts, dependencies, and configuration required to achieve the project's goals |
| Setup Speed | 4 | Vision G-6 | Developer can clone, install, and run with at most 2 shell commands in under 60 seconds |
| Algorithm-Presentation Separation | 4 | Vision Guiding Principle 4 | The stack must support implementing the algorithm as a pure module independent of rendering |
| Testability | 3 | Vision G-1, G-2, G-3 (correctness) | The stack must support automated testing of both pure algorithm logic and DOM rendering |
| Chrome Compatibility | 3 | Context "Google Chrome browser" | All stack components must produce output that runs in the latest Chrome without polyfills |
| Bundle Size | 2 | Vision G-5 | The production bundle should be as small as possible — no unnecessary runtime code |

## Language and Runtime

- **Selected**: TypeScript 5.x
- **Runtime**: Google Chrome (latest) — client-side only. Node.js 22.x required for local development (Vite dev server, Vitest).
- **Type System**: Static — TypeScript's type system catches coordinate-out-of-bounds errors, ensures the board state array has the correct dimensions, and types the knight's move offsets (dx, dy pairs). This matters because the Knight's Tour algorithm manipulates a 2D array with 8 directional offsets — off-by-one errors are the most common bug in such code.
- **Rationale**:
  1. Static typing prevents coordinate and array-index errors in the Warnsdorf algorithm (Criterion: Implementation Simplicity — fewer runtime bugs to debug)
  2. Vite natively transpiles TypeScript with zero configuration (Criterion: Setup Speed — no separate tsc build step needed)
  3. The DOM API has comprehensive TypeScript type definitions via `lib.dom.d.ts` (Criterion: Chrome Compatibility — native support)
  4. Vitest natively supports TypeScript test files (Criterion: Testability — no transpilation config for tests)
- **Ecosystem Fit**: TypeScript's built-in `lib.dom.d.ts` provides typed access to all DOM APIs needed: `document.createElement`, `HTMLElement.classList`, `HTMLInputElement.value`. No additional type packages needed.
- **Team Impact**: Standard web development language. No specialized framework knowledge required. A developer familiar with JavaScript can read and modify TypeScript immediately.
- **Risks**: TypeScript adds a transpilation step, but Vite handles this transparently. The developer must have Node.js installed for the build toolchain — this is stated as acceptable in the project context (local machine execution).
- **Criterion Scores**:

| Criterion | Score (1-5) | Notes |
|-----------|-------------|-------|
| Resource Efficiency | 5 | No runtime overhead — TypeScript compiles to plain JavaScript |
| Implementation Simplicity | 5 | Standard language, native DOM types |
| Setup Speed | 5 | Vite transpiles TS with zero config |
| Algorithm-Presentation Separation | 5 | Pure TS modules with no DOM dependency are natural |
| Testability | 5 | Vitest runs TS natively |
| Chrome Compatibility | 5 | Compiles to ES modules supported by Chrome |
| Bundle Size | 5 | Type annotations stripped at build time — zero runtime cost |

## Framework Selection

### 4.1 Vite (Build Tool)

- **Purpose**: Development server with HMR, TypeScript transpilation, and production bundling
- **Selected**: Vite 6.x
- **Rationale**: Vite's `vanilla-ts` template provides the exact project scaffolding needed: `index.html` entry point, `src/main.ts`, `tsconfig.json`, and a dev server — all in one `npm create vite` command. Dev server starts in <300ms (research Finding 3.5). Vite is the build tool that Vitest is built on, ensuring zero-config test integration. Selected over Webpack (slower dev server, more configuration), Parcel (smaller ecosystem, less TypeScript integration), and esbuild alone (no dev server or HMR).
- **Integration**: Vite reads `tsconfig.json` for TypeScript settings, serves `index.html` as the entry point, and resolves ES module imports natively. Vitest shares Vite's config via `vitest.config.ts` extending `vite.config.ts`.
- **Configuration Approach**: Use Vite's defaults. The only custom configuration is adding Vitest settings to `vite.config.ts`. No plugins required.
- **Risks**: Vite 6.x targets Baseline Widely Available browsers. Chrome is well within this baseline. No risk for this project.

### 4.2 CSS Grid (Rendering — native, no library)

- **Purpose**: Layout engine for the 8×8 chessboard
- **Selected**: CSS Grid (native browser feature, no version — supported since Chrome 57)
- **Rationale**: CSS Grid's `display: grid; grid-template-columns: repeat(8, 1fr)` creates an 8×8 board with ~10 lines of CSS (research Finding 3.2). Each cell is a `<div>` with native text content for move numbers, native `classList` for visited/current state, and native event handling. Selected over SVG (more verbose setup, requires viewBox coordinate management — research Finding 3.3) and Canvas (requires manual drawing, hit detection, and HiDPI scaling — research Finding 3.4).
- **Integration**: Standard CSS applied to HTML `<div>` elements created by TypeScript. No library integration needed.
- **Configuration Approach**: CSS defined in `src/style.css`, imported by Vite from `src/main.ts`.
- **Risks**: CSS Grid does not provide smooth position-animated transitions between grid cells. The knight's movement will be rendered as discrete cell placement (knight appears in the new cell) rather than sliding animation. This is acceptable per the vision's scope — the project visualizes the traversal path, not a physics simulation. If smooth sliding is later desired, absolute positioning within the grid container can be used.

### 4.3 Vitest (Testing Framework)

- **Purpose**: Unit testing for algorithm correctness and DOM rendering validation
- **Selected**: Vitest 4.x
- **Rationale**: Vitest integrates natively with Vite — it shares the same config, transformer, and module resolution (research Finding 3.8). Provides a Jest-compatible API (`describe`, `it`, `expect`) with zero additional configuration. Supports both `node` environment (for pure algorithm tests) and `jsdom` environment (for DOM tests). Selected over Jest (requires separate TypeScript configuration via ts-jest or babel, does not share Vite's module resolution) and over Playwright/Cypress (heavyweight browser testing tools designed for E2E testing, overkill for this project's unit test needs).
- **Integration**: Install as dev dependency. Add `test` script to `package.json`. Configure `jsdom` environment in `vitest.config.ts`. Test files use `.test.ts` suffix and are co-located with source files or in a `test/` directory.
- **Configuration Approach**: Extend `vite.config.ts` with Vitest test settings. Use `jsdom` as the default test environment to support both algorithm and DOM tests in the same config.
- **Risks**: Vitest's `jsdom` environment simulates the DOM but does not run CSS Grid layout — tests cannot verify visual grid positioning. This is acceptable because the algorithm and counter logic can be fully tested without CSS layout. Visual layout verification is done manually in Chrome.

## Data Layer

Not applicable. This project is a stateless client-side visualization. All state (board array, visited set, counters) is held in JavaScript memory during the page session. No persistent storage, database, or caching layer is needed. Data is ephemeral — refreshing the page resets all state, which is the expected behavior per the vision's scope boundaries.

## Infrastructure and Deployment

### 6.1 Local Development Server (Vite)

- **Purpose**: Serve the application during development with hot module replacement
- **Selected**: Vite's built-in dev server (included with Vite 6.x)
- **Rationale**: The context specifies "the solution can be executed on a local machine." Vite's dev server starts in <300ms, serves files over localhost, and provides HMR for instant feedback. No separate web server, Docker container, or cloud deployment is needed.
- **Integration**: Built into Vite — `npm run dev` starts the server on `http://localhost:5173`.
- **Cost Model**: Free — included with Vite (MIT license).
- **Risks**: No production deployment target is specified. If deployment is later needed, `npm run build` produces a static `dist/` folder that can be served by any static file host (GitHub Pages, Netlify, Vercel) with zero additional configuration.

No CI/CD pipeline, containerization, or monitoring/logging infrastructure is selected. The context specifies local execution only, and the project's scope does not include deployment to a shared environment.

## Developer Tooling

| Tool | Purpose | Selected | Rationale |
|------|---------|----------|-----------|
| Package Manager | Dependency management | npm 10.x | Ships with Node.js — no additional install. The project has 2 dev dependencies (Vite, Vitest) and 0 runtime dependencies, so npm's performance is indistinguishable from pnpm or yarn at this scale. Selected over pnpm (additional install step) and yarn (additional install step). |
| Build Tool | Dev server + bundling | Vite 6.x | <300ms dev server, native TS support, Vitest integration. See Section 4.1. |
| Test Runner | Test execution | Vitest 4.x | Native Vite integration, Jest-compatible API, jsdom support. See Section 4.3. |
| Type Checker | Static analysis | TypeScript 5.x (tsc) | Included with Vite's TypeScript support. Run `tsc --noEmit` for full type checking. Vite only transpiles (strips types) without type checking for speed; `tsc` provides the full check. |
| Linter | Code quality | None (deferred) | For a project with ~5 source files and a single developer, a linter adds configuration overhead without proportional benefit. TypeScript's type system catches the most impactful errors. ESLint can be added in version 2 if the project grows. |
| Formatter | Code style | None (deferred) | Single-developer project with ~5 files. Consistent formatting is achievable manually. Prettier can be added in version 2 if collaboration begins. |

## Compatibility Matrix

| Technology A | Technology B | Compatibility | Notes |
|-------------|-------------|---------------|-------|
| TypeScript 5.x | Vite 6.x | Confirmed | Vite uses esbuild for TS transpilation — native support, zero config |
| TypeScript 5.x | Vitest 4.x | Confirmed | Vitest uses Vite's transformer — native TS support in test files |
| Vite 6.x | Vitest 4.x | Confirmed | Vitest is built on Vite — shares config, resolver, and transformer |
| Vite 6.x | npm 10.x | Confirmed | Vite scaffolded via `npm create vite`, installed via `npm install` |
| Vite 6.x | Chrome (latest) | Confirmed | Vite output targets Baseline Widely Available browsers; Chrome is included |
| TypeScript 5.x | jsdom (latest) | Confirmed | jsdom provides DOM types compatible with TypeScript's `lib.dom.d.ts` |
| Vitest 4.x | jsdom (latest) | Confirmed | jsdom is a first-class Vitest environment via `environment: 'jsdom'` config |
| CSS Grid | Chrome (latest) | Confirmed | CSS Grid supported since Chrome 57 (2017) |
| Vite 6.x | Node.js 22.x | Confirmed | Vite 6.x requires Node.js 20.19+ or 22.12+ |

No compatibility caveats identified. All technologies are mature, use standard interfaces, and have been tested together in widely-used project templates (Vite `vanilla-ts` template).

## Rejected Alternatives

| Rejected Technology | Role | Reason for Rejection | Would Reconsider If |
|--------------------|------|---------------------|---------------------|
| Svelte 5 | Frontend framework | Adds `.svelte` file format learning curve and compilation abstraction for a project with only 3 UI sections and ~4 reactive values. The ~16 lines of code saved by Svelte's reactivity do not justify the additional conceptual overhead (research Finding 3.6, Criterion: Implementation Simplicity, weight 5). | The project scope expanded to 10+ interactive components or required complex state management |
| React 19 | Frontend framework | 44.5 KB gzipped runtime overhead is disproportionate for an application with 64 DOM elements and 4 counters. Virtual DOM diffing provides zero measurable benefit at this DOM size (research Finding 3.7, Criterion: Bundle Size, weight 2; Criterion: Resource Efficiency, weight 5). | The project required integration with an existing React ecosystem or grew to dozens of interactive components |
| SVG | Chessboard rendering | More verbose than CSS Grid for an 8×8 grid layout — requires `viewBox` setup, XML namespace, and explicit coordinate positioning for text. Resolution independence is unnecessary for a fixed-size desktop Chrome application (research Comparison Matrix, Criterion: Implementation Simplicity, weight 5). | The project required custom vector graphics, resolution-independent rendering across diverse devices, or needed a crisp SVG knight piece |
| HTML5 Canvas | Chessboard rendering | Requires manual drawing, hit detection, HiDPI scaling, and text rendering for a 64-element grid. Canvas provides no performance advantage over DOM at this element count while requiring 4× more setup code (research Finding 3.4, Criterion: Implementation Simplicity, weight 5). | The project required rendering thousands of elements simultaneously or needed complex real-time graphics (particle effects, physics) |
| Jest | Testing framework | Requires separate TypeScript configuration (ts-jest or babel-jest) and does not share Vite's module resolution. Vitest provides the same API with native Vite integration (research Finding 3.8, Criterion: Setup Speed, weight 4). | The project needed a testing framework with a larger ecosystem of plugins or required compatibility with an existing Jest test suite |
| pnpm | Package manager | Requires a separate installation step (`npm install -g pnpm`). The project has 2 dev dependencies — npm and pnpm are indistinguishable in performance at this scale (Criterion: Setup Speed, weight 4). | The project grew to 50+ dependencies where pnpm's disk efficiency and strict mode provide measurable benefits |
