import { describe, it, expect, beforeEach } from 'vitest';
import { useNotificationStore } from '../modules/notifications/store/useNotificationStore';

describe('useNotificationStore', () => {
  beforeEach(() => {
    useNotificationStore.setState({
      notifications: [],
      unreadCount: 0,
    });
  });

  it('starts with empty state', () => {
    const state = useNotificationStore.getState();
    expect(state.notifications).toEqual([]);
    expect(state.unreadCount).toBe(0);
  });

  describe('addNotification', () => {
    it('adds a notification with id, timestamp, and read=false', () => {
      useNotificationStore.getState().addNotification({
        type: 'info',
        title: 'Test',
        message: 'Hello',
      });
      const { notifications, unreadCount } = useNotificationStore.getState();
      expect(notifications).toHaveLength(1);
      expect(notifications[0].type).toBe('info');
      expect(notifications[0].title).toBe('Test');
      expect(notifications[0].message).toBe('Hello');
      expect(notifications[0].read).toBe(false);
      expect(notifications[0].id).toBeDefined();
      expect(notifications[0].timestamp).toBeInstanceOf(Date);
      expect(unreadCount).toBe(1);
    });

    it('prepends notification (newest first)', () => {
      useNotificationStore.getState().addNotification({
        type: 'info',
        title: 'First',
        message: '1',
      });
      useNotificationStore.getState().addNotification({
        type: 'warning',
        title: 'Second',
        message: '2',
      });
      const { notifications } = useNotificationStore.getState();
      expect(notifications[0].title).toBe('Second');
      expect(notifications[1].title).toBe('First');
    });

    it('caps at 50 notifications', () => {
      for (let i = 0; i < 60; i++) {
        useNotificationStore.getState().addNotification({
          type: 'info',
          title: `N${i}`,
          message: `${i}`,
        });
      }
      expect(useNotificationStore.getState().notifications).toHaveLength(50);
    });
  });

  describe('markAsRead', () => {
    it('marks a notification as read and decrements unreadCount', () => {
      useNotificationStore.getState().addNotification({
        type: 'info',
        title: 'Test',
        message: 'Hello',
      });
      const id = useNotificationStore.getState().notifications[0].id;
      useNotificationStore.getState().markAsRead(id);

      const { notifications, unreadCount } = useNotificationStore.getState();
      expect(notifications[0].read).toBe(true);
      expect(unreadCount).toBe(0);
    });

    it('does nothing for already-read notification', () => {
      useNotificationStore.getState().addNotification({
        type: 'info',
        title: 'Test',
        message: 'Hello',
      });
      const id = useNotificationStore.getState().notifications[0].id;
      useNotificationStore.getState().markAsRead(id);
      useNotificationStore.getState().markAsRead(id);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });

    it('does nothing for non-existent id', () => {
      useNotificationStore.getState().addNotification({
        type: 'info',
        title: 'Test',
        message: 'Hello',
      });
      useNotificationStore.getState().markAsRead('nonexistent');
      expect(useNotificationStore.getState().unreadCount).toBe(1);
    });
  });

  describe('markAllRead', () => {
    it('marks all as read', () => {
      useNotificationStore.getState().addNotification({ type: 'info', title: 'A', message: '1' });
      useNotificationStore.getState().addNotification({ type: 'warning', title: 'B', message: '2' });
      useNotificationStore.getState().markAllRead();

      const { notifications, unreadCount } = useNotificationStore.getState();
      expect(notifications.every((n) => n.read)).toBe(true);
      expect(unreadCount).toBe(0);
    });
  });

  describe('clearAll', () => {
    it('removes all notifications', () => {
      useNotificationStore.getState().addNotification({ type: 'info', title: 'A', message: '1' });
      useNotificationStore.getState().addNotification({ type: 'critical', title: 'B', message: '2' });
      useNotificationStore.getState().clearAll();

      const { notifications, unreadCount } = useNotificationStore.getState();
      expect(notifications).toEqual([]);
      expect(unreadCount).toBe(0);
    });
  });

  describe('dismiss', () => {
    it('removes a notification and adjusts unreadCount', () => {
      useNotificationStore.getState().addNotification({ type: 'info', title: 'A', message: '1' });
      useNotificationStore.getState().addNotification({ type: 'warning', title: 'B', message: '2' });
      const id = useNotificationStore.getState().notifications[0].id;
      useNotificationStore.getState().dismiss(id);

      const { notifications, unreadCount } = useNotificationStore.getState();
      expect(notifications).toHaveLength(1);
      expect(unreadCount).toBe(1);
    });

    it('does not decrement unreadCount for already-read notification', () => {
      useNotificationStore.getState().addNotification({ type: 'info', title: 'A', message: '1' });
      const id = useNotificationStore.getState().notifications[0].id;
      useNotificationStore.getState().markAsRead(id);
      useNotificationStore.getState().dismiss(id);
      expect(useNotificationStore.getState().unreadCount).toBe(0);
    });
  });
});
