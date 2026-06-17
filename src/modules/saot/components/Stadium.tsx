import { useMemo } from 'react';

function Stand({ position, rotation, width, depth, rows }: {
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  depth: number;
  rows: number;
}) {
  const seats = useMemo(() => {
    const result: { pos: [number, number, number]; color: string }[] = [];
    const seatWidth = width / Math.floor(width / 0.8);
    const rowDepth = depth / rows;
    const seatHeight = 0.4;
    const colors = ['#4a5568', '#5a6577', '#6b7a8d', '#7c8d9f'];

    for (let row = 0; row < rows; row++) {
      const seatsInRow = Math.floor(width / 0.8);
      for (let seat = 0; seat < seatsInRow; seat++) {
        const x = (seat - seatsInRow / 2 + 0.5) * seatWidth;
        const y = row * seatHeight + 0.1;
        const z = row * rowDepth;
        result.push({
          pos: [x, y, z] as [number, number, number],
          color: colors[row % colors.length],
        });
      }
    }
    return result;
  }, [width, depth, rows]);

  return (
    <group position={position} rotation={rotation}>
      {seats.map((seat, i) => (
        <mesh key={i} position={seat.pos}>
          <boxGeometry args={[0.6, 0.35, 0.6]} />
          <meshStandardMaterial color={seat.color} roughness={0.8} />
        </mesh>
      ))}

      <mesh position={[0, -0.1, depth / 2]}>
        <boxGeometry args={[width + 1, 0.2, depth + 1]} />
        <meshStandardMaterial color="#374151" roughness={0.9} />
      </mesh>
    </group>
  );
}

function LightTower({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 5, 0]}>
        <cylinderGeometry args={[0.15, 0.2, 10, 8]} />
        <meshStandardMaterial color="#9ca3af" metalness={0.7} roughness={0.3} />
      </mesh>

      <mesh position={[0, 10.5, 0]}>
        <boxGeometry args={[1.5, 0.5, 0.8]} />
        <meshStandardMaterial color="#e5e7eb" metalness={0.5} roughness={0.3} />
      </mesh>

      {[[-0.5, 0], [0.5, 0]].map(([x, z], i) => (
        <mesh key={i} position={[x, 10.2, z]}>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#fef3c7" emissive="#fef3c7" emissiveIntensity={2} />
        </mesh>
      ))}

      <spotLight
        position={[0, 10, 0]}
        angle={0.6}
        penumbra={0.5}
        intensity={3}
        distance={35}
        color="#fff8e7"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
    </group>
  );
}

export default function Stadium() {
  return (
    <group>
      {/* Arquibancadas laterais (esquerda e direita) */}
      <Stand position={[-17, 0, 0]} rotation={[0, Math.PI / 2, 0]} width={18} depth={4} rows={6} />
      <Stand position={[17, 0, 0]} rotation={[0, -Math.PI / 2, 0]} width={18} depth={4} rows={6} />

      {/* Arquibancadas de fundo (topo e base) */}
      <Stand position={[0, 0, -11]} rotation={[0, 0, 0]} width={30} depth={4} rows={6} />
      <Stand position={[0, 0, 11]} rotation={[0, Math.PI, 0]} width={30} depth={4} rows={6} />

      {/* Torres de iluminacao */}
      <LightTower position={[-19, 0, -12]} />
      <LightTower position={[19, 0, -12]} />
      <LightTower position={[-19, 0, 12]} />
      <LightTower position={[19, 0, 12]} />

      {/* Chao do estadio */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[70, 50]} />
        <meshStandardMaterial color="#1e293b" roughness={0.95} />
      </mesh>
    </group>
  );
}
