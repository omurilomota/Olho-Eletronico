import { useState, useEffect } from 'react';

interface SystemStatus {
  name: string;
  status: 'online' | 'warning' | 'offline';
  latency?: number;
  icon: string;
}

export default function StatusPanel() {
  const [systems, setSystems] = useState<SystemStatus[]>([
    { name: 'Cameras HD', status: 'online', latency: 12, icon: '\uD83D\uDCF9' },
    { name: 'Sensores IoT', status: 'online', latency: 8, icon: '\uD83D\uDCE1' },
    { name: 'Rede 5G', status: 'online', latency: 3, icon: '\uD83D\uDFE6' },
    { name: 'IA Tatica', status: 'online', latency: 45, icon: '\uD83E\uDD16' },
    { name: 'Backup Power', status: 'warning', latency: undefined, icon: '\u26A1' },
    { name: 'GPS Tracking', status: 'online', latency: 15, icon: '\uD83D\uDCCD' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSystems((prev) =>
        prev.map((s) => ({
          ...s,
          status: Math.random() > 0.95 ? 'warning' : Math.random() > 0.99 ? 'offline' : 'online',
          latency: s.latency !== undefined ? Math.floor(5 + Math.random() * 40) : undefined,
        })),
      );
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const statusColors = {
    online: 'bg-emerald-400',
    warning: 'bg-amber-400',
    offline: 'bg-red-400',
  };

  const statusText = {
    online: 'Online',
    warning: 'Alerta',
    offline: 'Offline',
  };

  return (
    <div className="bg-surface-800/50 rounded-xl border border-surface-700/50 p-4">
      <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">
        Status dos Sistemas
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {systems.map((sys) => (
          <div key={sys.name} className="bg-surface-900/50 rounded-lg p-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm">{sys.icon}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${statusColors[sys.status]} ${sys.status === 'online' ? 'animate-pulse-slow' : ''}`} />
            </div>
            <p className="text-[11px] font-medium text-surface-200/70 truncate">{sys.name}</p>
            <div className="flex items-center justify-between mt-1">
              <span className={`text-[10px] ${sys.status === 'online' ? 'text-emerald-400' : sys.status === 'warning' ? 'text-amber-400' : 'text-red-400'}`}>
                {statusText[sys.status]}
              </span>
              {sys.latency !== undefined && (
                <span className="text-[10px] font-mono text-surface-200/40">{sys.latency}ms</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
