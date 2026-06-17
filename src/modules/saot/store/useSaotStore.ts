import { create } from 'zustand';

export interface Position {
  x: number;
  z: number;
}

export type CameraPreset = 'broadcast' | 'tactical' | 'goal-left' | 'goal-right' | 'free';

export interface SAOTState {
  attacker: Position;
  defender: Position;
  goalkeeper: Position;
  ballPosition: [number, number, number];
  cameraPreset: CameraPreset;
  showShadows: boolean;
  showOffsideLine: boolean;
  setAttacker: (pos: Position) => void;
  setDefender: (pos: Position) => void;
  setGoalkeeper: (pos: Position) => void;
  setBallPosition: (pos: [number, number, number]) => void;
  setCameraPreset: (preset: CameraPreset) => void;
  toggleShadows: () => void;
  toggleOffsideLine: () => void;
  reset: () => void;
}

const initialState = {
  attacker: { x: 3, z: 1 },
  defender: { x: 1, z: -1 },
  goalkeeper: { x: -5, z: 0 },
  ballPosition: [-3, 0.2, 0] as [number, number, number],
  cameraPreset: 'broadcast' as CameraPreset,
  showShadows: true,
  showOffsideLine: false,
};

export const useSaotStore = create<SAOTState>((set) => ({
  ...initialState,
  setAttacker: (pos) => set({ attacker: pos }),
  setDefender: (pos) => set({ defender: pos }),
  setGoalkeeper: (pos) => set({ goalkeeper: pos }),
  setBallPosition: (pos) => set({ ballPosition: pos }),
  setCameraPreset: (preset) => set({ cameraPreset: preset }),
  toggleShadows: () => set((s) => ({ showShadows: !s.showShadows })),
  toggleOffsideLine: () => set((s) => ({ showOffsideLine: !s.showOffsideLine })),
  reset: () => set(initialState),
}));
