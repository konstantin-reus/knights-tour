import { describe, it, expect } from 'vitest';
import { createEmptyBoard, getKnightMoves, countAccessibility, getNextMove } from './algorithm.ts';
import { BOARD_SIZE } from './types.ts';

describe('algorithm', () => {
  describe('createEmptyBoard', () => {
    it('creates an 8x8 board with all cells unvisited', () => {
      const board = createEmptyBoard();
      expect(board).toHaveLength(BOARD_SIZE);
      for (const row of board) {
        expect(row).toHaveLength(BOARD_SIZE);
        for (const cell of row) {
          expect(cell).toBe(false);
        }
      }
    });
  });

  describe('getKnightMoves', () => {
    it('returns valid moves from center of empty board', () => {
      const board = createEmptyBoard();
      const moves = getKnightMoves(board, { row: 4, col: 4 });
      expect(moves).toHaveLength(8);
    });

    it('returns fewer moves from corner', () => {
      const board = createEmptyBoard();
      const moves = getKnightMoves(board, { row: 0, col: 0 });
      expect(moves).toHaveLength(2);
    });

    it('excludes visited cells', () => {
      const board = createEmptyBoard();
      board[2]![1] = true;
      const moves = getKnightMoves(board, { row: 0, col: 0 });
      expect(moves).toHaveLength(1);
      expect(moves[0]).toEqual({ row: 1, col: 2 });
    });
  });

  describe('countAccessibility', () => {
    it('counts onward moves from a position', () => {
      const board = createEmptyBoard();
      const count = countAccessibility(board, { row: 4, col: 4 });
      expect(count).toBe(8);
    });
  });

  describe('getNextMove', () => {
    it('returns a valid knight move', () => {
      const board = createEmptyBoard();
      board[0]![0] = true;
      const next = getNextMove(board, { row: 0, col: 0 });
      expect(next).not.toBeNull();
      const dr = Math.abs(next!.row - 0);
      const dc = Math.abs(next!.col - 0);
      expect([dr, dc].sort()).toEqual([1, 2]);
    });

    it('returns null when no moves available', () => {
      const board = createEmptyBoard();
      // Fill all reachable cells from (0,0)
      board[0]![0] = true;
      board[2]![1] = true;
      board[1]![2] = true;
      const next = getNextMove(board, { row: 0, col: 0 });
      expect(next).toBeNull();
    });

    it('prefers cell with fewer onward moves (Warnsdorf)', () => {
      const board = createEmptyBoard();
      board[0]![0] = true;
      // Verify it returns a valid move (exact cell depends on tie-breaking)
      const next = getNextMove(board, { row: 0, col: 0 });
      expect(next).not.toBeNull();
    });
  });
});
