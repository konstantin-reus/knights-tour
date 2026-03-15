import { describe, it, expect, beforeEach } from 'vitest';
import { createStatsPanel, updateStats, createSpeedSlider, showTourResult } from './stats.ts';

describe('stats', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  describe('createStatsPanel', () => {
    it('creates counter elements', () => {
      const elements = createStatsPanel(container);
      expect(elements.jumpCountEl).toBeInstanceOf(HTMLSpanElement);
      expect(elements.positionsCheckedEl).toBeInstanceOf(HTMLSpanElement);
      expect(elements.solutionsFoundEl).toBeInstanceOf(HTMLSpanElement);
      expect(elements.currentStartEl).toBeInstanceOf(HTMLSpanElement);
      expect(elements.tourResultEl).toBeInstanceOf(HTMLElement);
    });

    it('adds stats-panel class to container', () => {
      createStatsPanel(container);
      expect(container.classList.contains('stats-panel')).toBe(true);
    });
  });

  describe('updateStats', () => {
    it('updates counter text values', () => {
      const elements = createStatsPanel(container);
      updateStats(elements, {
        jumpCount: 10,
        positionsChecked: 3,
        solutionsFound: 2,
        currentStart: { row: 0, col: 0 },
        totalCells: 11,
      });
      expect(elements.jumpCountEl.textContent).toBe('11/64');
      expect(elements.positionsCheckedEl.textContent).toBe('3');
      expect(elements.solutionsFoundEl.textContent).toBe('2');
      expect(elements.currentStartEl.textContent).toBe('a8');
    });
  });

  describe('createSpeedSlider', () => {
    it('creates a range input and calls onChange', () => {
      let receivedDelay = 0;
      const slider = createSpeedSlider(container, (d) => { receivedDelay = d; });
      expect(slider.type).toBe('range');
      expect(slider.min).toBe('10');
      expect(slider.max).toBe('2000');

      // Slider value is inverted: delay = MAX + MIN - sliderValue
      slider.value = '500';
      slider.dispatchEvent(new Event('input'));
      expect(receivedDelay).toBe(2010 - 500);
    });
  });

  describe('showTourResult', () => {
    it('shows success message for complete tour', () => {
      const elements = createStatsPanel(container);
      showTourResult(elements, true, 64);
      expect(elements.tourResultEl.textContent).toBe('Tour complete!');
      expect(elements.tourResultEl.classList.contains('tour-result--success')).toBe(true);
    });

    it('shows incomplete message with count', () => {
      const elements = createStatsPanel(container);
      showTourResult(elements, false, 58);
      expect(elements.tourResultEl.textContent).toBe('Tour incomplete: visited 58/64 squares');
      expect(elements.tourResultEl.classList.contains('tour-result--incomplete')).toBe(true);
    });
  });
});
