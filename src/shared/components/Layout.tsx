import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';
import NotificationBell from '../../modules/notifications/components/NotificationBell';
import SessionBar from '../../modules/multiplayer/components/SessionBar';
import MultiplayerProvider from '../../modules/multiplayer/components/MultiplayerProvider';

type Props = {
  children: ReactNode;
  activeTab: 'saot' | 'icc';
  onTabChange: (tab: 'saot' | 'icc') => void;
};

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function SaotIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
    </svg>
  );
}

function IccIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75C20.25 16.153 16.556 18 12 18s-8.25-1.847-8.25-4.125v-3.75m16.5 0c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125" />
    </svg>
  );
}

export default function Layout({ children, activeTab, onTabChange }: Props) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-surface-950 text-white flex flex-col font-sans">
      <header className="glass border-b border-surface-700/50 sticky top-0 z-50">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative flex-shrink-0">
              <EyeIcon className="w-8 h-8 text-brand-400" />
              <div className="absolute inset-0 w-8 h-8 bg-brand-400/20 rounded-full blur-md" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold tracking-tight gradient-text truncate">{t('app.title')}</h1>
              <p className="text-[10px] sm:text-xs text-surface-200/50 tracking-widest uppercase hidden sm:block">{t('app.subtitle')}</p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            <div className="flex gap-1 bg-surface-900/50 rounded-lg p-1">
              <button
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'saot'
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30'
                    : 'text-surface-200/70 hover:text-white hover:bg-surface-700/50'
                }`}
                onClick={() => onTabChange('saot')}
              >
                <SaotIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.saot')}</span>
                <span className="sm:hidden">3D</span>
              </button>
              <button
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === 'icc'
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                    : 'text-surface-200/70 hover:text-white hover:bg-surface-700/50'
                }`}
                onClick={() => onTabChange('icc')}
              >
                <IccIcon className="w-4 h-4" />
                <span className="hidden sm:inline">{t('nav.icc')}</span>
                <span className="sm:hidden">ICC</span>
              </button>
            </div>
            <SessionBar />
            <NotificationBell />
            <LanguageSwitcher />
          </nav>
        </div>
      </header>

      <main className="flex-1 relative overflow-hidden">
        <MultiplayerProvider>
          {children}
        </MultiplayerProvider>
      </main>

      <footer className="glass border-t border-surface-700/50 px-4 py-2 flex items-center justify-between text-xs text-surface-200/40">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse-slow" />
            {t('app.system_status')}
          </span>
          <span className="hidden sm:inline">v1.0.0</span>
        </div>
        <span className="font-mono text-[10px]">{t('app.copa')}</span>
      </footer>
    </div>
  );
}
