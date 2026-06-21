import { create } from 'zustand';
import { dbCreateSession, dbGetSession, dbDeleteSession } from '../services/supabaseClient';

const COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ec4899'];

function generateId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

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
  localUserId: string | null;
  isConnected: boolean;
  connectionError: string | null;
  channelName: string | null;
  createSession: (name: string, userName: string) => Promise<void>;
  joinSession: (sessionId: string, userName: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  setSession: (session: Session | null) => void;
  setConnected: (connected: boolean) => void;
  setChannelName: (name: string | null) => void;
  setConnectionError: (error: string | null) => void;
  updateCursor: (x: number, z: number) => void;
  setParticipants: (participants: Participant[]) => void;
  addParticipant: (p: Participant) => void;
  removeParticipant: (id: string) => void;
}

export const useMultiplayerStore = create<MultiplayerState>((set, get) => ({
  session: null,
  localUserId: null,
  isConnected: false,
  connectionError: null,
  channelName: null,

  createSession: async (name, userName) => {
    const userId = generateId();
    const sessionId = generateId();

    const { error } = await dbCreateSession(sessionId, name, userName);
    if (error) {
      set({ connectionError: 'Falha ao criar sessao no servidor.' });
      return;
    }

    const session: Session = {
      id: sessionId,
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
    set({ session, localUserId: userId, connectionError: null });
  },

  joinSession: async (sessionId, userName) => {
    const { data, error } = await dbGetSession(sessionId);
    if (error || !data) {
      set({ connectionError: 'Sessao nao encontrada. Verifique o ID.' });
      return;
    }

    const userId = generateId();
    const participantCount = get().session?.participants.length ?? 0;
    const session: Session = {
      id: data.id,
      name: data.name,
      createdBy: data.created_by,
      participants: [
        {
          id: userId,
          name: userName,
          color: COLORS[(participantCount + 1) % COLORS.length],
          role: 'viewer',
        },
      ],
      createdAt: new Date(data.created_at),
    };
    set({ session, localUserId: userId, connectionError: null });
  },

  leaveSession: async () => {
    const { session, localUserId } = get();
    if (session && localUserId) {
      const me = session.participants.find((p) => p.id === localUserId);
      if (me?.role === 'admin') {
        await dbDeleteSession(session.id).catch(() => {});
      }
    }
    set({ session: null, localUserId: null, isConnected: false, channelName: null, connectionError: null });
  },

  setSession: (session) => set({ session }),
  setConnected: (connected) => set({ isConnected: connected }),
  setChannelName: (name) => set({ channelName: name }),
  setConnectionError: (error) => set({ connectionError: error }),

  updateCursor: (x, z) => {
    const session = get().session;
    const localUserId = get().localUserId;
    if (!session || !localUserId) return;
    set({
      session: {
        ...session,
        participants: session.participants.map((p) =>
          p.id === localUserId ? { ...p, cursor: { x, z } } : p,
        ),
      },
    });
  },

  setParticipants: (participants) => {
    const session = get().session;
    if (!session) return;
    set({ session: { ...session, participants } });
  },

  addParticipant: (p) => {
    const session = get().session;
    if (!session) return;
    const exists = session.participants.some((ep) => ep.id === p.id);
    if (exists) return;
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
}));
