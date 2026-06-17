import { create } from 'zustand';

export interface Position {
  x: number;
  z: number;
}

export type CameraPreset = 'broadcast' | 'tactical' | 'goal-left' | 'goal-right' | 'free';

export type ScenarioType =
  | 'custom'
  | 'normal-offside'
  | 'marginal'
  | 'reverse-offside'
  | 'no-offside-behind'
  | 'no-offside-level';

interface Scenario {
  attacker: Position;
  defender: Position;
  goalkeeper: Position;
  label: string;
  description: string;
}

export const SCENARIOS: Record<Exclude<ScenarioType, 'custom'>, Scenario> = {
  'normal-offside': {
    attacker: { x: 5, z: 1 },
    defender: { x: 2, z: -1 },
    goalkeeper: { x: -5, z: 0 },
    label: 'Impedimento Classico',
    description: 'Atacante posicionado a frente do penultimo defensor',
  },
  'marginal': {
    attacker: { x: 3.05, z: 0.5 },
    defender: { x: 3, z: -1 },
    goalkeeper: { x: -5, z: 0 },
    label: 'Impedimento Marginal',
    description: 'Diferenca de apenas 5cm — decisao apertada',
  },
  'reverse-offside': {
    attacker: { x: 2, z: 1 },
    defender: { x: 5, z: -1 },
    goalkeeper: { x: -5, z: 0 },
    label: 'Impedimento Reverso',
    description: 'Atacante recua mas defensor avanca para criar a linha',
  },
  'no-offside-behind': {
    attacker: { x: -2, z: 1 },
    defender: { x: 3, z: -1 },
    goalkeeper: { x: -5, z: 0 },
    label: 'Bola Por Tras',
    description: 'Atacante comeca atras do defensor — posicao legal',
  },
  'no-offside-level': {
    attacker: { x: 3, z: 1 },
    defender: { x: 3, z: -1 },
    goalkeeper: { x: -5, z: 0 },
    label: 'Posicao Legal',
    description: 'Atacante na mesma linha do defensor — sem impedimento',
  },
};

export interface SAOTState {
  attacker: Position;
  defender: Position;
  goalkeeper: Position;
  ballPosition: [number, number, number];
  cameraPreset: CameraPreset;
  showShadows: boolean;
  showOffsideLine: boolean;
  activeScenario: ScenarioType;
  setAttacker: (pos: Position) => void;
  setDefender: (pos: Position) => void;
  setGoalkeeper: (pos: Position) => void;
  setBallPosition: (pos: [number, number, number]) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  toggleShadows: () => void;
  toggleOffsideLine: () => void;
  loadScenario: (type: ScenarioType) => void;
  reset: () => void;
}

const defaultState = {
  attacker: { x: 3, z: 1 },
  defender: { x: -3, z: -1 },
  goalkeeper: { x: -5, z: 0 },
  ballPosition: [-3, 0.2, 0] as [number, number, number],
  cameraPreset: 'broadcast' as CameraPreset,
  showShadows: true,
  showOffsideLine: false,
  activeScenario: 'custom' as ScenarioType,
};

export const useSaotStore = create<SAOTState>((set) => ({
  ...defaultState,
  setAttacker: (pos) => set({ attacker: pos, activeScenario: 'custom' }),
  setDefender: (pos) => set({ defender: pos, activeScenario: 'custom' }),
  setGoalkeeper: (pos) => set({ goalkeeper: pos, activeScenario: 'custom' }),
  setBallPosition: (pos) => set({ ballPosition: pos }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  toggleShadows: () => set((s) => ({ showShadows: !s.showShadows })),
  toggleOffsideLine: () => set((s) => ({ showOffsideLine: !s.showOffsideLine })),
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
