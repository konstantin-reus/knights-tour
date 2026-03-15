import { describe, it, expect, beforeEach } from 'vitest';
import { createBoard, updateCell, resetBoard, highlightKnight } from './board.ts';

describe('board', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  describe('createBoard', () => {
    it('creates 64 cells in an 8x8 grid', () => {
      const cells = createBoard(container);
      expect(cells).toHaveLength(8);
      for (const row of cells) {
        expect(row).toHaveLength(8);
      }
      expect(container.children).toHaveLength(64);
    });

    it('adds board class to container', () => {
      createBoard(container);
      expect(container.classList.contains('board')).toBe(true);
    });

    it('alternates light and dark cells', () => {
      const cells = createBoard(container);
      expect(cells[0]![0]!.classList.contains('cell--light')).toBe(true);
      expect(cells[0]![1]!.classList.contains('cell--dark')).toBe(true);
      expect(cells[1]![0]!.classList.contains('cell--dark')).toBe(true);
      expect(cells[1]![1]!.classList.contains('cell--light')).toBe(true);
    });
  });

  describe('updateCell', () => {
    it('sets visited state with move number', () => {
      const cells = createBoard(container);
      updateCell(cells, { row: 0, col: 0 }, 'visited', 5);
      const cell = cells[0]![0]!;
      expect(cell.classList.contains('cell--visited')).toBe(true);
      expect(cell.textContent).toBe('5');
    });

    it('sets knight state with chess piece', () => {
      const cells = createBoard(container);
      updateCell(cells, { row: 3, col: 3 }, 'knight');
      const cell = cells[3]![3]!;
      expect(cell.classList.contains('cell--knight')).toBe(true);
      expect(cell.textContent).toBe('♞');
    });
  });

  describe('resetBoard', () => {
    it('clears all cell states and text', () => {
      const cells = createBoard(container);
      updateCell(cells, { row: 0, col: 0 }, 'visited', 1);
      updateCell(cells, { row: 1, col: 2 }, 'knight');
      resetBoard(cells);

      for (const row of cells) {
        for (const cell of row) {
          expect(cell.classList.contains('cell--visited')).toBe(false);
          expect(cell.classList.contains('cell--knight')).toBe(false);
          expect(cell.textContent).toBe('');
        }
      }
    });
  });

  describe('highlightKnight', () => {
    it('places knight indicator on the specified cell', () => {
      const cells = createBoard(container);
      highlightKnight(cells, { row: 2, col: 3 });
      const cell = cells[2]![3]!;
      expect(cell.classList.contains('cell--knight')).toBe(true);
      expect(cell.textContent).toBe('♞');
    });
  });
});
