import { useRef, useEffect, memo } from 'react';
import { Group, Mesh, Material } from 'three';
import { DragControls } from '@react-three/drei';
import type { Position } from '../store/useSaotStore';
import { useDragPlayer } from '../hooks/useDragPlayer';

interface PlayerProps {
  position: Position;
  color: string;
  onDragEnd: (pos: Position) => void;
}

const Player = memo(function Player({ position, color, onDragEnd }: PlayerProps) {
  const groupRef = useRef<Group>(null);
  const handleDrag = useDragPlayer(onDragEnd);

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

  return (
    <DragControls onDrag={handleDrag} autoTransform={false}>
      <group ref={groupRef} position={[position.x, 0, position.z]}>
        <mesh position={[0, 1, 0]}>
          <cylinderGeometry args={[0.2, 0.2, 1.5, 8]} />
          <meshStandardMaterial color={color} />
        </mesh>
        <mesh position={[0, 1.9, 0]}>
          <sphereGeometry args={[0.2, 16, 16]} />
          <meshStandardMaterial color="peachpuff" />
        </mesh>
        <mesh position={[0.1, 0.1, 0.15]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
        <mesh position={[-0.1, 0.1, -0.15]}>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="black" />
        </mesh>
      </group>
    </DragControls>
  );
});

export default Player;
