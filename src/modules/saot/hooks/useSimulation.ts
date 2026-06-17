import { useState, useCallback, useRef, useEffect } from 'react';

interface SimulationFrame {
  time: number;
  ballPosition: [number, number, number];
  attackerPosition: { x: number; z: number };
  defenderPosition: { x: number; z: number };
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

  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [currentFrame, setCurrentFrame] = useState<SimulationFrame>({
    time: 0,
    ballPosition: ballStart,
    attackerPosition: attackerStart,
    defenderPosition: defenderStart,
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

      const ballX = ballStart[0] + (ballEnd[0] - ballStart[0]) * eased;
      const ballY = ballStart[1] + Math.sin(eased * Math.PI) * 2;
      const ballZ = ballStart[2] + (ballEnd[2] - ballStart[2]) * eased;

      const attackerRun = eased * 3;
      const attackerX = attackerStart.x + attackerRun;
      const attackerZ = attackerStart.z + Math.sin(eased * Math.PI * 2) * 0.5;

      const defenderRun = eased * 1.5;
      const defenderX = defenderStart.x + defenderRun;
      const defenderZ = defenderStart.z;

      return {
        time: t,
        ballPosition: [ballX, ballY, ballZ],
        attackerPosition: { x: attackerX, z: attackerZ },
        defenderPosition: { x: defenderX, z: defenderZ },
      };
    },
    [duration, ballStart, ballEnd, attackerStart, defenderStart],
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
      ballPosition: ballStart,
      attackerPosition: attackerStart,
      defenderPosition: defenderStart,
    });
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, [ballStart, attackerStart, defenderStart]);

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
