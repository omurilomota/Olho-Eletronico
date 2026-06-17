import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Seeded random for reproducible city
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

interface Building {
  x: number;
  z: number;
  width: number;
  depth: number;
  height: number;
  color: string;
}

interface Tree {
  x: number;
  z: number;
  height: number;
  canopyRadius: number;
}

interface Car {
  x: number;
  z: number;
  direction: 1 | -1;
  axis: 'x' | 'z';
  speed: number;
  color: string;
}

interface Person {
  x: number;
  z: number;
  speed: number;
  angle: number;
  color: string;
}

function generateCity(seed: number) {
  const rng = seededRandom(seed);
  const buildings: Building[] = [];
  const trees: Tree[] = [];
  const cars: Car[] = [];
  const people: Person[] = [];

  const buildingColors = [
    '#4a5568', '#5a6577', '#6b7a8d', '#7c8d9f',
    '#8b9daa', '#9ca3af', '#607080', '#506070',
    '#708090', '#556677', '#667788', '#445566',
  ];

  const carColors = ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#8b5cf6', '#ec4899', '#ffffff', '#1a1a1a'];

  // Generate buildings in a grid outside the stadium
  for (let gx = -4; gx <= 4; gx++) {
    for (let gz = -3; gz <= 3; gz++) {
      const bx = gx * 8 + (rng() - 0.5) * 3;
      const bz = gz * 8 + (rng() - 0.5) * 3;

      // Skip if inside stadium area (radius ~28)
      const dist = Math.sqrt(bx * bx + bz * bz);
      if (dist < 28) continue;

      // Skip if too far
      if (dist > 80) continue;

      const w = 2 + rng() * 3;
      const d = 2 + rng() * 3;
      const h = 3 + rng() * 12;

      buildings.push({
        x: bx,
        z: bz,
        width: w,
        depth: d,
        height: h,
        color: buildingColors[Math.floor(rng() * buildingColors.length)],
      });
    }
  }

  // Generate trees in park areas (clusters)
  const parkCenters = [
    { x: -35, z: 20 }, { x: 35, z: -20 },
    { x: -40, z: -25 }, { x: 40, z: 25 },
    { x: 0, z: -45 }, { x: 0, z: 45 },
  ];

  for (const park of parkCenters) {
    const treeCount = 8 + Math.floor(rng() * 8);
    for (let i = 0; i < treeCount; i++) {
      const tx = park.x + (rng() - 0.5) * 20;
      const tz = park.z + (rng() - 0.5) * 20;
      const dist = Math.sqrt(tx * tx + tz * tz);
      if (dist < 28) continue;

      trees.push({
        x: tx,
        z: tz,
        height: 1.5 + rng() * 2,
        canopyRadius: 0.8 + rng() * 1.2,
      });
    }
  }

  // Generate cars on roads (grid pattern)
  for (let i = 0; i < 30; i++) {
    const axis: 'x' | 'z' = rng() > 0.5 ? 'x' : 'z';
    const pos = (rng() - 0.5) * 70;
    const lane = Math.floor(rng() * 4) - 2;

    cars.push({
      x: axis === 'x' ? pos : -25 + lane * 15,
      z: axis === 'z' ? pos : -25 + lane * 15,
      direction: rng() > 0.5 ? 1 : -1,
      axis,
      speed: 2 + rng() * 4,
      color: carColors[Math.floor(rng() * carColors.length)],
    });
  }

  // Generate people on sidewalks
  for (let i = 0; i < 40; i++) {
    const angle = rng() * Math.PI * 2;
    const dist = 25 + rng() * 30;

    people.push({
      x: Math.cos(angle) * dist,
      z: Math.sin(angle) * dist,
      speed: 0.3 + rng() * 0.8,
      angle: rng() * Math.PI * 2,
      color: ['#ef4444', '#3b82f6', '#f59e0b', '#22c55e', '#ec4899'][Math.floor(rng() * 5)],
    });
  }

  return { buildings, trees, cars, people };
}

function Buildings({ data }: { data: Building[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  useMemo(() => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    data.forEach((b, i) => {
      dummy.position.set(b.x, b.height / 2, b.z);
      dummy.scale.set(b.width, b.height, b.depth);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
      meshRef.current!.setColorAt(i, new THREE.Color(b.color));
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  }, [data]);

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]} castShadow receiveShadow>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.8} />
    </instancedMesh>
  );
}

