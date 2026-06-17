import { useMemo } from 'react';
import * as THREE from 'three';

function Goal({ position, rotation }: { position: [number, number, number]; rotation: [number, number, number] }) {
  const postRadius = 0.06;
  const crossbarHeight = 2.44;
  const goalWidth = 7.32;
  const goalDepth = 2;
  const halfWidth = goalWidth / 2;

  const netGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const indices: number[] = [];
    const cols = 20;
    const rows = 10;

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = (i / cols) * goalWidth - halfWidth;
        const y = 0.1 + (j / rows) * (crossbarHeight - 0.1);
        const z = -(i / cols) * goalDepth * 0.3;
        points.push(new THREE.Vector3(x, y, z));
      }
    }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const a = i * (rows + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (rows + 1) + j;
        const d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(points.flatMap(p => [p.x, p.y, p.z]), 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, []);

  const sideNetGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const indices: number[] = [];
    const cols = 6;
    const rows = 10;

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const z = -(i / cols) * goalDepth;
        const y = 0.1 + (j / rows) * (crossbarHeight - 0.1);
        points.push(new THREE.Vector3(0, y, z));
      }
    }

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        const a = i * (rows + 1) + j;
        const b = a + 1;
        const c = (i + 1) * (rows + 1) + j;
        const d = c + 1;
        indices.push(a, b, c, b, d, c);
      }
    }

    const geom = new THREE.BufferGeometry();
    geom.setAttribute('position', new THREE.Float32BufferAttribute(points.flatMap(p => [p.x, p.y, p.z]), 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, []);

  const postMaterial = (
    <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.6} />
  );

  const netMaterial = (
    <meshStandardMaterial
      color="#ffffff"
      transparent
      opacity={0.25}
      side={THREE.DoubleSide}
      wireframe
      roughness={0.5}
    />
  );

  return (
    <group position={position} rotation={rotation}>
      {/* Trave esquerda */}
      <mesh position={[-halfWidth, crossbarHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, crossbarHeight, 12]} />
        {postMaterial}
      </mesh>

      {/* Trave direita */}
      <mesh position={[halfWidth, crossbarHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[postRadius, postRadius, crossbarHeight, 12]} />
        {postMaterial}
      </mesh>

      {/* Travessao */}
      <mesh position={[0, crossbarHeight, -goalDepth / 2]} castShadow>
        <boxGeometry args={[goalWidth + postRadius * 2, postRadius * 2, postRadius * 2]} />
        {postMaterial}
      </mesh>

      {/* Rede traseira */}
      <mesh geometry={netGeometry}>
        {netMaterial}
      </mesh>

      {/* Rede lateral esquerda */}
      <mesh position={[-halfWidth, 0, -goalDepth / 2]} geometry={sideNetGeometry.clone()}>
        {netMaterial}
      </mesh>

      {/* Rede lateral direita */}
      <mesh position={[halfWidth, 0, -goalDepth / 2]} rotation={[0, Math.PI, 0]} geometry={sideNetGeometry.clone()}>
        {netMaterial}
      </mesh>
    </group>
  );
}

export default function Goals() {
  return (
    <group>
      <Goal position={[-15, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Goal position={[15, 0, 0]} rotation={[0, -Math.PI / 2, 0]} />
    </group>
  );
}
