import { Canvas } from '@react-three/fiber';
import { useTranslation } from 'react-i18next';
import { useSaotStore } from '../store/useSaotStore';
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
import { useMultiplayer, type RemoteCursorData } from '../../multiplayer/components/MultiplayerProvider';
import { useState, useCallback, useRef, memo, useMemo } from 'react';

interface SceneCallbacks {
  onDragStart: () => void;
  onDragEndAttacker: (pos: { x: number; z: number }) => void;
  onDragEndDefender: (pos: { x: number; z: number }) => void;
  onDragEndGoalkeeper: (pos: { x: number; z: number }) => void;
  onDragCompleteAttacker: (pos: { x: number; z: number }) => void;
  onDragCompleteDefender: (pos: { x: number; z: number }) => void;
  onDragCompleteGoalkeeper: (pos: { x: number; z: number }) => void;
}

const Scene3D = memo(function Scene3D({ callbacks }: { callbacks: SceneCallbacks }) {
  const { t } = useTranslation();
  const attacker = useSaotStore((s) => s.attacker);
  const defender = useSaotStore((s) => s.defender);
  const goalkeeper = useSaotStore((s) => s.goalkeeper);
  const cameraPreset = useSaotStore((s) => s.cameraPreset);
  const showOffsideLine = useSaotStore((s) => s.showOffsideLine);
  const editMode = useSaotStore((s) => s.editMode);
  const ctx = useMultiplayer();
  const remoteCursors = ctx?.remoteCursors ?? [];

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

  return (
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
        onDragEnd={callbacks.onDragEndAttacker}
        onDragStart={callbacks.onDragStart}
        onDragComplete={callbacks.onDragCompleteAttacker}
        highlighted={editMode || (result.isOffside && showOffsideLine)}
        animationState={isSimulating ? simulation.currentFrame.attackerAnim : 'idle'}
        facingAngle={attackerAngle}
      />
      <Player
        position={isSimulating ? simulation.currentFrame.defenderPosition : defender}
        color="#3b82f6"
        secondaryColor="#1e3a5f"
        label={t('saot.defender')}
        onDragEnd={callbacks.onDragEndDefender}
        onDragStart={callbacks.onDragStart}
        onDragComplete={callbacks.onDragCompleteDefender}
        highlighted={editMode}
        animationState={isSimulating ? simulation.currentFrame.defenderAnim : 'idle'}
        facingAngle={defenderAngle}
      />
      <Player
        position={{ x: goalkeeper.x, z: goalkeeper.z }}
        color="#eab308"
        secondaryColor="#1a1a1a"
        label={t('saot.goalkeeper')}
        onDragEnd={callbacks.onDragEndGoalkeeper}
        onDragStart={callbacks.onDragStart}
        onDragComplete={callbacks.onDragCompleteGoalkeeper}
        highlighted={editMode}
      />

      <Ball
        position={isSimulating ? simulation.currentFrame.ballPosition : [-15, 0.2, 0]}
        spinning={isSimulating}
      />

      {showOffsideLine && (
        <OffsideLine
          defenderX={defender.x}
          attackerX={isSimulating ? simulation.currentFrame.attackerPosition.x : attacker.x}
          isOffside={result.isOffside}
          marginCm={result.marginCm}
          visible={simulation.progress > 0}
        />
      )}

      {remoteCursors.map((cursor: RemoteCursorData) => (
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
        enabled={!editMode}
      />
    </Canvas>
  );
});

export default function SAOTLab() {
  const [activePanel, setActivePanel] = useState<'controls' | 'playbook'>('controls');
  const multiplayer = useMultiplayer();
  const localUserId = useMultiplayerStore((s) => s.localUserId);
  const session = multiplayer?.session ?? [];
  const isConnected = multiplayer?.isConnected ?? false;
  const sendCursor = multiplayer?.sendCursor;
  const sendPlayer = multiplayer?.sendPlayer;
  const sendDrag = multiplayer?.sendDrag;

  const me = localUserId ? session.find((p) => p.id === localUserId) : null;
  const isAdmin = me?.role === 'admin';

  const attacker = useSaotStore((s) => s.attacker);
  const defender = useSaotStore((s) => s.defender);
  const goalkeeper = useSaotStore((s) => s.goalkeeper);
  const setAttacker = useSaotStore((s) => s.setAttacker);
  const setDefender = useSaotStore((s) => s.setDefender);
  const setGoalkeeper = useSaotStore((s) => s.setGoalkeeper);
  const setDragging = useSaotStore((s) => s.setDragging);

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

  const lastCursorBroadcast = useRef(0);

  const handleDragMove = useCallback(
    (target: 'attacker' | 'defender' | 'goalkeeper', pos: { x: number; z: number }) => {
      if (target === 'attacker') setAttacker(pos);
      else if (target === 'defender') setDefender(pos);
      else if (target === 'goalkeeper') setGoalkeeper(pos);
    },
    [setAttacker, setDefender, setGoalkeeper],
  );

  const handleDragComplete = useCallback(
    (target: 'attacker' | 'defender' | 'goalkeeper', pos: { x: number; z: number }) => {
      if (isConnected) {
        sendPlayer?.({ target, position: pos });
        sendDrag?.('end');
      }
      setDragging(null);
    },
    [isConnected, sendPlayer, sendDrag, setDragging],
  );

  const handlePlayerDragStart = useCallback(() => {
    if (isConnected && localUserId) {
      setDragging(localUserId);
      sendDrag?.('start');
    }
  }, [isConnected, localUserId, setDragging, sendDrag]);

  const handleDragEndAttacker = useCallback(
    (pos: { x: number; z: number }) => handleDragMove('attacker', pos),
    [handleDragMove],
  );
  const handleDragEndDefender = useCallback(
    (pos: { x: number; z: number }) => handleDragMove('defender', pos),
    [handleDragMove],
  );
  const handleDragEndGoalkeeper = useCallback(
    (pos: { x: number; z: number }) => handleDragMove('goalkeeper', pos),
    [handleDragMove],
  );

  const handleDragCompleteAttacker = useCallback(
    (pos: { x: number; z: number }) => handleDragComplete('attacker', pos),
    [handleDragComplete],
  );
  const handleDragCompleteDefender = useCallback(
    (pos: { x: number; z: number }) => handleDragComplete('defender', pos),
    [handleDragComplete],
  );
  const handleDragCompleteGoalkeeper = useCallback(
    (pos: { x: number; z: number }) => handleDragComplete('goalkeeper', pos),
    [handleDragComplete],
  );

  const sceneCallbacks = useMemo(() => ({
    onDragStart: handlePlayerDragStart,
    onDragEndAttacker: handleDragEndAttacker,
    onDragEndDefender: handleDragEndDefender,
    onDragEndGoalkeeper: handleDragEndGoalkeeper,
    onDragCompleteAttacker: handleDragCompleteAttacker,
    onDragCompleteDefender: handleDragCompleteDefender,
    onDragCompleteGoalkeeper: handleDragCompleteGoalkeeper,
  }), [handlePlayerDragStart, handleDragEndAttacker, handleDragEndDefender, handleDragEndGoalkeeper, handleDragCompleteAttacker, handleDragCompleteDefender, handleDragCompleteGoalkeeper]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isConnected || !isAdmin || !sendCursor) return;
      const now = Date.now();
      if (now - lastCursorBroadcast.current < 100) return;
      lastCursorBroadcast.current = now;
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 37 - 18.5;
      const z = ((e.clientY - rect.top) / rect.height) * 22 - 11;
      sendCursor(x, z);
    },
    [isConnected, isAdmin, sendCursor],
  );

  return (
    <div className="h-[calc(100vh-7rem)] flex">
      <div className="flex-1 relative" onPointerMove={handlePointerMove}>
        <DataOverlay />
        <Scene3D callbacks={sceneCallbacks} />
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
            {'Controles'}
          </button>
          <button
            onClick={() => setActivePanel('playbook')}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              activePanel === 'playbook'
                ? 'text-brand-400 border-b-2 border-brand-400 bg-brand-500/5'
                : 'text-surface-200/50 hover:text-surface-200/70'
            }`}
          >
            {'Playbook'}
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
