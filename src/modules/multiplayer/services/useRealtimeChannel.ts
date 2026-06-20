import { useEffect, useCallback, useRef } from 'react';
import { getSupabase, SESSION_CHANNEL_PREFIX, CURSOR_EVENT, SCENARIO_EVENT, PLAYBOOK_EVENT, PLAYER_EVENT } from './supabaseClient';
import { useMultiplayerStore, type Participant } from '../store/useMultiplayerStore';
import type { ScenarioType } from '../../saot/store/useSaotStore';
import type { Position } from '../../saot/store/useSaotStore';

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

export interface CursorPayload {
  userId: string;
  name: string;
  color: string;
  x: number;
  z: number;
}

interface RealtimeCallbacks {
  onCursor?: (payload: CursorPayload) => void;
  onScenario?: (payload: ScenarioPayload) => void;
  onPlaybook?: (payload: PlaybookPayload) => void;
  onPlayer?: (payload: PlayerPayload) => void;
}

export function useRealtimeChannel(callbacks?: RealtimeCallbacks) {
  const { session, addParticipant, removeParticipant, setParticipants } = useMultiplayerStore();
  const channelRef = useRef<ReturnType<ReturnType<typeof getSupabase>['channel']> | null>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    if (!session) {
      channelRef.current = null;
      return;
    }

    let supabase;
    try {
      supabase = getSupabase();
    } catch (e) {
      useMultiplayerStore.setState({
        isConnected: false,
        connectionError: e instanceof Error ? e.message : 'Falha ao inicializar Supabase.',
      });
      return;
    }

    const channelName = `${SESSION_CHANNEL_PREFIX}${session.id}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
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
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        for (const p of newPresences) {
          if (p && typeof p === 'object' && 'id' in p) {
            addParticipant(p as unknown as Participant);
          }
        }
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        for (const p of leftPresences) {
          if (p && typeof p === 'object' && 'id' in p) {
            removeParticipant((p as unknown as Participant).id);
          }
        }
      })
      .on('broadcast', { event: CURSOR_EVENT }, ({ payload }) => {
        callbacksRef.current?.onCursor?.(payload as CursorPayload);
      })
      .on('broadcast', { event: SCENARIO_EVENT }, ({ payload }) => {
        callbacksRef.current?.onScenario?.(payload as ScenarioPayload);
      })
      .on('broadcast', { event: PLAYBOOK_EVENT }, ({ payload }) => {
        callbacksRef.current?.onPlaybook?.(payload as PlaybookPayload);
      })
      .on('broadcast', { event: PLAYER_EVENT }, ({ payload }) => {
        callbacksRef.current?.onPlayer?.(payload as PlayerPayload);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const me = session.participants[0];
          if (me) {
            await channel.track({
              id: me.id,
              name: me.name,
              color: me.color,
              role: me.role,
              cursor: me.cursor,
            });
          }
          useMultiplayerStore.setState({ isConnected: true, connectionError: null });
        } else if (status === 'CHANNEL_ERROR') {
          useMultiplayerStore.setState({ isConnected: false, connectionError: 'Falha ao conectar com o servidor.' });
        } else if (status === 'TIMED_OUT') {
          useMultiplayerStore.setState({ isConnected: false, connectionError: 'Tempo esgotado. Verifique sua conexao.' });
        } else if (status === 'CLOSED') {
          useMultiplayerStore.setState({ isConnected: false });
        }
      });

    channelRef.current = channel;

    let joinTimeout: ReturnType<typeof setTimeout> | null = null;
    const role = session.participants[0]?.role;
    if (role === 'viewer') {
      joinTimeout = setTimeout(() => {
        const current = useMultiplayerStore.getState();
        if (current.session && current.session.participants.length <= 1) {
          useMultiplayerStore.setState({
            isConnected: false,
            connectionError: 'Sessao nao encontrada ou criador offline.',
          });
        }
      }, 5000);
    } else if (role === 'admin') {
      joinTimeout = setTimeout(() => {
        const current = useMultiplayerStore.getState();
        if (current.session && !current.isConnected && !current.connectionError) {
          useMultiplayerStore.setState({
            isConnected: false,
            connectionError: 'Nao foi possivel conectar ao canal. Verifique sua conexao.',
          });
        }
      }, 8000);
    }

    return () => {
      if (joinTimeout) clearTimeout(joinTimeout);
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [session?.id]);

  const trackCursor = useCallback(
    async (x: number, z: number) => {
      if (!channelRef.current || !session) return;
      const me = session.participants.find((p) => p.role === 'admin');
      if (!me) return;
      await channelRef.current.track({
        id: me.id,
        name: me.name,
        color: me.color,
        role: me.role,
        cursor: { x, z },
      });
    },
    [session?.id, session?.participants],
  );

  const broadcastCursor = useCallback(
    async (userId: string, name: string, color: string, x: number, z: number) => {
      if (!channelRef.current) return;
      await channelRef.current.send({
        type: 'broadcast',
        event: CURSOR_EVENT,
        payload: { userId, name, color, x, z },
      });
    },
    [],
  );

  const broadcastScenario = useCallback(async (payload: ScenarioPayload) => {
    if (!channelRef.current) return;
    await channelRef.current.send({ type: 'broadcast', event: SCENARIO_EVENT, payload });
  }, []);

  const broadcastPlaybook = useCallback(async (payload: PlaybookPayload) => {
    if (!channelRef.current) return;
    await channelRef.current.send({ type: 'broadcast', event: PLAYBOOK_EVENT, payload });
  }, []);

  const broadcastPlayer = useCallback(async (payload: PlayerPayload) => {
    if (!channelRef.current) return;
    await channelRef.current.send({ type: 'broadcast', event: PLAYER_EVENT, payload });
  }, []);

  return {
    channelRef,
    trackCursor,
    broadcastCursor,
    broadcastScenario,
    broadcastPlaybook,
    broadcastPlayer,
  };
}
