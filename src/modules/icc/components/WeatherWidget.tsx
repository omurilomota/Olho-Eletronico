import { useState, useEffect } from 'react';

interface Weather {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  humidity: number;
  wind: number;
}

const conditionIcons = {
  sunny: '\u2600\uFE0F',
  cloudy: '\u2601\uFE0F',
  rainy: '\uD83C\uDF27\uFE0F',
};

const conditionLabels = {
  sunny: 'Ensolarado',
  cloudy: 'Nublado',
  rainy: 'Chuvoso',
};

export default function WeatherWidget() {
  const [weather, setWeather] = useState<Weather>({
    temp: 22,
    condition: 'sunny',
    humidity: 65,
    wind: 12,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setWeather((prev) => ({
        temp: Math.max(15, Math.min(35, prev.temp + (Math.random() - 0.5) * 2)),
        condition: Math.random() > 0.8 ? (Math.random() > 0.5 ? 'cloudy' : 'rainy') : 'sunny',
        humidity: Math.max(30, Math.min(90, prev.humidity + (Math.random() - 0.5) * 5)),
        wind: Math.max(0, Math.min(40, prev.wind + (Math.random() - 0.5) * 3)),
      }));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-surface-800/50 rounded-xl border border-surface-700/50 p-4">
      <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">
        Condicoes Climaticas
      </h3>

      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{conditionIcons[weather.condition]}</span>
        <div>
          <p className="text-2xl font-bold text-surface-200/90">
            {Math.round(weather.temp)}°C
          </p>
          <p className="text-xs text-surface-200/50">
            {conditionLabels[weather.condition]}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-surface-900/50 rounded-lg p-2">
          <p className="text-surface-200/40 mb-0.5">Umidade</p>
          <p className="font-mono text-surface-200/70">{Math.round(weather.humidity)}%</p>
        </div>
        <div className="bg-surface-900/50 rounded-lg p-2">
          <p className="text-surface-200/40 mb-0.5">Vento</p>
          <p className="font-mono text-surface-200/70">{Math.round(weather.wind)} km/h</p>
        </div>
      </div>
    </div>
  );
}
