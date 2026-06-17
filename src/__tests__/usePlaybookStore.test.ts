import { describe, it, expect, beforeEach } from 'vitest';
import { usePlaybookStore } from '../modules/saot/store/usePlaybookStore';

describe('usePlaybookStore', () => {
  beforeEach(() => {
    usePlaybookStore.getState().clearPlay();
  });

  it('has 5 plays', () => {
    expect(usePlaybookStore.getState().plays).toHaveLength(5);
  });

  it('starts with no play selected', () => {
    const state = usePlaybookStore.getState();
    expect(state.currentPlayId).toBeNull();
    expect(state.currentStep).toBe(0);
  });

  it('selectPlay sets currentPlayId and resets step', () => {
    usePlaybookStore.getState().selectPlay('passe-longo');
    const state = usePlaybookStore.getState();
    expect(state.currentPlayId).toBe('passe-longo');
    expect(state.currentStep).toBe(0);
  });

  it('nextStep advances to next step', () => {
    usePlaybookStore.getState().selectPlay('passe-longo');
    usePlaybookStore.getState().nextStep();
    expect(usePlaybookStore.getState().currentStep).toBe(1);
    usePlaybookStore.getState().nextStep();
    expect(usePlaybookStore.getState().currentStep).toBe(2);
  });

  it('nextStep does not exceed max steps', () => {
    usePlaybookStore.getState().selectPlay('passe-longo');
    // Passe longo has 3 steps (0, 1, 2)
    usePlaybookStore.getState().nextStep();
    usePlaybookStore.getState().nextStep();
    usePlaybookStore.getState().nextStep(); // Already at max
    expect(usePlaybookStore.getState().currentStep).toBe(2);
  });

  it('prevStep goes back', () => {
    usePlaybookStore.getState().selectPlay('passe-longo');
    usePlaybookStore.getState().nextStep();
    usePlaybookStore.getState().nextStep();
    usePlaybookStore.getState().prevStep();
    expect(usePlaybookStore.getState().currentStep).toBe(1);
  });

  it('prevStep does not go below 0', () => {
    usePlaybookStore.getState().selectPlay('passe-longo');
    usePlaybookStore.getState().prevStep();
    expect(usePlaybookStore.getState().currentStep).toBe(0);
  });

  it('resetPlay resets step to 0', () => {
    usePlaybookStore.getState().selectPlay('passe-longo');
    usePlaybookStore.getState().nextStep();
    usePlaybookStore.getState().nextStep();
    usePlaybookStore.getState().resetPlay();
    expect(usePlaybookStore.getState().currentStep).toBe(0);
  });

  it('clearPlay resets everything', () => {
    usePlaybookStore.getState().selectPlay('linha-fundo');
    usePlaybookStore.getState().nextStep();
    usePlaybookStore.getState().clearPlay();
    const state = usePlaybookStore.getState();
    expect(state.currentPlayId).toBeNull();
    expect(state.currentStep).toBe(0);
  });

  it('each play has required fields', () => {
    const plays = usePlaybookStore.getState().plays;
    for (const play of plays) {
      expect(play.id).toBeTruthy();
      expect(play.name).toBeTruthy();
      expect(play.icon).toBeTruthy();
      expect(play.description).toBeTruthy();
      expect(play.steps.length).toBeGreaterThan(0);
      expect(['offside', 'legal']).toContain(play.result);
      expect(['facil', 'medio', 'dificil']).toContain(play.difficulty);
    }
  });
});
