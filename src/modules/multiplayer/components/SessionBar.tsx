import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useMultiplayerStore } from '../store/useMultiplayerStore';
import SessionModal from './SessionModal';

export default function SessionBar() {
  const { t } = useTranslation();
  const session = useMultiplayerStore((s) => s.session);
  const isConnected = useMultiplayerStore((s) => s.isConnected);
  const leaveSession = useMultiplayerStore((s) => s.leaveSession);
  const [showModal, setShowModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCloseModal = useCallback(() => setShowModal(false), []);

  const handleCopyId = async () => {
    if (!session) return;
    try {
      await navigator.clipboard.writeText(session.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (isConnected && session) {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse-slow" />
          <span className="text-xs font-medium text-surface-200/70">{session.name}</span>
        </div>
        <button
          onClick={handleCopyId}
          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-700/50 hover:bg-surface-700 transition-colors group"
          title={t('icc.multiplayer.copy_id')}
        >
          <span className="text-[10px] font-mono text-surface-200/40 group-hover:text-surface-200/70">{session.id}</span>
          <svg className="w-3 h-3 text-surface-200/30 group-hover:text-surface-200/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
          </svg>
        </button>
        {copied && <span className="text-[9px] text-emerald-400">{t('icc.multiplayer.copied')}</span>}
        <div className="flex -space-x-1.5">
          {session.participants.map((p) => (
            <div
              key={p.id}
              className="w-5 h-5 rounded-full border-2 border-surface-800 flex items-center justify-center text-[8px] font-bold text-white"
              style={{ backgroundColor: p.color }}
              title={p.name}
            >
              {p.name.charAt(0)}
            </div>
          ))}
        </div>
        <span className="text-[10px] text-surface-200/40">{session.participants.length}</span>
        <button
          onClick={leaveSession}
          className="text-[10px] text-red-400/60 hover:text-red-400 transition-colors"
        >
          {t('icc.multiplayer.leave')}
        </button>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="flex items-center gap-2 px-3 py-1.5 glass rounded-lg hover:bg-surface-700/50 transition-colors"
      >
        <svg className="w-4 h-4 text-surface-200/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
        </svg>
        <span className="text-xs text-surface-200/50">{t('icc.multiplayer.connect')}</span>
      </button>
      {showModal && <SessionModal onClose={handleCloseModal} />}
    </>
  );
}
