import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useMultiplayerStore } from '../modules/multiplayer/store/useMultiplayerStore';

const mockDbCreateSession = vi.fn().mockResolvedValue({ error: null });
const mockDbGetSession = vi.fn().mockResolvedValue({
  data: { id: 'ABC123', name: 'Test Session', created_by: 'Remote', created_at: new Date().toISOString() },
  error: null,
});
const mockDbDeleteSession = vi.fn().mockResolvedValue({ error: null });

vi.mock('../modules/multiplayer/services/supabaseClient', () => ({
  dbCreateSession: (...args: unknown[]) => mockDbCreateSession(...args),
  dbGetSession: (...args: unknown[]) => mockDbGetSession(...args),
  dbDeleteSession: (...args: unknown[]) => mockDbDeleteSession(...args),
}));

describe('useMultiplayerStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockDbCreateSession.mockResolvedValue({ error: null });
    mockDbGetSession.mockResolvedValue({
      data: { id: 'ABC123', name: 'Test Session', created_by: 'Remote', created_at: new Date().toISOString() },
      error: null,
    });
    mockDbDeleteSession.mockResolvedValue({ error: null });
    useMultiplayerStore.setState({
      session: null,
      localUserId: null,
      isConnected: false,
      connectionError: null,
      channelName: null,
    });
  });

  it('starts with empty state', () => {
    const state = useMultiplayerStore.getState();
    expect(state.session).toBeNull();
    expect(state.localUserId).toBeNull();
    expect(state.isConnected).toBe(false);
    expect(state.connectionError).toBeNull();
  });

  describe('createSession', () => {
    it('creates a session with admin role', async () => {
      await useMultiplayerStore.getState().createSession('Test Session', 'Admin');
      const { session, localUserId } = useMultiplayerStore.getState();

      expect(session).not.toBeNull();
      expect(session!.name).toBe('Test Session');
      expect(session!.createdBy).toBe('Admin');
      expect(session!.participants).toHaveLength(1);
      expect(session!.participants[0].role).toBe('admin');
      expect(session!.participants[0].name).toBe('Admin');
      expect(session!.participants[0].color).toBe('#ef4444');
      expect(localUserId).toBe(session!.participants[0].id);
      expect(mockDbCreateSession).toHaveBeenCalledOnce();
    });

    it('sets error when DB insert fails', async () => {
      mockDbCreateSession.mockResolvedValueOnce({ error: { message: 'fail', details: '', hint: '', code: 'ERR', toJSON: () => ({}), name: 'PostgrestError' } });
      await useMultiplayerStore.getState().createSession('Test', 'Admin');
      expect(useMultiplayerStore.getState().connectionError).toBe('Falha ao criar sessao no servidor.');
      expect(useMultiplayerStore.getState().session).toBeNull();
    });

    it('generates unique session ids', async () => {
      await useMultiplayerStore.getState().createSession('S1', 'User1');
      const id1 = useMultiplayerStore.getState().session!.id;
      useMultiplayerStore.setState({ session: null, localUserId: null });
      await useMultiplayerStore.getState().createSession('S2', 'User2');
      const id2 = useMultiplayerStore.getState().session!.id;
      expect(id1).not.toBe(id2);
    });
  });

  describe('joinSession', () => {
    it('joins a session with viewer role', async () => {
      await useMultiplayerStore.getState().joinSession('ABC123', 'Viewer');
      const { session, localUserId } = useMultiplayerStore.getState();

      expect(session).not.toBeNull();
      expect(session!.id).toBe('ABC123');
      expect(session!.participants[0].role).toBe('viewer');
      expect(session!.participants[0].name).toBe('Viewer');
      expect(localUserId).toBe(session!.participants[0].id);
      expect(mockDbGetSession).toHaveBeenCalledWith('ABC123');
    });

    it('sets error when session not found', async () => {
      mockDbGetSession.mockResolvedValueOnce({ data: null, error: { message: 'not found' } });
      await useMultiplayerStore.getState().joinSession('NOPE', 'Viewer');
      expect(useMultiplayerStore.getState().connectionError).toBe('Sessao nao encontrada. Verifique o ID.');
      expect(useMultiplayerStore.getState().session).toBeNull();
    });
  });

  describe('leaveSession', () => {
    it('clears all state', async () => {
      await useMultiplayerStore.getState().createSession('Test', 'User');
      await useMultiplayerStore.getState().leaveSession();
      const state = useMultiplayerStore.getState();

      expect(state.session).toBeNull();
      expect(state.localUserId).toBeNull();
      expect(state.isConnected).toBe(false);
      expect(state.channelName).toBeNull();
    });

    it('deletes session from DB when admin leaves', async () => {
      await useMultiplayerStore.getState().createSession('Test', 'Admin');
      await useMultiplayerStore.getState().leaveSession();
      expect(mockDbDeleteSession).toHaveBeenCalledOnce();
    });

    it('does not delete session when viewer leaves', async () => {
      mockDbGetSession.mockResolvedValueOnce({
        data: { id: 'XYZ', name: 'S', created_by: 'Other', created_at: new Date().toISOString() },
        error: null,
      });
      await useMultiplayerStore.getState().joinSession('XYZ', 'Viewer');
      await useMultiplayerStore.getState().leaveSession();
      expect(mockDbDeleteSession).not.toHaveBeenCalled();
    });
  });

  describe('updateCursor', () => {
    it('updates cursor for local user only', async () => {
      await useMultiplayerStore.getState().createSession('Test', 'Admin');
      const localId = useMultiplayerStore.getState().localUserId!;

      useMultiplayerStore.getState().updateCursor(5.5, 3.2);
      const participant = useMultiplayerStore.getState().session!.participants.find(
        (p) => p.id === localId,
      );
      expect(participant?.cursor).toEqual({ x: 5.5, z: 3.2 });
    });

    it('does nothing without session', () => {
      useMultiplayerStore.getState().updateCursor(1, 2);
      expect(useMultiplayerStore.getState().session).toBeNull();
    });
  });

  describe('setParticipants', () => {
    it('replaces participant list', async () => {
      await useMultiplayerStore.getState().createSession('Test', 'Admin');
      const newParticipants = [
        { id: 'p1', name: 'A', color: '#fff', role: 'admin' as const },
        { id: 'p2', name: 'B', color: '#000', role: 'viewer' as const },
      ];
      useMultiplayerStore.getState().setParticipants(newParticipants);
      expect(useMultiplayerStore.getState().session!.participants).toHaveLength(2);
    });
  });

  describe('addParticipant', () => {
    it('adds a new participant', async () => {
      await useMultiplayerStore.getState().createSession('Test', 'Admin');
      useMultiplayerStore.getState().addParticipant({
        id: 'viewer1',
        name: 'Viewer',
        color: '#3b82f6',
        role: 'viewer',
      });
      expect(useMultiplayerStore.getState().session!.participants).toHaveLength(2);
    });

    it('does not add duplicate participant', async () => {
      await useMultiplayerStore.getState().createSession('Test', 'Admin');
      const localId = useMultiplayerStore.getState().localUserId!;
      useMultiplayerStore.getState().addParticipant({
        id: localId,
        name: 'Dup',
        color: '#fff',
        role: 'admin',
      });
      expect(useMultiplayerStore.getState().session!.participants).toHaveLength(1);
    });
  });

  describe('removeParticipant', () => {
    it('removes a participant by id', async () => {
      await useMultiplayerStore.getState().createSession('Test', 'Admin');
      useMultiplayerStore.getState().addParticipant({
        id: 'v1',
        name: 'Viewer',
        color: '#3b82f6',
        role: 'viewer',
      });
      expect(useMultiplayerStore.getState().session!.participants).toHaveLength(2);
      useMultiplayerStore.getState().removeParticipant('v1');
      expect(useMultiplayerStore.getState().session!.participants).toHaveLength(1);
    });
  });

  describe('setConnected / setChannelName / setConnectionError', () => {
    it('updates connection state', () => {
      useMultiplayerStore.getState().setConnected(true);
      expect(useMultiplayerStore.getState().isConnected).toBe(true);
      useMultiplayerStore.getState().setChannelName('session:TEST');
      expect(useMultiplayerStore.getState().channelName).toBe('session:TEST');
    });

    it('sets and clears connection error', () => {
      useMultiplayerStore.getState().setConnectionError('test error');
      expect(useMultiplayerStore.getState().connectionError).toBe('test error');
      useMultiplayerStore.getState().setConnectionError(null);
      expect(useMultiplayerStore.getState().connectionError).toBeNull();
    });
  });
});
