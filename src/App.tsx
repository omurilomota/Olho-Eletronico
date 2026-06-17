import { useState } from 'react';
import Layout from './shared/components/Layout';
import LoginScreen from './shared/components/LoginScreen';
import SAOTLab from './modules/saot/components/SAOTLab';
import ICCCommandCenter from './modules/icc/components/ICCCommandCenter';
import ErrorBoundary from './shared/components/ErrorBoundary';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => localStorage.getItem('olho-auth') === 'true',
  );
  const [activeTab, setActiveTab] = useState<'saot' | 'icc'>('saot');

  if (!isLoggedIn) {
    return (
      <LoginScreen
        onLogin={() => {
          localStorage.setItem('olho-auth', 'true');
          setIsLoggedIn(true);
        }}
      />
    );
  }

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
