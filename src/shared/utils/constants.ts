export const PITCH_WIDTH = 20;
export const PITCH_HEIGHT = 12;
export const GOAL_WIDTH = 7.32;
export const GOAL_HEIGHT = 2.44;
export const PENALTY_AREA_WIDTH = 16.5;
export const PENALTY_AREA_HEIGHT = 40.32;
export const GOAL_AREA_WIDTH = 5.5;
export const GOAL_AREA_HEIGHT = 18.32;
export const CENTER_CIRCLE_RADIUS = 9.15;
export const PENALTY_SPOT_DISTANCE = 11;
export const CORNER_ARC_RADIUS = 1;

export function formatCm(meters: number): string {
  return `${(meters * 100).toFixed(1)} cm`;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
