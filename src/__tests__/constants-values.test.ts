import { describe, it, expect } from 'vitest';
import {
  PITCH_WIDTH,
  PITCH_HEIGHT,
  GOAL_WIDTH,
  GOAL_HEIGHT,
  CENTER_CIRCLE_RADIUS,
} from '../shared/utils/constants';

describe('constants', () => {
  it('has correct pitch dimensions', () => {
    expect(PITCH_WIDTH).toBe(20);
    expect(PITCH_HEIGHT).toBe(12);
  });

  it('has correct goal dimensions', () => {
    expect(GOAL_WIDTH).toBe(7.32);
    expect(GOAL_HEIGHT).toBe(2.44);
  });

  it('has correct center circle radius', () => {
    expect(CENTER_CIRCLE_RADIUS).toBe(9.15);
  });
});
