import { describe, it, expect } from 'vitest';
import { getAIResponse, SUGGESTED_PROMPTS, getModelLabels } from '../modules/icc/services/mockAIResponses';

describe('getAIResponse', () => {
  it('returns response for "ataque" keyword with tatico model', () => {
    const result = getAIResponse('Analise de ataque');
    expect(result.role).toBe('ai');
    expect(result.content).toBeTruthy();
    expect(result.model).toBe('tatico');
    expect(result.reasoning).toBeTruthy();
  });

  it('returns response for "defesa" keyword', () => {
    const result = getAIResponse('defesa do time');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('tatico');
    expect(result.reasoning).toBeTruthy();
  });

  it('returns response for "posse" keyword with estatistico model', () => {
    const result = getAIResponse('Analise de posse de bola');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('estatistico');
    expect(result.reasoning).toBeTruthy();
  });

  it('returns response for "formacao" keyword', () => {
    const result = getAIResponse('Qual formacao usar?');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('tatico');
  });

  it('returns response for "jogador" keyword with estatistico model', () => {
    const result = getAIResponse('Performance do jogador');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('estatistico');
  });

  it('returns response for "historico" keyword', () => {
    const result = getAIResponse('historico de confrontos');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('estatistico');
  });

  it('returns response for "clima" keyword with operacional model', () => {
    const result = getAIResponse('Como esta o clima?');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('operacional');
  });

  it('returns response for "lesao" keyword', () => {
    const result = getAIResponse('Status de lesao do time');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('operacional');
  });

  it('returns response for "arbitragem" keyword', () => {
    const result = getAIResponse('analise de arbitragem');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('tatico');
  });

  it('returns response for "estrategia" keyword', () => {
    const result = getAIResponse('Estrategia para o jogo');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('tatico');
  });

  it('returns response for "vendas" keyword with operacional model', () => {
    const result = getAIResponse('Analise de vendas');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('operacional');
  });

  it('returns response for "estadio" keyword', () => {
    const result = getAIResponse('Status do estadio');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('operacional');
  });

  it('returns response for "torcida" keyword', () => {
    const result = getAIResponse('Simulacao de torcida');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('operacional');
  });

  it('returns response for "risco" keyword', () => {
    const result = getAIResponse('Analise de risco');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('operacional');
  });

  it('returns response for "previsao" keyword with preditivo model', () => {
    const result = getAIResponse('Previsao do jogo');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('preditivo');
  });

  it('returns response for "placar" keyword', () => {
    const result = getAIResponse('Qual o placar?');
    expect(result.role).toBe('ai');
    expect(result.model).toBe('preditivo');
  });

  it('returns fallback for unknown keyword with detected model', () => {
    const result = getAIResponse('xyz123');
    expect(result.role).toBe('ai');
    expect(result.content).toBeTruthy();
    expect(result.model).toBeDefined();
  });

  it('is case insensitive', () => {
    const result = getAIResponse('ATAQUE');
    expect(result.model).toBe('tatico');
  });

  it('always includes reasoning', () => {
    const result = getAIResponse('ataque');
    expect(result.reasoning).toBeDefined();
    expect(typeof result.reasoning).toBe('string');
    expect(result.reasoning!.length).toBeGreaterThan(0);
  });
});

describe('getModelLabels', () => {
  it('has all four models', () => {
    const labels = getModelLabels();
    expect(labels).toHaveProperty('tatico');
    expect(labels).toHaveProperty('estatistico');
    expect(labels).toHaveProperty('operacional');
    expect(labels).toHaveProperty('preditivo');
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
