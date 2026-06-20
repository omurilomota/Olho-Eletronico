import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useMultiplayerStore } from '../store/useMultiplayerStore';

interface Props {
  onClose: () => void;
}

export default function SessionModal({ onClose }: Props) {
  const { t } = useTranslation();
  const { createSession, joinSession, isConnected, connectionError } = useMultiplayerStore();
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [sessionName, setSessionName] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [userName, setUserName] = useState('');
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [joining, setJoining] = useState(false);

  const handleCreate = () => {
    if (!sessionName.trim() || !userName.trim()) return;
    createSession(sessionName.trim(), userName.trim());
    const id = useMultiplayerStore.getState().session?.id;
    if (id) setCreatedId(id);
  };

  const handleJoin = () => {
    if (!sessionId.trim() || !userName.trim()) return;
    setError('');
    setJoining(true);
    joinSession(sessionId.trim().toUpperCase(), userName.trim());
  };

  useEffect(() => {
    if (!joining) return;
    if (isConnected) {
      setJoining(false);
      onClose();
    } else if (connectionError) {
      setJoining(false);
      setError(connectionError);
    }
  }, [joining, isConnected, connectionError, onClose]);

  const handleCopyId = async () => {
    if (!createdId) return;
    try {
      await navigator.clipboard.writeText(createdId);
      setCopied(true);
      setTimeout(() => setCopied(true), 2000);
      setTimeout(onClose, 1500);
    } catch {
      setCopied(true);
      setTimeout(onClose, 1500);
    }
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
          {createdId ? (
            <>
              <div className="text-center">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <p className="text-sm text-surface-200/80 mb-1">{t('icc.multiplayer.session_created')}</p>
                <p className="text-[10px] text-surface-200/40 mb-3">{t('icc.multiplayer.share_id')}</p>
              </div>
              <div className="flex items-center gap-2 bg-surface-900/80 rounded-lg p-3">
                <span className="flex-1 text-center text-lg font-mono font-bold text-brand-400 tracking-widest">{createdId}</span>
                <button
                  onClick={handleCopyId}
                  className="px-3 py-1.5 rounded-md text-xs font-medium bg-brand-600 hover:bg-brand-700 text-white transition-colors"
                >
                  {copied ? t('icc.multiplayer.copied') : t('icc.multiplayer.copy_id')}
                </button>
              </div>
            </>
          ) : (
            <>
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

              {error && (
                <p className="text-xs text-red-400 text-center">{error}</p>
              )}

              <button
                onClick={mode === 'create' ? handleCreate : handleJoin}
                disabled={
                  !userName.trim() ||
                  (mode === 'create' ? !sessionName.trim() : !sessionId.trim()) ||
                  joining
                }
                className="w-full py-2.5 rounded-lg font-semibold text-sm bg-emerald-600 hover:bg-emerald-700 disabled:bg-surface-700 disabled:text-surface-200/30 text-white transition-colors"
              >
                {joining
                  ? t('icc.multiplayer.connecting', 'Conectando...')
                  : mode === 'create'
                    ? t('icc.multiplayer.create')
                    : t('icc.multiplayer.join')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
