import { create } from 'zustand';

export interface Position {
  x: number;
  z: number;
}

export interface SAOTState {
  attacker: Position;
  defender: Position;
  goalkeeper: Position;
  setAttacker: (pos: Position) => void;
  setDefender: (pos: Position) => void;
  setGoalkeeper: (pos: Position) => void;
  reset: () => void;
}

const initialState = {
  attacker: { x: 6, z: 0 },
  defender: { x: 4, z: -2 },
  goalkeeper: { x: -8, z: 0 },
};

export const useSaotStore = create<SAOTState>((set) => ({
  ...initialState,
  setAttacker: (pos) => set({ attacker: pos }),
  setDefender: (pos) => set({ defender: pos }),
  setGoalkeeper: (pos) => set({ goalkeeper: pos }),
  reset: () => set(initialState),
}));
