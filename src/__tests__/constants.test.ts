import { describe, it, expect } from 'vitest';
import { formatCm, clamp, lerp } from '../shared/utils/constants';

describe('formatCm', () => {
  it('converts meters to cm with 1 decimal', () => {
    expect(formatCm(1)).toBe('100.0 cm');
  });

  it('formats zero', () => {
    expect(formatCm(0)).toBe('0.0 cm');
  });

  it('formats negative values', () => {
    expect(formatCm(-0.5)).toBe('-50.0 cm');
  });

  it('formats fractional meters', () => {
    expect(formatCm(0.05)).toBe('5.0 cm');
  });
});

describe('clamp', () => {
  it('returns value within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles min equal to max', () => {
    expect(clamp(5, 3, 3)).toBe(3);
  });
});

describe('lerp', () => {
  it('returns a at t=0', () => {
    expect(lerp(0, 10, 0)).toBe(0);
  });

  it('returns b at t=1', () => {
    expect(lerp(0, 10, 1)).toBe(10);
  });

  it('returns midpoint at t=0.5', () => {
    expect(lerp(0, 10, 0.5)).toBe(5);
  });

  it('works with negative values', () => {
    expect(lerp(-10, 10, 0.5)).toBe(0);
  });
});
