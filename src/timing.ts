export const tickInterval = 150;

export type TickClock = { previousTime: number | null; elapsed: number };
export const freshClock = (now: number | null = null): TickClock => ({ previousTime: now, elapsed: 0 });

export function advanceClock(
  clock: TickClock,
  now: number,
  interval: number = tickInterval,
): { clock: TickClock; shouldStep: boolean } {
  if (clock.previousTime === null) {
    return { clock: { previousTime: now, elapsed: 0 }, shouldStep: false };
  }
  const elapsed = clock.elapsed + Math.max(0, now - clock.previousTime);
  const shouldStep = elapsed >= interval;
  // At most one move per frame; discard backlog after a stall.
  return {
    clock: { previousTime: now, elapsed: shouldStep ? elapsed % interval : elapsed },
    shouldStep,
  };
}
