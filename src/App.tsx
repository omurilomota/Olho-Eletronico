import React, { useState, Suspense } from 'react';
import Layout from './shared/components/Layout';
import LoginScreen from './shared/components/LoginScreen';
import ErrorBoundary from './shared/components/ErrorBoundary';

const SAOTLab = React.lazy(() => import('./modules/saot/components/SAOTLab'));
const ICCCommandCenter = React.lazy(() => import('./modules/icc/components/ICCCommandCenter'));

function LoadingFallback() {
  return (
    <div className="h-[calc(100vh-7rem)] flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-brand-400 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  // Demo-only auth — not for production. Replace with Supabase Auth or similar.
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
      <Suspense fallback={<LoadingFallback />}>
        <ErrorBoundary module="SAOT Lab">
          {activeTab === 'saot' && <SAOTLab />}
        </ErrorBoundary>
        <ErrorBoundary module="ICC Command Center">
          {activeTab === 'icc' && <ICCCommandCenter />}
        </ErrorBoundary>
      </Suspense>
    </Layout>
  );
}
