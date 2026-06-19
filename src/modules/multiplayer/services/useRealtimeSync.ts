import { useEffect, useCallback, useRef } from 'react';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
import { usePresence } from './usePresence';
import { useBroadcast, useBroadcastListeners } from './useBroadcast';
import type { CursorPayload, ScenarioPayload, PlaybookPayload, PlayerPayload } from './useBroadcast';

export type { CursorPayload, ScenarioPayload, PlaybookPayload, PlayerPayload };

interface RealtimeCallbacks {
  onRemoteCursor?: (userId: string, x: number, z: number) => void;
  onRemoteScenario?: (payload: ScenarioPayload) => void;
  onRemotePlaybook?: (payload: PlaybookPayload) => void;
  onRemotePlayer?: (payload: PlayerPayload) => void;
}

export function useRealtimeSync(callbacks?: RealtimeCallbacks) {
  const { session } = useMultiplayerStore();
  const { trackCursor } = usePresence();
  const { broadcastCursor, broadcastScenario, broadcastPlaybook, broadcastPlayer } = useBroadcast();
  const { setCallbacks } = useBroadcastListeners();
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  useEffect(() => {
    setCallbacks({
      onCursor: (payload: CursorPayload) => {
        const me = session?.participants[0];
        if (me && payload.userId !== me.id) {
          callbacksRef.current?.onRemoteCursor?.(payload.userId, payload.x, payload.z);
        }
      },
      onScenario: (payload: ScenarioPayload) => {
        callbacksRef.current?.onRemoteScenario?.(payload);
      },
      onPlaybook: (payload: PlaybookPayload) => {
        callbacksRef.current?.onRemotePlaybook?.(payload);
      },
      onPlayer: (payload: PlayerPayload) => {
        callbacksRef.current?.onRemotePlayer?.(payload);
      },
    });
  }, [session?.id, setCallbacks]);

  const sendCursor = useCallback(
    async (x: number, z: number) => {
      const me = session?.participants[0];
      if (!me) return;
      await broadcastCursor(me.id, me.name, me.color, x, z);
      await trackCursor(x, z);
    },
    [session?.participants, broadcastCursor, trackCursor],
  );

  const sendScenario = useCallback(
    async (payload: ScenarioPayload) => {
      await broadcastScenario(payload);
    },
    [broadcastScenario],
  );

  const sendPlaybook = useCallback(
    async (payload: PlaybookPayload) => {
      await broadcastPlaybook(payload);
    },
    [broadcastPlaybook],
  );

  const sendPlayer = useCallback(
    async (payload: PlayerPayload) => {
      await broadcastPlayer(payload);
    },
    [broadcastPlayer],
  );

  return {
    sendCursor,
    sendScenario,
    sendPlaybook,
    sendPlayer,
  };
}
