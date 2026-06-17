import { useEffect, useRef, useState, useCallback } from 'react';
import { useCrowdSimulation } from '../hooks/useCrowdSimulation';

function drawStadium(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  const fieldX = 100;
  const fieldY = 60;
  const fieldW = 400;
  const fieldH = 280;

  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(fieldX - 20, fieldY - 20, fieldW + 40, fieldH + 40);
  ctx.setLineDash([]);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(fieldX, fieldY, fieldW, fieldH);

  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(fieldX, fieldY, fieldW, fieldH);

  ctx.beginPath();
  ctx.moveTo(fieldX + fieldW / 2, fieldY);
  ctx.lineTo(fieldX + fieldW / 2, fieldY + fieldH);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(fieldX + fieldW / 2, fieldY + fieldH / 2, 40, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = 'bold 14px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CAMPO', w / 2, fieldY + fieldH / 2 + 5);

  ctx.fillStyle = '#1e293b';
  ctx.fillRect(fieldX - 30, fieldY + 80, 25, 120);
  ctx.fillRect(fieldX + fieldW + 5, fieldY + 80, 25, 120);
  ctx.fillRect(fieldX + 150, fieldY - 25, 100, 20);
  ctx.fillRect(fieldX + 150, fieldY + fieldH + 5, 100, 20);
}

function drawHeatmapOverlay(ctx: CanvasRenderingContext2D, points: { x: number; y: number }[], w: number, h: number) {
  const cellSize = 10;
  const cols = Math.ceil(w / cellSize);
  const rows = Math.ceil(h / cellSize);
  const density = new Float32Array(cols * rows);

  for (const p of points) {
    const col = Math.floor(p.x / cellSize);
    const row = Math.floor(p.y / cellSize);
    if (col >= 0 && col < cols && row >= 0 && row < rows) {
      density[row * cols + col] += 1;
    }
  }

  const maxDensity = Math.max(...density, 1);

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const val = density[r * cols + c];
      if (val > 0) {
        const intensity = val / maxDensity;
        let color: string;
        if (intensity < 0.33) {
          color = `rgba(59, 130, 246, ${intensity * 1.5})`;
        } else if (intensity < 0.66) {
          color = `rgba(245, 158, 11, ${intensity * 1.2})`;
        } else {
          color = `rgba(239, 68, 68, ${intensity})`;
        }
        ctx.fillStyle = color;
        ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
      }
    }
  }
}

export default function DigitalTwinMap() {
  const [timeLeft, setTimeLeft] = useState(120);
  const [isPaused, setIsPaused] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const { points, alert, stats, gates, reset } = useCrowdSimulation(timeLeft, isPaused);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    drawStadium(ctx, w, h);

    if (showHeatmap) {
      drawHeatmapOverlay(ctx, points, w, h);
    }

    for (const g of gates) {
      const isCongested = stats.congestedGates.some((cg) => cg.id === g.id);

      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
      ctx.fillStyle = isCongested
        ? 'rgba(239, 68, 68, 0.15)'
        : `${g.color}15`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
      ctx.strokeStyle = isCongested ? '#ef4444' : g.color;
      ctx.lineWidth = isCongested ? 3 : 2;
      ctx.stroke();

      const gateCount = points.filter((p) => {
        const dx = p.x - g.x;
        const dy = p.y - g.y;
        return Math.sqrt(dx * dx + dy * dy) < g.radius;
      }).length;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(g.label, g.x, g.y - 8);

      ctx.fillStyle = isCongested ? '#ef4444' : '#94a3b8';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(`${gateCount}`, g.x, g.y + 10);
    }

    ctx.fillStyle = '#60a5fa';
    for (const p of points) {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const size = Math.min(1 + speed * 0.5, 3);
      ctx.globalAlpha = 0.6 + speed * 0.1;
      ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    }
    ctx.globalAlpha = 1;

  }, [points, gates, stats, showHeatmap]);

  useEffect(() => {
    const id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [draw]);

  return (
    <div className="bg-surface-800/50 rounded-xl border border-surface-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-surface-200/80">
          Gemeos Digitais - Fluxo de Torcedores
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
              isPaused
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-amber-500/20 text-amber-400'
            }`}
          >
            {isPaused ? '\u25B6 Retomar' : '\u23F8 Pausar'}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-700 text-surface-200/70 hover:bg-surface-600 transition-colors"
          >
            \u21BA Reset
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs text-surface-200/50">
        <label className="flex items-center gap-2">
          Tempo p/ inicio:
          <input
            type="range"
            min="0"
            max="120"
            value={timeLeft}
            onChange={(e) => setTimeLeft(Number(e.target.value))}
            className="w-24 accent-brand-500"
          />
          <span className="font-mono text-surface-200/70">{timeLeft} min</span>
        </label>
        <label className="flex items-center gap-1.5 cursor-pointer">
          <input
            type="checkbox"
            checked={showHeatmap}
            onChange={(e) => setShowHeatmap(e.target.checked)}
            className="accent-brand-500"
          />
          Heatmap
        </label>
      </div>

      <canvas
        ref={canvasRef}
        className="w-full rounded-lg border border-surface-700/30"
        style={{ aspectRatio: '3/2' }}
      />

      {alert && (
        <div className="mt-3 bg-red-500/10 border border-red-500/30 text-red-400 px-3 py-2 rounded-lg text-xs font-medium animate-pulse">
          {alert}
        </div>
      )}

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="bg-surface-800/50 rounded-lg p-2">
          <p className="text-lg font-bold text-surface-200/80">{stats.totalPoints}</p>
          <p className="text-[10px] text-surface-200/40">Torcedores</p>
        </div>
        <div className="bg-surface-800/50 rounded-lg p-2">
          <p className="text-lg font-bold text-surface-200/80">{stats.avgSpeed.toFixed(1)}</p>
          <p className="text-[10px] text-surface-200/40">Vel. Media</p>
        </div>
        <div className="bg-surface-800/50 rounded-lg p-2">
          <p className={`text-lg font-bold ${stats.congestedGates.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {stats.congestedGates.length}
          </p>
          <p className="text-[10px] text-surface-200/40">Congestionados</p>
        </div>
      </div>
    </div>
  );
}
