import { useState } from 'react';
import Layout from './shared/components/Layout';
import SAOTLab from './modules/saot/components/SAOTLab';
import ICCCommandCenter from './modules/icc/components/ICCCommandCenter';
import ErrorBoundary from './shared/components/ErrorBoundary';
import DataOverlay from './shared/components/DataOverlay';

export default function App() {
  const [activeTab, setActiveTab] = useState<'saot' | 'icc'>('saot');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <DataOverlay />
      <ErrorBoundary fallback={<div>Erro no modulo SAOT</div>}>
        {activeTab === 'saot' && <SAOTLab />}
      </ErrorBoundary>
      <ErrorBoundary fallback={<div>Erro no modulo ICC</div>}>
        {activeTab === 'icc' && <ICCCommandCenter />}
      </ErrorBoundary>
    </Layout>
  );
}
