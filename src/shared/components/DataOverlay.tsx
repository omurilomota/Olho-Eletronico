import { useEffect, useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import ExportButton from './ExportButton';
import { useSaotStore } from '../../modules/saot/store/useSaotStore';
import { calculateOffside } from '../../modules/saot/services/OffsideCalculator';

interface FpsHistoryEntry {
  time: number;
  fps: number;
}

export default function DataOverlay() {
  const { t } = useTranslation();
  const { attacker, defender, goalkeeper } = useSaotStore();
  const [fps, setFps] = useState(60);
  const [triangles, setTriangles] = useState(0);
  const [drawCalls, setDrawCalls] = useState(0);
  const [history, setHistory] = useState<FpsHistoryEntry[]>([]);
  const historyRef = useRef<FpsHistoryEntry[]>([]);

  const result = calculateOffside(attacker, defender, goalkeeper);

  useEffect(() => {
    let frames = 0;
    let lastTime = performance.now();
    let animId = 0;

    const tick = () => {
      frames++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        const currentFps = Math.round((frames * 1000) / (now - lastTime));
        setFps(currentFps);

        historyRef.current = [...historyRef.current.slice(-59), { time: now, fps: currentFps }];
        setHistory([...historyRef.current]);

        frames = 0;
        lastTime = now;
      }
      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTriangles(Math.floor(1200 + Math.random() * 200));
      setDrawCalls(Math.floor(15 + Math.random() * 5));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const fpsColor = fps >= 50 ? 'text-emerald-400' : fps >= 30 ? 'text-amber-400' : 'text-red-400';
  const fpsBg = fps >= 50 ? 'bg-emerald-400' : fps >= 30 ? 'bg-amber-400' : 'bg-red-400';

  return (
    <div className="absolute top-3 right-3 glass rounded-xl px-4 py-3 z-50 min-w-[200px] animate-fade-in">
      <div className="flex items-center gap-2 mb-3 pb-2 border-b border-surface-700/50">
        <span className={`w-2 h-2 rounded-full ${fpsBg}`} />
        <span className="text-xs font-semibold text-surface-200/80 tracking-wider uppercase">
          {t('overlay.title')}
        </span>
      </div>

      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-surface-200/50">FPS</span>
          <span className={`text-sm font-mono font-bold ${fpsColor}`}>{fps}</span>
        </div>

        <div className="h-8 flex items-end gap-px">
          {history.map((entry, i) => (
            <div
              key={i}
              className={`flex-1 rounded-t-sm transition-all duration-200 ${
                entry.fps >= 50 ? 'bg-emerald-400/60' : entry.fps >= 30 ? 'bg-amber-400/60' : 'bg-red-400/60'
              }`}
              style={{ height: `${(entry.fps / 72) * 100}%`, minHeight: '2px' }}
            />
          ))}
          {history.length === 0 && (
            <div className="w-full h-2 bg-surface-700 rounded animate-pulse" />
          )}
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-surface-200/50">Triangles</span>
          <span className="font-mono text-surface-200/80">{triangles.toLocaleString()}</span>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-surface-200/50">Draw Calls</span>
          <span className="font-mono text-surface-200/80">{drawCalls}</span>
        </div>

        <div className="pt-2 border-t border-surface-700/50">
          <ExportButton data={{ attacker, defender, goalkeeper, result }} />
        </div>
      </div>
    </div>
  );
}
