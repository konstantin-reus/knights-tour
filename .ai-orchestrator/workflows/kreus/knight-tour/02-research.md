---
agent: research
sequence: 2
references: []
summary: "Researched Warnsdorf's rule behavior on 8x8 boards, chessboard rendering approaches (CSS Grid/DOM, SVG, Canvas), web build tooling (Vite + vanilla TypeScript, Svelte, React), and testing frameworks (Vitest). Primary recommendation: use Vite with vanilla TypeScript, CSS Grid for the board, and Vitest for testing — this combination meets all project requirements with minimal complexity and near-zero framework overhead."
---

## Research Objective

- **Topic**: Technology choices and algorithmic considerations for building a browser-based Knight's Tour visualization
- **Motivation**: The project context specifies "Choose technologies for implementation" as a constraint. The downstream tech-stack and architecture agents need evidence-based guidance on: (a) how Warnsdorf's rule behaves on an 8×8 board to inform algorithm design, (b) which rendering approach fits an 8×8 chessboard with step-by-step animation, (c) which build tooling and framework (if any) meets the project's goals of simplicity and fast local setup, and (d) which testing framework integrates with the chosen tooling.
- **Scope**: Included — Warnsdorf's rule success rates and tie-breaking strategies, browser rendering technologies for grid-based visualizations (CSS Grid/DOM, SVG, Canvas), frontend frameworks/tooling (Vite + vanilla TypeScript, Svelte, React), and testing frameworks (Vitest, Jest). Excluded — server-side technologies (not needed per vision), deployment platforms, CI/CD pipelines, alternative Knight's Tour algorithms (backtracking, neural network heuristics are out of scope per vision document).
- **Key Questions**:
  1. What is the success rate of Warnsdorf's rule on an 8×8 board across all 64 starting positions, and how does tie-breaking strategy affect it?
  2. Which browser rendering technology (CSS Grid/DOM, SVG, Canvas) is best suited for an 8×8 chessboard with step-by-step animation of ~64 elements?
  3. Is a frontend framework (Svelte, React) warranted for this project, or does vanilla TypeScript with Vite suffice?
  4. What is the minimal build tooling needed to achieve a 2-command local setup (install + dev server)?
  5. Which testing framework integrates natively with Vite and supports both pure algorithm tests and DOM assertions?

## Methodology

