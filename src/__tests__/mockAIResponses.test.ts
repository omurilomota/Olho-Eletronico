import { describe, it, expect } from 'vitest';
import { getAIResponse, SUGGESTED_PROMPTS } from '../modules/icc/services/mockAIResponses';

describe('getAIResponse', () => {
  it('returns response for "ataque" keyword', () => {
    const result = getAIResponse('Analise de ataque');
    expect(result.role).toBe('ai');
    expect(result.content).toBeTruthy();
    expect(result.chartData).toBeDefined();
    expect(result.chartData?.label).toBe('Ataques por Setor');
    expect(result.chartData?.data).toEqual([25, 65, 10]);
  });

  it('returns response for "defesa" keyword', () => {
    const result = getAIResponse('defesa do time');
    expect(result.role).toBe('ai');
    expect(result.chartData?.label).toBe('Gols Sofridos por Tipo');
  });

  it('returns response for "posse" keyword', () => {
    const result = getAIResponse('Analise de posse de bola');
    expect(result.role).toBe('ai');
    expect(result.chartData?.label).toBe('Posse por Zona (%)');
  });

  it('returns response for "formacao" keyword', () => {
    const result = getAIResponse('Qual formacao usar?');
    expect(result.role).toBe('ai');
    expect(result.chartData?.label).toBe('Eficiencia por Formacao');
  });

  it('returns response for "jogador" keyword', () => {
    const result = getAIResponse('Performance do jogador');
    expect(result.role).toBe('ai');
    expect(result.chartData?.label).toBe('Metricas do Atacante');
  });

  it('returns response for "historico" keyword', () => {
    const result = getAIResponse('historico de confrontos');
    expect(result.role).toBe('ai');
    expect(result.chartData?.label).toBe('Resultado nos Confrontos');
  });

  it('returns response for "clima" keyword', () => {
    const result = getAIResponse('Como esta o clima?');
    expect(result.role).toBe('ai');
    expect(result.chartData?.label).toBe('Condicoes por Hora');
  });

  it('returns response for "lesao" keyword', () => {
    const result = getAIResponse('Status de lesao do time');
    expect(result.role).toBe('ai');
    expect(result.chartData?.label).toBe('Dias de Recuperacao');
  });

  it('returns response for "arbitragem" keyword', () => {
    const result = getAIResponse('analise de arbitragem');
    expect(result.role).toBe('ai');
    expect(result.chartData?.label).toBe('Cartoes por Jogo');
  });

  it('returns response for "estrategia" keyword', () => {
    const result = getAIResponse('Estrategia para o jogo');
    expect(result.role).toBe('ai');
    expect(result.chartData?.label).toBe('Eficacia Tatica (%)');
  });

  it('returns fallback for unknown keyword', () => {
    const result = getAIResponse('xyz123');
    expect(result.role).toBe('ai');
    expect(result.content).toBeTruthy();
  });

  it('is case insensitive', () => {
    const result = getAIResponse('ATAQUE');
    expect(result.chartData?.label).toBe('Ataques por Setor');
  });
});

describe('SUGGESTED_PROMPTS', () => {
  it('has 7 suggested prompts', () => {
    expect(SUGGESTED_PROMPTS).toHaveLength(7);
  });

  it('all prompts are non-empty strings', () => {
    for (const prompt of SUGGESTED_PROMPTS) {
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(0);
    }
  });
});
