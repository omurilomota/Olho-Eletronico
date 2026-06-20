import { create } from 'zustand';

/**
 * Posicao 2D no plano do campo 3D.
 * X = comprimento do campo (positivo = gol adversario, negativo = proprio gol)
 * Z = largura do campo
 * 1 unidade = 1 metro
 */
export interface Position {
  x: number;
  z: number;
}

/** Presets de camera disponiveis para visualizacao do campo. */
export type CameraPreset = 'broadcast' | 'tactical' | 'goal-left' | 'goal-right' | 'free';

/** Tipos de cenarios pre-definidos para testes de impedimento. */
export type ScenarioType =
  | 'custom'
  | 'normal-offside'
  | 'marginal'
  | 'reverse-offside'
  | 'no-offside-behind'
  | 'no-offside-level';

/** Cenario pre-definido com posicoes dos jogadores e chave de traducao. */
interface Scenario {
  attacker: Position;
  defender: Position;
  goalkeeper: Position;
  labelKey: string;
  descriptionKey: string;
}

export const SCENARIOS: Record<Exclude<ScenarioType, 'custom'>, Scenario> = {
  'normal-offside': {
    attacker: { x: 5, z: 0 },
    defender: { x: 2, z: 0 },
    goalkeeper: { x: -15, z: 0 },
    labelKey: 'saot.scenarios_data.normal-offside.label',
    descriptionKey: 'saot.scenarios_data.normal-offside.description',
  },
  'marginal': {
    attacker: { x: 3.05, z: 0 },
    defender: { x: 3, z: 0 },
    goalkeeper: { x: -15, z: 0 },
    labelKey: 'saot.scenarios_data.marginal.label',
    descriptionKey: 'saot.scenarios_data.marginal.description',
  },
  'reverse-offside': {
    attacker: { x: 2, z: 0 },
    defender: { x: 5, z: 0 },
    goalkeeper: { x: -15, z: 0 },
    labelKey: 'saot.scenarios_data.reverse-offside.label',
    descriptionKey: 'saot.scenarios_data.reverse-offside.description',
  },
  'no-offside-behind': {
    attacker: { x: -2, z: 0 },
    defender: { x: 3, z: 0 },
    goalkeeper: { x: -15, z: 0 },
    labelKey: 'saot.scenarios_data.no-offside-behind.label',
    descriptionKey: 'saot.scenarios_data.no-offside-behind.description',
  },
  'no-offside-level': {
    attacker: { x: 3, z: 0 },
    defender: { x: 3, z: 0 },
    goalkeeper: { x: -15, z: 0 },
    labelKey: 'saot.scenarios_data.no-offside-level.label',
    descriptionKey: 'saot.scenarios_data.no-offside-level.description',
  },
};

export interface SAOTState {
  attacker: Position;
  defender: Position;
  goalkeeper: Position;
  cameraPreset: CameraPreset;
  showShadows: boolean;
  showOffsideLine: boolean;
  editMode: boolean;
  activeScenario: ScenarioType;
  setAttacker: (pos: Position) => void;
  setDefender: (pos: Position) => void;
  setGoalkeeper: (pos: Position) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  toggleShadows: () => void;
  toggleOffsideLine: () => void;
  toggleEditMode: () => void;
  loadScenario: (type: ScenarioType) => void;
  reset: () => void;
}

const defaultState = {
  attacker: { x: 3, z: 0 },
  defender: { x: -3, z: 0 },
  goalkeeper: { x: -15, z: 0 },
  cameraPreset: 'broadcast' as CameraPreset,
  showShadows: true,
  showOffsideLine: false,
  editMode: false,
  activeScenario: 'custom' as ScenarioType,
};

export const useSaotStore = create<SAOTState>((set) => ({
  ...defaultState,
  setAttacker: (pos) => set({ attacker: pos, activeScenario: 'custom' }),
  setDefender: (pos) => set({ defender: pos, activeScenario: 'custom' }),
  setGoalkeeper: (pos) => set({ goalkeeper: pos, activeScenario: 'custom' }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  toggleShadows: () => set((s) => ({ showShadows: !s.showShadows })),
  toggleOffsideLine: () => set((s) => ({ showOffsideLine: !s.showOffsideLine })),
  toggleEditMode: () => set((s) => ({ editMode: !s.editMode })),
  loadScenario: (type) => {
    if (type === 'custom') {
      set(defaultState);
      return;
    }
    const scenario = SCENARIOS[type];
    set({
      attacker: scenario.attacker,
      defender: scenario.defender,
      goalkeeper: scenario.goalkeeper,
      activeScenario: type,
    });
  },
  reset: () => set(defaultState),
}));
