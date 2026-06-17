import { create } from 'zustand';

export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  chartData?: { label: string; data: number[] };
}

interface ICCState {
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearChat: () => void;
}

export const useIccStore = create<ICCState>((set) => ({
  messages: [],
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  clearChat: () => set({ messages: [] }),
}));
