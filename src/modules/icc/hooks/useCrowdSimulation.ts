import { useEffect, useRef, useState, useCallback } from 'react';

interface Gate {
  id: number;
  x: number;
  y: number;
  radius: number;
  label: string;
  color: string;
}

export interface CrowdPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  hue: number;
}

export interface CrowdStats {
  totalPoints: number;
  congestedGates: { id: number; label: string; count: number }[];
  avgSpeed: number;
}

const GATES: Gate[] = [
  { id: 1, x: 120, y: 40, radius: 35, label: 'Norte A', color: '#f59e0b' },
  { id: 2, x: 480, y: 40, radius: 35, label: 'Norte B', color: '#f59e0b' },
  { id: 3, x: 120, y: 360, radius: 35, label: 'Sul A', color: '#3b82f6' },
  { id: 4, x: 480, y: 360, radius: 35, label: 'Sul B', color: '#3b82f6' },
  { id: 5, x: 300, y: 200, radius: 30, label: 'Central', color: '#8b5cf6' },
];

const CONGESTION_THRESHOLD = 80;

function createInitialPoints(): CrowdPoint[] {
  return Array.from({ length: 600 }, () => ({
    x: Math.random() * 600,
    y: Math.random() * 400,
    vx: 0,
    vy: 0,
    speed: 0.5 + Math.random() * 1.5,
    hue: 200 + Math.random() * 40,
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

function updatePoint(p: CrowdPoint, speedFactor: number): CrowdPoint {
  const target = findClosestGate(p);
  const dx = target.x - p.x;
  const dy = target.y - p.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;

  const speed = p.speed * speedFactor;
  const noiseX = (Math.random() - 0.5) * 0.3;
  const noiseY = (Math.random() - 0.5) * 0.3;

  const newVx = (dx / len) * speed + noiseX;
  const newVy = (dy / len) * speed + noiseY;
  const actualSpeed = Math.sqrt(newVx * newVx + newVy * newVy);

  const hue = actualSpeed > 2 ? 0 : actualSpeed > 1 ? 40 : 200;

  return {
    x: p.x + newVx,
    y: p.y + newVy,
    vx: newVx,
    vy: newVy,
    speed: p.speed,
    hue,
  };
}

function checkCongestion(points: CrowdPoint[]): CrowdStats['congestedGates'] {
  const congested: CrowdStats['congestedGates'] = [];

  for (const g of GATES) {
    const count = points.filter((p) => {
      const dx = p.x - g.x;
      const dy = p.y - g.y;
      return Math.sqrt(dx * dx + dy * dy) < g.radius;
    }).length;
    if (count > CONGESTION_THRESHOLD) {
      congested.push({ id: g.id, label: g.label, count });
    }
  }

  return congested;
}

function calcAvgSpeed(points: CrowdPoint[]): number {
  if (points.length === 0) return 0;
  const total = points.reduce((sum, p) => sum + Math.sqrt(p.vx * p.vx + p.vy * p.vy), 0);
  return total / points.length;
}

export function useCrowdSimulation(timeLeftMinutes: number, paused = false) {
  const [points, setPoints] = useState<CrowdPoint[]>(createInitialPoints);
  const [alert, setAlert] = useState<string | null>(null);
  const [stats, setStats] = useState<CrowdStats>({
    totalPoints: 600,
    congestedGates: [],
    avgSpeed: 0,
  });
  const animRef = useRef<number>(0);
  const timeRef = useRef(timeLeftMinutes);
  const pausedRef = useRef(paused);
  const pointsRef = useRef<CrowdPoint[]>(points);

  useEffect(() => { timeRef.current = timeLeftMinutes; }, [timeLeftMinutes]);
  useEffect(() => { pausedRef.current = paused; }, [paused]);

  const animate = useCallback(() => {
    if (pausedRef.current) {
      animRef.current = requestAnimationFrame(animate);
      return;
    }

    const factor = Math.max(0.1, timeRef.current / 120);
    const speedFactor = (1 - factor) * 2 + 0.3;

    const prev = pointsRef.current;
    const next = prev.map((p) => updatePoint(p, speedFactor));
    pointsRef.current = next;

    setPoints(next);

    const congested = checkCongestion(next);
    const avgSpeed = calcAvgSpeed(next);

    setStats({
      totalPoints: next.length,
      congestedGates: congested,
      avgSpeed: Math.round(avgSpeed * 100) / 100,
    });

    if (congested.length > 0) {
      setAlert(`Alerta: ${congested.map((g) => `${g.label} (${g.count})`).join(', ')}`);
    } else {
      setAlert(null);
    }

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    animRef.current = requestAnimationFrame(animate);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  const reset = useCallback(() => {
    const fresh = createInitialPoints();
    pointsRef.current = fresh;
    setPoints(fresh);
    setAlert(null);
  }, []);

  return { points, alert, stats, gates: GATES, reset };
}
