import { useEffect, useCallback } from 'react';
import { supabase, SESSION_CHANNEL_PREFIX } from './supabaseClient';
import { useMultiplayerStore, type Participant } from '../store/useMultiplayerStore';

export function usePresence() {
  const { session, addParticipant, removeParticipant, setParticipants } = useMultiplayerStore();

  useEffect(() => {
    if (!session) return;

    const channelName = `${SESSION_CHANNEL_PREFIX}${session.id}`;
    const channel = supabase.channel(channelName);

    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const allParticipants: Participant[] = [];
      for (const key of Object.keys(state)) {
        const presences = state[key];
        if (Array.isArray(presences)) {
          for (const p of presences) {
            if (p && typeof p === 'object' && 'id' in p) {
              allParticipants.push(p as unknown as Participant);
            }
          }
        }
      }
      setParticipants(allParticipants);
    });

    channel.on('presence', { event: 'join' }, ({ newPresences }) => {
      for (const p of newPresences) {
        if (p && typeof p === 'object' && 'id' in p) {
          addParticipant(p as unknown as Participant);
        }
      }
    });

    channel.on('presence', { event: 'leave' }, ({ leftPresences }) => {
      for (const p of leftPresences) {
        if (p && typeof p === 'object' && 'id' in p) {
          removeParticipant((p as unknown as Participant).id);
        }
      }
    });

    channel.subscribe(async (status) => {
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
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session?.id]);

  const trackCursor = useCallback(
    async (x: number, z: number) => {
      if (!session) return;
      const channelName = `${SESSION_CHANNEL_PREFIX}${session.id}`;
      const channel = supabase.channel(channelName);
      const me = session.participants.find((p) => p.role === 'admin');
      if (!me) return;
      await channel.track({
        id: me.id,
        name: me.name,
        color: me.color,
        role: me.role,
        cursor: { x, z },
      });
    },
    [session?.id, session?.participants],
  );

  return { trackCursor };
}
