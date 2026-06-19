import { useEffect, useCallback, useRef } from 'react';
import { getSupabase, SESSION_CHANNEL_PREFIX, CURSOR_EVENT, SCENARIO_EVENT, PLAYBOOK_EVENT, PLAYER_EVENT } from './supabaseClient';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
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

type ChannelRef = ReturnType<ReturnType<typeof getSupabase>['channel']>;

export function useBroadcast() {
  const { session, addParticipant } = useMultiplayerStore();
  const channelRef = useRef<ChannelRef | null>(null);

  useEffect(() => {
    if (!session) {
      channelRef.current = null;
      return;
    }

    const supabase = getSupabase();
    const channelName = `${SESSION_CHANNEL_PREFIX}${session.id}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: CURSOR_EVENT }, ({ payload }) => {
        const data = payload as CursorPayload;
        const me = session.participants[0];
        if (me && data.userId !== me.id) {
          addParticipant({
            id: data.userId,
            name: data.name,
            color: data.color,
            role: 'viewer',
            cursor: { x: data.x, z: data.z },
          });
        }
      })
      .subscribe();

    channelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, [session?.id]);

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
    await channelRef.current.send({
      type: 'broadcast',
      event: SCENARIO_EVENT,
      payload,
    });
  }, []);

  const broadcastPlaybook = useCallback(async (payload: PlaybookPayload) => {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: 'broadcast',
      event: PLAYBOOK_EVENT,
      payload,
    });
  }, []);

  const broadcastPlayer = useCallback(async (payload: PlayerPayload) => {
    if (!channelRef.current) return;
    await channelRef.current.send({
      type: 'broadcast',
      event: PLAYER_EVENT,
      payload,
    });
  }, []);

  return {
    channelRef,
    broadcastCursor,
    broadcastScenario,
    broadcastPlaybook,
    broadcastPlayer,
  };
}

export function useBroadcastListeners() {
  const { session } = useMultiplayerStore();
  const callbacksRef = useRef({
    onCursor: null as ((payload: CursorPayload) => void) | null,
    onScenario: null as ((payload: ScenarioPayload) => void) | null,
    onPlaybook: null as ((payload: PlaybookPayload) => void) | null,
    onPlayer: null as ((payload: PlayerPayload) => void) | null,
  });

  const setCallbacks = useCallback(
    (c: typeof callbacksRef.current) => {
      callbacksRef.current = c;
    },
    [],
  );

  useEffect(() => {
    if (!session) return;

    const supabase = getSupabase();
    const channelName = `${SESSION_CHANNEL_PREFIX}${session.id}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: CURSOR_EVENT }, ({ payload }) => {
        callbacksRef.current.onCursor?.(payload as CursorPayload);
      })
      .on('broadcast', { event: SCENARIO_EVENT }, ({ payload }) => {
        callbacksRef.current.onScenario?.(payload as ScenarioPayload);
      })
      .on('broadcast', { event: PLAYBOOK_EVENT }, ({ payload }) => {
        callbacksRef.current.onPlaybook?.(payload as PlaybookPayload);
      })
      .on('broadcast', { event: PLAYER_EVENT }, ({ payload }) => {
        callbacksRef.current.onPlayer?.(payload as PlayerPayload);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  return { setCallbacks };
}
