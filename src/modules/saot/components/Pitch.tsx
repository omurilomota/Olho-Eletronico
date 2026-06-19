import { useMemo, type ReactNode } from 'react';
import * as THREE from 'three';

function createGrassTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const stripeWidth = 512 / 14;
  for (let i = 0; i < 14; i++) {
    ctx.fillStyle = i % 2 === 0 ? '#2d8a4e' : '#34a058';
    ctx.fillRect(i * stripeWidth, 0, stripeWidth, 512);
  }

  for (let i = 0; i < 3000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    ctx.fillStyle = `rgba(${20 + Math.random() * 20}, ${90 + Math.random() * 30}, ${30 + Math.random() * 20}, 0.4)`;
    ctx.fillRect(x, y, 1, 2);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(8, 6);
  return texture;
}

function PitchMarkings() {
  const W = 37;
  const H = 22;
  const lineY = 0.02;
  const LW = 0.12;
  const halfW = W / 2;
  const halfH = H / 2;

  const penaltyDist = 6.75;
  const penaltyHalfH = 6;
  const goalAreaDist = 3;
  const goalAreaHalfH = 3;
  const centerR = 3;
  const lines = useMemo(() => {
    const r: { pos: [number, number, number]; scale: [number, number, number] }[] = [];

    // Limites do campo (bordas)
    r.push({ pos: [0, lineY, -halfH], scale: [W, LW, LW] });
    r.push({ pos: [0, lineY, halfH], scale: [W, LW, LW] });
    r.push({ pos: [-halfW, lineY, 0], scale: [LW, LW, H] });
    r.push({ pos: [halfW, lineY, 0], scale: [LW, LW, H] });

    // Linha central
    r.push({ pos: [0, lineY, 0], scale: [LW, LW, H] });

    // === Areas de penalty (contorno: 3 linhas cada — a 4a e a borda do campo) ===
    // Gol esquerdo (x = -halfW)
    const pL = -halfW + penaltyDist;
    r.push({ pos: [pL, lineY, 0], scale: [LW, LW, penaltyHalfH * 2] }); // linha interna (paralela a lateral)
    r.push({ pos: [-halfW + penaltyDist / 2, lineY, -penaltyHalfH], scale: [penaltyDist, LW, LW] }); // topo
    r.push({ pos: [-halfW + penaltyDist / 2, lineY, penaltyHalfH], scale: [penaltyDist, LW, LW] }); // base

    // Gol direito (x = +halfW)
    const pR = halfW - penaltyDist;
    r.push({ pos: [pR, lineY, 0], scale: [LW, LW, penaltyHalfH * 2] });
    r.push({ pos: [halfW - penaltyDist / 2, lineY, -penaltyHalfH], scale: [penaltyDist, LW, LW] });
    r.push({ pos: [halfW - penaltyDist / 2, lineY, penaltyHalfH], scale: [penaltyDist, LW, LW] });

    // === Areas de gol (contorno: 3 linhas cada) ===
    // Gol esquerdo
    const gL = -halfW + goalAreaDist;
    r.push({ pos: [gL, lineY, 0], scale: [LW, LW, goalAreaHalfH * 2] });
    r.push({ pos: [-halfW + goalAreaDist / 2, lineY, -goalAreaHalfH], scale: [goalAreaDist, LW, LW] });
    r.push({ pos: [-halfW + goalAreaDist / 2, lineY, goalAreaHalfH], scale: [goalAreaDist, LW, LW] });

    // Gol direito
    const gR = halfW - goalAreaDist;
    r.push({ pos: [gR, lineY, 0], scale: [LW, LW, goalAreaHalfH * 2] });
    r.push({ pos: [halfW - goalAreaDist / 2, lineY, -goalAreaHalfH], scale: [goalAreaDist, LW, LW] });
    r.push({ pos: [halfW - goalAreaDist / 2, lineY, goalAreaHalfH], scale: [goalAreaDist, LW, LW] });

    // Arcos de escanteio
    const cornerSegments = 12;
    const cornerR = 1;
    const corners: [number, number][] = [
      [-halfW, -halfH],
      [halfW, -halfH],
      [-halfW, halfH],
      [halfW, halfH],
    ];

    corners.forEach(([cx, cz]) => {
      for (let i = 0; i < cornerSegments; i++) {
        const a1 = (i / cornerSegments) * Math.PI * 0.5;
        const a2 = ((i + 1) / cornerSegments) * Math.PI * 0.5;
        const x1 = cx + Math.cos(a1) * cornerR * (cx > 0 ? -1 : 1);
        const z1 = cz + Math.sin(a1) * cornerR * (cz > 0 ? -1 : 1);
        const x2 = cx + Math.cos(a2) * cornerR * (cx > 0 ? -1 : 1);
        const z2 = cz + Math.sin(a2) * cornerR * (cz > 0 ? -1 : 1);
        r.push({
          pos: [(x1 + x2) / 2, lineY, (z1 + z2) / 2],
          scale: [LW, LW, cornerR * Math.PI * 0.5 / cornerSegments + 0.02],
        });
      }
    });

    return r;
  }, []);

  // Circulo central
  const centerCircle = useMemo(() => {
    const segments = 64;
    const result: ReactNode[] = [];
    for (let i = 0; i < segments; i++) {
      const a1 = (i / segments) * Math.PI * 2;
      const a2 = ((i + 1) / segments) * Math.PI * 2;
      const x1 = Math.cos(a1) * centerR;
      const z1 = Math.sin(a1) * centerR;
      const x2 = Math.cos(a2) * centerR;
      const z2 = Math.sin(a2) * centerR;
      result.push(
        <mesh key={`cc-${i}`} position={[(x1 + x2) / 2, lineY, (z1 + z2) / 2]}>
          <boxGeometry args={[LW, LW, centerR * 2 * Math.PI / segments + 0.02]} />
          <meshStandardMaterial color="white" roughness={0.8} />
        </mesh>
      );
    }
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

      {centerCircle}

      {/* Macadores de penalty */}
      <mesh position={[-halfW + 6.5, lineY + 0.01, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.6} />
      </mesh>
      <mesh position={[halfW - 6.5, lineY + 0.01, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.6} />
      </mesh>

      {/* Centro */}
      <mesh position={[0, lineY + 0.01, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshStandardMaterial color="white" roughness={0.6} />
      </mesh>
    </group>
  );
}

export default function Pitch() {
  const grassTexture = useMemo(() => createGrassTexture(), []);

  return (
    <group>
      {/* Gramado */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[37, 22]} />
        <meshStandardMaterial
          map={grassTexture}
          roughness={0.9}
          metalness={0.0}
          color="#1e7a30"
        />
      </mesh>

      <PitchMarkings />
    </group>
  );
}
