import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface OffsideLineProps {
  x: number;
  isOffside: boolean;
  marginCm: number;
  attackerX: number;
  visible: boolean;
}

export default function OffsideLine({ x, isOffside, marginCm, attackerX, visible }: OffsideLineProps) {
  const lineColor = isOffside ? '#ef4444' : '#22c55e';

  if (!visible) return null;

  return (
    <group>
      <mesh position={[x, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.08, 12]} />
        <meshBasicMaterial
          color={lineColor}
          transparent
          opacity={0.7}
          side={THREE.DoubleSide}
        />
      </mesh>

      {[...Array(20)].map((_, i) => (
        <mesh key={i} position={[x, 0.02, (i - 10) * 0.6]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.04, 0.3]} />
          <meshBasicMaterial color={lineColor} transparent opacity={0.9} />
        </mesh>
      ))}

      <mesh position={[x, 1, 0]}>
        <boxGeometry args={[0.04, 2, 0.04]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.4} />
      </mesh>

      <group position={[attackerX, 0.03, 0]}>
        {[...Array(16)].map((_, i) => {
          const angle = (i / 16) * Math.PI * 2;
          const radius = 0.4;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.06, 0.06]} />
              <meshBasicMaterial
                color={isOffside ? '#ef4444' : '#22c55e'}
                transparent
                opacity={0.8}
              />
            </mesh>
          );
        })}
      </group>

      <mesh position={[attackerX, 0.01, 6.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.08]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.6} />
      </mesh>

      <mesh position={[x, 0.01, 6.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.5, 0.08]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.6} />
      </mesh>

      <mesh position={[(attackerX + x) / 2, 0.02, 6.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[Math.abs(attackerX - x), 0.04]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.4} />
      </mesh>

      <Html position={[x, 2.5, 0]} center distanceFactor={10}>
        <div className="pointer-events-none select-none">
          <div
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-white text-center whitespace-nowrap animate-pulse"
            style={{
              backgroundColor: isOffside ? '#ef4444' : '#22c55e',
              boxShadow: `0 0 20px ${isOffside ? '#ef444466' : '#22c55e66'}`,
            }}
          >
            {isOffside ? 'IMPEDIDO' : 'LEGAL'}
            <br />
            <span className="text-[10px] font-normal opacity-80">
              Margem: {Math.abs(marginCm).toFixed(1)} cm
            </span>
          </div>
        </div>
      </Html>

      {isOffside && (
        <Html position={[attackerX, 2.5, 0]} center distanceFactor={10}>
          <div className="pointer-events-none select-none">
            <div className="text-red-400 text-lg font-bold animate-bounce">
              &#x26A0;
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
