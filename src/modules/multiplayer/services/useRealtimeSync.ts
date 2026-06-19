import { useEffect, useRef, useCallback } from 'react';
import { useMultiplayerStore, type Participant } from '../store/useMultiplayerStore';

const SIMULATED_PARTICIPANTS: Omit<Participant, 'id'>[] = [
  { name: 'Coach AI', color: '#3b82f6', role: 'viewer', cursor: { x: 2, z: -1 } },
  { name: 'Analista', color: '#22c55e', role: 'viewer', cursor: { x: -3, z: 2 } },
];

export function useRealtimeSync() {
  const { session, addParticipant, removeParticipant, updateCursor } = useMultiplayerStore();
  const intervalRef = useRef<ReturnType<typeof setInterval>>(null);
  const simParticipantRef = useRef<string | null>(null);

  useEffect(() => {
    if (!session) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const sim = SIMULATED_PARTICIPANTS[Math.floor(Math.random() * SIMULATED_PARTICIPANTS.length)];
    const simId = `sim-${Date.now()}`;
    simParticipantRef.current = simId;

    const timeout = setTimeout(() => {
      addParticipant({
        ...sim,
        id: simId,
        cursor: { x: Math.random() * 10 - 5, z: Math.random() * 6 - 3 },
      });

      intervalRef.current = setInterval(() => {
        updateCursor(
          Math.random() * 10 - 5,
          Math.random() * 6 - 3,
        );
      }, 2000);
    }, 3000);

    return () => {
      clearTimeout(timeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (simParticipantRef.current) {
        removeParticipant(simParticipantRef.current);
        simParticipantRef.current = null;
      }
    };
  }, [session?.id]);

  const broadcastCursor = useCallback(
    (x: number, z: number) => {
      updateCursor(x, z);
    },
    [updateCursor],
  );

  return { broadcastCursor };
}
