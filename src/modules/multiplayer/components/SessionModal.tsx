import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useMultiplayerStore } from '../store/useMultiplayerStore';

interface Props {
  onClose: () => void;
}

export default function SessionModal({ onClose }: Props) {
  const { t } = useTranslation();
  const { createSession, joinSession } = useMultiplayerStore();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [sessionName, setSessionName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [userName, setUserName] = useState('');

  const handleCreate = () => {
    if (!sessionName.trim() || !userName.trim()) return;
    createSession(sessionName.trim(), userName.trim());
    onClose();
  };

  const handleJoin = () => {
    if (!sessionId.trim() || !userName.trim()) return;
    joinSession(sessionId.trim().toUpperCase(), userName.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-800 rounded-2xl border border-surface-700/50 shadow-2xl w-full max-w-sm mx-4 animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-700/50">
          <h2 className="text-sm font-semibold text-surface-200/80">{t('icc.multiplayer.title')}</h2>
          <button onClick={onClose} className="text-surface-200/40 hover:text-surface-200/70">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex gap-1 bg-surface-900/50 rounded-lg p-1">
            <button
              onClick={() => setMode('create')}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                mode === 'create' ? 'bg-brand-600 text-white' : 'text-surface-200/50'
              }`}
            >
              {t('icc.multiplayer.create_session')}
            </button>
            <button
              onClick={() => setMode('join')}
              className={`flex-1 py-2 rounded-md text-xs font-medium transition-colors ${
                mode === 'join' ? 'bg-brand-600 text-white' : 'text-surface-200/50'
              }`}
            >
              {t('icc.multiplayer.join_session')}
            </button>
          </div>

          <div>
            <label className="text-[10px] text-surface-200/50 uppercase tracking-wider mb-1 block">
              {t('icc.multiplayer.your_name')}
            </label>
            <input
              className="w-full bg-surface-900/50 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-200/30 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              placeholder={t('icc.multiplayer.name_placeholder')}
            />
          </div>

          {mode === 'create' ? (
            <div>
              <label className="text-[10px] text-surface-200/50 uppercase tracking-wider mb-1 block">
                {t('icc.multiplayer.session_name')}
              </label>
              <input
                className="w-full bg-surface-900/50 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-200/30 focus:outline-none focus:ring-1 focus:ring-brand-500/50"
                value={sessionName}
                onChange={(e) => setSessionName(e.target.value)}
                placeholder={t('icc.multiplayer.session_name_placeholder')}
              />
            </div>
          ) : (
            <div>
              <label className="text-[10px] text-surface-200/50 uppercase tracking-wider mb-1 block">
                {t('icc.multiplayer.session_id')}
              </label>
              <input
                className="w-full bg-surface-900/50 rounded-lg px-3 py-2 text-sm text-white placeholder-surface-200/30 focus:outline-none focus:ring-1 focus:ring-brand-500/50 font-mono uppercase"
                value={sessionId}
                onChange={(e) => setSessionId(e.target.value)}
                placeholder={t('icc.multiplayer.session_id_placeholder')}
                maxLength={6}
              />
            </div>
          )}

          <button
            onClick={mode === 'create' ? handleCreate : handleJoin}
            disabled={
              !userName.trim() ||
              (mode === 'create' ? !sessionName.trim() : !sessionId.trim())
            }
            className="w-full py-2.5 rounded-lg font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-surface-700 disabled:text-surface-200/30 text-white transition-colors"
          >
            {mode === 'create' ? t('icc.multiplayer.create') : t('icc.multiplayer.join')}
          </button>
        </div>
      </div>
    </div>
  );
}
