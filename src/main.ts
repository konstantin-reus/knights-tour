import './style.css';
import { startVisualization } from './controller.ts';

try {
  const boardContainer = document.getElementById('board');
  const statsContainer = document.getElementById('stats');

  if (!boardContainer || !statsContainer) {
    throw new Error('Required DOM containers #board and #stats not found');
  }

  startVisualization({ boardContainer, statsContainer });
} catch (error) {
  console.error('Knight Tour initialization failed:', error);
  const app = document.getElementById('app');
  if (app) {
    app.textContent = 'An unexpected error occurred. Please refresh the page.';
  }
}
