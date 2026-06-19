import { create } from 'zustand';
import type { Position } from './useSaotStore';

export interface PlayStep {
  description: string;
  ballStart: [number, number, number];
  ballEnd: [number, number, number];
  attackerEnd: Position;
  defenderEnd: Position;
}

export interface Play {
  id: string;
  name: string;
  icon: string;
  description: string;
  steps: PlayStep[];
  result: 'offside' | 'legal';
  difficulty: 'facil' | 'medio' | 'dificil';
}

const PLAYS: Play[] = [
  {
    id: 'passe-longo',
    name: 'Passe Longo Classico',
    icon: '\u26BD',
    description: 'Meio-campo joga por cima da defesa. Atacante entra na area.',
    result: 'offside',
    difficulty: 'facil',
    steps: [
      {
        description: 'Meio-campo levanta a bola',
        ballStart: [-15, 0.2, 0],
        ballEnd: [2, 3, 0],
        attackerEnd: { x: 2, z: 0 },
        defenderEnd: { x: 0, z: 0 },
      },
      {
        description: 'Bola desce na area',
        ballStart: [2, 3, 0],
        ballEnd: [6, 0.2, 0],
        attackerEnd: { x: 6, z: 0 },
        defenderEnd: { x: 3, z: 0 },
      },
      {
        description: 'Atacante finaliza — IMPEDIDO',
        ballStart: [6, 0.2, 0],
        ballEnd: [8, 0.2, 0],
        attackerEnd: { x: 8, z: 0 },
        defenderEnd: { x: 4, z: 0 },
      },
    ],
  },
  {
    id: 'linha-fundo',
    name: 'Linha de Fundo Reversa',
    icon: '\uD83D\uDD04',
    description: 'Atacante recua para receber a bola em posicao legal.',
    result: 'legal',
    difficulty: 'facil',
    steps: [
      {
        description: 'Atacante recua para receber',
        ballStart: [-15, 0.2, 0],
        ballEnd: [0, 0.2, 0],
        attackerEnd: { x: 0, z: 0 },
        defenderEnd: { x: 3, z: 0 },
      },
      {
        description: 'Toque de primeira para o meio',
        ballStart: [0, 0.2, 0],
        ballEnd: [2, 0.2, 0],
        attackerEnd: { x: 2, z: 0 },
        defenderEnd: { x: 3.5, z: 0 },
      },
      {
        description: 'Finalizacao — LEGAL',
        ballStart: [2, 0.2, 0],
        ballEnd: [5, 0.2, 0],
        attackerEnd: { x: 5, z: 0 },
        defenderEnd: { x: 4, z: 0 },
      },
    ],
  },
  {
    id: 'bola-curta',
    name: 'Bola Curta do Meio',
    icon: '\uD83C\uDFC3',
    description: 'Passes curtos no meio campo. Finalizacao marginal.',
    result: 'offside',
    difficulty: 'medio',
    steps: [
      {
        description: 'Primeiro passe curto',
        ballStart: [-15, 0.2, 0],
        ballEnd: [-2, 0.2, 0],
        attackerEnd: { x: -2, z: 0 },
        defenderEnd: { x: 1, z: 0 },
      },
      {
        description: 'Segundo passe — atacante avanca',
        ballStart: [-2, 0.2, 0],
        ballEnd: [2, 0.2, 0],
        attackerEnd: { x: 2.1, z: 0 },
        defenderEnd: { x: 2, z: 0 },
      },
      {
        description: 'Finalizacao — IMPEDIDO por 10cm',
        ballStart: [2, 0.2, 0],
        ballEnd: [4, 0.2, 0],
        attackerEnd: { x: 4, z: 0 },
        defenderEnd: { x: 2.5, z: 0 },
      },
    ],
  },
  {
    id: 'contra-ataque',
    name: 'Contra-Ataque Rapido',
    icon: '\u26A1',
    description: 'Roubada de bola e contra-ataque. Posicao legal.',
    result: 'legal',
    difficulty: 'medio',
    steps: [
      {
        description: 'Roubada de bola no meio',
        ballStart: [0, 0.2, 0],
        ballEnd: [3, 0.2, 0],
        attackerEnd: { x: 3, z: 0 },
        defenderEnd: { x: 1, z: 0 },
      },
      {
        description: 'Atacante arranca com a bola',
        ballStart: [3, 0.2, 0],
        ballEnd: [6, 0.2, 0],
        attackerEnd: { x: 6, z: 0 },
        defenderEnd: { x: 2, z: 0 },
      },
      {
        description: 'Gol — LEGAL, defensor atras',
        ballStart: [6, 0.2, 0],
        ballEnd: [9, 0.2, 0],
        attackerEnd: { x: 9, z: 0 },
        defenderEnd: { x: 3, z: 0 },
      },
    ],
  },
  {
    id: 'tiro-livre',
    name: 'Tiro Livre Indireto',
    icon: '\uD83C\uDFC6',
    description: 'Cobrança de falta. Toque sutil e finalização.',
    result: 'offside',
    difficulty: 'dificil',
    steps: [
      {
        description: 'Cobrança curta da falta',
        ballStart: [-2, 0.2, 0],
        ballEnd: [0, 0.2, 0],
        attackerEnd: { x: 0, z: 0 },
        defenderEnd: { x: 2, z: 0 },
      },
      {
        description: 'Toque de cabeça para trás',
        ballStart: [0, 0.2, 0],
        ballEnd: [-1, 1.5, 0],
        attackerEnd: { x: 1, z: 0 },
        defenderEnd: { x: 2.5, z: 0 },
      },
      {
        description: 'Finalizacao — IMPEDIDO',
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
  isPlaying: boolean;
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
  isPlaying: false,
  selectPlay: (id) => set({ currentPlayId: id, currentStep: 0, isPlaying: false }),
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
  resetPlay: () => set({ currentStep: 0, isPlaying: false }),
  clearPlay: () => set({ currentPlayId: null, currentStep: 0, isPlaying: false }),
}));
