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
import DataOverlay from '../../../shared/components/DataOverlay';
import { calculateOffside } from '../services/OffsideCalculator';

export default function SAOTLab() {
  const {
    attacker, defender, goalkeeper,
    cameraPreset,
    showOffsideLine,
    setAttacker, setDefender, setGoalkeeper,
  } = useSaotStore();

  const simulation = useSimulation({
    attackerStart: attacker,
    defenderStart: defender,
    ballStart: [-3, 0.2, 0],
    ballEnd: [attacker.x + 2, 0.2, attacker.z],
  });

  const result = calculateOffside(
    simulation.currentFrame.attackerPosition,
    simulation.currentFrame.defenderPosition,
    goalkeeper,
  );

  const activeDefenders = [defender, goalkeeper].sort((a, b) => b.x - a.x);
  const offsideLineX = activeDefenders[1].x;

  const isSimulating = simulation.progress > 0 && simulation.progress < 1;

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
          />
          <Player
            position={isSimulating ? simulation.currentFrame.defenderPosition : defender}
            color="#3b82f6"
            secondaryColor="#1e3a5f"
            label="Defensor"
            number={4}
            onDragEnd={setDefender}
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
            position={isSimulating ? simulation.currentFrame.ballPosition : [-3, 0.2, 0]}
            spinning={isSimulating}
          />

          {showOffsideLine && (
            <OffsideLine
              x={offsideLineX}
              isOffside={result.isOffside}
              marginCm={result.marginCm}
              attackerX={isSimulating ? simulation.currentFrame.attackerPosition.x : attacker.x}
              visible={simulation.progress > 0}
            />
          )}

          <CameraController
            preset={cameraPreset}
            followBall={isSimulating}
            ballPosition={isSimulating ? simulation.currentFrame.ballPosition : [-3, 0.2, 0]}
          />
        </Canvas>
      </div>

      <div className="w-72 border-l border-surface-700/50 glass">
        <ControlPanel simulation={simulation} result={result} />
      </div>
    </div>
  );
}
