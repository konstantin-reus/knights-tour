import { MIN_DELAY_MS, MAX_DELAY_MS, DEFAULT_DELAY_MS } from './types.ts';
import type { StatsState, StatsPanelElements } from './types.ts';

function positionToLabel(pos: { row: number; col: number }): string {
  const col = String.fromCharCode(97 + pos.col); // a-h
  const row = 8 - pos.row; // 8-1
  return `${col}${row}`;
}

export function createStatsPanel(container: HTMLElement): StatsPanelElements {
  container.classList.add('stats-panel');

  const jumpCountEl = document.createElement('span');
  const positionsCheckedEl = document.createElement('span');
  const solutionsFoundEl = document.createElement('span');
  const currentStartEl = document.createElement('span');
  const tourResultEl = document.createElement('div');
  tourResultEl.classList.add('tour-result');

  const entries: [string, HTMLSpanElement][] = [
    ['Jumps', jumpCountEl],
    ['Positions checked', positionsCheckedEl],
    ['Solutions found', solutionsFoundEl],
    ['Current start', currentStartEl],
  ];

  for (const [label, el] of entries) {
    const row = document.createElement('div');
    row.classList.add('stats-row');
    const labelEl = document.createElement('span');
    labelEl.classList.add('stats-label');
    labelEl.textContent = `${label}:`;
    el.classList.add('stats-value');
    row.appendChild(labelEl);
    row.appendChild(el);
    container.appendChild(row);
  }

  container.appendChild(tourResultEl);

  return { jumpCountEl, positionsCheckedEl, solutionsFoundEl, currentStartEl, tourResultEl };
}

export function updateStats(elements: StatsPanelElements, stats: StatsState): void {
  elements.jumpCountEl.textContent = `${stats.totalCells}/64`;
  elements.positionsCheckedEl.textContent = String(stats.positionsChecked);
  elements.solutionsFoundEl.textContent = String(stats.solutionsFound);
  elements.currentStartEl.textContent = positionToLabel(stats.currentStart);
}

export function createSpeedSlider(
  container: HTMLElement,
  onChange: (delayMs: number) => void,
): HTMLInputElement {
  const wrapper = document.createElement('div');
  wrapper.classList.add('speed-slider');

  const label = document.createElement('label');
  label.textContent = 'Speed:';

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = String(MIN_DELAY_MS);
  slider.max = String(MAX_DELAY_MS);
  slider.step = '10';
  slider.value = String(MAX_DELAY_MS + MIN_DELAY_MS - DEFAULT_DELAY_MS);

  const fastLabel = document.createElement('span');
  fastLabel.textContent = 'Fast';
  const slowLabel = document.createElement('span');
  slowLabel.textContent = 'Slow';

  slider.addEventListener('input', () => {
    onChange(MAX_DELAY_MS + MIN_DELAY_MS - parseInt(slider.value, 10));
  });

  wrapper.appendChild(label);
  wrapper.appendChild(slowLabel);
  wrapper.appendChild(slider);
  wrapper.appendChild(fastLabel);
  container.appendChild(wrapper);

  return slider;
}

export function showTourResult(
  elements: StatsPanelElements,
  complete: boolean,
  visited: number,
): void {
  if (complete) {
    elements.tourResultEl.textContent = 'Tour complete!';
    elements.tourResultEl.classList.add('tour-result--success');
    elements.tourResultEl.classList.remove('tour-result--incomplete');
  } else {
    elements.tourResultEl.textContent = `Tour incomplete: visited ${visited}/64 squares`;
    elements.tourResultEl.classList.add('tour-result--incomplete');
    elements.tourResultEl.classList.remove('tour-result--success');
  }
}
