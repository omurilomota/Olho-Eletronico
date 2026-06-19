import { Canvas } from '@react-three/fiber';
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
import DataOverlay from '../../../shared/components/DataOverlay';
import { calculateOffside } from '../services/OffsideCalculator';
import { useState } from 'react';

export default function SAOTLab() {
  const [activePanel, setActivePanel] = useState<'controls' | 'playbook'>('controls');

  const {
    attacker, defender, goalkeeper,
    cameraPreset,
    showOffsideLine,
    setAttacker, setDefender, setGoalkeeper,
  } = useSaotStore();

  const simulation = useSimulation({
    attackerStart: attacker,
    defenderStart: defender,
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

  return (
    <div className="h-[calc(100vh-7rem)] flex">
      <div className="flex-1 relative">
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
            label="Atacante"
            number={9}
            onDragEnd={setAttacker}
            highlighted={result.isOffside && showOffsideLine}
            animationState={isSimulating ? simulation.currentFrame.attackerAnim : 'idle'}
            facingAngle={attackerAngle}
          />
          <Player
            position={isSimulating ? simulation.currentFrame.defenderPosition : defender}
            color="#3b82f6"
            secondaryColor="#1e3a5f"
            label="Defensor"
            number={4}
            onDragEnd={setDefender}
            animationState={isSimulating ? simulation.currentFrame.defenderAnim : 'idle'}
            facingAngle={defenderAngle}
          />
          <Player
            position={{ x: goalkeeper.x, z: goalkeeper.z }}
            color="#eab308"
            secondaryColor="#1a1a1a"
            label="Goleiro"
            number={1}
            onDragEnd={setGoalkeeper}
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

          <CameraController
            preset={cameraPreset}
            followBall={isSimulating}
            ballPosition={isSimulating ? simulation.currentFrame.ballPosition : [-15, 0.2, 0]}
          />
        </Canvas>
      </div>

      <div className="w-72 border-l border-surface-700/50 glass flex flex-col">
        {/* Tab switcher */}
        <div className="flex border-b border-surface-700/50">
          <button
            onClick={() => setActivePanel('controls')}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              activePanel === 'controls'
                ? 'text-brand-400 border-b-2 border-brand-400 bg-brand-500/5'
                : 'text-surface-200/50 hover:text-surface-200/70'
            }`}
          >
            Controles
          </button>
          <button
            onClick={() => setActivePanel('playbook')}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              activePanel === 'playbook'
                ? 'text-brand-400 border-b-2 border-brand-400 bg-brand-500/5'
                : 'text-surface-200/50 hover:text-surface-200/70'
            }`}
          >
            Playbook
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
