---
agent: architecture
sequence: 4
references: ["vision", "tech-stack", "research"]
summary: "A layered client-side architecture with four modules — Algorithm, Board Renderer, Stats Panel, and Animation Controller — communicating through typed TypeScript interfaces. The Algorithm module is a pure function with zero DOM dependencies, the Board Renderer manages an 8×8 CSS Grid, and the Animation Controller orchestrates the traversal loop using setTimeout with a speed slider. All state is ephemeral in-memory; no persistence layer is needed."
---

## Architecture Overview

The system uses a **layered modular architecture** with strict unidirectional data flow. This pattern was chosen because: (a) the vision's guiding principle 4 mandates separation of algorithm and presentation, (b) the tech-stack specifies vanilla TypeScript with no framework (requiring explicit module boundaries instead of framework-imposed component structure), and (c) the project has exactly four functional concerns — algorithm computation, board rendering, statistics display, and animation timing — each mapping to one module.

The architecture has three layers: **Logic** (pure computation, no DOM), **Presentation** (DOM rendering, no algorithm knowledge), and **Orchestration** (coordinates the other two).

```
                    ┌─────────────────────────┐
                    │   Animation Controller   │  ← Orchestration layer
                    │  (loop, timing, speed)   │
                    └──────┬──────────┬────────┘
                           │          │
              ┌────────────▼──┐  ┌────▼──────────┐
              │   Algorithm   │  │ Board Renderer │  ← Logic / Presentation
              │  (Warnsdorf)  │  │ (CSS Grid DOM) │
              └───────────────┘  └────┬───────────┘
                                      │
                                 ┌────▼──────────┐
                                 │  Stats Panel   │  ← Presentation
                                 │  (counters)    │
                                 └────────────────┘

User input: Speed Slider ──────► Animation Controller
```

Data flows top-down: the Animation Controller requests the next move from the Algorithm module, receives a coordinate, passes it to the Board Renderer which updates the DOM, and updates the Stats Panel counters. The Speed Slider feeds directly into the Animation Controller's delay value. No component calls upward.

## Component Design

### C-1: Algorithm Module

- **Responsibility**: Compute the next knight move using Warnsdorf's rule with random tie-breaking, given the current board state and knight position.
- **Public Interface**:
  ```typescript
  type Position = { row: number; col: number };
  type BoardState = boolean[][];  // 8×8, true = visited

  function getNextMove(board: BoardState, current: Position): Position | null;
  function getKnightMoves(board: BoardState, pos: Position): Position[];
  function countAccessibility(board: BoardState, pos: Position): number;
  function createEmptyBoard(): BoardState;
  ```
