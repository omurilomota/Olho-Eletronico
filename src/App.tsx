import { useState } from 'react';
import Layout from './shared/components/Layout';
import SAOTLab from './modules/saot/components/SAOTLab';
import ICCCommandCenter from './modules/icc/components/ICCCommandCenter';
import ErrorBoundary from './shared/components/ErrorBoundary';

export default function App() {
  const [activeTab, setActiveTab] = useState<'saot' | 'icc'>('saot');

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      <ErrorBoundary module="SAOT Lab">
        {activeTab === 'saot' && <SAOTLab />}
      </ErrorBoundary>
      <ErrorBoundary module="ICC Command Center">
        {activeTab === 'icc' && <ICCCommandCenter />}
      </ErrorBoundary>
    </Layout>
  );
}
