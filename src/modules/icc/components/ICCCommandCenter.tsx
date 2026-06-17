import DigitalTwinMap from './DigitalTwinMap';
import AIChat from './AIChat';
import OpsTicker from './OpsTicker';

export default function ICCCommandCenter() {
  return (
    <div className="p-4 space-y-4">
      <OpsTicker />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DigitalTwinMap />
        <AIChat />
      </div>
    </div>
  );
}
