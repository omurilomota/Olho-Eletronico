import { useEffect, useRef, useState, useCallback } from 'react';

interface Gate {
  x: number;
  y: number;
  radius: number;
}

export interface CrowdPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const GATES: Gate[] = [
  { x: 150, y: 50, radius: 30 },
  { x: 450, y: 50, radius: 30 },
  { x: 150, y: 350, radius: 30 },
  { x: 450, y: 350, radius: 30 },
];

const N = 500;

function createInitialPoints(): CrowdPoint[] {
  return Array.from({ length: N }, () => ({
    x: Math.random() * 600,
    y: Math.random() * 400,
    vx: 0,
    vy: 0,
  }));
}

function findClosestGate(p: CrowdPoint): Gate {
  let target = GATES[0];
  let minDist = Infinity;
  for (const g of GATES) {
    const dx = g.x - p.x;
    const dy = g.y - p.y;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d < minDist) {
      minDist = d;
      target = g;
    }
  }
  return target;
}

function updatePoint(p: CrowdPoint, speed: number): CrowdPoint {
  const target = findClosestGate(p);
  const dx = target.x - p.x;
  const dy = target.y - p.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;
  return {
    x: p.x + (dx / len) * speed,
    y: p.y + (dy / len) * speed,
    vx: (dx / len) * speed,
    vy: (dy / len) * speed,
  };
}

function checkCongestion(points: CrowdPoint[]): string | null {
  for (const g of GATES) {
    const count = points.filter((p) => {
      const dx = p.x - g.x;
      const dy = p.y - g.y;
      return Math.sqrt(dx * dx + dy * dy) < g.radius;
    }).length;
    if (count > 200) {
      return `Alerta: portao (${g.x},${g.y}) com ${count} torcedores!`;
    }
  }
  return null;
}

export function useCrowdSimulation(timeLeftMinutes: number) {
  const [points, setPoints] = useState<CrowdPoint[]>(createInitialPoints);
  const [alert, setAlert] = useState<string | null>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(timeLeftMinutes);

  useEffect(() => {
    timeRef.current = timeLeftMinutes;
  }, [timeLeftMinutes]);

  const animate = useCallback(() => {
    setPoints((prev) => {
      const factor = Math.max(0.1, timeRef.current / 120);
      const speed = (1 - factor) * 2 + 0.1;
      const next = prev.map((p) => updatePoint(p, speed));

      const congestion = checkCongestion(next);
      setAlert(congestion);

      return next;
    });
    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  return { points, alert };
}
