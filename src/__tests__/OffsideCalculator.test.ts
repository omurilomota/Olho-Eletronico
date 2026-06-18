import { describe, it, expect } from 'vitest';
import { calculateOffside } from '../modules/saot/services/OffsideCalculator';
import type { Position } from '../modules/saot/store/useSaotStore';

describe('calculateOffside', () => {
  it('returns offside when attacker is ahead of defender', () => {
    const attacker: Position = { x: 5, z: 0 };
    const defender: Position = { x: 3, z: -1 };
    const goalkeeper: Position = { x: -5, z: 0 };
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(true);
    expect(result.marginCm).toBe(200);
  });

  it('returns no offside when attacker is behind defender', () => {
    const attacker: Position = { x: 3, z: 0 };
    const defender: Position = { x: 5, z: -1 };
    const goalkeeper: Position = { x: 4, z: 0 };
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(false);
    expect(result.marginCm).toBe(-200);
  });

  it('returns no offside when attacker is level with defender', () => {
    const attacker: Position = { x: 4, z: 1 };
    const defender: Position = { x: 4, z: -1 };
    const goalkeeper: Position = { x: -3, z: 0 };
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(false);
    expect(result.marginCm).toBe(0);
  });

  it('uses defender as second-last even when goalkeeper is ahead', () => {
    const attacker: Position = { x: -4, z: 0 };
    const defender: Position = { x: -8, z: -1 };
    const goalkeeper: Position = { x: -3, z: 0 };
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(true);
    expect(result.marginCm).toBe(400);
  });

  it('returns marginal offside (5cm)', () => {
    const attacker: Position = { x: 3.05, z: 0 };
    const defender: Position = { x: 3, z: -1 };
    const goalkeeper: Position = { x: -5, z: 0 };
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(true);
    expect(result.marginCm).toBe(5);
  });

  it('rounds marginCm to 2 decimal places', () => {
    const attacker: Position = { x: 5.001, z: 0 };
    const defender: Position = { x: 5, z: -1 };
    const goalkeeper: Position = { x: -3, z: 0 };
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(true);
    expect(result.marginCm).toBe(0.1);
  });

  it('detects offside with typical match positions', () => {
    const attacker: Position = { x: 6, z: 0 };
    const defender: Position = { x: 2, z: -1 };
    const goalkeeper: Position = { x: -5, z: 0 };
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(true);
    expect(result.marginCm).toBe(400);
  });

  it('returns no offside when defender is ahead of attacker', () => {
    const attacker: Position = { x: 1, z: 0 };
    const defender: Position = { x: 5, z: -1 };
    const goalkeeper: Position = { x: 3, z: 0 };
    const result = calculateOffside(attacker, defender, goalkeeper);

    expect(result.isOffside).toBe(false);
    expect(result.marginCm).toBe(-400);
  });
});
