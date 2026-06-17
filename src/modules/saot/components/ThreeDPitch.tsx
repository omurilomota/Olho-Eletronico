import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { useRef, useEffect, useMemo } from 'react';
import { useSaotStore } from '../store/useSaotStore';
import type { OffsideResult } from '../services/OffsideCalculator';
import Player from './Player';

export default function ThreeDPitch({
  showResult,
}: {
  showResult?: OffsideResult;
}) {
  const {
    attacker,
    defender,
    goalkeeper,
    setAttacker,
    setDefender,
    setGoalkeeper,
  } = useSaotStore();
  const controlsRef = useRef(null);

  useEffect(() => {
    return () => {
      (
        controlsRef.current as unknown as { dispose?: () => void }
      )?.dispose?.();
    };
  }, []);

  const offsideLineX = useMemo(() => {
    if (!showResult) return null;
    const defenders = [defender, goalkeeper].sort((a, b) => b.x - a.x);
    return defenders[1].x;
  }, [showResult, defender, goalkeeper]);

  return (
    <div className="h-[500px] w-full relative">
      <Canvas camera={{ position: [0, 10, 15], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <OrbitControls ref={controlsRef} enableDamping />

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <planeGeometry args={[20, 12]} />
          <meshStandardMaterial color="green" />
        </mesh>

        <gridHelper args={[20, 20, 'white', 'white']} position={[0, 0.01, 0]} />

        <Player position={attacker} color="red" onDragEnd={setAttacker} />
        <Player position={defender} color="blue" onDragEnd={setDefender} />
        <Player
          position={goalkeeper}
          color="yellow"
          onDragEnd={setGoalkeeper}
        />

        {offsideLineX !== null && (
          <mesh position={[offsideLineX, 0.05, 0]}>
            <boxGeometry args={[0.05, 2, 12]} />
            <meshBasicMaterial
              color={showResult?.isOffside ? 'red' : 'green'}
            />
          </mesh>
        )}
      </Canvas>
    </div>
  );
}
