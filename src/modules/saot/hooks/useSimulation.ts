import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Frame individual da animacao de simulacao.
 * Contem posicoes e estados de animacao de todos os elementos para um instante t.
 */
interface SimulationFrame {
  time: number;
  ballPosition: [number, number, number];
  attackerPosition: { x: number; z: number };
  defenderPosition: { x: number; z: number };
  attackerAnim: 'idle' | 'running' | 'kicking';
  defenderAnim: 'idle' | 'running';
}

/**
 * Opcoes de configuracao da simulacao.
 * @property duration - Duracao total em ms (default: 3000ms = 3s)
 * @property attackerStart - Posicao inicial do atacante
 * @property defenderStart - Posicao inicial do defensor
 * @property ballStart - Posicao inicial da bola [x, y, z]
 * @property ballEnd - Posicao final da bola [x, y, z]
 */
interface UseSimulationOptions {
  duration?: number;
  attackerStart: { x: number; z: number };
  defenderStart: { x: number; z: number };
  ballStart: [number, number, number];
  ballEnd: [number, number, number];
}

/**
 * Hook de simulacao de jogada de futebol.
 *
 * Timeline da animacao (3 segundos default):
 * - 0% a 70%: goleiro chuta, atacante e defensor correm
 * - 70% a 85%: atacante chuta a bola
 * - 85% a 100%: todos em posicao final (idle)
 *
 * Easing: quadratic ease-in-out para movimento natural.
 *
 * @param options - Configuracao da simulacao (posicoes iniciais, duracao)
 * @returns Estado e controles da simulacao (play, pause, reset, seek, etc.)
 */
export function useSimulation(options: UseSimulationOptions) {
  const {
    duration = 3000, // 3 segundos para a jogada completa
    attackerStart,
    defenderStart,
    ballStart,
    ballEnd,
  } = options;

  // Use refs so reset() always uses the latest positions from the store
  const attackerStartRef = useRef(attackerStart);
  const defenderStartRef = useRef(defenderStart);
  const ballStartRef = useRef(ballStart);
  const ballEndRef = useRef(ballEnd);

  attackerStartRef.current = attackerStart;
  defenderStartRef.current = defenderStart;
  ballStartRef.current = ballStart;
  ballEndRef.current = ballEnd;

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [currentFrame, setCurrentFrame] = useState<SimulationFrame>({
    time: 0,
    ballPosition: ballStart,
    attackerPosition: attackerStart,
    defenderPosition: defenderStart,
    attackerAnim: 'idle',
    defenderAnim: 'idle',
  });

  const animRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);

  const generateFrame = useCallback(
    (t: number): SimulationFrame => {
      const normalizedT = Math.min(t / duration, 1);

      // Quadratic ease-in-out: acelera no inicio, desacelera no fim
      const eased = normalizedT < 0.5
        ? 2 * normalizedT * normalizedT
        : 1 - Math.pow(-2 * normalizedT + 2, 2) / 2;

      const bS = ballStartRef.current;
      const bE = ballEndRef.current;
      const aS = attackerStartRef.current;
      const dS = defenderStartRef.current;

      // Bola: vai do goleiro ate o atacante com arco de 2m de altura
      const ballX = bS[0] + (bE[0] - bS[0]) * eased;
      const ballY = bS[1] + Math.sin(eased * Math.PI) * 2; // arco de 2m
      const ballZ = bS[2] + (bE[2] - bS[2]) * eased;

      // Atacante: corre 3m para frente, com balanco lateral de 0.5m
      const attackerRun = eased * 3; // 3 metros de distancia de corrida
      const attackerX = aS.x + attackerRun;
      const attackerZ = aS.z + Math.sin(eased * Math.PI * 2) * 0.5; // balanco lateral

      // Defensor: corre 1.5m (metade da velocidade do atacante)
      const defenderRun = eased * 1.5; // 1.5 metros de distancia de corrida
      const defenderX = dS.x + defenderRun;
      const defenderZ = dS.z;

      let attackerAnim: 'idle' | 'running' | 'kicking' = 'idle';
      let defenderAnim: 'idle' | 'running' = 'idle';

      // Fases da animacao:
      // 0% - 70%: ambos correm (atacante vai na bola, defensor acompanha)
      // 70% - 85%: atacante chuta a bola
      // 85% - 100%: todos em posicao final (idle)
      if (normalizedT > 0 && normalizedT < 0.7) {
        attackerAnim = 'running';
        defenderAnim = 'running';
      } else if (normalizedT >= 0.7 && normalizedT < 0.85) {
        attackerAnim = 'kicking';
        defenderAnim = 'running';
      } else if (normalizedT >= 0.85) {
        attackerAnim = 'idle';
        defenderAnim = 'idle';
      }

      return {
        time: t,
        ballPosition: [ballX, ballY, ballZ],
        attackerPosition: { x: attackerX, z: attackerZ },
        defenderPosition: { x: defenderX, z: defenderZ },
        attackerAnim,
        defenderAnim,
      };
    },
    [duration],
  );

  const animate = useCallback(() => {
    const elapsed = (performance.now() - startTimeRef.current) * speed;
    const t = Math.min(elapsed, duration);

    setCurrentTime(t);
    setProgress(t / duration);
    setCurrentFrame(generateFrame(t));

    if (t < duration) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
    }
  }, [duration, speed, generateFrame]);

  const play = useCallback(() => {
    if (progress >= 1) {
      startTimeRef.current = performance.now();
      setProgress(0);
      setCurrentTime(0);
    } else {
      startTimeRef.current = performance.now() - pausedTimeRef.current;
    }
    setIsPlaying(true);
    animRef.current = requestAnimationFrame(animate);
  }, [animate, progress]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    pausedTimeRef.current = currentTime;
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, [currentTime]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentTime(0);
    setCurrentFrame({
      time: 0,
      ballPosition: ballStartRef.current,
      attackerPosition: attackerStartRef.current,
      defenderPosition: defenderStartRef.current,
      attackerAnim: 'idle',
      defenderAnim: 'idle',
    });
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  const seek = useCallback(
    (t: number) => {
      const clampedT = Math.max(0, Math.min(t, duration));
      setCurrentTime(clampedT);
      setProgress(clampedT / duration);
      setCurrentFrame(generateFrame(clampedT));
      pausedTimeRef.current = clampedT;
    },
    [duration, generateFrame],
  );

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return {
    isPlaying,
    progress,
    currentTime,
    duration,
    speed,
    currentFrame,
    play,
    pause,
    reset,
    seek,
    setSpeed,
  };
}
