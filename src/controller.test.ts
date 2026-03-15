import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { startVisualization } from './controller.ts';
import { BOARD_SIZE } from './types.ts';

describe('controller', () => {
  let boardContainer: HTMLElement;
  let statsContainer: HTMLElement;

  beforeEach(() => {
    vi.useFakeTimers();
    boardContainer = document.createElement('div');
    statsContainer = document.createElement('div');
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('creates the board and stats panel on start', () => {
    startVisualization({ boardContainer, statsContainer });
    // Board should have 64 cells
    expect(boardContainer.children).toHaveLength(BOARD_SIZE * BOARD_SIZE);
    // Stats container should have children (counter rows + slider)
    expect(statsContainer.children.length).toBeGreaterThan(0);
  });

  it('places knight on starting cell after first render', () => {
    startVisualization({ boardContainer, statsContainer });
    const knightCells = boardContainer.querySelectorAll('.cell--knight');
    expect(knightCells).toHaveLength(1);
    expect(knightCells[0]!.textContent).toBe('♞');
  });

  it('advances the knight after one timer tick', () => {
    startVisualization({ boardContainer, statsContainer });
    vi.advanceTimersByTime(200);
    // Knight should still be on the board after one tick
    const knight = boardContainer.querySelector('.cell--knight');
    expect(knight).not.toBeNull();
    // At least one visited cell should exist
    const visited = boardContainer.querySelectorAll('.cell--visited');
    expect(visited.length).toBeGreaterThanOrEqual(1);
  });
});
