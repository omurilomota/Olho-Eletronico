import * as THREE from 'three';
import { Html } from '@react-three/drei';
import { useTranslation } from 'react-i18next';

/** Props do componente de linhas de impedimento. */
interface OffsideLineProps {
  /** Posicao X do defensor (linha vermelha = impedimento). */
  defenderX: number;
  /** Posicao X do atacante (linha azul). */
  attackerX: number;
  /** Se o atacante esta impedido. */
  isOffside: boolean;
  /** Distancia em cm entre atacante e linha do defensor. */
  marginCm: number;
  /** Se as linhas devem ser renderizadas. */
  visible: boolean;
}

const DEFENDER_COLOR = '#ef4444';
const ATTACKER_COLOR = '#3b82f6';
const LEGAL_COLOR = '#22c55e';

/**
 * Renderiza as linhas de impedimento no campo 3D.
 * - Linha vermelha na posicao do defensor (linha de impedimento)
 * - Linha azul na posicao do atacante
 * - Zona vermelha transparente atras da linha do defensor
 * - Conector visual mostrando a distancia entre as duas linhas
 */
export default function OffsideLine({
  defenderX,
  attackerX,
  isOffside,
  marginCm,
  visible,
}: OffsideLineProps) {
  const { t } = useTranslation();
  if (!visible) return null;

  const resultColor = isOffside ? DEFENDER_COLOR : LEGAL_COLOR;
  const absMargin = Math.abs(marginCm);
  const midpointX = (attackerX + defenderX) / 2;

  return (
    <group>
      {/* === ZONA DE IMPEDIMENTO === */}
      {/* Preenchimento vermelho atras da linha do defensor (lado do gol) */}
      <mesh position={[defenderX - 5, 0.012, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[10, 12]} />
        <meshBasicMaterial
          color={DEFENDER_COLOR}
          transparent
          opacity={isOffside ? 0.12 : 0.04}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* === LINHA DO DEFENSOR (VERMELHA) === */}
      {/* Linha principal no chao */}
      <mesh position={[defenderX, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 12]} />
        <meshBasicMaterial color={DEFENDER_COLOR} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Tracejado da linha do defensor */}
      {[...Array(24)].map((_, i) => (
        <mesh key={`def-dash-${i}`} position={[defenderX, 0.02, (i - 12) * 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 0.25]} />
          <meshBasicMaterial color={DEFENDER_COLOR} transparent opacity={0.95} />
        </mesh>
      ))}
      {/* Poste vertical da linha do defensor */}
      <mesh position={[defenderX, 1.2, 0]}>
        <boxGeometry args={[0.06, 2.4, 0.06]} />
        <meshBasicMaterial color={DEFENDER_COLOR} transparent opacity={0.5} />
      </mesh>
      <mesh position={[defenderX, 2.5, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color={DEFENDER_COLOR} />
      </mesh>

      {/* === LINHA DO ATACANTE (AZUL) === */}
      {/* Linha principal no chao */}
      <mesh position={[attackerX, 0.015, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.18, 12]} />
        <meshBasicMaterial color={ATTACKER_COLOR} transparent opacity={0.85} side={THREE.DoubleSide} />
      </mesh>
      {/* Tracejado da linha do atacante */}
      {[...Array(24)].map((_, i) => (
        <mesh key={`atk-dash-${i}`} position={[attackerX, 0.02, (i - 12) * 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[0.12, 0.25]} />
          <meshBasicMaterial color={ATTACKER_COLOR} transparent opacity={0.95} />
        </mesh>
      ))}
      {/* Poste vertical da linha do atacante */}
      <mesh position={[attackerX, 1.2, 0]}>
        <boxGeometry args={[0.06, 2.4, 0.06]} />
        <meshBasicMaterial color={ATTACKER_COLOR} transparent opacity={0.5} />
      </mesh>
      <mesh position={[attackerX, 2.5, 0]}>
        <sphereGeometry args={[0.1, 12, 12]} />
        <meshBasicMaterial color={ATTACKER_COLOR} />
      </mesh>

      {/* === CONECTOR VISUAL (distancia no chao) === */}
      {/* Marcador do atacante */}
      <mesh position={[attackerX, 0.01, 6.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.1]} />
        <meshBasicMaterial color={ATTACKER_COLOR} transparent opacity={0.7} />
      </mesh>
      {/* Marcador da linha do defensor */}
      <mesh position={[defenderX, 0.01, 6.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.6, 0.1]} />
        <meshBasicMaterial color={DEFENDER_COLOR} transparent opacity={0.7} />
      </mesh>
      {/* Linha conectando atacante <-> defensor */}
      <mesh position={[midpointX, 0.015, 6.8]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[Math.abs(attackerX - defenderX), 0.05]} />
        <meshBasicMaterial color={resultColor} transparent opacity={0.5} />
      </mesh>
      {/* Diamond no meio do conector */}
      <mesh position={[midpointX, 0.02, 6.8]} rotation={[-Math.PI / 2, 0, Math.PI / 4]}>
        <planeGeometry args={[0.15, 0.15]} />
        <meshBasicMaterial color={resultColor} transparent opacity={0.8} />
      </mesh>

      {/* === LABELS === */}
      {/* Label da linha do defensor */}
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

      {/* Label da linha do atacante */}
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

      {/* Label do resultado */}
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

      {/* Distancia entre as linhas */}
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

      {/* Sinal de advertencia se impedido */}
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
