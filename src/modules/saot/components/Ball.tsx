import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface BallProps {
  position: [number, number, number];
  visible?: boolean;
  spinning?: boolean;
}

function createBallTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 256, 256);

  ctx.strokeStyle = '#333333';
  ctx.lineWidth = 2;

  const pentagonSize = 30;
  const centerX = 128;
  const centerY = 128;

  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const x = centerX + pentagonSize * Math.cos(angle);
    const y = centerY + pentagonSize * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  for (let i = 0; i < 5; i++) {
    const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2;
    const x1 = centerX + pentagonSize * Math.cos(angle);
    const y1 = centerY + pentagonSize * Math.sin(angle);

    const nextAngle = ((i + 1) * 2 * Math.PI) / 5 - Math.PI / 2;
    const x2 = centerX + pentagonSize * Math.cos(nextAngle);
    const y2 = centerY + pentagonSize * Math.sin(nextAngle);

    const midAngle = ((i + 0.5) * 2 * Math.PI) / 5 - Math.PI / 2;
    const outerR = pentagonSize * 2.2;
    const ox = centerX + outerR * Math.cos(midAngle);
    const oy = centerY + outerR * Math.sin(midAngle);

    ctx.beginPath();
    ctx.arc(x1, y1, 4, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(ox, oy);
    ctx.strokeStyle = '#666666';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(ox, oy);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

export default function Ball({ position, visible = true, spinning = false }: BallProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useMemo(() => createBallTexture(), []);

  useFrame((state) => {
    if (meshRef.current && spinning) {
      meshRef.current.rotation.x += 0.05;
      meshRef.current.rotation.z += 0.03;
    }
    if (meshRef.current) {
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 3) * 0.01;
    }
  });

  if (!visible) return null;

  return (
    <group>
      <mesh ref={meshRef} position={position} castShadow>
        <icosahedronGeometry args={[0.12, 2]} />
        <meshStandardMaterial
          map={texture}
          roughness={0.4}
          metalness={0.1}
          envMapIntensity={0.5}
        />
      </mesh>

      <mesh position={[position[0], 0.005, position[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.15, 16]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.2} />
      </mesh>
    </group>
  );
}
