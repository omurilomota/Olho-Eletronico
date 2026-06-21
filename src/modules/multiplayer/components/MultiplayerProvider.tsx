import { createContext, useContext, useEffect, useCallback, useRef, useState, type ReactNode } from 'react';
import { getSupabase, SESSION_CHANNEL_PREFIX, CURSOR_EVENT, SCENARIO_EVENT, PLAYBOOK_EVENT, PLAYER_EVENT, DRAG_EVENT } from '../services/supabaseClient';
import { useMultiplayerStore, type Participant } from '../store/useMultiplayerStore';
import { useSaotStore, type ScenarioType, type Position } from '../../saot/store/useSaotStore';
import { usePlaybookStore } from '../../saot/store/usePlaybookStore';

export interface ScenarioPayload {
  attacker: Position;
  defender: Position;
  goalkeeper: Position;
  activeScenario: ScenarioType;
}

export interface PlaybookPayload {
  playId: string | null;
  step: number;
}

export interface PlayerPayload {
  target: 'attacker' | 'defender' | 'goalkeeper';
  position: Position;
}

export interface RemoteCursorData {
  userId: string;
  name: string;
  color: string;
  x: number;
  z: number;
}

interface MultiplayerContextValue {
  session: Participant[];
  isConnected: boolean;
  connectionError: string | null;
  remoteCursors: RemoteCursorData[];
  sendCursor: (x: number, z: number) => void;
  sendPlayer: (payload: PlayerPayload) => void;
  sendScenario: (payload: ScenarioPayload) => void;
  sendPlaybook: (payload: PlaybookPayload) => void;
  sendDrag: (action: 'start' | 'end') => void;
}

const MultiplayerContext = createContext<MultiplayerContextValue | null>(null);

export function useMultiplayer(): MultiplayerContextValue | null;
export function useMultiplayer<T>(selector: (value: MultiplayerContextValue) => T): T;
export function useMultiplayer<T>(selector?: (value: MultiplayerContextValue) => T): T | MultiplayerContextValue | null {
  const ctx = useContext(MultiplayerContext);
  if (selector && ctx) return selector(ctx);
  return ctx;
}

const MAX_RETRIES = 3;
const BASE_DELAY = 1000;

