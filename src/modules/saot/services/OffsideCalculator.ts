import type { Position } from '../store/useSaotStore';

export interface OffsideResult {
  isOffside: boolean;
  marginCm: number;
}

/**
 * Calculates offside by comparing attacker X position with the
 * second-last defender (considering goalkeeper and defender).
 * Rule: 1 unit = 1 meter = 100 cm.
 */
export function calculateOffside(
  attacker: Position,
  defender: Position,
  goalkeeper: Position,
): OffsideResult {
  const defenders = [defender, goalkeeper].sort((a, b) => b.x - a.x);
  const secondLastX = defenders[1].x;

  const marginCm = (attacker.x - secondLastX) * 100;
  return {
    isOffside: marginCm > 0,
    marginCm: Math.round(marginCm * 100) / 100,
  };
}
