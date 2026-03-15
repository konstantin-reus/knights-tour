import { BOARD_SIZE, DEFAULT_DELAY_MS } from './types.ts';
import type { AnimationConfig, Position, StatsState } from './types.ts';
import { getNextMove, createEmptyBoard } from './algorithm.ts';
import { createBoard, updateCell, resetBoard, highlightKnight } from './board.ts';
import { createStatsPanel, updateStats, createSpeedSlider, showTourResult } from './stats.ts';

function generateStartingPositions(): Position[] {
  const positions: Position[] = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      positions.push({ row, col });
    }
  }
  // Fisher-Yates shuffle
  for (let i = positions.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [positions[i], positions[j]] = [positions[j]!, positions[i]!];
  }
  return positions;
}

export function startVisualization(config: AnimationConfig): void {
  const cells = createBoard(config.boardContainer);
  const statsElements = createStatsPanel(config.statsContainer);

  let delayMs = DEFAULT_DELAY_MS;
  createSpeedSlider(config.statsContainer, (newDelay) => {
    delayMs = newDelay;
  });

  const startingPositions = generateStartingPositions();
  let positionIndex = 0;
  let positionsChecked = 0;
  let solutionsFound = 0;

  function runTraversal(startPos: Position): void {
    const board = createEmptyBoard();
    board[startPos.row]![startPos.col] = true;
    let current = startPos;
    let jumpCount = 0;

    resetBoard(cells);
    highlightKnight(cells, startPos);

    const stats: StatsState = {
      jumpCount: 0,
      positionsChecked,
      solutionsFound,
      currentStart: startPos,
      totalCells: 1,
    };
    updateStats(statsElements, stats);
    statsElements.tourResultEl.textContent = '';
    statsElements.tourResultEl.classList.remove('tour-result--success', 'tour-result--incomplete');

    function step(): void {
      const next = getNextMove(board, current);

      if (next === null) {
        // Traversal ended
        const totalVisited = jumpCount + 1;
        const complete = totalVisited === BOARD_SIZE * BOARD_SIZE;

        if (complete) {
          solutionsFound++;
        }
        positionsChecked++;

        showTourResult(statsElements, complete, totalVisited);
        updateStats(statsElements, {
          jumpCount,
          positionsChecked,
          solutionsFound,
          currentStart: startPos,
          totalCells: totalVisited,
        });

        // Proceed to next starting position after a pause
        setTimeout(() => {
          positionIndex++;
          if (positionIndex < startingPositions.length) {
            runTraversal(startingPositions[positionIndex]!);
          } else {
            statsElements.tourResultEl.textContent =
              `All ${BOARD_SIZE * BOARD_SIZE} positions tested. Solutions: ${solutionsFound}/${positionsChecked}`;
          }
        }, Math.max(delayMs, 500));

        return;
      }

      // Execute the move
      updateCell(cells, current, 'visited', jumpCount + 1);
      board[next.row]![next.col] = true;
      current = next;
      jumpCount++;

      highlightKnight(cells, current);

      updateStats(statsElements, {
        jumpCount,
        positionsChecked,
        solutionsFound,
        currentStart: startPos,
        totalCells: jumpCount + 1,
      });

      setTimeout(step, delayMs);
    }

    setTimeout(step, delayMs);
  }

  runTraversal(startingPositions[positionIndex]!);
}
