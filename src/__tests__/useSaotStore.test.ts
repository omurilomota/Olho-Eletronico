import { describe, it, expect, beforeEach } from 'vitest';
import { useSaotStore, SCENARIOS } from '../modules/saot/store/useSaotStore';

describe('useSaotStore', () => {
  beforeEach(() => {
    useSaotStore.getState().reset();
  });

  it('has correct default state', () => {
    const state = useSaotStore.getState();
    expect(state.attacker).toEqual({ x: 3, z: 1 });
    expect(state.defender).toEqual({ x: -3, z: -1 });
    expect(state.goalkeeper).toEqual({ x: -5, z: 0 });
    expect(state.cameraPreset).toBe('broadcast');
    expect(state.showShadows).toBe(true);
    expect(state.showOffsideLine).toBe(false);
    expect(state.activeScenario).toBe('custom');
  });

  it('setAttacker updates position and sets scenario to custom', () => {
    useSaotStore.getState().setAttacker({ x: 10, z: 5 });
    const state = useSaotStore.getState();
    expect(state.attacker).toEqual({ x: 10, z: 5 });
    expect(state.activeScenario).toBe('custom');
  });

  it('setDefender updates position and sets scenario to custom', () => {
    useSaotStore.getState().setDefender({ x: 7, z: 3 });
    const state = useSaotStore.getState();
    expect(state.defender).toEqual({ x: 7, z: 3 });
    expect(state.activeScenario).toBe('custom');
  });

  it('setGoalkeeper updates position and sets scenario to custom', () => {
    useSaotStore.getState().setGoalkeeper({ x: -8, z: 2 });
    const state = useSaotStore.getState();
    expect(state.goalkeeper).toEqual({ x: -8, z: 2 });
    expect(state.activeScenario).toBe('custom');
  });

  it('setCameraPreset updates preset', () => {
    useSaotStore.getState().setCameraPreset('tactical');
    expect(useSaotStore.getState().cameraPreset).toBe('tactical');
  });

  it('toggleShadows toggles showShadows', () => {
    expect(useSaotStore.getState().showShadows).toBe(true);
    useSaotStore.getState().toggleShadows();
    expect(useSaotStore.getState().showShadows).toBe(false);
    useSaotStore.getState().toggleShadows();
    expect(useSaotStore.getState().showShadows).toBe(true);
  });

  it('toggleOffsideLine toggles showOffsideLine', () => {
    expect(useSaotStore.getState().showOffsideLine).toBe(false);
    useSaotStore.getState().toggleOffsideLine();
    expect(useSaotStore.getState().showOffsideLine).toBe(true);
  });

  it('loadScenario sets positions from SCENARIOS', () => {
    useSaotStore.getState().loadScenario('normal-offside');
    const state = useSaotStore.getState();
    expect(state.attacker).toEqual(SCENARIOS['normal-offside'].attacker);
    expect(state.defender).toEqual(SCENARIOS['normal-offside'].defender);
    expect(state.goalkeeper).toEqual(SCENARIOS['normal-offside'].goalkeeper);
    expect(state.activeScenario).toBe('normal-offside');
  });

  it('loadScenario custom resets to defaults', () => {
    useSaotStore.getState().setAttacker({ x: 99, z: 99 });
    useSaotStore.getState().loadScenario('custom');
    const state = useSaotStore.getState();
    expect(state.attacker).toEqual({ x: 3, z: 1 });
    expect(state.activeScenario).toBe('custom');
  });

  it('reset restores default state', () => {
    useSaotStore.getState().setAttacker({ x: 99, z: 99 });
    useSaotStore.getState().setCameraPreset('tactical');
    useSaotStore.getState().reset();
    const state = useSaotStore.getState();
    expect(state.attacker).toEqual({ x: 3, z: 1 });
    expect(state.cameraPreset).toBe('broadcast');
  });

  it('has all 5 non-custom scenarios', () => {
    const scenarioKeys = Object.keys(SCENARIOS);
    expect(scenarioKeys).toHaveLength(5);
    expect(scenarioKeys).toContain('normal-offside');
    expect(scenarioKeys).toContain('marginal');
    expect(scenarioKeys).toContain('reverse-offside');
    expect(scenarioKeys).toContain('no-offside-behind');
    expect(scenarioKeys).toContain('no-offside-level');
  });
});
