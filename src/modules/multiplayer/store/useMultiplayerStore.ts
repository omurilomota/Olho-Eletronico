import { create } from 'zustand';

export interface Participant {
  id: string;
  name: string;
  color: string;
  cursor?: { x: number; z: number };
  role: 'admin' | 'viewer';
}

export interface Session {
  id: string;
  name: string;
  createdBy: string;
  participants: Participant[];
  createdAt: Date;
}

interface MultiplayerState {
  session: Session | null;
  isConnected: boolean;
  createSession: (name: string, userName: string) => void;
  joinSession: (sessionId: string, userName: string) => void;
  leaveSession: () => void;
  updateCursor: (x: number, z: number) => void;
  addParticipant: (p: Participant) => void;
  removeParticipant: (id: string) => void;
  setConnected: (connected: boolean) => void;
}

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

function generateId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  session: null,
  isConnected: false,

  createSession: (name, userName) => {
    const userId = generateId();
    const session: Session = {
      id: generateId(),
      name,
      createdBy: userName,
      participants: [
        {
          id: userId,
          name: userName,
          color: COLORS[0],
          role: 'admin',
        },
      ],
      createdAt: new Date(),
    };
    set({ session, isConnected: true });
  },

  joinSession: (sessionId, userName) => {
    const userId = generateId();
    const participantCount = get().session?.participants.length ?? 0;
    const session: Session = {
      id: sessionId,
      name: `Session ${sessionId}`,
      createdBy: 'Remote',
      participants: [
        {
          id: 'host',
          name: 'Host',
          color: COLORS[0],
          role: 'admin',
          cursor: { x: 0, z: 0 },
        },
        {
          id: userId,
          name: userName,
          color: COLORS[participantCount % COLORS.length],
          role: 'viewer',
        },
      ],
      createdAt: new Date(),
    };
    set({ session, isConnected: true });
  },

  leaveSession: () => set({ session: null, isConnected: false }),

  updateCursor: (x, z) => {
    const session = get().session;
    if (!session) return;
    const myId = session.participants.find((p) => p.role === 'admin')?.id;
    if (!myId) return;
    set({
      session: {
        ...session,
        participants: session.participants.map((p) =>
          p.id === myId ? { ...p, cursor: { x, z } } : p,
        ),
      },
    });
  },

  addParticipant: (p) => {
    const session = get().session;
    if (!session) return;
    set({
      session: {
        ...session,
        participants: [...session.participants, p],
      },
    });
  },

  removeParticipant: (id) => {
    const session = get().session;
    if (!session) return;
    set({
      session: {
        ...session,
        participants: session.participants.filter((p) => p.id !== id),
      },
    });
  },

  setConnected: (connected) => set({ isConnected: connected }),
}));