- **Sources**: Wikipedia (Knight's Tour), GeeksforGeeks (Warnsdorf algorithm implementation), arxiv.org paper 0803.4321 (Marateck, "How good is the Warnsdorff's knight's tour heuristic?"), SAS proceedings paper 3060-2015, Oregon State REU proceedings (Ganzfried, 2004), Vite official documentation (vite.dev), Vitest official documentation (vitest.dev), SVG Genie benchmarks (2025), JointJS blog (SVG vs Canvas), Tapflare web graphics comparison, Boris Smus performance analysis, SvelteScaling analysis, StacksFinder bundle size comparison, and DEV Community framework comparison articles.
- **Evaluation Criteria**: Performance at the project's scale (~64 DOM elements), developer complexity (lines of code, configuration required), bundle size overhead, framework learning curve, testing integration, Chrome compatibility, and alignment with the vision's guiding principles (separation of algorithm/presentation, resource discipline, zero-install experience).
- **Constraints**: Must run in Google Chrome on desktop. Must support local development with at most 2 shell commands. Must not require a backend server. The application has a small, fixed number of visual elements (~64 squares + 1 knight + 4 counters + 1 slider). The algorithm is computationally trivial (63 moves per traversal, each O(8) to evaluate).

## Findings

### 3.1 Warnsdorf's Rule on 8×8 Boards

- **Overview**: Warnsdorf's rule (1823) is a greedy heuristic for the Knight's Tour: at each step, move to the adjacent unvisited square that has the fewest onward moves to unvisited squares. It runs in O(N²) time where N is the board dimension — effectively linear in the number of squares.
- **Key Characteristics**:
  - With random tie-breaking, the success rate across all 64 starting positions on an 8×8 board is approximately 99% (based on Wikipedia and GeeksforGeeks synthesis of known results)
  - With deterministic tie-breaking (choosing the first minimum in iteration order), specific starting positions may fail. Using the less-than operator (LT) to select the first minimum fails on a small set of squares; using less-than-or-equal (LE) to select the last minimum fails on a different, mutually exclusive set of squares (b8, b7, c7, b6, b3 with LE per SAS paper 3060-2015)
  - Marateck (2008, arxiv 0803.4321) analyzed all 8! = 40,320 permutations of move ordering across all 64 starting squares and found success rates vary by permutation ordering, with the majority achieving >85% success
  - The algorithm completes in microseconds on modern hardware — the SAS paper reports ~0.07s for a 100×100 board
- **Maturity**: Production-ready. The algorithm has been studied since 1823 and implemented in every major programming language.
- **Ecosystem**: Hundreds of reference implementations exist on GitHub, GeeksforGeeks, Rosetta Code, and academic papers.
- **Compatibility**: Pure algorithmic logic; no platform dependencies. Implementable in any language including TypeScript.
- **Known Limitations**: Not guaranteed to find a complete tour from every starting position — it is a heuristic. Tie-breaking strategy is the critical factor. Incomplete tours (visiting fewer than 64 squares) will occur for a small percentage of starting positions depending on the tie-breaking method.
- **Evidence**: Wikipedia Knight's Tour article, GeeksforGeeks implementation guide, Marateck 2008 (arxiv 0803.4321), SAS paper 3060-2015, Oregon State REU proceedings (Ganzfried 2004).

### 3.2 Chessboard Rendering: CSS Grid/DOM

- **Overview**: CSS Grid is a native browser layout system that creates a 2D grid of HTML elements. For an 8×8 chessboard, this means 64 `<div>` elements arranged via `display: grid; grid-template-columns: repeat(8, 1fr)`. Each cell is a standard DOM element with native event handling, CSS styling, and accessibility.
- **Key Characteristics**:
  - Element count: 64 squares + ~1 knight overlay = ~65 DOM nodes — trivially small for any modern browser
  - Hardware-accelerated rendering and animation via CSS transitions/transforms
  - Native interactivity: `onclick`, `:hover`, CSS transitions require zero custom code
  - Text rendering (move numbers on cells) is native and accessible
- **Maturity**: Production-ready. CSS Grid has been supported in all major browsers since 2017 (Chrome 57+).
- **Ecosystem**: Part of the web platform — no library needed. Extensive MDN documentation.
- **Compatibility**: Fully compatible with Chrome, the project's target browser.
- **Known Limitations**: Not suitable for complex graphical rendering (particle effects, custom shapes). For this project's 64-square grid, this limitation is irrelevant.
- **Evidence**: MDN CSS Grid documentation, Tapflare web graphics comparison, Boris Smus performance analysis.

### 3.3 Chessboard Rendering: SVG

- **Overview**: SVG (Scalable Vector Graphics) is an XML-based format for defining 2D vector graphics. Each element is part of the DOM. For a chessboard, 64 `<rect>` elements plus text and a knight image would compose the visualization.
- **Key Characteristics**:
  - Resolution-independent — renders crisply at any zoom level or screen DPI
  - DOM-based: each element supports event handlers, CSS styling, and ARIA attributes
  - Native animation via CSS or SMIL
  - Knight piece can be rendered as an SVG path for crisp scaling
- **Maturity**: Production-ready. SVG has been supported in all major browsers since 2011.
- **Ecosystem**: Part of the web platform. Libraries like D3.js can manipulate SVG, but are not required for this project's scale.
- **Compatibility**: Fully compatible with Chrome.
- **Known Limitations**: Performance degrades with thousands of elements (>3,000–5,000 nodes per SVG Genie 2025 benchmarks). At 64 elements, this limitation is irrelevant. Slightly more verbose markup than CSS Grid for a simple grid layout.
- **Evidence**: SVG Genie benchmarks (2025), JointJS SVG vs Canvas blog, yworks.com visualization options analysis.

### 3.4 Chessboard Rendering: HTML5 Canvas

- **Overview**: Canvas provides a pixel-based immediate-mode drawing surface. Drawing commands render pixels directly; the browser does not retain a scene graph. All interactivity must be implemented manually via coordinate-based hit detection.
- **Key Characteristics**:
  - Excels at rendering thousands to millions of elements (AG Grid uses Canvas for 100,000+ cells)
  - No retained DOM nodes — lower memory footprint at extreme scale
  - Requires manual hit detection for click events
  - Text rendering is pixel-based (not selectable, not accessible by default)
  - Requires manual scaling for Retina/HiDPI displays
- **Maturity**: Production-ready. Canvas has been supported since Chrome 4 (2010).
- **Ecosystem**: Part of the web platform. Libraries like Konva.js and Fabric.js add interactivity, but add bundle size.
- **Compatibility**: Fully compatible with Chrome.
- **Known Limitations**: Black box to screen readers. Manual event handling adds code complexity. For 64 elements, Canvas provides no performance advantage over DOM/SVG while requiring significantly more implementation code.
- **Evidence**: Boris Smus canvas vs SVG performance analysis, LogRocket Canvas guide, Tapflare comparison.

### 3.5 Build Tooling: Vite + Vanilla TypeScript

- **Overview**: Vite is a build tool that provides instant dev server startup via native ES modules and production bundling via Rollup. The `vanilla-ts` template scaffolds a minimal TypeScript project with zero framework dependencies.
- **Key Characteristics**:
  - Setup: `npm create vite@latest my-app -- --template vanilla-ts` → 1 command scaffolding
  - Dev server startup: <300ms (Vite official documentation)
  - Hot Module Replacement (HMR) for instant feedback during development
  - Production bundle: only application code, no framework runtime — bundle size equals source code size
  - TypeScript transpilation included with zero configuration
  - Requires Node.js 20.19+ or 22.12+
- **Maturity**: Production-ready. Vite 6.x is current (2026). Adopted by Vue, Svelte, SolidJS, and Astro as their default build tool.
- **Ecosystem**: 70,000+ GitHub stars, corporate backing by the Vue.js team, active maintenance with frequent releases.
- **Compatibility**: Outputs standard ES modules compatible with Chrome.
- **Known Limitations**: No built-in component architecture or reactivity — state management and DOM updates must be written manually.
- **Evidence**: Vite official documentation (vite.dev/guide), Medium setup guide (Viktorsson 2025), DEV Community tutorial.

### 3.6 Framework Option: Svelte

- **Overview**: Svelte is a compile-time framework that transforms component code into optimized vanilla JavaScript at build time, shipping near-zero runtime overhead to the browser.
- **Key Characteristics**:
  - Baseline gzipped bundle size: ~2.6 KB (SvelteScaling analysis)
  - Built-in reactivity: variable assignments automatically trigger DOM updates
  - Scoped CSS per component
  - Component file format: `.svelte` files with HTML, CSS, and JS in a single file
  - Scaling formula: Bundle Bytes = 0.493 × Source Code Size + 2811 (SvelteScaling)
- **Maturity**: Production-ready. Svelte 5 is current. Used in production by The New York Times, Apple, Spotify.
- **Ecosystem**: ~80,000 GitHub stars, corporate usage, active maintenance.
- **Compatibility**: Compiles to standard JavaScript; fully compatible with Chrome and Vite.
- **Known Limitations**: Adds a build-time compilation step and `.svelte` file format that requires learning. For a project with ~5 components and ~200 lines of UI code, the reactivity and scoping benefits are marginal compared to the learning curve for a developer unfamiliar with Svelte.
- **Evidence**: SvelteScaling analysis, StacksFinder bundle size comparison, svelte.dev documentation.

### 3.7 Framework Option: React

- **Overview**: React is a runtime component library that uses a virtual DOM to efficiently update the browser DOM. It is the most widely adopted frontend framework.
- **Key Characteristics**:
  - Baseline gzipped bundle size: ~44.5 KB (react + react-dom per StacksFinder)
  - Virtual DOM adds an abstraction layer between application state and the browser DOM
  - JSX/TSX syntax for component templates
  - Requires explicit state management hooks (useState, useEffect)
- **Maturity**: Production-ready. React 19 is current. Used by Meta, Netflix, Airbnb.
- **Ecosystem**: 230,000+ GitHub stars, largest community of any frontend framework.
- **Compatibility**: Fully compatible with Chrome and Vite.
- **Known Limitations**: 44.5 KB runtime overhead is disproportionate for a single-page app with 64 squares and 4 counters. Virtual DOM diffing provides no benefit when the DOM is this small — direct DOM manipulation is equally fast. React's component lifecycle adds conceptual complexity without proportional benefit for this project's scope.
- **Evidence**: StacksFinder bundle size comparison, React official documentation.

### 3.8 Testing Framework: Vitest

- **Overview**: Vitest is a testing framework powered by Vite, offering native ESM and TypeScript support with zero configuration when used alongside a Vite project.
- **Key Characteristics**:
  - Zero-config integration with Vite projects — shares the same `vite.config.ts`
  - Jest-compatible API (`describe`, `it`, `expect`)
  - Supports `jsdom` and `happy-dom` environments for DOM testing
  - Watch mode by default for rapid feedback during development
  - Install: `npm install --save-dev vitest` — 1 dependency
  - Vitest 4.0 (2025) marked Browser Mode as stable for real-browser testing
- **Maturity**: Production-ready. Vitest 4.x is current.
- **Ecosystem**: 14,000+ GitHub stars, backed by the Vite team, rapid adoption as the standard test runner for Vite projects.
- **Compatibility**: Runs on Node.js; `jsdom` environment provides sufficient DOM simulation for testing grid rendering and counter updates.
- **Known Limitations**: Younger than Jest (fewer StackOverflow answers and tutorials). For this project's simple test needs (pure algorithm functions + basic DOM assertions), this limitation is negligible.
- **Evidence**: Vitest official documentation (vitest.dev/guide), DEV Community Vitest vs Jest comparison (2026).

## Comparison Matrix

### Rendering Approaches

| Criterion | CSS Grid/DOM | SVG | Canvas |
|-----------|-------------|-----|--------|
| Performance at 64 elements | Excellent — trivial load | Excellent — trivial load | Excellent — but unnecessary overhead |
| Developer complexity | Low — standard HTML/CSS | Medium — XML syntax, viewBox setup | High — manual drawing, hit detection |
| Text on cells (move numbers) | Native — `<span>` inside `<div>` | Native — `<text>` element | Manual — `fillText()`, not selectable |
| Animation | CSS transitions + JS classList | CSS transitions + JS setAttribute | Manual — full redraw per frame |
| Event handling | Native — `onclick` per element | Native — `onclick` per element | Manual — coordinate math |
| Accessibility | Native — DOM semantics | Good — ARIA on SVG elements | Poor — opaque pixel buffer |
| Resolution independence | Good — scales with CSS | Excellent — vector-based | Poor — requires manual HiDPI scaling |
| Knight piece rendering | Unicode ♞ or image in `<div>` | SVG path — crisp at any size | drawImage — requires HiDPI handling |
| Lines of setup code | ~10 (CSS Grid definition) | ~20 (SVG viewBox + rect loop) | ~40 (canvas setup + draw functions) |
| Alignment with vision principle "Separation of algorithm and presentation" | Strong — DOM update = set className | Strong — setAttribute calls | Weak — rendering tightly coupled to draw loop |

### Build Tooling / Framework

| Criterion | Vite + Vanilla TS | Vite + Svelte | Vite + React |
|-----------|------------------|--------------|-------------|
| Gzipped bundle baseline | 0 KB (no framework runtime) | ~2.6 KB | ~44.5 KB |
| Setup commands | 2 (`npm create vite` + `npm install`) | 2 (`npm create vite` + `npm install`) | 2 (`npm create vite` + `npm install`) |
| Dev server startup | <300ms | <300ms | <300ms |
| Learning curve for project scope | Low — standard DOM APIs | Medium — Svelte syntax, reactivity model | Medium — JSX, hooks, component lifecycle |
| Built-in reactivity | None — manual DOM updates | Yes — assignment-based reactivity | Yes — useState/useEffect hooks |
| Component scoping | None — global CSS (manageable at this scale) | Built-in scoped CSS | CSS Modules or styled-components |
| Files to manage per component | 0 extra (plain .ts) | 1 (.svelte per component) | 1 (.tsx per component) |
| Testing integration with Vitest | Native — same config | Native — same config | Native — same config (+ @testing-library/react) |
| Maintenance footprint | Minimal — only Vite + TypeScript | Moderate — Svelte compiler updates | Moderate — React runtime + ecosystem updates |

## Trade-offs

### Option 1: CSS Grid/DOM (Rendering)

- **Advantages**:
  - Lowest implementation complexity for the 8×8 grid (vision G-1: chessboard display) — standard HTML and CSS that every web developer knows
  - Native text rendering enables displaying move numbers on cells (vision G-3: counters) with zero additional code
  - Native event handling simplifies future extensions (clicking cells, drag-and-drop) if scope expands
  - Full accessibility support without extra work (vision G-5: Chrome compatibility includes assistive technology)
- **Disadvantages**:
  - Knight piece rendered as Unicode character (♞) or `<img>` may lack the visual polish of a custom SVG path (vision G-1: visualization clarity)
  - No resolution-independent vector rendering — though at fixed 8×8 grid size on desktop Chrome, this has no practical impact
- **Best Suited For**: Grid-based layouts with a small, fixed number of elements and text content on cells — exactly this project's requirements
- **Worst Suited For**: Complex graphical scenes with custom shapes, curves, or thousands of animated elements

### Option 2: SVG (Rendering)

- **Advantages**:
  - Resolution-independent rendering ensures crisp knight piece and board at any zoom level (vision G-1: visual clarity)
  - DOM-based elements support native event handling and CSS styling, same as CSS Grid
  - Knight piece can be a custom SVG path for visual polish
- **Disadvantages**:
  - Slightly more complex setup than CSS Grid — requires SVG `viewBox`, namespace, and coordinate system knowledge (increases implementation time relative to vision G-6: simple development)
  - Text positioning in SVG requires explicit `x`, `y` coordinates rather than natural flow layout (complicates vision G-3: counter display on cells)
  - Mixing SVG board with HTML counters and slider requires coordination between two rendering models
- **Best Suited For**: Graphically rich visualizations requiring custom shapes and resolution independence
- **Worst Suited For**: Simple grid layouts where HTML/CSS achieves the same result with less code

### Option 3: Canvas (Rendering)

- **Advantages**:
  - Highest theoretical performance ceiling for rendering — relevant if the project ever scales to thousands of simultaneous boards
  - Complete pixel-level control over all visual output
- **Disadvantages**:
  - Manual hit detection makes interactive features significantly harder to implement (threatens vision G-4: slider responsiveness and future extensibility)
  - Text rendering is not accessible (threatens vision G-3: counter readability and G-5: Chrome accessibility)
  - Requires manual HiDPI scaling for Retina displays
  - Tightest coupling between algorithm output and rendering code (violates vision principle: separation of algorithm and presentation)
- **Best Suited For**: Rendering thousands of elements, game engines, complex real-time animations
- **Worst Suited For**: Small grid-based layouts with text content and simple interactivity — this project

### Option 4: Vite + Vanilla TypeScript (Tooling)

- **Advantages**:
  - Zero framework runtime overhead — the browser loads only application code (vision G-5: resource discipline)
  - Simplest dependency tree: Vite + TypeScript only — reduces maintenance burden (vision G-6: simple setup)
  - No framework-specific syntax to learn — standard TypeScript and DOM APIs
  - Algorithm module is naturally a pure TypeScript file, achieving separation of concerns without framework abstractions (vision principle: separation of algorithm and presentation)
- **Disadvantages**:
  - DOM updates must be written manually (e.g., `element.textContent = value`) — more verbose than Svelte's reactivity for the counter updates (vision G-3)
  - No built-in component scoping — CSS is global (manageable with BEM naming or CSS modules at this project's scale of ~3 UI sections)
- **Best Suited For**: Small, focused applications with a clear DOM structure and minimal state complexity
- **Worst Suited For**: Large applications with complex state management, many interactive forms, or deep component hierarchies

### Option 5: Vite + Svelte (Tooling)

- **Advantages**:
  - Built-in reactivity reduces boilerplate for counter updates — `count += 1` automatically updates the DOM (vision G-3)
  - Scoped CSS per component prevents style conflicts
  - Near-zero runtime overhead (~2.6 KB gzipped) (vision G-5: resource discipline)
- **Disadvantages**:
  - Adds a learning requirement for Svelte's `.svelte` file format and reactivity model — additional complexity for a project with only ~3 UI sections
  - Svelte compiler adds a build step abstraction — debugging requires understanding compiled output
  - Marginal benefit: for ~4 reactive values (jump count, positions checked, solutions found, current position), manual DOM updates in vanilla TS require ~4 lines of code each — Svelte saves roughly 16 lines total
- **Best Suited For**: Medium-sized interactive applications with many reactive UI elements
- **Worst Suited For**: Minimal projects where the framework abstraction costs more conceptual overhead than it saves in code

### Option 6: Vite + React (Tooling)

- **Advantages**:
  - Largest ecosystem of visualization libraries, UI components, and tutorials
  - Most widely known framework — maximizes the pool of developers who can maintain the code
- **Disadvantages**:
  - 44.5 KB gzipped runtime for an application that displays 64 squares, 4 counters, and 1 slider — disproportionate overhead (threatens vision G-5: resource discipline)
  - Virtual DOM diffing provides zero measurable benefit over direct DOM manipulation at this scale
  - JSX and hooks (useState, useEffect) add conceptual overhead without proportional benefit
- **Best Suited For**: Large, complex applications with many interactive components, data fetching, and routing
- **Worst Suited For**: Minimal single-page visualizations where the framework runtime exceeds the application code

## Risks and Limitations

### Research Risks

- **Risk**: Random tie-breaking in Warnsdorf's rule may produce a non-deterministic failure rate, causing the visualization to show incomplete tours unpredictably
  - **Likelihood**: High (incomplete tours are expected behavior, not a bug)
  - **Impact**: Users may misinterpret incomplete tours as application errors
  - **Mitigation**: The UI must clearly indicate when a tour is incomplete (e.g., "Tour incomplete: visited 58/64 squares") and the solutions counter must only increment for full 64-square tours. Consider logging the success rate during development to validate it matches the expected ~99%.

- **Risk**: Choosing vanilla TypeScript over a framework may lead to spaghetti DOM manipulation code as the project grows
  - **Likelihood**: Low (the project scope is fixed at 3 UI sections: board, counters, slider)
  - **Impact**: Harder to maintain or extend if scope grows beyond version 1
  - **Mitigation**: Enforce clear module boundaries from the start — separate files for algorithm, board rendering, counters, and animation control. The architecture agent should define these boundaries explicitly.

- **Risk**: CSS Grid cell transitions may not provide smooth-enough animation for the knight's movement
  - **Likelihood**: Low (CSS transitions handle transform and opacity changes at 60fps in Chrome)
  - **Impact**: Knight movement appears jerky rather than smooth
  - **Mitigation**: Test animation with CSS `transition` on the knight element's `grid-column`/`grid-row` or absolute positioning within the grid. If CSS transitions are insufficient, fall back to JavaScript-driven `requestAnimationFrame` positioning.

### Research Limitations

- Bundle size comparisons for Svelte (2.6 KB) and React (44.5 KB) are based on framework baselines from community analyses (SvelteScaling, StacksFinder) rather than identical benchmark applications. Actual bundle sizes vary by application code and tree-shaking effectiveness.
- Warnsdorf's rule success rate of "~99% with random tie-breaking" is synthesized from multiple sources (Wikipedia, GeeksforGeeks) rather than from a single authoritative benchmark. The Marateck (2008) paper analyzed deterministic orderings, not random tie-breaking specifically.
- No prototype was built to validate CSS Grid animation smoothness for the knight's movement. A 30-minute proof of concept with a moving `<div>` inside a CSS Grid would confirm or refute this assumption.

## Recommendations

1. **Priority**: P0
   - **Recommendation**: Use Vite with the `vanilla-ts` template as the build tool and project foundation. Do not use a frontend framework (Svelte, React, Vue).
   - **Justification**: The project has 3 UI sections (board, counters, slider) and ~4 reactive values. Vanilla TypeScript with direct DOM manipulation achieves all vision goals (G-1 through G-6) with zero framework runtime overhead (Finding 3.5), the simplest dependency tree, and the fastest possible setup (2 commands). Svelte's ~2.6 KB overhead is negligible (Finding 3.6), but its learning curve and compilation abstraction add complexity without proportional benefit for this project's fixed scope. React's 44.5 KB baseline is disproportionate (Finding 3.7).
   - **Confidence Level**: High — the project scope is well-defined and small enough that framework abstractions provide marginal benefit.
   - **Validation Step**: Scaffold a Vite `vanilla-ts` project, create 4 `<div>` elements with `textContent` updates on a timer, and verify the setup takes under 60 seconds.

2. **Priority**: P0
   - **Recommendation**: Use CSS Grid with standard HTML `<div>` elements for the chessboard rendering. Display the knight as a Unicode character (♞) or a small SVG/PNG image inside a grid cell.
   - **Justification**: CSS Grid is the simplest rendering approach for a fixed 8×8 grid (Finding 3.2), provides native text rendering for move numbers (vision G-3), native event handling, and full accessibility. SVG offers resolution independence (Finding 3.3) but adds unnecessary complexity for a fixed-size desktop Chrome application. Canvas is overkill (Finding 3.4). The comparison matrix shows CSS Grid requires ~10 lines of setup versus ~20 for SVG and ~40 for Canvas.
   - **Confidence Level**: High — 64 DOM elements is trivially within browser performance limits, and CSS Grid is the natural layout model for a grid.
   - **Validation Step**: Create an 8×8 CSS Grid with colored cells and a ♞ character that moves between cells on a timer. Verify smooth rendering in Chrome.

3. **Priority**: P0
   - **Recommendation**: Implement Warnsdorf's rule with random tie-breaking as the traversal algorithm.
   - **Justification**: Random tie-breaking achieves ~99% success rate across all 64 starting positions (Finding 3.1), which is the highest known success rate for the basic heuristic. Deterministic tie-breaking methods fail on specific squares. The UI must handle incomplete tours gracefully regardless of the tie-breaking strategy.
   - **Confidence Level**: Medium — the 99% figure is synthesized from multiple sources. Actual behavior should be validated by running all 64 starting positions during development.
   - **Validation Step**: Implement the algorithm and run all 64 starting positions 10 times each. Record success counts per starting position to empirically verify the success rate.

4. **Priority**: P1
   - **Recommendation**: Use Vitest as the testing framework with `jsdom` environment for DOM tests.
   - **Justification**: Vitest integrates natively with Vite (Finding 3.8), shares the same config, supports TypeScript out of the box, and provides a Jest-compatible API. The `jsdom` environment is sufficient for testing grid cell creation, counter updates, and algorithm correctness. No additional testing library is needed for this project's scope.
   - **Confidence Level**: High — Vitest is the standard test runner for Vite projects with broad community adoption.
   - **Validation Step**: Install Vitest, write one test for a pure algorithm function and one test that asserts DOM element creation, verify both pass.

5. **Priority**: P1
   - **Recommendation**: Structure the algorithm as a pure TypeScript module that accepts board state and returns the next move, with no knowledge of the DOM or rendering.
   - **Justification**: This enables testing the algorithm independently of the browser (Finding 3.8, Vitest in Node environment), aligns with the vision's guiding principle of separating algorithm and presentation, and allows the rendering approach to change without modifying algorithm code.
   - **Confidence Level**: High — pure function design is a well-established pattern for algorithm/UI separation.
   - **Validation Step**: Write the algorithm module, verify it can be imported and executed in a Vitest `node` environment without any DOM dependencies.
