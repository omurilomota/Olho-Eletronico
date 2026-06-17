import { useEffect, useState } from 'react';
import { useSaotStore } from '../../modules/saot/store/useSaotStore';

export default function DataOverlay() {
  const { attacker, defender, goalkeeper } = useSaotStore();
  const [fps, setFps] = useState(50);
  const [hz] = useState(500);
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    const interval = setInterval(
      () => setFps(Math.floor(48 + Math.random() * 4)),
      20,
    );
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setBlink(true);
    const t = setTimeout(() => setBlink(false), 200);
    return () => clearTimeout(t);
  }, [attacker, defender, goalkeeper]);

  return (
    <div className="absolute top-2 right-2 bg-black/70 text-xs px-3 py-2 rounded space-y-1 z-50">
      <div className="flex items-center gap-2">
        <span
          className={`w-2 h-2 rounded-full ${blink ? 'bg-yellow-400' : 'bg-green-400'}`}
        />
        <span>29 pontos corporais</span>
      </div>
      <div>Cameras: {fps} fps</div>
      <div>Sensor na bola: {hz} Hz</div>
    </div>
  );
}
