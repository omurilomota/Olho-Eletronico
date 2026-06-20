import { useState, useCallback, useRef, useEffect } from 'react';

interface SimulationFrame {
  time: number;
  ballPosition: [number, number, number];
  attackerPosition: { x: number; z: number };
  defenderPosition: { x: number; z: number };
  goalkeeperPosition: { x: number; z: number };
  attackerAnim: 'idle' | 'running' | 'kicking';
  defenderAnim: 'idle' | 'running';
  goalkeeperAnim: 'idle' | 'running' | 'kicking';
}

interface UseSimulationOptions {
  duration?: number;
  attackerStart: { x: number; z: number };
  defenderStart: { x: number; z: number };
  goalkeeperStart: { x: number; z: number };
  ballStart: [number, number, number];
  ballEnd: [number, number, number];
}

function computeFrame(
  t: number,
  duration: number,
  bS: [number, number, number],
  bE: [number, number, number],
  aS: { x: number; z: number },
  dS: { x: number; z: number },
  gS: { x: number; z: number },
): SimulationFrame {
  const normalizedT = Math.min(t / duration, 1);

  const eased = normalizedT < 0.5
    ? 2 * normalizedT * normalizedT
    : 1 - Math.pow(-2 * normalizedT + 2, 2) / 2;

  const ballX = bS[0] + (bE[0] - bS[0]) * eased;
  const ballY = bS[1] + Math.sin(eased * Math.PI) * 2;
  const ballZ = bS[2] + (bE[2] - bS[2]) * eased;

  const attackerRun = eased * 3;
  const attackerX = aS.x + attackerRun;

  const defenderRun = eased * 1.5;
  const defenderX = dS.x + defenderRun;

  let attackerAnim: 'idle' | 'running' | 'kicking' = 'idle';
  let defenderAnim: 'idle' | 'running' = 'idle';
  let goalkeeperAnim: 'idle' | 'running' | 'kicking' = 'idle';

  if (normalizedT > 0 && normalizedT < 0.1) {
    goalkeeperAnim = 'kicking';
  } else if (normalizedT >= 0.1 && normalizedT < 0.7) {
    attackerAnim = 'running';
    defenderAnim = 'running';
  } else if (normalizedT >= 0.7 && normalizedT < 0.85) {
    attackerAnim = 'kicking';
    defenderAnim = 'running';
  }

  return {
    time: t,
    ballPosition: [ballX, ballY, ballZ],
    attackerPosition: { x: attackerX, z: aS.z },
    defenderPosition: { x: defenderX, z: dS.z },
    goalkeeperPosition: { x: gS.x, z: gS.z },
    attackerAnim,
    defenderAnim,
    goalkeeperAnim,
  };
}

export function useSimulation(options: UseSimulationOptions) {
  const {
    duration = 3000,
    attackerStart,
    defenderStart,
    goalkeeperStart,
    ballStart,
    ballEnd,
  } = options;

  const attackerStartRef = useRef(attackerStart);
  const defenderStartRef = useRef(defenderStart);
  const goalkeeperStartRef = useRef(goalkeeperStart);
  const ballStartRef = useRef(ballStart);
  const ballEndRef = useRef(ballEnd);

  attackerStartRef.current = attackerStart;
  defenderStartRef.current = defenderStart;
  goalkeeperStartRef.current = goalkeeperStart;
  ballStartRef.current = ballStart;
  ballEndRef.current = ballEnd;

  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackState, setPlaybackState] = useState({ progress: 0, currentTime: 0 });
  const [speed, setSpeed] = useState(1);

  const defaultFrame = computeFrame(0, duration, ballStart, ballEnd, attackerStart, defenderStart, goalkeeperStart);
  const [currentFrame, setCurrentFrame] = useState<SimulationFrame>(defaultFrame);

  const animRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const speedRef = useRef(speed);

  speedRef.current = speed;

  const animate = useCallback(() => {
    const now = performance.now();
    const elapsed = (now - startTimeRef.current) * speedRef.current;
    const t = Math.min(elapsed, duration);

    frameCountRef.current++;

    if (frameCountRef.current % 2 === 0) {
      const frame = computeFrame(
        t, duration,
        ballStartRef.current, ballEndRef.current,
        attackerStartRef.current, defenderStartRef.current,
        goalkeeperStartRef.current,
      );
      setPlaybackState({ progress: t / duration, currentTime: t });
      setCurrentFrame(frame);
    }

    if (t < duration) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      const finalFrame = computeFrame(
        duration, duration,
        ballStartRef.current, ballEndRef.current,
        attackerStartRef.current, defenderStartRef.current,
        goalkeeperStartRef.current,
      );
      setPlaybackState({ progress: 1, currentTime: duration });
      setCurrentFrame(finalFrame);
      setIsPlaying(false);
    }
  }, [duration]);

  const play = useCallback(() => {
    if (playbackState.progress >= 1) {
      startTimeRef.current = performance.now();
      setPlaybackState({ progress: 0, currentTime: 0 });
    } else {
      startTimeRef.current = performance.now() - pausedTimeRef.current;
    }
    frameCountRef.current = 0;
    setIsPlaying(true);
    animRef.current = requestAnimationFrame(animate);
  }, [animate, playbackState.progress]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    pausedTimeRef.current = playbackState.currentTime;
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, [playbackState.currentTime]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setPlaybackState({ progress: 0, currentTime: 0 });
    setCurrentFrame(computeFrame(
      0, duration,
      ballStartRef.current, ballEndRef.current,
      attackerStartRef.current, defenderStartRef.current,
      goalkeeperStartRef.current,
    ));
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, [duration]);

  const seek = useCallback(
    (t: number) => {
      const clampedT = Math.max(0, Math.min(t, duration));
      setPlaybackState({ progress: clampedT / duration, currentTime: clampedT });
      setCurrentFrame(computeFrame(
        clampedT, duration,
        ballStartRef.current, ballEndRef.current,
        attackerStartRef.current, defenderStartRef.current,
        goalkeeperStartRef.current,
      ));
      pausedTimeRef.current = clampedT;
    },
    [duration],
  );

  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return {
    isPlaying,
    progress: playbackState.progress,
    currentTime: playbackState.currentTime,
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
