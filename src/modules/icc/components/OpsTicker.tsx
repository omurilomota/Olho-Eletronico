import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface TickerEvent {
  id: number;
  text: string;
  severity: 'info' | 'warning' | 'critical';
  time: Date;
}

const EVENTS: Omit<TickerEvent, 'id' | 'time'>[] = [
  { text: 'Delegacao do Brasil chegou ao estadio', severity: 'info' },
  { text: 'Checkpoint 3 liberado com sucesso', severity: 'info' },
  { text: 'Reabastecimento de alimentos no setor B concluido', severity: 'info' },
  { text: 'Sinal de IPTV 100% estavel', severity: 'info' },
  { text: 'Equipe medica posicionada no portao 2', severity: 'info' },
  { text: 'Varredura de seguranca concluida', severity: 'info' },
  { text: ' congestionamento detectado no portao Norte A', severity: 'warning' },
  { text: 'Temperatura interna: 28C - acima do ideal', severity: 'warning' },
  { text: 'Camara 7 com intermitencia - manutencao solicitada', severity: 'warning' },
  { text: 'Sensor de fumaca setor C disparou - verificacao em andamento', severity: 'critical' },
  { text: 'Incidente no portao Sul B - equipe de seguranca acionada', severity: 'critical' },
  { text: 'Alerta: fluxo irregular de torcedores na arquibancada Leste', severity: 'critical' },
  { text: 'Sistema de iluminacao do campo: backup ativado', severity: 'warning' },
  { text: 'Delegacao da Argentina em deslocamento - ETA 15 min', severity: 'info' },
  { text: 'Concessionaria setor D: estoque baixo de agua', severity: 'warning' },
  { text: 'Check-in VIP: 85% dos convites confirmados', severity: 'info' },
  { text: 'Drone de inspecao concluiu volta ao estadio', severity: 'info' },
  { text: 'Radio comunicacao: canal 7 com interferencia', severity: 'warning' },
];

const severityConfig = {
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10', dot: 'bg-blue-400' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', dot: 'bg-red-400' },
};

export default function OpsTicker() {
  const { t } = useTranslation();
  const [events, setEvents] = useState<TickerEvent[]>(() =>
    EVENTS.slice(0, 6).map((e, i) => ({
      ...e,
      id: i,
      time: new Date(Date.now() - (5 - i) * 180000),
    })),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setEvents((prev) => {
        const next = [...prev];
        next.shift();
        const newEvent = EVENTS[Math.floor(Math.random() * EVENTS.length)];
        next.push({
          ...newEvent,
          id: Date.now(),
          time: new Date(),
        });
        return next;
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  };

  const current = events[events.length - 1];
  const config = severityConfig[current.severity];

  return (
    <div className="bg-surface-800/50 rounded-xl border border-surface-700/50 overflow-hidden">
      <div className="flex items-center gap-3 px-4 py-2 border-b border-surface-700/50">
        <div className={`w-2 h-2 rounded-full ${config.dot} animate-pulse`} />
        <span className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
          {t('icc.ticker.title')}
        </span>
        <span className="ml-auto text-[10px] font-mono text-surface-200/30">
          {events.length} {t('icc.ticker.events')}
        </span>
      </div>

      <div className="h-10 flex items-center overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-4 px-4">
          {events.slice(-3).map((event) => {
            const c = severityConfig[event.severity];
            return (
              <span key={event.id} className={`inline-flex items-center gap-2 text-xs ${c.color}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
                <span className="font-mono text-surface-200/40">{formatTime(event.time)}</span>
                <span>{event.text}</span>
                <span className="text-surface-200/20 mx-2">|</span>
              </span>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-2 border-t border-surface-700/50 flex gap-2 overflow-x-auto">
        {events.slice(-5).reverse().map((event) => {
          const c = severityConfig[event.severity];
          return (
            <div
              key={event.id}
              className={`flex-shrink-0 px-2.5 py-1 rounded-lg text-[10px] ${c.bg} ${c.color} flex items-center gap-1.5`}
            >
              <span className={`w-1 h-1 rounded-full ${c.dot}`} />
              {formatTime(event.time)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
