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

function createInitialFrame(
  ballStart: [number, number, number],
  attackerStart: { x: number; z: number },
  defenderStart: { x: number; z: number },
  goalkeeperStart: { x: number; z: number },
): SimulationFrame {
  return {
    time: 0,
    ballPosition: [...ballStart],
    attackerPosition: { ...attackerStart },
    defenderPosition: { ...defenderStart },
    goalkeeperPosition: { ...goalkeeperStart },
    attackerAnim: 'idle',
    defenderAnim: 'idle',
    goalkeeperAnim: 'idle',
  };
}

function computeFrame(
  t: number,
  duration: number,
  bS: [number, number, number],
  bE: [number, number, number],
  aS: { x: number; z: number },
  dS: { x: number; z: number },
  gS: { x: number; z: number },
  out: SimulationFrame,
): void {
  const normalizedT = Math.min(t / duration, 1);

  const eased = normalizedT < 0.5
    ? 2 * normalizedT * normalizedT
    : 1 - Math.pow(-2 * normalizedT + 2, 2) / 2;

  out.time = t;
  out.ballPosition[0] = bS[0] + (bE[0] - bS[0]) * eased;
  out.ballPosition[1] = bS[1] + Math.sin(eased * Math.PI) * 2;
  out.ballPosition[2] = bS[2] + (bE[2] - bS[2]) * eased;

  const attackerRun = eased * 3;
  out.attackerPosition.x = aS.x + attackerRun;
  out.attackerPosition.z = aS.z;

  const defenderRun = eased * 1.5;
  out.defenderPosition.x = dS.x + defenderRun;
  out.defenderPosition.z = dS.z;

  out.goalkeeperPosition.x = gS.x;
  out.goalkeeperPosition.z = gS.z;

  if (normalizedT > 0 && normalizedT < 0.1) {
    out.goalkeeperAnim = 'kicking';
    out.attackerAnim = 'idle';
    out.defenderAnim = 'idle';
  } else if (normalizedT >= 0.1 && normalizedT < 0.7) {
    out.goalkeeperAnim = 'idle';
    out.attackerAnim = 'running';
    out.defenderAnim = 'running';
  } else if (normalizedT >= 0.7 && normalizedT < 0.85) {
    out.goalkeeperAnim = 'idle';
    out.attackerAnim = 'kicking';
    out.defenderAnim = 'running';
  } else if (normalizedT >= 0.85) {
    out.goalkeeperAnim = 'idle';
    out.attackerAnim = 'idle';
    out.defenderAnim = 'idle';
  } else {
    out.goalkeeperAnim = 'idle';
    out.attackerAnim = 'idle';
    out.defenderAnim = 'idle';
  }
}

const INITIAL_FRAME = createInitialFrame([0, 0, 0], { x: 0, z: 0 }, { x: 0, z: 0 }, { x: 0, z: 0 });

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

  const frameBufferRef = useRef<SimulationFrame>(INITIAL_FRAME);
  const [currentFrame, setCurrentFrame] = useState<SimulationFrame>(INITIAL_FRAME);

  const animRef = useRef<number>(0);
  const startTimeRef = useRef(0);
  const pausedTimeRef = useRef(0);
  const frameCountRef = useRef(0);
  const progressRef = useRef(0);
  const isPlayingRef = useRef(false);

  isPlayingRef.current = isPlaying;
  progressRef.current = playbackState.progress;

  const animate = useCallback(() => {
    const now = performance.now();
    const elapsed = (now - startTimeRef.current) * speed;
    const t = Math.min(elapsed, duration);

    computeFrame(
      t,
      duration,
      ballStartRef.current,
      ballEndRef.current,
      attackerStartRef.current,
      defenderStartRef.current,
      goalkeeperStartRef.current,
      frameBufferRef.current,
    );

    frameCountRef.current++;
    if (frameCountRef.current % 2 === 0) {
      setPlaybackState({ progress: t / duration, currentTime: t });
      setCurrentFrame({ ...frameBufferRef.current });
    }

    if (t < duration) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      setPlaybackState({ progress: 1, currentTime: duration });
      setCurrentFrame({ ...frameBufferRef.current });
      setIsPlaying(false);
    }
  }, [duration, speed]);

  const play = useCallback(() => {
    if (progressRef.current >= 1) {
      startTimeRef.current = performance.now();
      setPlaybackState({ progress: 0, currentTime: 0 });
    } else {
      startTimeRef.current = performance.now() - pausedTimeRef.current;
    }
    frameCountRef.current = 0;
    setIsPlaying(true);
    animRef.current = requestAnimationFrame(animate);
  }, [animate]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    pausedTimeRef.current = playbackState.currentTime;
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, [playbackState.currentTime]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setPlaybackState({ progress: 0, currentTime: 0 });
    setCurrentFrame(createInitialFrame(
      ballStartRef.current,
      attackerStartRef.current,
      defenderStartRef.current,
      goalkeeperStartRef.current,
    ));
    if (animRef.current) cancelAnimationFrame(animRef.current);
  }, []);

  const seek = useCallback(
    (t: number) => {
      const clampedT = Math.max(0, Math.min(t, duration));
      const frame = createInitialFrame(
        ballStartRef.current,
        attackerStartRef.current,
        defenderStartRef.current,
        goalkeeperStartRef.current,
      );
      computeFrame(clampedT, duration, ballStartRef.current, ballEndRef.current,
        attackerStartRef.current, defenderStartRef.current, goalkeeperStartRef.current, frame);
      setPlaybackState({ progress: clampedT / duration, currentTime: clampedT });
      setCurrentFrame(frame);
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
