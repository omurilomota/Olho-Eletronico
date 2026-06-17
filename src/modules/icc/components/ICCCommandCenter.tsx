import DigitalTwinMap from './DigitalTwinMap';
import AIChat from './AIChat';
import OpsTicker from './OpsTicker';
import RiskGauge from './RiskGauge';
import StatusPanel from './StatusPanel';
import WeatherWidget from './WeatherWidget';

export default function ICCCommandCenter() {
  return (
    <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-7rem)]">
      <OpsTicker />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <DigitalTwinMap />
        </div>

        <div className="space-y-4">
          <RiskGauge />
          <WeatherWidget />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <AIChat />
        </div>

        <div>
          <StatusPanel />
        </div>
      </div>
    </div>
  );
}
