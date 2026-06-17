import { useMemo } from 'react';
import * as THREE from 'three';

function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const stripeWidth = 512 / 12;
  for (let i = 0; i < 12; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#2d8a4e' : '#34a058';
    ctx.fillRect(i * stripeWidth, 0, stripeWidth, 512);
  }

  for (let i = 0; i < 2000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = `rgba(${30 + Math.random() * 20}, ${120 + Math.random() * 30}, ${60 + Math.random() * 20}, 0.3)`;
    ctx.fillRect(x, y, 1, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(4, 2);
  return texture;
}

function PitchMarkings() {
  const W = 20;
  const H = 12;
  const lineY = 0.02;
  const lineWidth = 0.05;
  const halfW = W / 2;
  const halfH = H / 2;

  const penaltyW = 4.5;
  const penaltyH = 8;
  const goalAreaW = 2;
  const goalAreaH = 4;
  const centerR = 2;

  const lines = useMemo(() => {
    const result: { pos: [number, number, number]; scale: [number, number, number] }[] = [];

    result.push({ pos: [0, lineY, -halfH], scale: [W, lineWidth, lineWidth] });
    result.push({ pos: [0, lineY, halfH], scale: [W, lineWidth, lineWidth] });
    result.push({ pos: [-halfW, lineY, 0], scale: [lineWidth, lineWidth, H] });
    result.push({ pos: [halfW, lineY, 0], scale: [lineWidth, lineWidth, H] });

    result.push({ pos: [0, lineY, 0], scale: [lineWidth, lineWidth, H] });

    result.push({ pos: [-halfW + penaltyW / 2, lineY, 0], scale: [penaltyW, lineWidth, penaltyH] });
    result.push({ pos: [halfW - penaltyW / 2, lineY, 0], scale: [penaltyW, lineWidth, penaltyH] });

    result.push({ pos: [-halfW + goalAreaW / 2, lineY, 0], scale: [goalAreaW, lineWidth, goalAreaH] });
    result.push({ pos: [halfW - goalAreaW / 2, lineY, 0], scale: [goalAreaW, lineWidth, goalAreaH] });

    return result;
  }, []);

  return (
    <group>
      {lines.map((line, i) => (
        <mesh key={i} position={line.pos}>
          <boxGeometry args={line.scale} />
          <meshStandardMaterial color="white" roughness={0.8} />
        </mesh>
      ))}

      {(() => {
        const segments = 64;
        const centerLine: any[] = [];
        for (let i = 0; i < segments; i++) {
          const a1 = (i / segments) * Math.PI * 2;
          const a2 = ((i + 1) / segments) * Math.PI * 2;
          const x1 = Math.cos(a1) * centerR;
          const z1 = Math.sin(a1) * centerR;
          const x2 = Math.cos(a2) * centerR;
          const z2 = Math.sin(a2) * centerR;
          centerLine.push(
            <mesh key={`center-${i}`} position={[(x1 + x2) / 2, lineY, (z1 + z2) / 2]}>
              <boxGeometry args={[lineWidth, lineWidth, centerR * 2 * Math.PI / segments + 0.02]} />
              <meshStandardMaterial color="white" roughness={0.8} />
            </mesh>
          );
        }
        return centerLine;
      })()}

      <mesh position={[-3.5, lineY + 0.01, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.6} />
      </mesh>
      <mesh position={[3.5, lineY + 0.01, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.6} />
      </mesh>

      <mesh position={[0, lineY + 0.01, 0]}>
        <sphereGeometry args={[0.08, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function Pitch() {
  const grassTexture = useMemo(() => createGrassTexture(), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[20, 12]} />
        <meshStandardMaterial
          map={grassTexture}
          roughness={0.9}
          metalness={0.0}
          color="#3aaa5c"
        />
      </mesh>

      <PitchMarkings />
    </group>
  );
}
