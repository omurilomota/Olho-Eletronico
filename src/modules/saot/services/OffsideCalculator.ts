import type { Position } from '../store/useSaotStore';

export interface OffsideResult {
  isOffside: boolean;
  marginCm: number;
}

/**
 * Calculates offside by comparing attacker X position with the
 * defender (second-last opponent — goalkeeper is last).
 * Rule: 1 unit = 1 meter = 100 cm.
 */
export function calculateOffside(
  attacker: Position,
  defender: Position,
  _goalkeeper: Position,
): OffsideResult {
  const secondLastX = defender.x;

  const marginCm = (attacker.x - secondLastX) * 100;
  return {
    isOffside: marginCm > 0,
    marginCm: Math.round(marginCm * 100) / 100,
  };
}
