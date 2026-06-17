import { useEffect, useState } from 'react';

const EVENTS = [
  'Delegacao do Brasil chegou ao estadio',
  'Checkpoint 3 liberado',
  'Reabastecimento de alimentos no setor B',
  'Sinal de IPTV 100% estavel',
  'Equipe medica posicionada no portao 2',
  'Varredura de seguranca concluida',
];

export default function OpsTicker() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % EVENTS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-gray-900 px-4 py-2 overflow-hidden whitespace-nowrap text-sm border border-gray-700 rounded">
      <span className="animate-marquee inline-block">
        {EVENTS[current]} | {EVENTS[(current + 1) % EVENTS.length]}
      </span>
    </div>
  );
}
