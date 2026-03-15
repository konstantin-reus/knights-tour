export const BOARD_SIZE = 8;
export const DEFAULT_DELAY_MS = 200;
export const MIN_DELAY_MS = 10;
export const MAX_DELAY_MS = 2000;

export type Position = {
  row: number;
  col: number;
};

export type BoardState = boolean[][];

export type CellState = 'empty' | 'visited' | 'current' | 'knight';

export interface StatsState {
  jumpCount: number;
  positionsChecked: number;
  solutionsFound: number;
  currentStart: Position;
  totalCells: number;
}

export interface StatsPanelElements {
  jumpCountEl: HTMLSpanElement;
  positionsCheckedEl: HTMLSpanElement;
  solutionsFoundEl: HTMLSpanElement;
  currentStartEl: HTMLSpanElement;
  tourResultEl: HTMLElement;
}

export interface AnimationConfig {
  boardContainer: HTMLElement;
  statsContainer: HTMLElement;
}
