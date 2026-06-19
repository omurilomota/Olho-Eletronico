import { useTranslation } from 'react-i18next';
import { useNotificationStore, type NotificationType } from '../store/useNotificationStore';

interface Props {
  onClose: () => void;
}

const TYPE_CONFIG: Record<NotificationType, { color: string; bg: string; icon: string }> = {
  info: { color: 'text-blue-400', bg: 'bg-blue-500/10', icon: '\u2139\uFE0F' },
  warning: { color: 'text-amber-400', bg: 'bg-amber-500/10', icon: '\u26A0\uFE0F' },
  critical: { color: 'text-red-400', bg: 'bg-red-500/10', icon: '\uD83D\uDEA8' },
  success: { color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: '\u2705' },
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h`;
}

export default function NotificationPanel({ onClose }: Props) {
  const { t } = useTranslation();
  const { notifications, markAsRead, markAllRead, clearAll, dismiss } = useNotificationStore();

  return (
    <div className="w-80 bg-surface-800 rounded-xl border border-surface-700/50 shadow-2xl shadow-black/50 animate-slide-up">
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700/50">
        <h3 className="text-sm font-semibold text-surface-200/80">{t('icc.notifications.title')}</h3>
        <div className="flex gap-2">
          <button onClick={markAllRead} className="text-[10px] text-surface-200/40 hover:text-surface-200/70 transition-colors">
            {t('icc.notifications.mark_all_read')}
          </button>
          <button onClick={onClose} className="text-surface-200/40 hover:text-surface-200/70">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-sm text-surface-200/40">{t('icc.notifications.empty')}</div>
        ) : (
          notifications.map((n) => {
            const config = TYPE_CONFIG[n.type];
            return (
              <div
                key={n.id}
                className={`px-4 py-3 border-b border-surface-700/30 hover:bg-surface-700/20 transition-colors cursor-pointer ${
                  !n.read ? 'bg-surface-700/10' : ''
                }`}
                onClick={() => markAsRead(n.id)}
              >
                <div className="flex items-start gap-2">
                  <span className={`text-xs mt-0.5 ${config.color}`}>{config.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-xs font-medium ${!n.read ? 'text-surface-200/90' : 'text-surface-200/60'}`}>
                        {n.title}
                      </p>
                      <span className="text-[9px] text-surface-200/30 ml-2">{timeAgo(n.timestamp)}</span>
                    </div>
                    <p className="text-[11px] text-surface-200/40 mt-0.5 truncate">{n.message}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                    className="text-surface-200/20 hover:text-surface-200/50 flex-shrink-0"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 py-2 border-t border-surface-700/50">
          <button onClick={clearAll} className="w-full text-center text-[10px] text-surface-200/30 hover:text-surface-200/60 transition-colors">
            {t('icc.notifications.clear_all')}
          </button>
        </div>
      )}
    </div>
  );
}
