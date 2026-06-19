import i18n from '../../../i18n';
import type { NotificationType } from '../store/useNotificationStore';

interface MockNotification {
  type: NotificationType;
  title: string;
  message: string;
}

interface NotificationTemplate {
  type: NotificationType;
  key: string;
}

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  { type: 'info', key: '0' },
  { type: 'info', key: '1' },
  { type: 'warning', key: '2' },
  { type: 'warning', key: '3' },
  { type: 'critical', key: '4' },
  { type: 'success', key: '5' },
  { type: 'info', key: '6' },
  { type: 'warning', key: '7' },
  { type: 'critical', key: '8' },
  { type: 'success', key: '9' },
  { type: 'info', key: '10' },
  { type: 'warning', key: '11' },
];

export function getRandomNotification(): MockNotification {
  const template = NOTIFICATION_TEMPLATES[Math.floor(Math.random() * NOTIFICATION_TEMPLATES.length)];
  const pool = i18n.t('icc.notifications_pool', { returnObjects: true }) as Array<{ title: string; message: string }>;
  const data = pool[Number(template.key)];
  return {
    type: template.type,
    title: data?.title ?? template.key,
    message: data?.message ?? '',
  };
}

let intervalId: ReturnType<typeof setInterval> | null = null;

export function startNotificationSimulation(
  callback: (n: MockNotification) => void,
  intervalMs = 8000,
): void {
  stopNotificationSimulation();
  intervalId = setInterval(() => {
    callback(getRandomNotification());
  }, intervalMs);
}

export function stopNotificationSimulation(): void {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
}
