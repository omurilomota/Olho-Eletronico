import { describe, it, expect } from 'vitest';
import { calculateOffside } from '../modules/saot/services/OffsideCalculator';
import type { Position } from '../modules/saot/store/useSaotStore';

describe('calculateOffside', () => {
  it('returns offside when attacker is ahead of second-last defender', () => {
    const attacker: Position = { x: 5, z: 0 };
    const defender: Position = { x: 3, z: -1 };
    const goalkeeper: Position = { x: -5, z: 0 };
    // Sorted desc by x: [defender(3), goalkeeper(-5)] → secondLastX = -5
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(true);
    expect(result.marginCm).toBe(1000);
  });

  it('returns no offside when attacker is behind second-last defender', () => {
    const attacker: Position = { x: 3, z: 0 };
    const defender: Position = { x: 5, z: -1 };
    const goalkeeper: Position = { x: 4, z: 0 };
    // Sorted desc by x: [defender(5), goalkeeper(4)] → secondLastX = 4
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(false);
    expect(result.marginCm).toBe(-100);
  });

  it('returns no offside when attacker is level with second-last defender', () => {
    const attacker: Position = { x: 4, z: 1 };
    const defender: Position = { x: 5, z: -1 };
    const goalkeeper: Position = { x: 4, z: 0 };
    // Sorted desc by x: [defender(5), goalkeeper(4)] → secondLastX = 4
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(false);
    expect(result.marginCm).toBe(0);
  });

  it('uses goalkeeper as second-last defender when goalkeeper is ahead of defender', () => {
    const attacker: Position = { x: -4, z: 0 };
    const defender: Position = { x: -8, z: -1 };
    const goalkeeper: Position = { x: -3, z: 0 };
    // Sorted desc by x: [goalkeeper(-3), defender(-8)] → secondLastX = defender(-8)
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(true);
    expect(result.marginCm).toBe(400);
  });

  it('returns marginal offside (5cm)', () => {
    const attacker: Position = { x: 3.05, z: 0 };
    const defender: Position = { x: 3, z: -1 };
    const goalkeeper: Position = { x: -5, z: 0 };
    // Sorted desc by x: [defender(3), goalkeeper(-5)] → secondLastX = -5
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(true);
    expect(result.marginCm).toBe(805);
  });

  it('rounds marginCm to 2 decimal places', () => {
    const attacker: Position = { x: 4.001, z: 0 };
    const defender: Position = { x: 5, z: -1 };
    const goalkeeper: Position = { x: 4, z: 0 };
    // Sorted desc by x: [defender(5), goalkeeper(4)] → secondLastX = 4
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.marginCm).toBe(0.1);
  });

  it('handles goalkeeper being the only defender ahead', () => {
    const attacker: Position = { x: 10, z: 0 };
    const defender: Position = { x: -5, z: -1 };
    const goalkeeper: Position = { x: 8, z: 0 };
    // Sorted desc by x: [goalkeeper(8), defender(-5)] → secondLastX = defender(-5)
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(true);
    expect(result.marginCm).toBe(1500);
  });

  it('detects offside with typical match positions', () => {
    // Attacker at x=6, both defenders behind at x=2 and x=-5
    const attacker: Position = { x: 6, z: 0 };
    const defender: Position = { x: 2, z: -1 };
    const goalkeeper: Position = { x: -5, z: 0 };
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(true);
    expect(result.marginCm).toBe(1100);
  });

  it('returns no offside when both defenders are ahead', () => {
    const attacker: Position = { x: 1, z: 0 };
    const defender: Position = { x: 5, z: -1 };
    const goalkeeper: Position = { x: 3, z: 0 };
    // Sorted desc: [5, 3] → secondLastX = 3
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(false);
    expect(result.marginCm).toBe(-200);
  });
});
