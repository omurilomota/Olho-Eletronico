import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type Tab = 'now' | 'weekly' | 'monthly';

interface Weather {
  temp: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  humidity: number;
  wind: number;
}

interface DayForecast {
  day: string;
  tempMin: number;
  tempMax: number;
  condition: 'sunny' | 'cloudy' | 'rainy';
  rainChance: number;
}

interface MonthData {
  avgTemp: number;
  rainyDays: number;
  totalPrecipMm: number;
  sunnyDays: number;
  cloudyDays: number;
}

const conditionIcons: Record<string, string> = {
  sunny: '\u2600\uFE0F',
  cloudy: '\u2601\uFE0F',
  rainy: '\uD83C\uDF27\uFE0F',
};

const conditionLabels: Record<string, string> = {
  sunny: 'Ensolarado',
  cloudy: 'Nublado',
  rainy: 'Chuvoso',
};

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

function generateWeekly(): DayForecast[] {
  const today = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const baseTemp = 20 + Math.random() * 10;
    const cond = Math.random() > 0.7 ? (Math.random() > 0.5 ? 'cloudy' : 'rainy') : 'sunny';
    return {
      day: DAY_NAMES[d.getDay()],
      tempMin: Math.round(baseTemp - 4 - Math.random() * 3),
      tempMax: Math.round(baseTemp + 2 + Math.random() * 4),
      condition: cond,
      rainChance: cond === 'rainy' ? 60 + Math.round(Math.random() * 30) : cond === 'cloudy' ? 20 + Math.round(Math.random() * 20) : Math.round(Math.random() * 15),
    };
  });
}

function generateMonthly(): MonthData {
  return {
    avgTemp: Math.round(18 + Math.random() * 12),
    rainyDays: Math.round(5 + Math.random() * 10),
    totalPrecipMm: Math.round(30 + Math.random() * 80),
    sunnyDays: Math.round(15 + Math.random() * 10),
    cloudyDays: Math.round(3 + Math.random() * 5),
  };
}

export default function WeatherWidget() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<Tab>('now');
  const [weather, setWeather] = useState<Weather>({
    temp: 24,
    condition: 'sunny',
    humidity: 55,
    wind: 10,
  });
  const [weekly] = useState<DayForecast[]>(generateWeekly);
  const [monthly] = useState<MonthData>(generateMonthly);

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

  const tabs: { id: Tab; label: string }[] = [
    { id: 'now', label: t('icc.weather.now') },
    { id: 'weekly', label: t('icc.weather.weekly') },
    { id: 'monthly', label: t('icc.weather.monthly') },
  ];

  return (
    <div className="bg-surface-800/50 rounded-xl border border-surface-700/50 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider">
          {t('icc.weather.title')}
        </h3>
        <div className="flex gap-1 bg-surface-900/50 rounded-lg p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-2 py-1 rounded-md text-[10px] font-medium transition-all ${
                tab === t.id
                  ? 'bg-brand-600 text-white'
                  : 'text-surface-200/50 hover:text-surface-200/70'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'now' && (
        <div>
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
              <p className="text-surface-200/40 mb-0.5">{t('icc.weather.humidity')}</p>
              <p className="font-mono text-surface-200/70">{Math.round(weather.humidity)}%</p>
            </div>
            <div className="bg-surface-900/50 rounded-lg p-2">
              <p className="text-surface-200/40 mb-0.5">{t('icc.weather.wind')}</p>
              <p className="font-mono text-surface-200/70">{Math.round(weather.wind)} km/h</p>
            </div>
          </div>
        </div>
      )}

      {tab === 'weekly' && (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {weekly.map((d, i) => (
            <div
              key={i}
              className={`flex-shrink-0 w-16 rounded-lg p-2 text-center text-xs ${
                i === 0 ? 'bg-brand-600/20 border border-brand-500/30' : 'bg-surface-900/50'
              }`}
            >
              <p className="font-semibold text-surface-200/80 mb-1">{d.day}</p>
              <p className="text-lg mb-1">{conditionIcons[d.condition]}</p>
              <p className="font-mono text-surface-200/90">
                {d.tempMax}°
              </p>
              <p className="font-mono text-surface-200/40 text-[10px]">
                {d.tempMin}°
              </p>
              <div className="mt-1 h-1 bg-surface-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-400 rounded-full"
                  style={{ width: `${d.rainChance}%` }}
                />
              </div>
              <p className="text-[9px] text-surface-200/30 mt-0.5">{d.rainChance}%</p>
            </div>
          ))}
        </div>
      )}

      {tab === 'monthly' && (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-surface-900/50 rounded-lg p-2">
              <p className="text-surface-200/40 mb-0.5">{t('icc.weather.avg_temp')}</p>
              <p className="font-mono text-lg text-surface-200/90">{monthly.avgTemp}°C</p>
            </div>
            <div className="bg-surface-900/50 rounded-lg p-2">
              <p className="text-surface-200/40 mb-0.5">{t('icc.weather.precipitation')}</p>
              <p className="font-mono text-lg text-surface-200/90">{monthly.totalPrecipMm}mm</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-surface-900/50 rounded-lg p-2 text-center">
              <p className="text-lg">{conditionIcons.sunny}</p>
              <p className="font-mono text-surface-200/80">{monthly.sunnyDays}</p>
              <p className="text-surface-200/30 text-[10px]">{t('icc.weather.sunny')}</p>
            </div>
            <div className="bg-surface-900/50 rounded-lg p-2 text-center">
              <p className="text-lg">{conditionIcons.cloudy}</p>
              <p className="font-mono text-surface-200/80">{monthly.cloudyDays}</p>
              <p className="text-surface-200/30 text-[10px]">{t('icc.weather.cloudy')}</p>
            </div>
            <div className="bg-surface-900/50 rounded-lg p-2 text-center">
              <p className="text-lg">{conditionIcons.rainy}</p>
              <p className="font-mono text-surface-200/80">{monthly.rainyDays}</p>
              <p className="text-surface-200/30 text-[10px]">{t('icc.weather.rainy')}</p>
            </div>
          </div>
          <div className="bg-surface-900/50 rounded-lg p-2">
            <div className="flex justify-between text-[10px] text-surface-200/40 mb-1">
              <span>{t('icc.weather.rainy_days')}</span>
              <span className="font-mono">{monthly.rainyDays}/30</span>
            </div>
            <div className="h-1.5 bg-surface-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-400 rounded-full transition-all"
                style={{ width: `${(monthly.rainyDays / 30) * 100}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
