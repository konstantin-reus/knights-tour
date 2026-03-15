import { BOARD_SIZE } from './types.ts';
import type { Position, CellState } from './types.ts';

export function createBoard(container: HTMLElement): HTMLElement[][] {
  container.classList.add('board');
  const cells: HTMLElement[][] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    const rowCells: HTMLElement[] = [];
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      cell.classList.add((row + col) % 2 === 0 ? 'cell--light' : 'cell--dark');
      container.appendChild(cell);
      rowCells.push(cell);
    }
    cells.push(rowCells);
  }

  return cells;
}

export function updateCell(
  cells: HTMLElement[][],
  pos: Position,
  state: CellState,
  moveNumber?: number,
): void {
  const cell = cells[pos.row]![pos.col]!;
  cell.classList.remove('cell--visited', 'cell--current', 'cell--knight');

  switch (state) {
    case 'visited':
      cell.classList.add('cell--visited');
      if (moveNumber !== undefined) {
        cell.textContent = String(moveNumber);
      }
      break;
    case 'knight':
      cell.classList.add('cell--knight');
      cell.textContent = '♞';
      break;
    case 'current':
      cell.classList.add('cell--current');
      break;
    case 'empty':
      cell.textContent = '';
      break;
  }
}

export function resetBoard(cells: HTMLElement[][]): void {
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const cell = cells[row]![col]!;
      cell.classList.remove('cell--visited', 'cell--current', 'cell--knight');
      cell.textContent = '';
    }
  }
}

export function highlightKnight(cells: HTMLElement[][], pos: Position): void {
  const cell = cells[pos.row]![pos.col]!;
  cell.classList.add('cell--knight');
  cell.textContent = '♞';
}
