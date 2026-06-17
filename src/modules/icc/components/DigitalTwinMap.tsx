import { useEffect, useRef, useState } from 'react';
import { useCrowdSimulation } from '../hooks/useCrowdSimulation';

export default function DigitalTwinMap() {
  const [timeLeft, setTimeLeft] = useState(120);
  const { points, alert } = useCrowdSimulation(timeLeft);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, 600, 400);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(0, 0, 600, 400);

    ctx.fillStyle = '#fbbf24';
    const gatePositions = [
      [150, 50],
      [450, 50],
      [150, 350],
      [450, 350],
    ] as const;
    for (const [x, y] of gatePositions) {
      ctx.beginPath();
      ctx.arc(x, y, 30, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = '#60a5fa';
    for (const p of points) {
      ctx.fillRect(p.x - 1, p.y - 1, 2, 2);
    }
  }, [points]);

  return (
    <div className="bg-gray-800 p-4 rounded">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-semibold">Geos Digitais - Fluxo de Torcedores</h3>
        <label className="text-sm">
          Tempo p/ inicio: {timeLeft} min
          <input
            type="range"
            min="0"
            max="120"
            value={timeLeft}
            onChange={(e) => setTimeLeft(Number(e.target.value))}
            className="ml-2 w-32"
          />
        </label>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={400}
        className="w-full rounded"
      />
      {alert && (
        <div className="mt-2 bg-red-900 text-red-200 px-3 py-1 rounded animate-pulse">
          {alert}
        </div>
      )}
    </div>
  );
}
