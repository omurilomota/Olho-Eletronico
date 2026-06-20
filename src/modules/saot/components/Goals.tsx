import { useMemo } from 'react';
import * as THREE from 'three';

const POST_RADIUS = 0.06;
const CROSSBAR_HEIGHT = 2.44;
const GOAL_WIDTH = 7.32;
const GOAL_DEPTH = 2;
const HALF_WIDTH = GOAL_WIDTH / 2;

function GoalGrass({ x, direction }: { x: number; direction: 1 | -1 }) {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[x + direction * GOAL_DEPTH / 2, -0.005, 0]}
    >
      <planeGeometry args={[GOAL_DEPTH, GOAL_WIDTH]} />
      <meshStandardMaterial color="#2d8a4e" roughness={0.9} />
    </mesh>
  );
}

function Goal({ x, netDirection }: { x: number; netDirection: 1 | -1 }) {
  const postMaterial = (
    <meshStandardMaterial color="#e8e8e8" roughness={0.3} metalness={0.6} />
  );

  const netMaterial = (
    <meshStandardMaterial
      color="#cccccc"
      transparent
      opacity={0.35}
      side={THREE.DoubleSide}
      wireframe
      roughness={0.5}
    />
  );

  const backNetGeom = useMemo(() => {
    const points: number[] = [];
    const indices: number[] = [];
    const cols = 20;
    const rows = 10;
    const backX = netDirection * GOAL_DEPTH;

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const z = (i / cols) * GOAL_WIDTH - HALF_WIDTH;
        const y = 0.1 + (j / rows) * (CROSSBAR_HEIGHT - 0.1);
        points.push(backX, y, z);
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
    geom.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [netDirection]);

  const sideNetNeg = useMemo(() => {
    const points: number[] = [];
    const indices: number[] = [];
    const cols = 6;
    const rows = 10;

    for (let i = 0; i <= cols; i++) {
      for (let j = 0; j <= rows; j++) {
        const x = (i / cols) * netDirection * GOAL_DEPTH;
        const y = 0.1 + (j / rows) * (CROSSBAR_HEIGHT - 0.1);
        points.push(x, y, 0);
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
    geom.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    geom.setIndex(indices);
    geom.computeVertexNormals();
    return geom;
  }, [netDirection]);

  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, CROSSBAR_HEIGHT / 2, -HALF_WIDTH]} castShadow>
        <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, CROSSBAR_HEIGHT, 12]} />
        {postMaterial}
      </mesh>

      <mesh position={[0, CROSSBAR_HEIGHT / 2, HALF_WIDTH]} castShadow>
        <cylinderGeometry args={[POST_RADIUS, POST_RADIUS, CROSSBAR_HEIGHT, 12]} />
        {postMaterial}
      </mesh>

      <mesh position={[0, CROSSBAR_HEIGHT, 0]} castShadow>
        <boxGeometry args={[POST_RADIUS * 2, POST_RADIUS * 2, GOAL_WIDTH]} />
        {postMaterial}
      </mesh>

      <mesh position={[netDirection * GOAL_DEPTH / 2, CROSSBAR_HEIGHT, -HALF_WIDTH]} castShadow>
        <boxGeometry args={[GOAL_DEPTH, POST_RADIUS * 2, POST_RADIUS * 2]} />
        {postMaterial}
      </mesh>

      <mesh position={[netDirection * GOAL_DEPTH / 2, CROSSBAR_HEIGHT, HALF_WIDTH]} castShadow>
        <boxGeometry args={[GOAL_DEPTH, POST_RADIUS * 2, POST_RADIUS * 2]} />
        {postMaterial}
      </mesh>

      <mesh geometry={backNetGeom}>
        {netMaterial}
      </mesh>

      <mesh position={[0, 0, -HALF_WIDTH]} geometry={sideNetNeg}>
        {netMaterial}
      </mesh>

      <mesh position={[0, 0, HALF_WIDTH]} geometry={sideNetNeg}>
        {netMaterial}
      </mesh>
    </group>
  );
}

export default function Goals() {
  return (
    <group>
      <GoalGrass x={-16.5} direction={-1} />
      <Goal x={-16.5} netDirection={-1} />

      <GoalGrass x={16.5} direction={1} />
      <Goal x={16.5} netDirection={1} />
    </group>
  );
}
