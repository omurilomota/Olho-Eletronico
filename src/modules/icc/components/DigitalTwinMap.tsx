import { useEffect, useRef, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useCrowdSimulation } from '../hooks/useCrowdSimulation';

function drawStadium(ctx: CanvasRenderingContext2D, w: number, h: number, field: { x: number; y: number; w: number; h: number }) {
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, w, h);

  // Arquibancada externa
  ctx.strokeStyle = '#334155';
  ctx.lineWidth = 1;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(field.x - 60, field.y - 40, field.w + 120, field.h + 80);
  ctx.setLineDash([]);

  // Zona do campo (área protegida)
  ctx.fillStyle = '#1a2744';
  ctx.fillRect(field.x, field.y, field.w, field.h);

  // Borda do campo
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2;
  ctx.strokeRect(field.x, field.y, field.w, field.h);

  // Linha central
  ctx.beginPath();
  ctx.moveTo(field.x + field.w / 2, field.y);
  ctx.lineTo(field.x + field.w / 2, field.y + field.h);
  ctx.stroke();

  // Círculo central
  ctx.beginPath();
  ctx.arc(field.x + field.w / 2, field.y + field.h / 2, 35, 0, Math.PI * 2);
  ctx.stroke();

  // Label do campo
  ctx.fillStyle = '#64748b';
  ctx.font = 'bold 13px Inter, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('CAMPO', field.x + field.w / 2, field.y + field.h / 2 - 8);
  ctx.font = '10px Inter, sans-serif';
  ctx.fillStyle = '#475569';
  ctx.fillText('Zona de Exclusao', field.x + field.w / 2, field.y + field.h / 2 + 8);

  // Túneis de entrada
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(field.x - 30, field.y + 80, 20, 60);
  ctx.fillRect(field.x + field.w + 10, field.y + 80, 20, 60);
  ctx.fillRect(field.x + 120, field.y - 25, 60, 20);
  ctx.fillRect(field.x + 120, field.y + field.h + 5, 60, 20);
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

function hueToColor(hue: number, alpha: number): string {
  return `hsla(${hue}, 80%, 55%, ${alpha})`;
}

export default function DigitalTwinMap() {
  const { t } = useTranslation();
  const [timeLeft, setTimeLeft] = useState(120);
  const [isPaused, setIsPaused] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(true);
  const { points, alert, stats, gates, reset, field } = useCrowdSimulation(timeLeft, isPaused);
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

    drawStadium(ctx, w, h, field);

    if (showHeatmap) {
      drawHeatmapOverlay(ctx, points, w, h);
    }

    // Portões
    for (const g of gates) {
      const isCongested = stats.congestedGates.some((cg) => cg.id === g.id);

      ctx.beginPath();
      ctx.arc(g.x, g.y, g.radius, 0, Math.PI * 2);
      ctx.fillStyle = isCongested ? 'rgba(239, 68, 68, 0.15)' : `${g.color}15`;
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

    // Torcedores — coloridos por velocidade (hue)
    for (const p of points) {
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      const size = Math.min(1.5 + speed * 0.4, 3.5);
      ctx.fillStyle = hueToColor(p.hue, 0.7 + speed * 0.05);
      ctx.fillRect(p.x - size / 2, p.y - size / 2, size, size);
    }

  }, [points, gates, stats, showHeatmap, field]);

  useEffect(() => {
    const id = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(id);
  }, [draw]);

  return (
    <div className="bg-surface-800/50 rounded-xl border border-surface-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-surface-200/80">
          {t('icc.digital_twin.title')}
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
            {isPaused ? `\u25B6 ${t('icc.digital_twin.resume')}` : `\u23F8 ${t('icc.digital_twin.pause')}`}
          </button>
          <button
            onClick={reset}
            className="px-3 py-1 rounded-lg text-xs font-medium bg-surface-700 text-surface-200/70 hover:bg-surface-600 transition-colors"
          >
            {'↻'} Reset
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-3 text-xs text-surface-200/50">
        <label className="flex items-center gap-2">
          {t('icc.digital_twin.time_to_start')}:
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
          {t('icc.digital_twin.heatmap')}
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
          <p className="text-[10px] text-surface-200/40">{t('icc.digital_twin.fans')}</p>
        </div>
        <div className="bg-surface-800/50 rounded-lg p-2">
          <p className="text-lg font-bold text-surface-200/80">{stats.avgSpeed.toFixed(1)}</p>
          <p className="text-[10px] text-surface-200/40">{t('icc.digital_twin.avg_speed')}</p>
        </div>
        <div className="bg-surface-800/50 rounded-lg p-2">
          <p className={`text-lg font-bold ${stats.congestedGates.length > 0 ? 'text-red-400' : 'text-emerald-400'}`}>
            {stats.congestedGates.length}
          </p>
          <p className="text-[10px] text-surface-200/40">{t('icc.digital_twin.congested')}</p>
        </div>
      </div>
    </div>
  );
}
