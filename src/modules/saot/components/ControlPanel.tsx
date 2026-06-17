import { useSaotStore, type CameraPreset } from '../store/useSaotStore';
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

const CAMERA_PRESETS: { id: CameraPreset; label: string; icon: string }[] = [
  { id: 'broadcast', label: 'Broadcast', icon: '\uD83C\uDFAC' },
  { id: 'tactical', label: 'Tatico', icon: '\uD83D\uDCCA' },
  { id: 'goal-left', label: 'Gol Esq.', icon: '\u2618' },
  { id: 'goal-right', label: 'Gol Dir.', icon: '\u2618' },
  { id: 'free', label: 'Livre', icon: '\uD83E\uDDF1' },
];

const SPEED_OPTIONS = [
  { value: 0.5, label: '0.5x' },
  { value: 1, label: '1x' },
  { value: 2, label: '2x' },
];

export default function ControlPanel({ simulation, result }: ControlPanelProps) {
  const {
    goalkeeper,
    cameraPreset, setCameraPreset,
    showShadows, toggleShadows,
    showOffsideLine, toggleOffsideLine,
    reset,
  } = useSaotStore();

  return (
    <div className="h-full overflow-y-auto p-4 space-y-4 text-sm">
      <div className="glass rounded-xl p-4">
        <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">
          Camera
        </h3>
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
        <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">
          Simulacao
        </h3>

        <div className="flex gap-2 mb-3">
          <button
            onClick={simulation.isPlaying ? simulation.pause : simulation.play}
            className={`flex-1 px-4 py-2.5 rounded-lg font-semibold text-sm transition-all ${
              simulation.isPlaying
                ? 'bg-amber-500 hover:bg-amber-600 text-white'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
          >
            {simulation.isPlaying ? '\u23F8 Pausar' : '\u25B6 Iniciar'}
          </button>
          <button
            onClick={simulation.reset}
            className="px-4 py-2.5 rounded-lg font-medium text-sm bg-surface-700 hover:bg-surface-600 text-surface-200/80 transition-colors"
          >
            \u21BA Reset
          </button>
        </div>

        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-surface-200/50">Progresso</span>
            <span className="text-xs font-mono text-surface-200/70">
              {(simulation.progress * 100).toFixed(0)}%
            </span>
          </div>
          <div className="h-2 bg-surface-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-emerald-500 rounded-full transition-all duration-100"
              style={{ width: `${simulation.progress * 100}%` }}
            />
          </div>
          <input
            type="range"
            min={0}
            max={simulation.duration}
            value={simulation.currentTime}
            onChange={(e) => simulation.seek(Number(e.target.value))}
            className="w-full mt-2 accent-brand-500"
          />
        </div>

        <div>
          <span className="text-xs text-surface-200/50 block mb-1.5">Velocidade</span>
          <div className="flex gap-1">
            {SPEED_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => simulation.setSpeed(opt.value)}
                className={`flex-1 px-2 py-1.5 rounded text-xs font-medium transition-all ${
                  simulation.speed === opt.value
                    ? 'bg-brand-600 text-white'
                    : 'bg-surface-800 text-surface-200/60 hover:bg-surface-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">
          Jogadores
        </h3>
        <div className="space-y-2">
          <PlayerRow label="Atacante" color="#ef4444" position={simulation.currentFrame.attackerPosition} number={9} />
          <PlayerRow label="Defensor" color="#3b82f6" position={simulation.currentFrame.defenderPosition} number={4} />
          <PlayerRow label="Goleiro" color="#eab308" position={{ x: goalkeeper.x, z: goalkeeper.z }} number={1} />
        </div>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">
          Resultado
        </h3>
        <div className={`p-3 rounded-lg text-center font-bold text-lg ${
          result.isOffside
            ? 'bg-red-500/20 text-red-400 glow-red'
            : 'bg-emerald-500/20 text-emerald-400 glow-emerald'
        }`}>
          {result.isOffside ? 'IMPEDIDO' : 'LEGAL'}
        </div>
        <p className="text-center text-xs text-surface-200/50 mt-2">
          Margem: {Math.abs(result.marginCm).toFixed(1)} cm
        </p>
      </div>

      <div className="glass rounded-xl p-4">
        <h3 className="text-xs font-semibold text-surface-200/60 uppercase tracking-wider mb-3">
          Opcoes
        </h3>
        <div className="space-y-2">
          <Toggle label="Sombras" enabled={showShadows} onToggle={toggleShadows} />
          <Toggle label="Linha de impedimento" enabled={showOffsideLine} onToggle={toggleOffsideLine} />
          <button
            onClick={reset}
            className="w-full px-3 py-2 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
          >
            Resetar posicoes
          </button>
        </div>
      </div>
    </div>
  );
}

function PlayerRow({ label, color, position, number }: {
  label: string;
  color: string;
  position: { x: number; z: number };
  number: number;
}) {
  return (
    <div className="flex items-center gap-2 p-2 rounded-lg bg-surface-800/50">
      <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: color }}>
        {number}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-surface-200/80 truncate">{label}</p>
        <p className="text-[10px] font-mono text-surface-200/40">
          x:{position.x.toFixed(1)} z:{position.z.toFixed(1)}
        </p>
      </div>
    </div>
  );
}

function Toggle({ label, enabled, onToggle }: { label: string; enabled: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-800/50 hover:bg-surface-800 transition-colors"
    >
      <span className="text-xs text-surface-200/70">{label}</span>
      <div className={`w-8 h-4 rounded-full transition-colors ${enabled ? 'bg-brand-500' : 'bg-surface-600'}`}>
        <div className={`w-3.5 h-3.5 rounded-full bg-white shadow transition-transform mt-0.5 ${enabled ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </div>
    </button>
  );
}
