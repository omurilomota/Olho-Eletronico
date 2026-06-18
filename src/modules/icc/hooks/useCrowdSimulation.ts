import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Portao de entrada/saida do estadio no mapa 2D.
 * Posicoes baseadas em um canvas de 600x400 pixels.
 */
interface Gate {
  id: number;
  x: number;
  y: number;
  radius: number;
  label: string;
  color: string;
}

/**
 * Ponto individual de um torcedor na simulacao de multidao.
 * Cada ponto se move em direcao ao portao mais proximo.
 * @property hue - Cor baseada na velocidade: 0=vermelho (lento), 40=amarelo (medio), 200=azul (rapido)
 */
export interface CrowdPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  hue: number;
}

/** Estatisticas agregadas da simulacao de multidao. */
export interface CrowdStats {
  totalPoints: number;
  congestedGates: { id: number; label: string; count: number }[];
  avgSpeed: number;
}

// Portoes distribuidos nos 4 cantos do estadio (canvas 600x400)
const GATES: Gate[] = [
  { id: 1, x: 80, y: 30, radius: 35, label: 'Norte A', color: '#f59e0b' },
  { id: 2, x: 520, y: 30, radius: 35, label: 'Norte B', color: '#f59e0b' },
  { id: 3, x: 80, y: 370, radius: 35, label: 'Sul A', color: '#3b82f6' },
  { id: 4, x: 520, y: 370, radius: 35, label: 'Sul B', color: '#3b82f6' },
];

// Campo de jogo: retangulo central onde torcedores NAO devem entrar
const FIELD = { x: 180, y: 100, w: 240, h: 200 };

// Limite de torcedores por portao para considerar congestamento
const CONGESTION_THRESHOLD = 80;

function isInField(x: number, y: number): boolean {
  return x > FIELD.x && x < FIELD.x + FIELD.w && y > FIELD.y && y < FIELD.y + FIELD.h;
}

function createInitialPoints(): CrowdPoint[] {
  const points: CrowdPoint[] = [];
  for (let i = 0; i < 600; i++) {
    let x = Math.random() * 600;
    let y = Math.random() * 400;
    // Garante que nenhum ponto comece dentro do campo
    while (isInField(x, y)) {
      x = Math.random() * 600;
      y = Math.random() * 400;
    }
    points.push({
      x,
      y,
      vx: 0,
      vy: 0,
      speed: 0.5 + Math.random() * 1.5,
      hue: 200 + Math.random() * 40,
    });
  }
  return points;
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

function pushOutOfField(x: number, y: number): { x: number; y: number } {
  // Empurra o ponto para fora do retângulo do campo
  const cx = FIELD.x + FIELD.w / 2;
  const cy = FIELD.y + FIELD.h / 2;
  const dx = x - cx;
  const dy = y - cy;

  // Escala para sair do campo
  const scaleX = dx !== 0 ? (FIELD.w / 2 + 5) / Math.abs(dx) : 2;
  const scaleY = dy !== 0 ? (FIELD.h / 2 + 5) / Math.abs(dy) : 2;
  const scale = Math.min(scaleX, scaleY);

  return { x: cx + dx * scale, y: cy + dy * scale };
}

function updatePoint(p: CrowdPoint, speedFactor: number): CrowdPoint {
  const target = findClosestGate(p);
  let dx = target.x - p.x;
  let dy = target.y - p.y;
  const len = Math.sqrt(dx * dx + dy * dy) || 1;

  const speed = p.speed * speedFactor;
  // Ruido aleatorio para movimento mais natural (±0.2)
  const noiseX = (Math.random() - 0.5) * 0.4;
  const noiseY = (Math.random() - 0.5) * 0.4;

  let newVx = (dx / len) * speed + noiseX;
  let newVy = (dy / len) * speed + noiseY;

  let newX = p.x + newVx;
  let newY = p.y + newVy;

  // Se entrou no campo, empurra para fora
  if (isInField(newX, newY)) {
    const pushed = pushOutOfField(newX, newY);
    newX = pushed.x;
    newY = pushed.y;
    // Redireciona a velocidade para longe do campo
    const pushDx = newX - (FIELD.x + FIELD.w / 2);
    const pushDy = newY - (FIELD.y + FIELD.h / 2);
    const pushLen = Math.sqrt(pushDx * pushDx + pushDy * pushDy) || 1;
    newVx = (pushDx / pushLen) * speed;
    newVy = (pushDy / pushLen) * speed;
  }

  // Mantém dentro dos limites do canvas
  newX = Math.max(5, Math.min(595, newX));
  newY = Math.max(5, Math.min(395, newY));

  const actualSpeed = Math.sqrt(newVx * newVx + newVy * newVy);
  // Mapeamento de velocidade para cor (HSL hue):
  // > 2.5 px/frame = vermelho (0) = congestionado
  // > 1.5 px/frame = amarelo (40) = medio
  // <= 1.5 px/frame = azul (200) = fluxo livre
  const hue = actualSpeed > 2.5 ? 0 : actualSpeed > 1.5 ? 40 : 200;

  return {
    x: newX,
    y: newY,
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

    // speedFactor: quanto menor o tempo restante, mais rapido os torcedores se movem
    // timeLeft = 120min → factor = 1.0 → speedFactor = 0.3 (lento, jogo comecando)
    // timeLeft = 0min → factor = 0.1 → speedFactor = 2.1 (rapido, jogo acabando)
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

  return { points, alert, stats, gates: GATES, reset, field: FIELD };
}
