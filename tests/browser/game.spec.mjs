import { test, expect } from '@playwright/test';

// Compare rendered Canvas content across actions, without a screenshot baseline.
const boardImage = (page) => page.locator('#board').evaluate((canvas) => canvas.toDataURL());

test.beforeEach(async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.__gameErrors = errors;
  // Select initial food directly in front of the head, without exposing game state.
  await page.addInitScript(() => { Math.random = () => 208.5 / 397; });
  await page.clock.install({ time: new Date('2026-01-01T00:00:00Z') });
  await page.clock.pauseAt(new Date('2026-01-01T00:00:01Z'));
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible();
});

test.afterEach(async ({ page }) => {
  expect(page.__gameErrors, 'No browser runtime or console errors').toEqual([]);
});

test('Start hides the overlay, draws movement, and eating updates the score', async ({ page }) => {
  const before = await boardImage(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await expect(page.locator('#overlay')).toBeHidden();
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeVisible();
  await page.clock.runFor(200);
  expect(await boardImage(page)).not.toBe(before);
  await expect(page.locator('#score')).toHaveText('Score: 1');
});

test('Space pauses without movement and resumes through the focused button once', async ({ page }) => {
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.clock.runFor(200);
  await page.keyboard.press('Space');
  await expect(page.getByRole('heading', { name: 'Paused', exact: true })).toBeVisible();
  const paused = await boardImage(page);
  await page.clock.runFor(600);
  expect(await boardImage(page)).toBe(paused);
  await page.keyboard.press('Space');
  await expect(page.locator('#overlay')).toBeHidden();
  await page.clock.runFor(100);
  expect(await boardImage(page)).toBe(paused);
  await page.clock.runFor(100);
  expect(await boardImage(page)).not.toBe(paused);
});

test('Restart from pause resets the actual board, score, focus, and timing', async ({ page }) => {
  const initial = await boardImage(page);
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.clock.runFor(200);
  await expect(page.locator('#score')).toHaveText('Score: 1');
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Ready to play?' })).toBeVisible();
  await expect(page.locator('#score')).toHaveText('Score: 0');
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeFocused();
  expect(await boardImage(page)).toBe(initial);
  await page.clock.runFor(500);
  expect(await boardImage(page)).toBe(initial);
  await page.keyboard.press('Enter');
  await page.clock.runFor(100);
  expect(await boardImage(page)).toBe(initial);
  await page.clock.runFor(100);
  expect(await boardImage(page)).not.toBe(initial);
});

test('wall loss freezes the board and exposes a working Restart button', async ({ page }) => {
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.clock.runFor(1700);
  await expect(page.getByRole('heading', { name: 'Game over', exact: true })).toBeVisible();
  await expect(page.locator('#overlay-message')).toContainText('You hit a wall. Final score: 1.');
  await expect(page.getByRole('button', { name: 'Pause', exact: true })).toBeHidden();
  await expect(page.getByRole('button', { name: 'Restart', exact: true })).toBeFocused();
  const finished = await boardImage(page);
  await page.clock.runFor(500);
  expect(await boardImage(page)).toBe(finished);
  await page.getByRole('button', { name: 'Restart', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeVisible();
  await expect(page.locator('#score')).toHaveText('Score: 0');
});

test('320-pixel viewport has no horizontal overflow and keeps controls visible', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  const dimensions = await page.evaluate(() => {
    const rect = document.querySelector('#board').getBoundingClientRect();
    return { width: rect.width, height: rect.height, left: rect.left, right: rect.right,
      viewport: innerWidth, scrollWidth: document.documentElement.scrollWidth };
  });
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.viewport);
  expect(Math.abs(dimensions.width - dimensions.height)).toBeLessThan(1);
  expect(dimensions.left).toBeGreaterThanOrEqual(0);
  expect(dimensions.right).toBeLessThanOrEqual(dimensions.viewport);
  await expect(page.getByRole('button', { name: 'Start', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.getByRole('button', { name: 'Pause', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Restart', exact: true })).toBeInViewport();
});
