import { describe, it, expect, beforeEach } from 'vitest';
import { useIccStore } from '../modules/icc/store/useIccStore';

describe('useIccStore', () => {
  beforeEach(() => {
    useIccStore.getState().clearChat();
  });

  it('starts with empty messages', () => {
    expect(useIccStore.getState().messages).toEqual([]);
  });

  it('addMessage adds a message', () => {
    useIccStore.getState().addMessage({ role: 'user', content: 'Hello' });
    const messages = useIccStore.getState().messages;
    expect(messages).toHaveLength(1);
    expect(messages[0]).toEqual({ role: 'user', content: 'Hello' });
  });

  it('addMessage appends multiple messages', () => {
    useIccStore.getState().addMessage({ role: 'user', content: 'Hello' });
    useIccStore.getState().addMessage({ role: 'ai', content: 'Hi there' });
    const messages = useIccStore.getState().messages;
    expect(messages).toHaveLength(2);
    expect(messages[0].role).toBe('user');
    expect(messages[1].role).toBe('ai');
  });

  it('addMessage preserves chartData', () => {
    useIccStore.getState().addMessage({
      role: 'ai',
      content: 'Data',
      chartData: { label: 'Test', data: [1, 2, 3] },
    });
    const msg = useIccStore.getState().messages[0];
    expect(msg.chartData).toEqual({ label: 'Test', data: [1, 2, 3] });
  });

  it('clearChat empties messages', () => {
    useIccStore.getState().addMessage({ role: 'user', content: 'Hello' });
    useIccStore.getState().addMessage({ role: 'ai', content: 'Hi' });
    useIccStore.getState().clearChat();
    expect(useIccStore.getState().messages).toEqual([]);
  });
});