function BuildingWindows({ data }: { data: Building[] }) {
  const windows = useMemo(() => {
    const result: { pos: [number, number, number]; color: string }[] = [];
    for (const b of data) {
      if (b.height < 4) continue;
      const floors = Math.floor(b.height / 1.2);
      const windowsPerFloor = Math.max(2, Math.floor(b.width / 1));
      for (let f = 0; f < floors; f++) {
        for (let w = 0; w < windowsPerFloor; w++) {
          const lit = Math.random() > 0.4;
          if (!lit) continue;
          const wx = b.x - b.width / 2 + 0.5 + (w / windowsPerFloor) * b.width;
          const wy = 1 + f * 1.2;
          result.push({
            pos: [wx, wy, b.z + b.depth / 2 + 0.01],
            color: lit ? '#fef3c7' : '#1a1a2e',
          });
        }
      }
    }
    return result;
  }, [data]);

  return (
    <group>
      {windows.map((w, i) => (
        <mesh key={i} position={w.pos}>
          <planeGeometry args={[0.3, 0.4]} />
          <meshBasicMaterial color={w.color} />
        </mesh>
      ))}
    </group>
  );
}

function Trees({ data }: { data: Tree[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const canopyRef = useRef<THREE.InstancedMesh>(null);

  useMemo(() => {
    if (!meshRef.current || !canopyRef.current) return;
    const dummy = new THREE.Object3D();

    data.forEach((t, i) => {
      // Trunk
      dummy.position.set(t.x, t.height / 2, t.z);
      dummy.scale.set(0.15, t.height, 0.15);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);

      // Canopy
      dummy.position.set(t.x, t.height + t.canopyRadius * 0.6, t.z);
      dummy.scale.set(t.canopyRadius, t.canopyRadius, t.canopyRadius);
      dummy.updateMatrix();
      canopyRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
    canopyRef.current.instanceMatrix.needsUpdate = true;
  }, [data]);

  return (
    <group>
      <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#5d4037" roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={canopyRef} args={[undefined, undefined, data.length]}>
        <sphereGeometry args={[1, 8, 6]} />
        <meshStandardMaterial color="#2e7d32" roughness={0.8} />
      </instancedMesh>
    </group>
  );
}

function Cars({ data }: { data: Car[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const positionsRef = useRef(data.map((c) => ({ x: c.x, z: c.z })));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const positions = positionsRef.current;

    data.forEach((car, i) => {
      const pos = positions[i];
      if (car.axis === 'x') {
        pos.x += car.direction * car.speed * delta;
        if (pos.x > 50) pos.x = -50;
        if (pos.x < -50) pos.x = 50;
      } else {
        pos.z += car.direction * car.speed * delta;
        if (pos.z > 50) pos.z = -50;
        if (pos.z < -50) pos.z = 50;
      }

      dummy.position.set(pos.x, 0.25, pos.z);
      dummy.rotation.y = car.axis === 'x' ? 0 : Math.PI / 2;
      dummy.scale.set(0.8, 0.3, 0.4);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial roughness={0.6} metalness={0.3} />
    </instancedMesh>
  );
}

function People({ data }: { data: Person[] }) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const positionsRef = useRef(data.map((p) => ({ x: p.x, z: p.z, angle: p.angle })));

  useFrame((_, delta) => {
    if (!meshRef.current) return;
    const dummy = new THREE.Object3D();
    const positions = positionsRef.current;

    data.forEach((person, i) => {
      const pos = positions[i];
      pos.x += Math.cos(pos.angle) * person.speed * delta;
      pos.z += Math.sin(pos.angle) * person.speed * delta;

      // Wrap around
      const dist = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
      if (dist > 60 || dist < 22) {
        pos.angle += Math.PI;
      }
      if (pos.x > 55) pos.x = -55;
      if (pos.x < -55) pos.x = 55;
      if (pos.z > 55) pos.z = -55;
      if (pos.z < -55) pos.z = 55;

      dummy.position.set(pos.x, 0.5, pos.z);
      dummy.scale.set(0.15, 0.5, 0.15);
      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, data.length]}>
      <cylinderGeometry args={[0.5, 0.5, 1, 6]} />
      <meshStandardMaterial roughness={0.7} />
    </instancedMesh>
  );
}

function Roads() {
  const roads = useMemo(() => {
    const result: { pos: [number, number, number]; scale: [number, number, number] }[] = [];
    // Main grid roads
    for (let i = -3; i <= 3; i++) {
      // Horizontal roads
      result.push({
        pos: [0, -0.45, i * 12],
        scale: [120, 0.1, 3],
      });
      // Vertical roads
      result.push({
        pos: [i * 12, -0.45, 0],
        scale: [3, 0.1, 120],
      });
    }
    return result;
  }, []);

  return (
    <group>
      {roads.map((r, i) => (
        <mesh key={i} position={r.pos} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[r.scale[0], r.scale[2]]} />
          <meshStandardMaterial color="#2d2d2d" roughness={0.9} />
        </mesh>
      ))}
    </group>
  );
}

export default function CityBackground() {
  const city = useMemo(() => generateCity(42), []);

  return (
    <group>
      <Roads />
      <Buildings data={city.buildings} />
      <BuildingWindows data={city.buildings} />
      <Trees data={city.trees} />
      <Cars data={city.cars} />
      <People data={city.people} />

      {/* Ground plane for city area */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.55, 0]}>
        <planeGeometry args={[160, 160]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.95} />
      </mesh>
    </group>
  );
}
