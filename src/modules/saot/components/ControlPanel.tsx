import { useTranslation } from 'react-i18next';
import { useSaotStore, type CameraPreset, type ScenarioType, SCENARIOS } from '../store/useSaotStore';
import type { OffsideResult } from '../services/OffsideCalculator';

interface SimulationState {
  isPlaying: boolean;
  progress: number;
  currentTime: number;
  duration: number;
  speed: number;
  currentFrame: {
    attackerPosition: { x: number; z: number };
    defenderPosition: { x: number; z: number };
    ballPosition: [number, number, number];
  };
  play: () => void;
  pause: () => void;
  reset: () => void;
  seek: (t: number) => void;
  setSpeed: (s: number) => void;
}

interface ControlPanelProps {
  simulation: SimulationState;
  result: OffsideResult;
}

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
];

const SCENARIO_LIST: { id: ScenarioType; icon: string }[] = [
  { id: 'normal-offside', icon: '\u26A0\uFE0F' },
  { id: 'marginal', icon: '\uD83D\uDD0D' },
  { id: 'reverse-offside', icon: '\u21BB' },
  { id: 'no-offside-behind', icon: '\u2705' },
  { id: 'no-offside-level', icon: '\u2696\uFE0F' },
];

export default function ControlPanel({ simulation, result }: ControlPanelProps) {
  const { t } = useTranslation();
  const goalkeeper = useSaotStore((s) => s.goalkeeper);
  const activeScenario = useSaotStore((s) => s.activeScenario);
  const cameraPreset = useSaotStore((s) => s.cameraPreset);
  const setCameraPreset = useSaotStore((s) => s.setCameraPreset);
  const showShadows = useSaotStore((s) => s.showShadows);
  const toggleShadows = useSaotStore((s) => s.toggleShadows);
  const showOffsideLine = useSaotStore((s) => s.showOffsideLine);
  const toggleOffsideLine = useSaotStore((s) => s.toggleOffsideLine);
  const loadScenario = useSaotStore((s) => s.loadScenario);
  const reset = useSaotStore((s) => s.reset);

  const CAMERA_PRESETS: { id: CameraPreset; label: string; icon: string }[] = [
    { id: 'broadcast', label: t('saot.camera_presets.broadcast'), icon: '\uD83C\uDFAC' },
    { id: 'tactical', label: t('saot.camera_presets.tactical'), icon: '\uD83D\uDCCA' },
    { id: 'goal-left', label: t('saot.camera_presets.goal-left'), icon: '\u2618' },
    { id: 'goal-right', label: t('saot.camera_presets.goal-right'), icon: '\u2618' },
    { id: 'free', label: t('saot.camera_presets.free'), icon: '\uD83E\uDDF1' },
  ];

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 text-sm">
      <div className="glass rounded-xl p-4">
        <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">{t('saot.camera')}</h3>
        <div className="grid grid-cols-2 gap-1.5">
          {CAMERA_PRESETS.map((p) => (
            <button
              key={p.id}
              onClick={() => setCameraPreset(p.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                cameraPreset === p.id
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                  : 'bg-surface-800 text-surface-200/70 hover:bg-surface-700'
              }`}
            >
              <span className="mr-1">{p.icon}</span> {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">{t('saot.scenarios')}</h3>
        <div className="space-y-1.5">
          {SCENARIO_LIST.map((s) => {
            const scenario = SCENARIOS[s.id as keyof typeof SCENARIOS];
            const isActive = activeScenario === s.id;
            return (
              <button
                key={s.id}
                onClick={() => { loadScenario(s.id); simulation.reset(); }}
                className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
                  isActive
                    ? 'bg-brand-600/20 border border-brand-500/30 text-brand-300'
                    : 'bg-surface-800/50 hover:bg-surface-800 text-surface-200/70'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{s.icon}</span>
                  <span className="font-medium">{t(scenario.labelKey)}</span>
                </div>
                <p className="text-[10px] text-surface-200/40 mt-0.5 ml-6">{t(scenario.descriptionKey)}</p>
              </button>
            );
          })}
          <button
            onClick={() => { loadScenario('custom'); simulation.reset(); }}
            className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all ${
              activeScenario === 'custom'
                ? 'bg-surface-700 border border-surface-600 text-surface-200/80'
                : 'bg-surface-800/50 hover:bg-surface-800 text-surface-200/70'
            }`}
          >
            <div className="flex items-center gap-2">
              <span>{'🎮'}</span>
              <span className="font-medium">{t('saot.free_mode')}</span>
            </div>
            <p className="text-[10px] text-surface-200/40 mt-0.5 ml-6">{t('saot.free_mode_hint')}</p>
          </button>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">{t('saot.simulation')}</h3>
        <div className="flex gap-2 mb-3">
          <button
            onClick={simulation.isPlaying ? simulation.pause : simulation.play}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              simulation.isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {simulation.isPlaying ? `\u23F8 ${t('saot.pause')}` : `\u25B6 ${t('saot.play')}`}
          </button>
          <button
            onClick={simulation.reset}
            className="px-4 py-2.5 rounded-lg font-medium text-sm bg-surface-700 hover:bg-surface-600 text-surface-200/80 transition-colors"
          >
            {'\u21BB'} {t('saot.reset')}
          </button>
        </div>
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-surface-200/50">{t('saot.progress')}</span>
            <span className="text-xs font-mono text-surface-200/70">{(simulation.progress * 100).toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-100" style={{ width: `${simulation.progress * 100}%` }} />
          </div>
          <input type="range" min={0} max={simulation.duration} value={simulation.currentTime} onChange={(e) => simulation.seek(Number(e.target.value))} className="w-full mt-2 accent-brand-500" />
        </div>
        <div>
          <span className="text-xs text-surface-200/50 block mb-1.5">{t('saot.speed')}</span>
          <div className="flex gap-1">
            {SPEED_OPTIONS.map((opt) => (
              <button key={opt.value} onClick={() => simulation.setSpeed(opt.value)} className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${simulation.speed === opt.value ? 'bg-brand-600 text-white' : 'bg-surface-800 text-surface-200/60 hover:bg-surface-700'}`}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">{t('saot.players')}</h3>
        <div className="space-y-2">
          <PlayerRow label={t('saot.attacker')} color="#ef4444" position={simulation.currentFrame.attackerPosition} number={9} />
          <PlayerRow label={t('saot.defender')} color="#3b82f6" position={simulation.currentFrame.defenderPosition} number={4} />
          <PlayerRow label={t('saot.goalkeeper')} color="#eab308" position={{ x: goalkeeper.x, z: goalkeeper.z }} number={1} />
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">{t('saot.result')}</h3>
        <div className={`p-3 rounded-lg text-center font-bold text-lg ${result.isOffside ? 'bg-red-500/20 text-red-400 glow-red' : 'bg-emerald-500/20 text-emerald-400 glow-emerald'}`}>
          {result.isOffside ? t('saot.offside') : t('saot.legal')}
        </div>
        <p className="text-center text-xs text-surface-200/50 mt-2">{t('saot.margin')} {Math.abs(result.marginCm).toFixed(1)} cm</p>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">{t('saot.options')}</h3>
        <div className="space-y-2">
          <Toggle label={t('saot.shadows')} enabled={showShadows} onToggle={toggleShadows} />
          <Toggle label={t('saot.offside_line')} enabled={showOffsideLine} onToggle={toggleOffsideLine} />
          <button onClick={reset} className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
            {t('saot.reset_positions')}
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerRow({ label, color, position, number }: { label: string; color: string; position: { x: number; z: number }; number: number }) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-800/50">
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: color }}>{number}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-surface-200/80 truncate">{label}</p>
        <p className="text-[10px] font-mono text-surface-200/40">x:{position.x.toFixed(1)} z:{position.z.toFixed(1)}</p>
      </div>
    </div>
  );
}

function Toggle({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button onClick={onToggle} className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors">
      <span className="text-xs text-surface-200/70">{label}</span>
      <div className={`w-8 h-4 rounded-full transition-colors ${enabled ? 'bg-brand-500' : 'bg-surface-600'}`}>
        <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform mt-0.5 ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </button>
  );
}