- **Dependencies**: None. Zero imports. Pure functions operating on plain data structures.
- **Requirements Covered**: G-1 (traverse cells using Warnsdorf's rule), G-2 (starting cell is passed in — randomization handled by caller), VR-1 (returns `null` when no unvisited reachable square exists, signaling incomplete tour)
- **Internal Structure**:
  - `KNIGHT_OFFSETS`: Constant array of 8 `[dx, dy]` pairs representing L-shaped moves
  - `getKnightMoves()`: Filters offsets to positions within bounds and unvisited
  - `countAccessibility()`: Counts onward moves from a candidate position (Warnsdorf's degree)
  - `getNextMove()`: Selects the move with minimum accessibility, breaking ties randomly via `Math.random()`
  - `createEmptyBoard()`: Returns a fresh 8×8 `boolean[][]` initialized to `false`

### C-2: Board Renderer

- **Responsibility**: Create and update the 8×8 CSS Grid chessboard DOM, reflecting the current knight position, visited cells, and move numbers.
- **Public Interface**:
  ```typescript
  type CellState = 'empty' | 'visited' | 'current' | 'knight';

  function createBoard(container: HTMLElement): HTMLElement[][];
  function updateCell(cells: HTMLElement[][], pos: Position, state: CellState, moveNumber?: number): void;
  function resetBoard(cells: HTMLElement[][]): void;
  function highlightKnight(cells: HTMLElement[][], pos: Position): void;
  ```
- **Dependencies**: Receives a parent `HTMLElement` from the Orchestration layer. No dependency on Algorithm, Stats Panel, or Animation Controller.
- **Requirements Covered**: G-1 (display chessboard, animate knight), G-3 (mark visited cells with move numbers), VR-4 (clear visual cues for current position, visited cells)
- **Internal Structure**:
  - `createBoard()`: Creates 64 `<div>` elements in an 8×8 CSS Grid. Sets alternating light/dark classes. Returns a 2D array of cell elements for direct access by `[row][col]`.
  - `updateCell()`: Adds/removes CSS classes (`cell--visited`, `cell--current`, `cell--knight`) and sets `textContent` to the move number.
  - `resetBoard()`: Removes all state classes and text content from all 64 cells.
  - `highlightKnight()`: Places the knight indicator (Unicode ♞ character) in the specified cell and adds the `cell--knight` class.

### C-3: Stats Panel

- **Responsibility**: Display and update the four live counters and the speed slider.
- **Public Interface**:
  ```typescript
  interface StatsState {
    jumpCount: number;
    positionsChecked: number;
    solutionsFound: number;
    currentStart: Position;
    totalCells: number;      // for "visited X/64" display
  }

  function createStatsPanel(container: HTMLElement): StatsPanelElements;
  function updateStats(elements: StatsPanelElements, stats: StatsState): void;
  function createSpeedSlider(container: HTMLElement, onChange: (delayMs: number) => void): HTMLInputElement;
  function showTourResult(elements: StatsPanelElements, complete: boolean, visited: number): void;
  ```
- **Dependencies**: Receives parent `HTMLElement` from the Orchestration layer. Calls `onChange` callback when slider value changes (inversion of control — no dependency on Animation Controller).
- **Requirements Covered**: G-3 (four counters: jumps, positions checked, solutions found, current start), G-4 (speed slider), VR-1 (display incomplete tour message)
- **Internal Structure**:
  - `StatsPanelElements`: Type holding references to counter `<span>` elements for direct `textContent` updates.
  - `createStatsPanel()`: Creates the counter labels and value `<span>` elements. Returns element references.
  - `updateStats()`: Sets `textContent` on each counter element from the `StatsState` object. 4 direct DOM assignments.
  - `createSpeedSlider()`: Creates an `<input type="range">` with `min=10`, `max=2000`, `value=200`. Attaches an `input` event listener that calls `onChange` with the current numeric value.
  - `showTourResult()`: Displays "Tour complete!" or "Tour incomplete: visited X/64 squares" message.

### C-4: Animation Controller

- **Responsibility**: Orchestrate the traversal loop — manage the sequence of moves, timing between moves, starting position cycling, and coordination between Algorithm, Board Renderer, and Stats Panel.
- **Public Interface**:
  ```typescript
  interface AnimationConfig {
    boardContainer: HTMLElement;
    statsContainer: HTMLElement;
  }

  function startVisualization(config: AnimationConfig): void;
  ```
- **Dependencies**: Imports and calls `Algorithm.getNextMove()`, `Algorithm.createEmptyBoard()`, `BoardRenderer.createBoard()`, `BoardRenderer.updateCell()`, `BoardRenderer.resetBoard()`, `BoardRenderer.highlightKnight()`, `StatsPanel.createStatsPanel()`, `StatsPanel.updateStats()`, `StatsPanel.createSpeedSlider()`, `StatsPanel.showTourResult()`.
- **Requirements Covered**: G-1 (animate traversal), G-2 (random starting position, no repeats), G-4 (speed control takes effect within one move), G-5 (no memory leak over 64 traversals), VR-2 (yield to browser event loop between moves)
- **Internal Structure**:
  - `startVisualization()`: Entry point. Creates the board, stats panel, and slider. Initializes the starting position queue. Begins the first traversal.
  - `generateStartingPositions()`: Creates a shuffled array of all 64 `Position` objects using Fisher-Yates shuffle.
  - `runTraversal(startPos)`: Runs one traversal from the given starting position. Uses `setTimeout` to schedule each move with the current slider delay. After each move: calls `getNextMove()`, updates the board and stats, schedules the next move. When `getNextMove()` returns `null` or all 64 cells are visited, the traversal ends.
  - `onTraversalComplete(visited)`: Increments `positionsChecked`, conditionally increments `solutionsFound` if `visited === 64`, resets the board, and calls `runTraversal()` with the next starting position. If all 64 positions are exhausted, displays "All positions tested" summary.
  - `delayMs`: Mutable variable updated by the slider's `onChange` callback. Read by `setTimeout` before each move — ensures G-4 (speed change takes effect within one move).

## Data Model

This is a stateless client-side application. All data is ephemeral (lives in JavaScript memory during the page session). No database, file, or localStorage is used.

### Entity: Board State

```
BoardState (boolean[][])
├── Dimensions: 8 rows × 8 columns (fixed)
├── Cell value: false = unvisited, true = visited
├── Lifecycle: Created fresh for each traversal, discarded on reset
└── Storage: JavaScript array in memory
```

### Entity: Position

```
Position { row: number, col: number }
├── row: 0-7 (top to bottom)
├── col: 0-7 (left to right)
├── Constraint: 0 <= row < 8, 0 <= col < 8
└── Storage: JavaScript object, passed by value between functions
```

### Entity: Stats State

```
StatsState
├── jumpCount: number (0-63 per traversal, reset on new traversal)
├── positionsChecked: number (0-64, cumulative across session)
├── solutionsFound: number (0-64, cumulative, incremented only for complete tours)
├── currentStart: Position (the starting cell of the current traversal)
└── totalCells: number (count of visited cells, for display purposes)
```

### Entity: Starting Position Queue

```
Position[] (shuffled)
├── Length: 64 (one per board cell)
├── Order: Fisher-Yates shuffled at session start
├── Consumption: One position dequeued per traversal
└── Lifecycle: Created once at session start, consumed until empty
```

### Entity-Relationship Diagram

```
[Starting Position Queue]
        │ dequeue one Position per traversal
        ▼
[Animation Controller] ──creates──► [BoardState (boolean[][])]
        │                                    │
        │ passes Position + BoardState       │ read by
        ▼                                    ▼
[Algorithm Module] ──returns Position──► [Animation Controller]
        │                                    │
        │                          updates   │   updates
        │                          ┌─────────┴─────────┐
        │                          ▼                   ▼
        │                   [Board Renderer]    [Stats Panel]
        │                   (DOM cells[][])     (counter spans)
        │
        └── null return = traversal complete
```

## Interface Contracts

### IC-1: Algorithm.getNextMove()

- **Signature**: `getNextMove(board: BoardState, current: Position): Position | null`
- **Request**:
  - `board`: 8×8 `boolean[][]` where `true` = visited. Must have `current` position marked as `true`.
  - `current`: `Position` with `row` in `[0,7]` and `col` in `[0,7]`.
- **Response**:
  - Success: `Position` — the next cell to move to (guaranteed unvisited, valid knight move from `current`).
  - No valid move: `null` — all reachable cells from `current` are visited or out of bounds.
- **Example**:
  ```typescript
  const board = createEmptyBoard();
  board[0][0] = true; // starting position visited
  const next = getNextMove(board, { row: 0, col: 0 });
  // Returns e.g. { row: 2, col: 1 } or { row: 1, col: 2 }
  ```

### IC-2: BoardRenderer.createBoard()

- **Signature**: `createBoard(container: HTMLElement): HTMLElement[][]`
- **Request**: `container` — an existing DOM element to append the grid into.
- **Response**: 8×8 array of `HTMLDivElement` references, indexed as `cells[row][col]`.
- **Side Effect**: Appends 64 `<div>` children to `container`, styled as an 8×8 CSS Grid.
- **Example**:
  ```typescript
  const container = document.getElementById('board')!;
  const cells = createBoard(container);
  // cells[0][0] is the top-left cell (a8 in chess notation)
  // cells[7][7] is the bottom-right cell (h1 in chess notation)
  ```

### IC-3: StatsPanel.createSpeedSlider()

- **Signature**: `createSpeedSlider(container: HTMLElement, onChange: (delayMs: number) => void): HTMLInputElement`
- **Request**:
  - `container`: DOM element to append the slider into.
  - `onChange`: Callback invoked on every slider `input` event with the current delay in milliseconds.
- **Response**: The `<input type="range">` element reference.
- **Slider Range**: `min=10`, `max=2000`, `step=10`, default `value=200`.
- **Example**:
  ```typescript
  let delayMs = 200;
  const slider = createSpeedSlider(statsContainer, (newDelay) => {
    delayMs = newDelay; // takes effect on the next setTimeout call
  });
  ```

### IC-4: Animation Controller.startVisualization()

- **Signature**: `startVisualization(config: AnimationConfig): void`
- **Request**: `config` with `boardContainer` and `statsContainer` — DOM elements for the two UI sections.
- **Response**: None. Starts the visualization loop. The function returns immediately; traversal runs asynchronously via `setTimeout`.
- **Example**:
  ```typescript
  startVisualization({
    boardContainer: document.getElementById('board')!,
    statsContainer: document.getElementById('stats')!,
  });
  ```

## Technology Choices

| Technology | Purpose | Alternatives Considered | Selection Rationale |
|-----------|---------|------------------------|---------------------|
| TypeScript 5.x | Implementation language | JavaScript (no types) | Static typing catches coordinate/index errors in the algorithm — the most common bug class for board traversal code (tech-stack Section 3) |
| Vite 6.x | Build tool and dev server | Webpack (slower), Parcel (smaller ecosystem) | <300ms dev server, native TS support, Vitest integration, `vanilla-ts` template matches the project exactly (tech-stack Section 4.1) |
| CSS Grid | Chessboard layout | SVG (more verbose), Canvas (manual rendering) | Simplest rendering for a fixed 8×8 grid with native text, events, and accessibility (tech-stack Section 4.2, research Finding 3.2) |
| Vitest 4.x + jsdom | Testing | Jest (separate TS config needed) | Native Vite integration, Jest-compatible API, zero-config with Vite projects (tech-stack Section 4.3) |
| setTimeout | Animation timing | requestAnimationFrame (frame-locked), setInterval (fixed rate) | setTimeout allows variable delay per move (slider value read before each call), yields to browser event loop, and is naturally recursive (each move schedules the next). requestAnimationFrame is locked to ~16ms frames which conflicts with the 10ms-2000ms slider range. setInterval does not easily support dynamic delay changes. |
| Fisher-Yates shuffle | Starting position randomization | Sort with Math.random (biased), manual random selection (O(n²)) | Unbiased O(n) shuffle guaranteeing each of the 64 starting positions is used exactly once (G-2) |
| Math.random() | Warnsdorf tie-breaking | Deterministic ordering (fails on specific squares) | Random tie-breaking achieves ~99% success rate vs. deterministic methods which fail on 5+ specific squares (research Finding 3.1) |

## Data Flow

### DF-1: Primary Success Path — One Complete Move

1. **Trigger**: `setTimeout` fires in the Animation Controller after `delayMs` milliseconds.
2. **Animation Controller** reads the current `boardState` and `currentPosition`.
3. **Animation Controller** calls `Algorithm.getNextMove(boardState, currentPosition)`.
4. **Algorithm Module** computes all valid knight moves from `currentPosition`, filters to unvisited squares, calculates Warnsdorf accessibility for each, selects the minimum (random tie-break). Returns `Position { row: 2, col: 3 }`.
5. **Animation Controller** updates `boardState[2][3] = true` and sets `currentPosition = { row: 2, col: 3 }`.
6. **Animation Controller** calls `BoardRenderer.updateCell(cells, {row: 2, col: 3}, 'knight', jumpCount)` — the cell shows move number and knight indicator.
7. **Animation Controller** calls `BoardRenderer.updateCell(cells, previousPosition, 'visited', previousMoveNumber)` — previous cell loses knight, keeps visited state.
8. **Animation Controller** increments `jumpCount` and calls `StatsPanel.updateStats(elements, statsState)` — counter displays update.
9. **Animation Controller** calls `setTimeout(nextStep, delayMs)` — schedules the next move. The current slider value is read here (G-4: takes effect within one move).

### DF-2: Error Path — Incomplete Tour

1. **Trigger**: `setTimeout` fires.
2. **Animation Controller** calls `Algorithm.getNextMove(boardState, currentPosition)`.
3. **Algorithm Module** finds zero valid unvisited moves. Returns `null`.
4. **Animation Controller** detects `null` return. Reads `jumpCount` (e.g., 57 — only 58 of 64 cells visited).
5. **Animation Controller** calls `StatsPanel.showTourResult(elements, false, 58)` — displays "Tour incomplete: visited 58/64 squares".
6. **Animation Controller** does NOT increment `solutionsFound`.
7. **Animation Controller** increments `positionsChecked`, calls `StatsPanel.updateStats()`.
8. After a brief pause (e.g., 1 second), calls `onTraversalComplete()` to proceed to the next starting position.

### DF-3: State Reset — New Traversal

1. **Trigger**: Previous traversal completes (success or incomplete).
2. **Animation Controller** dequeues the next `Position` from the starting position queue.
3. **Animation Controller** calls `BoardRenderer.resetBoard(cells)` — all 64 cells cleared of visited/knight classes and text.
4. **Animation Controller** calls `Algorithm.createEmptyBoard()` — fresh `boolean[8][8]` with all `false`.
5. **Animation Controller** sets `boardState[startRow][startCol] = true`, `currentPosition = startPos`, `jumpCount = 0`.
6. **Animation Controller** calls `BoardRenderer.highlightKnight(cells, startPos)` — knight appears on starting cell.
7. **Animation Controller** calls `StatsPanel.updateStats()` — counters show new starting position, reset jump count.
8. **Animation Controller** calls `setTimeout(nextStep, delayMs)` — begins the new traversal.

## Error Handling Strategy

### Input Validation Errors

Not applicable in the traditional sense — there is no user text input, API request, or form submission. The only user input is the speed slider, which is constrained by the HTML `<input type="range">` element to values between `min` and `max`. The `parseInt()` conversion of the slider value is the only parsing operation.

### Business Logic Errors

- **Algorithm returns `null`**: This is expected behavior (Warnsdorf's rule does not guarantee a complete tour). Handled as an incomplete tour result in DF-2. Not an error — a valid outcome.
- **All 64 starting positions exhausted**: Handled by checking the queue length. Displays a summary message and stops the animation loop.

### Infrastructure Errors

Not applicable — the application is a static client-side page with no network calls, no database, and no external service dependencies. The only infrastructure is the browser itself.

### Unhandled Errors

- **Strategy**: Wrap the `startVisualization()` call in a `try/catch` at the `main.ts` entry point. If an unhandled error occurs, display a visible error message in the DOM (e.g., "An unexpected error occurred. Please refresh the page.") and log the error to `console.error()`.
- **Scope**: The application has no critical data to lose — all state is ephemeral. A page refresh is a full recovery.

### Error Propagation

- The Algorithm module returns `null` instead of throwing exceptions — the Animation Controller checks for `null` on every move.
- The Board Renderer and Stats Panel do not produce errors — they perform unconditional DOM assignments (`textContent`, `classList`).
- No error codes, result types, or error events are needed. The application's error surface is minimal.

### Logging and Monitoring

- **Development**: `console.log()` statements in the Animation Controller for traversal start/end events and success/failure counts. These aid debugging during development.
- **Production**: No logging infrastructure. The application is a fun visualization with no SLA, uptime requirement, or user telemetry.

## Security Design

### Authentication

Not applicable. The application is a static client-side page with no user accounts, no login, and no server.

### Authorization

Not applicable. There are no protected resources or user roles.

### Data Protection

Not applicable. The application processes no personal data, stores no data persistently, and makes no network requests. All data is ephemeral in-browser memory.

### Input Sanitization

- The speed slider value is read via `HTMLInputElement.value` and parsed with `parseInt()`. The `<input type="range">` constrains the value to the `[min, max]` range, preventing injection.
- No user-provided strings are inserted into the DOM via `innerHTML`. All DOM updates use `textContent` (for move numbers and counters) and `classList` (for cell states). This eliminates XSS risk.

### Threat Mitigations

No external threats apply to this application. It has no server, no network communication, no stored data, and no user authentication. The only attack surface is the static file serving in development (`vite dev`), which is localhost-only by default.

## Design Decisions

### DD-1: Pure Functions for the Algorithm Module

- **Decision**: The Warnsdorf algorithm is implemented as pure functions that accept board state and return positions, with zero DOM or side-effect dependencies.
- **Context**: Vision guiding principle 4 mandates separation of algorithm and presentation. The algorithm must be testable independently of the browser.
- **Alternatives Considered**:
  1. **Algorithm as a class with internal state**: The algorithm object would hold the board state internally and expose a `nextMove()` method. *Pro*: Encapsulates traversal state. *Con*: Tightly couples the algorithm to a single traversal lifecycle, harder to test (must instantiate and manage object state), and the Animation Controller already manages traversal state.
  2. **Algorithm as a generator function**: `function* knightTour(start)` yields positions one at a time. *Pro*: Elegant iteration interface. *Con*: Generator lifecycle management adds complexity (pausing, resuming, cleaning up), and the Animation Controller's `setTimeout` loop already provides the step-by-step pacing.
- **Rationale**: Pure functions are the simplest approach. They require no lifecycle management, no instantiation, and are trivially testable — pass in a board and position, assert the returned position. The Animation Controller owns all mutable state, keeping the algorithm stateless.
- **Consequences**: The Animation Controller must pass the full board state to the algorithm on every move. For an 8×8 board (64 booleans), this is negligible. The board is passed by reference (not copied), so no allocation overhead.

### DD-2: setTimeout for Animation Loop (Not requestAnimationFrame)

- **Decision**: Use `setTimeout(nextStep, delayMs)` for the animation loop, reading the slider value before each call.
- **Context**: Vision G-4 requires a speed slider (10ms–2000ms) that takes effect within one move. Vision VR-2 requires yielding to the browser event loop to prevent freezing.
- **Alternatives Considered**:
  1. **requestAnimationFrame (rAF)**: Fires at ~60fps (every ~16ms). *Pro*: Synced to display refresh rate, smooth animation. *Con*: Cannot slow below ~16ms intervals. For a 2000ms delay, the callback would fire 120 times doing nothing (checking if enough time has passed). Wasteful and conceptually misaligned — rAF is designed for continuous animation, not discrete timed steps.
  2. **setInterval**: Fires at a fixed rate. *Pro*: Simple setup. *Con*: Changing the interval requires clearing and resetting — the slider would need `clearInterval()` + `setInterval()` on every input event. Risk of overlapping callbacks if a move takes longer than the interval.
- **Rationale**: `setTimeout` is naturally recursive (each move schedules the next), reads the current delay value at scheduling time (instant slider response), and automatically yields to the browser event loop between moves. It is the simplest correct approach for variable-speed discrete stepping.
- **Consequences**: At 10ms delay, `setTimeout` may fire slightly later than 10ms due to browser timer resolution (~4ms minimum in Chrome). This is imperceptible and acceptable. Animation is not frame-synced, but for discrete cell-to-cell movement (not smooth motion), frame sync is irrelevant.

### DD-3: Fisher-Yates Shuffle for Starting Position Order

- **Decision**: Generate all 64 starting positions upfront and shuffle them using the Fisher-Yates algorithm, then iterate through the shuffled array sequentially.
- **Context**: Vision G-2 requires random starting positions with no repeats across 64 traversals.
- **Alternatives Considered**:
  1. **Random selection with a visited set**: Pick a random position, check if it's been used, retry if so. *Pro*: No upfront allocation. *Con*: O(n²) expected time as the set fills — the 64th position requires ~64 random attempts on average. Unpredictable timing.
  2. **Sequential iteration (a1, a2, ..., h8)**: Iterate through positions in order. *Pro*: Simplest. *Con*: Not random — violates G-2 ("random cell").
- **Rationale**: Fisher-Yates is O(n) in time and space, produces an unbiased permutation, and guarantees exactly 64 unique positions with zero retries. The shuffled array is consumed sequentially, making the animation controller's logic trivial (`queue.pop()`).
- **Consequences**: 64 `Position` objects are allocated at session start (~512 bytes). Negligible memory cost.

### DD-4: Cell State via CSS Classes (Not Inline Styles)

- **Decision**: Represent cell visual states (empty, visited, current, knight) as CSS classes (`cell--visited`, `cell--current`, `cell--knight`) toggled via `classList`, with all styling defined in `style.css`.
- **Context**: The board has 64 cells, each cycling through states during traversal. The rendering must be clear (VR-4) and resource-efficient (G-5).
- **Alternatives Considered**:
  1. **Inline styles via `element.style`**: Set `backgroundColor`, `color` directly in JavaScript. *Pro*: No CSS file coordination needed. *Con*: Style values scattered across TypeScript code, harder to adjust visuals without editing logic, no CSS transition support for class changes.
  2. **Data attributes + CSS selectors**: Use `data-state="visited"` with `[data-state="visited"] { ... }` selectors. *Pro*: Clean separation. *Con*: Slightly slower than class-based selectors (attribute selectors are less optimized in browsers), and `classList` is a more conventional API.
- **Rationale**: CSS classes provide the cleanest separation between logic (TypeScript toggles classes) and presentation (CSS defines colors/styles). CSS transitions can animate class changes for subtle visual effects. `classList.add/remove` is the fastest DOM state toggle method in Chrome.
- **Consequences**: All visual styling is in `style.css`, enabling design changes without touching TypeScript. The developer must keep class names in sync between CSS and TypeScript — but with only 3-4 state classes, this is trivially manageable.