export default function MultiplayerProvider({ children }: { children: ReactNode }) {
  const { session } = useMultiplayerStore();
  const setParticipants = useMultiplayerStore((s) => s.setParticipants);

  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>['channel']> | null>(null);
  const generationRef = useRef(0);
  const retryRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const retryCountRef = useRef(0);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursorData[]>([]);
  const remoteCursorsRef = useRef(setRemoteCursors);
  remoteCursorsRef.current = setRemoteCursors;

  const isConnected = useMultiplayerStore((s) => s.isConnected);
  const connectionError = useMultiplayerStore((s) => s.connectionError);

  useEffect(() => {
    if (!session) {
      if (retryRef.current) clearTimeout(retryRef.current);
      channelRef.current = null;
      return;
    }

    const gen = ++generationRef.current;
    retryCountRef.current = 0;

    let supabase: ReturnType<typeof getSupabase>;
    try {
      supabase = getSupabase();
    } catch (e) {
      useMultiplayerStore.setState({
        isConnected: false,
        connectionError: e instanceof Error ? e.message : 'Falha ao inicializar Supabase.',
      });
      return;
    }

    type Channel = ReturnType<typeof supabase.channel>;
    const channelName = `${SESSION_CHANNEL_PREFIX}${session.id}`;

    async function handleReconnect(oldChannel: Channel) {
      if (generationRef.current !== gen) return;
      if (retryCountRef.current >= MAX_RETRIES) return;
      retryCountRef.current++;
      const delay = BASE_DELAY * Math.pow(2, retryCountRef.current - 1);
      retryRef.current = setTimeout(async () => {
        if (generationRef.current !== gen) return;
        await supabase.removeChannel(oldChannel).catch(() => {});
        const newChannel = supabase.channel(channelName, {
          config: { broadcast: { self: false } },
        });
        setupChannel(newChannel);
        channelRef.current = newChannel;
      }, delay);
    }

    function setupChannel(ch: Channel) {
      ch
        .on('presence', { event: 'sync' }, () => {
          if (generationRef.current !== gen) return;
          const state = ch.presenceState();
          const seen = new Set<string>();
          const all: Participant[] = [];
          for (const key of Object.keys(state)) {
            const presences = state[key];
            if (Array.isArray(presences)) {
              for (const p of presences) {
                if (p && typeof p === 'object' && 'id' in p && !seen.has((p as unknown as Participant).id)) {
                  seen.add((p as unknown as Participant).id);
                  all.push(p as unknown as Participant);
                }
              }
            }
          }
          setParticipants(all);
        })
        .on('presence', { event: 'join' }, ({ newPresences }: { newPresences: unknown[] }) => {
          if (generationRef.current !== gen) return;
          for (const p of newPresences) {
            if (p && typeof p === 'object' && 'id' in p) {
              useMultiplayerStore.getState().addParticipant(p as unknown as Participant);
            }
          }
        })
        .on('presence', { event: 'leave' }, ({ leftPresences }: { leftPresences: unknown[] }) => {
          if (generationRef.current !== gen) return;
          for (const p of leftPresences) {
            if (p && typeof p === 'object' && 'id' in p) {
              useMultiplayerStore.getState().removeParticipant((p as unknown as Participant).id);
            }
          }
        })
        .on('broadcast', { event: CURSOR_EVENT }, ({ payload }: { payload: unknown }) => {
          if (generationRef.current !== gen) return;
          const data = payload as { userId: string; name: string; color: string; x: number; z: number };
          const meId = useMultiplayerStore.getState().localUserId;
          if (meId && data.userId !== meId) {
            remoteCursorsRef.current((prev) => {
              const existing = prev.find((c) => c.userId === data.userId);
              if (existing) {
                return prev.map((c) => (c.userId === data.userId ? { ...c, x: data.x, z: data.z } : c));
              }
              const cursorSession = useMultiplayerStore.getState().session;
              const participant = cursorSession?.participants.find((p) => p.id === data.userId);
              if (!participant) return prev;
              return [...prev, { userId: data.userId, name: participant.name, color: participant.color, x: data.x, z: data.z }];
            });
          }
        })
        .on('broadcast', { event: PLAYER_EVENT }, ({ payload }: { payload: unknown }) => {
          if (generationRef.current !== gen) return;
          const data = payload as PlayerPayload;
          const saotStore = useSaotStore.getState();
          if (data.target === 'attacker') saotStore.setAttacker(data.position);
          else if (data.target === 'defender') saotStore.setDefender(data.position);
          else if (data.target === 'goalkeeper') saotStore.setGoalkeeper(data.position);
        })
        .on('broadcast', { event: DRAG_EVENT }, ({ payload }: { payload: unknown }) => {
          if (generationRef.current !== gen) return;
          const data = payload as { action: 'start' | 'end'; userId: string };
          const meId = useMultiplayerStore.getState().localUserId;
          if (data.userId === meId) return;
          useSaotStore.getState().setDragging(data.action === 'start' ? data.userId : null);
        })
        .on('broadcast', { event: SCENARIO_EVENT }, ({ payload }: { payload: unknown }) => {
          if (generationRef.current !== gen) return;
          const data = payload as ScenarioPayload;
          const saotStore = useSaotStore.getState();
          saotStore.setAttacker(data.attacker);
          saotStore.setDefender(data.defender);
          saotStore.setGoalkeeper(data.goalkeeper);
          saotStore.loadScenario(data.activeScenario);
        })
        .on('broadcast', { event: PLAYBOOK_EVENT }, ({ payload }: { payload: unknown }) => {
          if (generationRef.current !== gen) return;
          const data = payload as PlaybookPayload;
          const playbookStore = usePlaybookStore.getState();
          if (data.playId) playbookStore.selectPlay(data.playId);
          for (let i = 0; i < data.step; i++) playbookStore.nextStep();
        })
        .subscribe((status: string) => {
          if (generationRef.current !== gen) return;

          if (status === 'SUBSCRIBED') {
            useMultiplayerStore.setState({ isConnected: true, connectionError: null });
            const meId = useMultiplayerStore.getState().localUserId;
            const me = meId
              ? useMultiplayerStore.getState().session?.participants.find((p) => p.id === meId)
              : null;
            if (me) {
              ch.track({
                id: me.id,
                name: me.name,
                color: me.color,
                role: me.role,
                cursor: me.cursor,
              }).catch(() => {});
            }
          } else if (status === 'CHANNEL_ERROR') {
            useMultiplayerStore.setState({ isConnected: false, connectionError: 'Falha ao conectar com o servidor.' });
          } else if (status === 'TIMED_OUT') {
            useMultiplayerStore.setState({ isConnected: false, connectionError: 'Tempo esgotado. Verifique sua conexao.' });
          } else if (status === 'CLOSED') {
            handleReconnect(ch);
          }
        });
    }

    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });
    setupChannel(channel);
    channelRef.current = channel;

    return () => {
      if (retryRef.current) clearTimeout(retryRef.current);
      generationRef.current++;
      const ch = channelRef.current;
      if (ch) {
        supabase.removeChannel(ch).catch(() => {});
      }
      channelRef.current = null;
      useMultiplayerStore.setState({ isConnected: false });
    };
  }, [session?.id]);

  useEffect(() => {
    if (!session) return;
    const participantIds = new Set(session.participants.map((p) => p.id));
    setRemoteCursors((prev) => prev.filter((c) => participantIds.has(c.userId)));
  }, [session?.participants]);

  const sendCursor = useCallback(async (x: number, z: number) => {
    if (!channelRef.current) return;
    const meId = useMultiplayerStore.getState().localUserId;
    const me = meId
      ? useMultiplayerStore.getState().session?.participants.find((p) => p.id === meId)
      : null;
    if (!me) return;
    channelRef.current.send({
      type: 'broadcast',
      event: CURSOR_EVENT,
      payload: { userId: me.id, name: me.name, color: me.color, x, z },
    }).catch(() => {});
  }, []);

  const sendPlayer = useCallback(async (payload: PlayerPayload) => {
    if (!channelRef.current) return;
    channelRef.current.send({ type: 'broadcast', event: PLAYER_EVENT, payload }).catch(() => {});
  }, []);

  const sendScenario = useCallback(async (payload: ScenarioPayload) => {
    if (!channelRef.current) return;
    channelRef.current.send({ type: 'broadcast', event: SCENARIO_EVENT, payload }).catch(() => {});
  }, []);

  const sendPlaybook = useCallback(async (payload: PlaybookPayload) => {
    if (!channelRef.current) return;
    channelRef.current.send({ type: 'broadcast', event: PLAYBOOK_EVENT, payload }).catch(() => {});
  }, []);

  const sendDrag = useCallback(async (action: 'start' | 'end') => {
    if (!channelRef.current) return;
    const meId = useMultiplayerStore.getState().localUserId;
    if (!meId) return;
    channelRef.current.send({ type: 'broadcast', event: DRAG_EVENT, payload: { action, userId: meId } }).catch(() => {});
  }, []);

  const contextValue: MultiplayerContextValue = {
    session: session?.participants ?? [],
    isConnected,
    connectionError,
    remoteCursors,
    sendCursor,
    sendPlayer,
    sendScenario,
    sendPlaybook,
    sendDrag,
  };

  return (
    <MultiplayerContext.Provider value={contextValue}>
      {children}
    </MultiplayerContext.Provider>
  );
}
