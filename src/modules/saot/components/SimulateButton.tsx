import { useState, useCallback } from 'react';
import { useSaotStore } from '../store/useSaotStore';
import {
  calculateOffside,
  type OffsideResult,
} from '../services/OffsideCalculator';

export default function SimulateButton() {
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<OffsideResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { attacker, defender, goalkeeper } = useSaotStore();

  const handleSimulate = useCallback(() => {
    setIsRunning(true);
    setProgress(0);
    setResult(null);
    let elapsed = 0;
    const interval = setInterval(() => {
      elapsed += 100;
      setProgress((prev) => Math.min(prev + 0.5, 100));
      if (elapsed >= 20000) {
        clearInterval(interval);
        setIsRunning(false);
        const offside = calculateOffside(attacker, defender, goalkeeper);
        setResult(offside);
      }
    }, 100);
  }, [attacker, defender, goalkeeper]);

  return (
    <div className="p-4 bg-gray-800 rounded">
      <button
        onClick={handleSimulate}
        disabled={isRunning}
        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded font-bold transition-colors"
      >
        Simular Passe
      </button>
      {isRunning && (
        <div className="mt-2 h-2 bg-gray-700 rounded overflow-hidden">
          <div
            className="h-full bg-blue-400 transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      {result && (
        <div className="mt-3 text-lg">
          <span
            className={result.isOffside ? 'text-red-400' : 'text-green-400'}
          >
            {result.isOffside ? 'IMPEDIDO' : 'LEGAL'}
          </span>
          <span className="ml-2 text-gray-300">
            Margem: {result.marginCm.toFixed(2)} cm
          </span>
        </div>
      )}
    </div>
  );
}
