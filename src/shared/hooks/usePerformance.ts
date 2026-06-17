import { useRef, useCallback, useState } from 'react';

interface PerformanceStats {
  fps: number;
  frameTime: number;
  low: boolean;
}

export function usePerformance(sampleSize = 60) {
  const framesRef = useRef<number[]>([]);
  const lastTimeRef = useRef(performance.now());
  const rafRef = useRef<number>(0);
  const [stats, setStats] = useState<PerformanceStats>({ fps: 60, frameTime: 16.67, low: false });

  const tick = useCallback(() => {
    const now = performance.now();
    const delta = now - lastTimeRef.current;
    lastTimeRef.current = now;

    framesRef.current.push(delta);
    if (framesRef.current.length > sampleSize) {
      framesRef.current.shift();
    }

    const avg = framesRef.current.reduce((a, b) => a + b, 0) / framesRef.current.length;
    const fps = Math.round(1000 / avg);
    const frameTime = Math.round(avg * 10) / 10;

    setStats({ fps, frameTime, low: fps < 30 });

    rafRef.current = requestAnimationFrame(tick);
  }, [sampleSize]);

  const start = useCallback(() => {
    lastTimeRef.current = performance.now();
    framesRef.current = [];
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  const stop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  return { stats, start, stop };
}
