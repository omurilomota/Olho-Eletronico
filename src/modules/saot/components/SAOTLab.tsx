import { Canvas } from '@react-three/fiber';
import { useTranslation } from 'react-i18next';
import { useSaotStore } from '../store/useSaotStore';
import { usePlaybookStore } from '../store/usePlaybookStore';
import { useSimulation } from '../hooks/useSimulation';
import Pitch from './Pitch';
import Goals from './Goals';
import Stadium from './Stadium';
import Environment from './Environment';
import Player from './Player';
import Ball from './Ball';
import OffsideLine from './OffsideLine';
import CameraController from './CameraController';
import ControlPanel from './ControlPanel';
import PlaybookMode from './PlaybookMode';
import RemoteCursor from './RemoteCursor';
import DataOverlay from '../../../shared/components/DataOverlay';
import { calculateOffside } from '../services/OffsideCalculator';
import { useMultiplayerStore } from '../../multiplayer/store/useMultiplayerStore';
import { useRealtimeSync, type ScenarioPayload, type PlayerPayload } from '../../multiplayer/services/useRealtimeSync';
import { useState, useCallback, useRef, useEffect } from 'react';

interface RemoteCursorData {
  userId: string;
  name: string;
  color: string;
  x: number;
  z: number;
}

export default function SAOTLab() {
  const { t } = useTranslation();
  const [activePanel, setActivePanel] = useState<'controls' | 'playbook'>('controls');
  const session = useMultiplayerStore((s) => s.session);
  const [remoteCursors, setRemoteCursors] = useState<RemoteCursorData[]>([]);
  const me = session?.participants[0];
  const isAdmin = me?.role === 'admin';

  useEffect(() => {
    if (!session) return;
    const participantIds = new Set(session.participants.map((p) => p.id));
    setRemoteCursors((prev) => prev.filter((c) => participantIds.has(c.userId)));
  }, [session?.participants]);

  const attacker = useSaotStore((s) => s.attacker);
  const defender = useSaotStore((s) => s.defender);
  const goalkeeper = useSaotStore((s) => s.goalkeeper);
  const activeScenario = useSaotStore((s) => s.activeScenario);
  const cameraPreset = useSaotStore((s) => s.cameraPreset);
  const showOffsideLine = useSaotStore((s) => s.showOffsideLine);
  const setAttacker = useSaotStore((s) => s.setAttacker);
  const setDefender = useSaotStore((s) => s.setDefender);
  const setGoalkeeper = useSaotStore((s) => s.setGoalkeeper);

  const simulation = useSimulation({
    attackerStart: attacker,
    defenderStart: defender,
    goalkeeperStart: { x: goalkeeper.x, z: goalkeeper.z },
    ballStart: [-15, 0.2, 0],
    ballEnd: [attacker.x + 3.5, 0.2, attacker.z],
  });

  const result = calculateOffside(
    simulation.currentFrame.attackerPosition,
    simulation.currentFrame.defenderPosition,
    goalkeeper,
  );

  const offsideLineX = defender.x;

  const isSimulating = simulation.progress > 0 && simulation.progress < 1;

  const attackerAngle = isSimulating
    ? Math.atan2(
        simulation.currentFrame.attackerPosition.z - attacker.z,
        simulation.currentFrame.attackerPosition.x - attacker.x,
      )
    : 0;

  const defenderAngle = isSimulating
    ? Math.atan2(
        simulation.currentFrame.defenderPosition.z - defender.z,
        simulation.currentFrame.defenderPosition.x - defender.x,
      )
    : 0;

  const handleRemoteCursor = useCallback((userId: string, x: number, z: number) => {
    setRemoteCursors((prev) => {
      const existing = prev.find((c) => c.userId === userId);
      if (existing) {
        return prev.map((c) => (c.userId === userId ? { ...c, x, z } : c));
      }
      const cursorSession = useMultiplayerStore.getState().session;
      const participant = cursorSession?.participants.find((p) => p.id === userId);
      if (!participant) return prev;
      return [...prev, { userId, name: participant.name, color: participant.color, x, z }];
    });
  }, []);

  const handleRemoteScenario = useCallback((payload: ScenarioPayload) => {
    const { setAttacker: sA, setDefender: sD, setGoalkeeper: sG, loadScenario } = useSaotStore.getState();
    sA(payload.attacker);
    sD(payload.defender);
    sG(payload.goalkeeper);
    loadScenario(payload.activeScenario);
  }, []);

  const handleRemotePlayer = useCallback((payload: PlayerPayload) => {
    const store = useSaotStore.getState();
    if (payload.target === 'attacker') store.setAttacker(payload.position);
    else if (payload.target === 'defender') store.setDefender(payload.position);
    else if (payload.target === 'goalkeeper') store.setGoalkeeper(payload.position);
  }, []);

  const { sendCursor, sendPlayer, sendScenario, sendPlaybook } = useRealtimeSync({
    onRemoteCursor: handleRemoteCursor,
    onRemoteScenario: handleRemoteScenario,
    onRemotePlayer: handleRemotePlayer,
  });

  const lastActiveScenario = useRef(activeScenario);
  useEffect(() => {
    if (!session || lastActiveScenario.current === activeScenario) return;
    lastActiveScenario.current = activeScenario;
    sendScenario({ attacker, defender, goalkeeper, activeScenario });
  }, [activeScenario, session, attacker, defender, goalkeeper, sendScenario]);

  const { currentPlayId, currentStep } = usePlaybookStore();
  const lastPlayRef = useRef({ playId: currentPlayId, step: currentStep });
  useEffect(() => {
    if (!session) return;
    if (lastPlayRef.current.playId === currentPlayId && lastPlayRef.current.step === currentStep) return;
    lastPlayRef.current = { playId: currentPlayId, step: currentStep };
    sendPlaybook({ playId: currentPlayId, step: currentStep });
  }, [currentPlayId, currentStep, session, sendPlaybook]);

  const lastCursorBroadcast = useRef(0);

  const handleDragEnd = useCallback(
    (target: 'attacker' | 'defender' | 'goalkeeper', pos: { x: number; z: number }) => {
      if (target === 'attacker') setAttacker(pos);
      else if (target === 'defender') setDefender(pos);
      else if (target === 'goalkeeper') setGoalkeeper(pos);

      if (session) {
        sendPlayer({ target, position: pos });
      }
    },
    [session, sendPlayer, setAttacker, setDefender, setGoalkeeper],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!session || !isAdmin) return;
      const now = Date.now();
      if (now - lastCursorBroadcast.current < 100) return;
      lastCursorBroadcast.current = now;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 37 - 18.5;
      const z = ((e.clientY - rect.top) / rect.height) * 22 - 11;
      sendCursor(x, z);
    },
    [session, isAdmin, sendCursor],
  );

  return (
    <div className="h-[calc(100vh-7rem)] flex">
      <div className="flex-1 relative" onPointerMove={handlePointerMove}>
        <DataOverlay />
        <Canvas
          shadows
          camera={{ position: [0, 12, 18], fov: 50 }}
          className="w-full h-full"
        >
          <Environment />
          <Pitch />
          <Goals />
          <Stadium />

          <Player
            position={isSimulating ? simulation.currentFrame.attackerPosition : attacker}
            color="#ef4444"
            secondaryColor="#ffffff"
            label={t('saot.attacker')}
            onDragEnd={(pos) => handleDragEnd('attacker', pos)}
            highlighted={result.isOffside && showOffsideLine}
            animationState={isSimulating ? simulation.currentFrame.attackerAnim : 'idle'}
            facingAngle={attackerAngle}
          />
          <Player
            position={isSimulating ? simulation.currentFrame.defenderPosition : defender}
            color="#3b82f6"
            secondaryColor="#1e3a5f"
            label={t('saot.defender')}
            onDragEnd={(pos) => handleDragEnd('defender', pos)}
            animationState={isSimulating ? simulation.currentFrame.defenderAnim : 'idle'}
            facingAngle={defenderAngle}
          />
          <Player
            position={{ x: goalkeeper.x, z: goalkeeper.z }}
            color="#eab308"
            secondaryColor="#1a1a1a"
            label={t('saot.goalkeeper')}
            onDragEnd={(pos) => handleDragEnd('goalkeeper', pos)}
          />

          <Ball
            position={isSimulating ? simulation.currentFrame.ballPosition : [-15, 0.2, 0]}
            spinning={isSimulating}
          />

          {showOffsideLine && (
            <OffsideLine
              defenderX={offsideLineX}
              attackerX={isSimulating ? simulation.currentFrame.attackerPosition.x : attacker.x}
              isOffside={result.isOffside}
              marginCm={result.marginCm}
              visible={simulation.progress > 0}
            />
          )}

          {remoteCursors.map((cursor) => (
            <RemoteCursor
              key={cursor.userId}
              position={{ x: cursor.x, z: cursor.z }}
              color={cursor.color}
              name={cursor.name}
            />
          ))}

          <CameraController
            preset={cameraPreset}
            followBall={isSimulating}
            ballPosition={isSimulating ? simulation.currentFrame.ballPosition : [-15, 0.2, 0]}
          />
        </Canvas>
      </div>

      <div className="w-72 border-l border-surface-700/50 glass flex flex-col">
        <div className="flex border-b border-surface-700/50">
          <button
            onClick={() => setActivePanel('controls')}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              activePanel === 'controls'
                ? 'text-brand-400 border-b-2 border-brand-400 bg-brand-500/5'
                : 'text-surface-200/50 hover:text-surface-200/70'
            }`}
          >
            {t('saot.controls', 'Controles')}
          </button>
          <button
            onClick={() => setActivePanel('playbook')}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              activePanel === 'playbook'
                ? 'text-brand-400 border-b-2 border-brand-400 bg-brand-500/5'
                : 'text-surface-200/50 hover:text-surface-200/70'
            }`}
          >
            {t('saot.playbook', 'Playbook')}
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activePanel === 'controls' ? (
            <ControlPanel simulation={simulation} result={result} />
          ) : (
            <div className="h-full overflow-y-auto p-4">
              <PlaybookMode />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
