import { create } from 'zustand';
import type { Position } from './useSaotStore';

export interface PlayStep {
  ballStart: [number, number, number];
  ballEnd: [number, number, number];
  attackerEnd: Position;
  defenderEnd: Position;
}

export interface Play {
  id: string;
  icon: string;
  steps: PlayStep[];
  result: 'offside' | 'legal';
  difficulty: 'facil' | 'medio' | 'dificil';
}

const PLAYS: Play[] = [
  {
    id: 'passe-longo',
    icon: '\u26BD',
    result: 'offside',
    difficulty: 'facil',
    steps: [
      {
        ballStart: [-15, 0.2, 0],
        ballEnd: [2, 3, 0],
        attackerEnd: { x: 2, z: 0 },
        defenderEnd: { x: 0, z: 0 },
      },
      {
        ballStart: [2, 3, 0],
        ballEnd: [6, 0.2, 0],
        attackerEnd: { x: 6, z: 0 },
        defenderEnd: { x: 3, z: 0 },
      },
      {
        ballStart: [6, 0.2, 0],
        ballEnd: [8, 0.2, 0],
        attackerEnd: { x: 8, z: 0 },
        defenderEnd: { x: 4, z: 0 },
      },
    ],
  },
  {
    id: 'linha-fundo',
    icon: '\uD83D\uDD04',
    result: 'legal',
    difficulty: 'facil',
    steps: [
      {
        ballStart: [-15, 0.2, 0],
        ballEnd: [0, 0.2, 0],
        attackerEnd: { x: 0, z: 0 },
        defenderEnd: { x: 3, z: 0 },
      },
      {
        ballStart: [0, 0.2, 0],
        ballEnd: [2, 0.2, 0],
        attackerEnd: { x: 2, z: 0 },
        defenderEnd: { x: 3.5, z: 0 },
      },
      {
        ballStart: [2, 0.2, 0],
        ballEnd: [5, 0.2, 0],
        attackerEnd: { x: 5, z: 0 },
        defenderEnd: { x: 4, z: 0 },
      },
    ],
  },
  {
    id: 'bola-curta',
    icon: '\uD83C\uDFC3',
    result: 'offside',
    difficulty: 'medio',
    steps: [
      {
        ballStart: [-15, 0.2, 0],
        ballEnd: [-2, 0.2, 0],
        attackerEnd: { x: -2, z: 0 },
        defenderEnd: { x: 1, z: 0 },
      },
      {
        ballStart: [-2, 0.2, 0],
        ballEnd: [2, 0.2, 0],
        attackerEnd: { x: 2.1, z: 0 },
        defenderEnd: { x: 2, z: 0 },
      },
      {
        ballStart: [2, 0.2, 0],
        ballEnd: [4, 0.2, 0],
        attackerEnd: { x: 4, z: 0 },
        defenderEnd: { x: 2.5, z: 0 },
      },
    ],
  },
  {
    id: 'contra-ataque',
    icon: '\u26A1',
    result: 'legal',
    difficulty: 'medio',
    steps: [
      {
        ballStart: [0, 0.2, 0],
        ballEnd: [3, 0.2, 0],
        attackerEnd: { x: 3, z: 0 },
        defenderEnd: { x: 1, z: 0 },
      },
      {
        ballStart: [3, 0.2, 0],
        ballEnd: [6, 0.2, 0],
        attackerEnd: { x: 6, z: 0 },
        defenderEnd: { x: 2, z: 0 },
      },
      {
        ballStart: [6, 0.2, 0],
        ballEnd: [9, 0.2, 0],
        attackerEnd: { x: 9, z: 0 },
        defenderEnd: { x: 3, z: 0 },
      },
    ],
  },
  {
    id: 'tiro-livre',
    icon: '\uD83C\uDFC6',
    result: 'offside',
    difficulty: 'dificil',
    steps: [
      {
        ballStart: [-2, 0.2, 0],
        ballEnd: [0, 0.2, 0],
        attackerEnd: { x: 0, z: 0 },
        defenderEnd: { x: 2, z: 0 },
      },
      {
        ballStart: [0, 0.2, 0],
        ballEnd: [-1, 1.5, 0],
        attackerEnd: { x: 1, z: 0 },
        defenderEnd: { x: 2.5, z: 0 },
      },
      {
        ballStart: [-1, 1.5, 0],
        ballEnd: [4, 0.2, 0],
        attackerEnd: { x: 4, z: 0 },
        defenderEnd: { x: 3, z: 0 },
      },
    ],
  },
];

interface PlaybookState {
  plays: Play[];
  currentPlayId: string | null;
  currentStep: number;
  selectPlay: (id: string) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetPlay: () => void;
  clearPlay: () => void;
}

export const usePlaybookStore = create<PlaybookState>((set, get) => ({
  plays: PLAYS,
  currentPlayId: null,
  currentStep: 0,
  selectPlay: (id) => set({ currentPlayId: id, currentStep: 0 }),
  nextStep: () => {
    const { currentPlayId, currentStep } = get();
    const play = PLAYS.find((p) => p.id === currentPlayId);
    if (play && currentStep < play.steps.length - 1) {
      set({ currentStep: currentStep + 1 });
    }
  },
  prevStep: () => {
    const { currentStep } = get();
    if (currentStep > 0) {
      set({ currentStep: currentStep - 1 });
    }
  },
  resetPlay: () => set({ currentStep: 0 }),
  clearPlay: () => set({ currentPlayId: null, currentStep: 0 }),
}));
