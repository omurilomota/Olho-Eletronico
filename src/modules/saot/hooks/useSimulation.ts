import { useState, useCallback, useRef, useEffect } from 'react';

interface SimulationFrame {
  time: number;
  ballPosition: [number, number, number];
  attackerPosition: { x: number; z: number };
  defenderPosition: { x: number; z: number };
  attackerAnim: 'idle' | 'running' | 'kicking';
  defenderAnim: 'idle' | 'running';
}

interface UseSimulationOptions {
  duration?: number;
  attackerStart: { x: number; z: number };
  defenderStart: { x: number; z: number };
  ballStart: [number, number, number];
  ballEnd: [number, number, number];
}

export function useSimulation(options: UseSimulationOptions) {
  const {
    duration = 3000,
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

      const eased = normalizedT < 0.5
        ? 2 * normalizedT * normalizedT
        : 1 - Math.pow(-2 * normalizedT + 2, 2) / 2;

      const bS = ballStartRef.current;
      const bE = ballEndRef.current;
      const aS = attackerStartRef.current;
      const dS = defenderStartRef.current;

      const ballX = bS[0] + (bE[0] - bS[0]) * eased;
      const ballY = bS[1] + Math.sin(eased * Math.PI) * 2;
      const ballZ = bS[2] + (bE[2] - bS[2]) * eased;

      const attackerRun = eased * 3;
      const attackerX = aS.x + attackerRun;
      const attackerZ = aS.z + Math.sin(eased * Math.PI * 2) * 0.5;

      const defenderRun = eased * 1.5;
      const defenderX = dS.x + defenderRun;
      const defenderZ = dS.z;

      let attackerAnim: 'idle' | 'running' | 'kicking' = 'idle';
      let defenderAnim: 'idle' | 'running' = 'idle';

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
