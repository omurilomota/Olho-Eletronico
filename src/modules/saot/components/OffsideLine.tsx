import { useMemo } from 'react';
import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useTranslation } from 'react-i18next';

interface OffsideLineProps {
  defenderX: number;
  attackerX: number;
  isOffside: boolean;
  marginCm: number;
  visible: boolean;
}

const DEFENDER_COLOR = '#3b82f6';
const ATTACKER_COLOR = '#ef4444';
const LEGAL_COLOR = '#22c55e';

const DASH_COUNT = 24;
const DASH_OFFSETS = Array.from({ length: DASH_COUNT }, (_, i) => (i - 12) * 0.5);

export default function OffsideLine({
  defenderX,
  attackerX,
  isOffside,
  marginCm,
  visible,
}: OffsideLineProps) {
  const { t } = useTranslation();

  const dashIndices = useMemo(() => DASH_OFFSETS, []);

  if (!visible) return null;

  const resultColor = isOffside ? DEFENDER_COLOR : LEGAL_COLOR;
  const absMargin = Math.abs(marginCm);
  const midpointX = (attackerX + defenderX) / 2;

  return (
    <group>
      {/* === ZONA DE IMPEDIMENTO === */}
      <mesh position={[defenderX - 5, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 12]} />
        <meshBasicMaterial
          color={DEFENDER_COLOR}
          transparent
          opacity={isOffside ? 0.12 : 0.04}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* === LINHA DO DEFENSOR (AZUL) === */}
      <mesh position={[defenderX, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 12]} />
        <meshBasicMaterial color={DEFENDER_COLOR} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      {dashIndices.map((offset, i) => (
        <mesh key={`def-dash-${i}`} position={[defenderX, 0.02, offset]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 0.25]} />
          <meshBasicMaterial color={DEFENDER_COLOR} transparent opacity={0.95} />
        </mesh>
      ))}
      <mesh position={[defenderX, 1.2, 0]}>
        <boxGeometry args={[0.06, 2.4, 0.06]} />
        <meshBasicMaterial color={DEFENDER_COLOR} transparent opacity={0.5} />
      </mesh>
      <mesh position={[defenderX, 2.5, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color={DEFENDER_COLOR} />
      </mesh>

      {/* === LINHA DO ATACANTE (VERMELHA) === */}
      <mesh position={[attackerX, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 12]} />
        <meshBasicMaterial color={ATTACKER_COLOR} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      {dashIndices.map((offset, i) => (
        <mesh key={`atk-dash-${i}`} position={[attackerX, 0.02, offset]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 0.25]} />
          <meshBasicMaterial color={ATTACKER_COLOR} transparent opacity={0.95} />
        </mesh>
      ))}
      <mesh position={[attackerX, 1.2, 0]}>
        <boxGeometry args={[0.06, 2.4, 0.06]} />
        <meshBasicMaterial color={ATTACKER_COLOR} transparent opacity={0.5} />
      </mesh>
      <mesh position={[attackerX, 2.5, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color={ATTACKER_COLOR} />
      </mesh>

      {/* === CONECTOR VISUAL === */}
      <mesh position={[attackerX, 0.01, 6.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.1]} />
        <meshBasicMaterial color={ATTACKER_COLOR} transparent opacity={0.7} />
      </mesh>
      <mesh position={[defenderX, 0.01, 6.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.1]} />
        <meshBasicMaterial color={DEFENDER_COLOR} transparent opacity={0.7} />
      </mesh>
      <mesh position={[midpointX, 0.015, 6.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[Math.abs(attackerX - defenderX), 0.05]} />
        <meshBasicMaterial color={resultColor} transparent opacity={0.5} />
      </mesh>
      <mesh position={[midpointX, 0.02, 6.8]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <planeGeometry args={[0.15, 0.15]} />
        <meshBasicMaterial color={resultColor} transparent opacity={0.8} />
      </mesh>

      {/* === LABELS === */}
      <Html position={[defenderX, 3.2, 0]} center distanceFactor={10}>
        <div className="pointer-events-none select-none">
          <div
            className="px-4 py-2 rounded-xl text-sm font-black text-white text-center whitespace-nowrap"
            style={{
              backgroundColor: DEFENDER_COLOR,
              boxShadow: `0 0 30px ${DEFENDER_COLOR}88, 0 0 60px ${DEFENDER_COLOR}44`,
            }}
          >
            {t('saot.offside_line_label')}
          </div>
        </div>
      </Html>

      <Html position={[attackerX, 3.2, 0]} center distanceFactor={10}>
        <div className="pointer-events-none select-none">
          <div
            className="px-4 py-2 rounded-xl text-sm font-black text-white text-center whitespace-nowrap"
            style={{
              backgroundColor: ATTACKER_COLOR,
              boxShadow: `0 0 30px ${ATTACKER_COLOR}88, 0 0 60px ${ATTACKER_COLOR}44`,
            }}
          >
            {t('saot.attacker_position')}
          </div>
        </div>
      </Html>

      <Html position={[defenderX, 2.3, 0]} center distanceFactor={10}>
        <div className="pointer-events-none select-none">
          <div
            className="px-3 py-1.5 rounded-lg text-lg font-black text-white text-center whitespace-nowrap"
            style={{
              backgroundColor: resultColor,
              boxShadow: `0 0 20px ${resultColor}66`,
            }}
          >
            {isOffside ? `\u26A0 ${t('saot.offside')}` : `\u2713 ${t('saot.legal')}`}
          </div>
        </div>
      </Html>

      <Html position={[midpointX, 0.5, 6.8]} center distanceFactor={10}>
        <div className="pointer-events-none select-none">
          <div className="px-2 py-1 rounded-md bg-black/80 text-xs font-bold text-white text-center whitespace-nowrap border border-white/20">
            {absMargin.toFixed(1)} cm
            <br />
            <span className="text-[9px] font-normal opacity-70">
              {isOffside ? t('saot.above_line') : t('saot.below_line')}
            </span>
          </div>
        </div>
      </Html>

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
