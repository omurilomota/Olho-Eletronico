import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';

interface RemoteCursorProps {
  position: { x: number; z: number };
  color: string;
  name: string;
}

export default function RemoteCursor({ position, color, name }: RemoteCursorProps) {
  const groupRef = useRef<THREE.Group>(null);
  const targetRef = useRef(new THREE.Vector3(position.x, 0.5, position.z));

  useFrame(() => {
    if (!groupRef.current) return;
    targetRef.current.set(position.x, 0.5, position.z);
    groupRef.current.position.lerp(targetRef.current, 0.15);
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.3, 0]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.2, 0.25, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.4} />
      </mesh>
      <Text
        position={[0, 0.6, 0]}
        fontSize={0.18}
        color="white"
        anchorX="center"
        anchorY="bottom"
        outlineWidth={0.02}
        outlineColor="black"
      >
        {name}
      </Text>
    </group>
  );
}
