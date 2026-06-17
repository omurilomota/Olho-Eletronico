import { useRef, useEffect, memo } from 'react';
import { Group, Mesh, Material } from 'three';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { DragControls } from '@react-three/drei';
import type { Position } from '../store/useSaotStore';
import { useDragPlayer } from '../hooks/useDragPlayer';

export type AnimationState = 'idle' | 'running' | 'kicking';

interface PlayerProps {
  position: Position;
  color: string;
  secondaryColor: string;
  label: string;
  number: number;
  onDragEnd: (pos: Position) => void;
  highlighted?: boolean;
  animationState?: AnimationState;
  facingAngle?: number;
}

const Player = memo(function Player({
  position,
  color,
  secondaryColor,
  label,
  onDragEnd,
  highlighted = false,
  animationState = 'idle',
  facingAngle = 0,
}: PlayerProps) {
  const groupRef = useRef<Group>(null);
  const leftLegRef = useRef<Group>(null);
  const rightLegRef = useRef<Group>(null);
  const leftArmRef = useRef<Group>(null);
  const rightArmRef = useRef<Group>(null);
  const torsoRef = useRef<Group>(null);
  const handleDrag = useDragPlayer(onDragEnd);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Idle bob
    groupRef.current.position.y = Math.sin(t * 2 + position.x) * 0.02;

    // Face the direction of movement
    if (facingAngle !== 0) {
      groupRef.current.rotation.y = facingAngle;
    }

    const speed = 3;

    // Animate legs
    if (leftLegRef.current && rightLegRef.current) {
      if (animationState === 'running') {
        leftLegRef.current.rotation.x = Math.sin(t * speed) * 0.5;
        rightLegRef.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.5;
      } else if (animationState === 'kicking') {
        // Kicking: right leg swings forward
        const kickPhase = (t * 2) % 1;
        if (kickPhase < 0.3) {
          rightLegRef.current.rotation.x = -kickPhase * 3;
        } else if (kickPhase < 0.6) {
          rightLegRef.current.rotation.x = -0.9 + (kickPhase - 0.3) * 6;
        } else {
          rightLegRef.current.rotation.x = 0.9 - (kickPhase - 0.6) * 3;
        }
        leftLegRef.current.rotation.x = Math.sin(t * speed) * 0.15;
      } else {
        // Idle
        leftLegRef.current.rotation.x *= 0.9;
        rightLegRef.current.rotation.x *= 0.9;
      }
    }

    // Animate arms
    if (leftArmRef.current && rightArmRef.current) {
      if (animationState === 'running') {
        leftArmRef.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.4;
        rightArmRef.current.rotation.x = Math.sin(t * speed) * 0.4;
      } else if (animationState === 'kicking') {
        // Balance: left arm forward when right leg kicks
        leftArmRef.current.rotation.x = Math.sin(t * speed) * 0.6;
        rightArmRef.current.rotation.x = Math.sin(t * speed + Math.PI) * 0.3;
      } else {
        // Idle: slight natural swing
        leftArmRef.current.rotation.x = Math.sin(t * 0.5) * 0.05;
        rightArmRef.current.rotation.x = Math.sin(t * 0.5 + Math.PI) * 0.05;
      }
    }

    // Torso lean
    if (torsoRef.current) {
      if (animationState === 'running') {
        torsoRef.current.rotation.x = Math.sin(t * speed) * 0.03;
      } else if (animationState === 'kicking') {
        torsoRef.current.rotation.z = Math.sin(t * 3) * 0.05;
      } else {
        torsoRef.current.rotation.x *= 0.9;
        torsoRef.current.rotation.z *= 0.9;
      }
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

        {/* Pernas */}
        <group ref={leftLegRef} position={[-0.12, 0.2, 0]}>
          <mesh rotation={[0.3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.065, 0.45, 8]} />
            <meshStandardMaterial color={shortsColor} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.25, 0.02]} castShadow>
            <boxGeometry args={[0.1, 0.08, 0.16]} />
            <meshStandardMaterial color={shoeColor} roughness={0.5} />
          </mesh>
        </group>

        <group ref={rightLegRef} position={[0.12, 0.2, 0]}>
          <mesh rotation={[-0.3, 0, 0]} castShadow>
            <cylinderGeometry args={[0.06, 0.065, 0.45, 8]} />
            <meshStandardMaterial color={shortsColor} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.25, -0.02]} castShadow>
            <boxGeometry args={[0.1, 0.08, 0.16]} />
            <meshStandardMaterial color={shoeColor} roughness={0.5} />
          </mesh>
        </group>

        {/* Torso + shorts */}
        <group ref={torsoRef} position={[0, 0.9, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.45, 0.65, 0.25]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[0, -0.38, 0]} castShadow>
            <boxGeometry args={[0.38, 0.15, 0.22]} />
            <meshStandardMaterial color={shortsColor} roughness={0.6} />
          </mesh>
        </group>

        {/* Bracos */}
        <group ref={leftArmRef} position={[-0.32, 1.05, 0]}>
          <mesh position={[0, -0.18, 0]} rotation={[0, 0, 0.2]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.45, 8]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[-0.04, -0.45, 0]} castShadow>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
        </group>

        <group ref={rightArmRef} position={[0.32, 1.05, 0]}>
          <mesh position={[0, -0.18, 0]} rotation={[0, 0, -0.2]} castShadow>
            <cylinderGeometry args={[0.05, 0.06, 0.45, 8]} />
            <meshStandardMaterial color={color} roughness={0.6} />
          </mesh>
          <mesh position={[0.04, -0.45, 0]} castShadow>
            <sphereGeometry args={[0.06, 8, 8]} />
            <meshStandardMaterial color={skinColor} roughness={0.7} />
          </mesh>
        </group>

        {/* Cabeca + cabelo */}
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
