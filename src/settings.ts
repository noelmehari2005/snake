export const speeds = {
  slow: { label: 'Slow', interval: 220 },
  normal: { label: 'Normal', interval: 150 },
  fast: { label: 'Fast', interval: 100 },
} as const;

export type Speed = keyof typeof speeds;
export const defaultSpeed: Speed = 'normal';

export function isSpeed(value: string | undefined): value is Speed {
  return value !== undefined && Object.hasOwn(speeds, value);
}
