import { gridSize, type Cell } from './board.ts';
import type { FeedbackEvent } from './feedback.ts';

export class GameEffects {
  private expiresAt = 0;

  private layer: HTMLElement;
  private reducedMotion: () => boolean;

  constructor(layer: HTMLElement, reducedMotion: () => boolean) {
    this.layer = layer;
    this.reducedMotion = reducedMotion;
  }

  show(event: FeedbackEvent, cell: Cell, now: number): void {
    this.clear();
    if (this.reducedMotion()) return;
    this.layer.dataset.effect = event;
    this.expiresAt = now + 450;
    if (event !== 'eat') return;
    const marker = document.createElement('span');
    marker.className = 'eat-marker';
    marker.style.left = `${(cell.x + 0.5) / gridSize * 100}%`;
    marker.style.top = `${(cell.y + 0.5) / gridSize * 100}%`;
    const pulse = document.createElement('span');
    pulse.className = 'head-pulse';
    marker.append(pulse);
    for (let index = 0; index < 6; index += 1) {
      const particle = document.createElement('span');
      particle.className = 'food-particle';
      const angle = index * Math.PI / 3;
      particle.style.setProperty('--dx', `${Math.cos(angle) * 18}px`);
      particle.style.setProperty('--dy', `${Math.sin(angle) * 18}px`);
      marker.append(particle);
    }
    this.layer.append(marker);
  }

  update(now: number): void {
    if (this.expiresAt && now >= this.expiresAt) this.clear();
  }

  clear(): void {
    this.expiresAt = 0;
    delete this.layer.dataset.effect;
    this.layer.replaceChildren();
  }
}
