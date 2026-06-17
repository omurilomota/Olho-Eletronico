import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface OffsideLineProps {
  x: number;
  isOffside: boolean;
  marginCm: number;
  attackerX: number;
  visible: boolean;
}

export default function OffsideLine({ x, isOffside, marginCm, attackerX, visible }: OffsideLineProps) {
  const lineColor = isOffside ? '#ef4444' : '#22c55e';
  const zoneColor = isOffside ? '#ef4444' : '#22c55e';

  if (!visible) return null;

  const absMargin = Math.abs(marginCm);
  const midpointX = (attackerX + x) / 2;

  return (
    <group>
      {/* Zona de impedimento preenchida (do penúltimo defensor até o gol) */}
      <mesh position={[x - 5, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 12]} />
        <meshBasicMaterial
          color={zoneColor}
          transparent
          opacity={isOffside ? 0.12 : 0.06}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Linha principal da impedimento — mais larga e com brilho */}
      <mesh position={[x, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 12]} />
        <meshBasicMaterial
          color={lineColor}
          transparent
          opacity={0.85}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* Tracejado da linha */}
      {[...Array(24)].map((_, i) => (
        <mesh key={i} position={[x, 0.02, (i - 12) * 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 0.25]} />
          <meshBasicMaterial color={lineColor} transparent opacity={0.95} />
        </mesh>
      ))}

      {/* Poste vertical da linha */}
      <mesh position={[x, 1.2, 0]}>
        <boxGeometry args={[0.06, 2.4, 0.06]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.5} />
      </mesh>
      <mesh position={[x, 2.5, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color={lineColor} />
      </mesh>

      {/* Anel ao redor do atacante */}
      <group position={[attackerX, 0.03, 0]}>
        {[...Array(20)].map((_, i) => {
          const angle = (i / 20) * Math.PI * 2;
          const radius = 0.5;
          return (
            <mesh
              key={i}
              position={[Math.cos(angle) * radius, 0, Math.sin(angle) * radius]}
              rotation={[-Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.08, 0.08]} />
              <meshBasicMaterial
                color={isOffside ? '#ef4444' : '#22c55e'}
                transparent
                opacity={0.9}
              />
            </mesh>
          );
        })}
      </group>

      {/* Seta horizontal mostrando a distância no chão */}
      {/* Marcador do atacante */}
      <mesh position={[attackerX, 0.01, 6.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.1]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.7} />
      </mesh>
      {/* Marcador da linha */}
      <mesh position={[x, 0.01, 6.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.1]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.7} />
      </mesh>
      {/* Linha conectando atacante ↔ linha */}
      <mesh position={[midpointX, 0.015, 6.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[Math.abs(attackerX - x), 0.05]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.5} />
      </mesh>

      {/* Seta dupla apontando para a distância */}
      <mesh position={[midpointX, 0.02, 6.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.15, 0.15]} />
        <meshBasicMaterial color={lineColor} transparent opacity={0.8} />
      </mesh>

      {/* Label da linha de impedimento */}
      <Html position={[x, 3.2, 0]} center distanceFactor={10}>
        <div className="pointer-events-none select-none">
          <div
            className="px-4 py-2 rounded-xl text-sm font-black text-white text-center whitespace-nowrap"
            style={{
              backgroundColor: lineColor,
              boxShadow: `0 0 30px ${lineColor}88, 0 0 60px ${lineColor}44`,
            }}
          >
            LINHA DE IMPEDIMENTO
          </div>
        </div>
      </Html>

      {/* Label do resultado */}
      <Html position={[x, 2.3, 0]} center distanceFactor={10}>
        <div className="pointer-events-none select-none">
          <div
            className="px-3 py-1.5 rounded-lg text-lg font-black text-white text-center whitespace-nowrap"
            style={{
              backgroundColor: isOffside ? '#ef4444' : '#22c55e',
              boxShadow: `0 0 20px ${isOffside ? '#ef444466' : '#22c55e66'}`,
            }}
          >
            {isOffside ? '⚠ IMPEDIDO' : '✓ LEGAL'}
          </div>
        </div>
      </Html>

      {/* Distância atacante ↔ linha */}
      <Html position={[midpointX, 0.5, 6.8]} center distanceFactor={10}>
        <div className="pointer-events-none select-none">
          <div className="px-2 py-1 rounded-md bg-black/80 text-xs font-bold text-white text-center whitespace-nowrap border border-white/20">
            {absMargin.toFixed(1)} cm
            <br />
            <span className="text-[9px] font-normal opacity-70">
              {isOffside ? 'acima da linha' : 'abaixo da linha'}
            </span>
          </div>
        </div>
      </Html>

      {/* Sinal de advertência se impedido */}
      {isOffside && (
        <Html position={[attackerX, 2.8, 0]} center distanceFactor={10}>
          <div className="pointer-events-none select-none">
            <div className="text-red-400 text-2xl font-bold animate-bounce">
              ⚠
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
