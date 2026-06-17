import { useState, useEffect } from 'react';

export default function RiskGauge() {
  const [value, setValue] = useState(35);

  useEffect(() => {
    const interval = setInterval(() => {
      setValue((prev) => {
        const delta = (Math.random() - 0.5) * 10;
        return Math.max(0, Math.min(100, prev + delta));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const getColor = (v: number) => {
    if (v < 30) return { stroke: '#22c55e', text: 'text-emerald-400', label: 'BAIXO' };
    if (v < 60) return { stroke: '#f59e0b', text: 'text-amber-400', label: 'MEDIO' };
    return { stroke: '#ef4444', text: 'text-red-400', label: 'ALTO' };
  };

  const { stroke, text, label } = getColor(value);
  const circumference = 2 * Math.PI * 40;
  const dashoffset = circumference - (value / 100) * circumference * 0.75;

  return (
    <div className="bg-surface-800/50 rounded-xl border border-surface-700/50 p-4 text-center">
      <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">
        Nivel de Risco
      </h3>

      <div className="relative w-28 h-28 mx-auto">
        <svg className="w-full h-full -rotate-[135deg]" viewBox="0 0 100 100">
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeLinecap="round"
          />
          <circle
            cx="50"
            cy="50"
            r="40"
            fill="none"
            stroke={stroke}
            strokeWidth="8"
            strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            className="transition-all duration-1000"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-2xl font-bold ${text}`}>{Math.round(value)}</span>
          <span className="text-[9px] text-surface-200/40 font-medium">{label}</span>
        </div>
      </div>
    </div>
  );
}
