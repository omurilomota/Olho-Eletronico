/**
 * Posicao 2D no plano do campo.
 * X = comprimento do campo (positivo = direita, gol adversario)
 * Z = largura do campo (positivo = frente)
 * 1 unidade = 1 metro
 */
export interface Position {
  x: number;
  z: number;
}
