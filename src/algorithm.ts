import { BOARD_SIZE } from './types.ts';
import type { Position, BoardState } from './types.ts';

const KNIGHT_OFFSETS: readonly [number, number][] = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

export function createEmptyBoard(): BoardState {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => false),
  );
}

export function getKnightMoves(board: BoardState, pos: Position): Position[] {
  const moves: Position[] = [];
  for (const [dr, dc] of KNIGHT_OFFSETS) {
    const row = pos.row + dr;
    const col = pos.col + dc;
    if (row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE && !board[row]![col]) {
      moves.push({ row, col });
    }
  }
  return moves;
}

export function countAccessibility(board: BoardState, pos: Position): number {
  return getKnightMoves(board, pos).length;
}

export function getNextMove(board: BoardState, current: Position): Position | null {
  const moves = getKnightMoves(board, current);
  if (moves.length === 0) return null;

  let minAccess = Infinity;
  const best: Position[] = [];

  for (const move of moves) {
    const access = countAccessibility(board, move);
    if (access < minAccess) {
      minAccess = access;
      best.length = 0;
      best.push(move);
    } else if (access === minAccess) {
      best.push(move);
    }
  }

  return best[Math.floor(Math.random() * best.length)]!;
}
