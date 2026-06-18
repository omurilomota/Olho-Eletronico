/** Largura do campo em metros (comprimento total). */
export const PITCH_WIDTH = 37;

/** Altura do campo em metros (largura total). */
export const PITCH_HEIGHT = 22;

/** Largura do gol em metros (padrao FIFA). */
export const GOAL_WIDTH = 7.32;

/** Altura do gol em metros (padrao FIFA). */
export const GOAL_HEIGHT = 2.44;

/** Distancia da area de penalti em metros. */
export const PENALTY_AREA_DISTANCE = 6.75;

/** Metade da largura da area de penalti. */
export const PENALTY_AREA_HALF_HEIGHT = 6;

/** Distancia da area de gool em metros. */
export const GOAL_AREA_DISTANCE = 3;

/** Metade da largura da area de gool. */
export const GOAL_AREA_HALF_HEIGHT = 3;

/** Raio do circulo central em metros. */
export const CENTER_CIRCLE_RADIUS = 3;

/** Raio do arco de escanteio em metros. */
export const CORNER_ARC_RADIUS = 1;

/**
 * Formata um valor em metros para centimetros.
 * @param meters - Valor em metros
 * @returns String formatada (ex: "1.5 m = 150.0 cm")
 */
export function formatCm(meters: number): string {
  return `${(meters * 100).toFixed(1)} cm`;
}

/**
 * Limita um valor entre minimo e maximo.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Interpolacao linear entre dois valores.
 * @param a - Valor inicial
 * @param b - Valor final
 * @param t - Fator de interpolacao (0..1)
 */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}
