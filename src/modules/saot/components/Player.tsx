import { useRef, useEffect, memo } from 'react';
import { Group, Mesh, Material } from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { DragControls } from '@react-three/drei';
import type { Position } from '../store/useSaotStore';
import { useDragPlayer } from '../hooks/useDragPlayer';

interface PlayerProps {
  position: Position;
  color: string;
  secondaryColor: string;
  label: string;
  number: number;
  onDragEnd: (pos: Position) => void;
  highlighted?: boolean;
}

const Player = memo(function Player({
  position,
  color,
  secondaryColor,
  label,
  onDragEnd,
  highlighted = false,
}: PlayerProps) {
  const groupRef = useRef<Group>(null);
  const handleDrag = useDragPlayer(onDragEnd);

  useFrame((state) => {
    if (groupRef.current) {
      const t = state.clock.elapsedTime;
      groupRef.current.position.y = Math.sin(t * 2 + position.x) * 0.02;
    }
  });

  useEffect(() => {
    return () => {
      groupRef.current?.traverse((child) => {
        if (child instanceof Mesh) {
          child.geometry?.dispose();
          if (Array.isArray(child.material)) {
            child.material.forEach((m: Material) => m.dispose());
          } else {
            child.material?.dispose();
          }
        }
      });
    };
  }, []);

  const skinColor = '#e8b89d';
  const shortsColor = secondaryColor || '#ffffff';
  const shoeColor = '#1a1a1a';

  return (
    <DragControls onDrag={handleDrag} autoTransform={false}>
      <group ref={groupRef} position={[position.x, 0, position.z]}>

        {/* Legs + shoes (ground level) */}
        <group position={[-0.12, 0.2, 0]}>
          <mesh rotation={[0.3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.065, 0.45, 8]} />
            <meshStandardMaterial color={shortsColor} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.25, 0.02]} castShadow>
            <boxGeometry args={[0.1, 0.08, 0.16]} />
            <meshStandardMaterial color={shoeColor} roughness={0.5} />
          </mesh>
        </group>

        <group position={[0.12, 0.2, 0]}>
          <mesh rotation={[-0.3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.065, 0.45, 8]} />
            <meshStandardMaterial color={shortsColor} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.25, -0.02]} castShadow>
            <boxGeometry args={[0.1, 0.08, 0.16]} />
            <meshStandardMaterial color={shoeColor} roughness={0.5} />
          </mesh>
        </group>

        {/* Torso + shorts (mid section) */}
        <group position={[0, 0.9, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.45, 0.65, 0.25]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.38, 0]} castShadow>
            <boxGeometry args={[0.38, 0.15, 0.22]} />
            <meshStandardMaterial color={shortsColor} roughness={0.6} />
          </mesh>
        </group>

        {/* Arms (from shoulders) */}
        <group position={[-0.32, 1.05, 0]}>
          <mesh position={[0, -0.18, 0]} rotation={[0, 0, 0.2]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.45, 8]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[-0.04, -0.45, 0]} castShadow>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
        </group>

        <group position={[0.32, 1.05, 0]}>
          <mesh position={[0, -0.18, 0]} rotation={[0, 0, -0.2]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.45, 8]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[0.04, -0.45, 0]} castShadow>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Head + hair (on top of torso) */}
        <group position={[0, 1.45, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.16, 16, 16]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, 0.1, 0]} castShadow>
            <sphereGeometry args={[0.17, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} />
            <meshStandardMaterial color="#2d1b0e" roughness={0.8} />
          </mesh>
        </group>

        {/* Highlight ring */}
        {highlighted && (
          <mesh position={[0, 0.9, 0]}>
            <ringGeometry args={[0.5, 0.6, 32]} />
            <meshBasicMaterial color="#ef4444" transparent opacity={0.6} side={2} />
          </mesh>
        )}

        {/* Floating label */}
        <Html position={[0, 2.0, 0]} center distanceFactor={8}>
          <div className="pointer-events-none select-none">
            <div
              className="px-2 py-0.5 rounded text-[10px] font-bold text-white text-center whitespace-nowrap"
              style={{ backgroundColor: color, boxShadow: `0 2px 8px ${color}66` }}
            >
              {label}
            </div>
          </div>
        </Html>

        {/* Shadow circle on ground */}
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.25, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.3} />
        </mesh>
      </group>
    </DragControls>
  );
});

export default Player;
