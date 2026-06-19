import { useCallback, useRef } from 'react';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
import { useRealtimeChannel } from './useRealtimeChannel';
import type { ScenarioPayload, PlaybookPayload, PlayerPayload } from './useRealtimeChannel';

export type { ScenarioPayload, PlaybookPayload, PlayerPayload };

interface RealtimeCallbacks {
  onRemoteCursor?: (userId: string, x: number, z: number) => void;
  onRemoteScenario?: (payload: ScenarioPayload) => void;
  onRemotePlaybook?: (payload: PlaybookPayload) => void;
  onRemotePlayer?: (payload: PlayerPayload) => void;
}

export function useRealtimeSync(callbacks?: RealtimeCallbacks) {
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const handleCursor = useCallback(
    (payload: { userId: string; name: string; color: string; x: number; z: number }) => {
      const me = useMultiplayerStore.getState().session?.participants[0];
      if (me && payload.userId !== me.id) {
        callbacksRef.current?.onRemoteCursor?.(payload.userId, payload.x, payload.z);
      }
    },
    [],
  );

  const handleScenario = useCallback(
    (payload: ScenarioPayload) => {
      callbacksRef.current?.onRemoteScenario?.(payload);
    },
    [],
  );

  const handlePlaybook = useCallback(
    (payload: PlaybookPayload) => {
      callbacksRef.current?.onRemotePlaybook?.(payload);
    },
    [],
  );

  const handlePlayer = useCallback(
    (payload: PlayerPayload) => {
      callbacksRef.current?.onRemotePlayer?.(payload);
    },
    [],
  );

  const { trackCursor, broadcastCursor, broadcastScenario, broadcastPlaybook, broadcastPlayer } =
    useRealtimeChannel({
      onCursor: handleCursor,
      onScenario: handleScenario,
      onPlaybook: handlePlaybook,
      onPlayer: handlePlayer,
    });

  const sendCursor = useCallback(
    async (x: number, z: number) => {
      const me = useMultiplayerStore.getState().session?.participants[0];
      if (!me) return;
      await broadcastCursor(me.id, me.name, me.color, x, z);
      await trackCursor(x, z);
    },
    [broadcastCursor, trackCursor],
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

  return { sendCursor, sendScenario, sendPlaybook, sendPlayer };
}
