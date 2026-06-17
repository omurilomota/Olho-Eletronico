export function formatCm(meters: number): string {
  return `${(meters * 100).toFixed(2)} cm`;
}

export const PITCH_WIDTH = 20;
export const PITCH_HEIGHT = 12;
export const DRAG_SPEED_FACTOR = 0.5;
