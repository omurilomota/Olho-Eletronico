import { describe, it, expect, beforeEach } from 'vitest';
import { useMultiplayerStore } from '../modules/multiplayer/store/useMultiplayerStore';

describe('useMultiplayerStore', () => {
  beforeEach(() => {
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
    it('creates a session with admin role', () => {
      useMultiplayerStore.getState().createSession('Test Session', 'Admin');
      const { session, localUserId, isConnected } = useMultiplayerStore.getState();

      expect(session).not.toBeNull();
      expect(session!.name).toBe('Test Session');
      expect(session!.createdBy).toBe('Admin');
      expect(session!.participants).toHaveLength(1);
      expect(session!.participants[0].role).toBe('admin');
      expect(session!.participants[0].name).toBe('Admin');
      expect(session!.participants[0].color).toBe('#ef4444');
      expect(localUserId).toBe(session!.participants[0].id);
      expect(isConnected).toBe(true);
    });

    it('generates unique session ids', () => {
      useMultiplayerStore.getState().createSession('S1', 'User1');
      const id1 = useMultiplayerStore.getState().session!.id;
      useMultiplayerStore.setState({ session: null, localUserId: null });
      useMultiplayerStore.getState().createSession('S2', 'User2');
      const id2 = useMultiplayerStore.getState().session!.id;
      expect(id1).not.toBe(id2);
    });
  });

  describe('joinSession', () => {
    it('joins a session with viewer role', () => {
      useMultiplayerStore.getState().joinSession('ABC123', 'Viewer');
      const { session, localUserId, isConnected } = useMultiplayerStore.getState();

      expect(session).not.toBeNull();
      expect(session!.id).toBe('ABC123');
      expect(session!.participants[0].role).toBe('viewer');
      expect(session!.participants[0].name).toBe('Viewer');
      expect(localUserId).toBe(session!.participants[0].id);
      expect(isConnected).toBe(true);
    });
  });

  describe('leaveSession', () => {
    it('clears all state', () => {
      useMultiplayerStore.getState().createSession('Test', 'User');
      useMultiplayerStore.getState().leaveSession();
      const state = useMultiplayerStore.getState();

      expect(state.session).toBeNull();
      expect(state.localUserId).toBeNull();
      expect(state.isConnected).toBe(false);
      expect(state.channelName).toBeNull();
    });
  });

  describe('updateCursor', () => {
    it('updates cursor for local user only', () => {
      useMultiplayerStore.getState().createSession('Test', 'Admin');
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
    it('replaces participant list', () => {
      useMultiplayerStore.getState().createSession('Test', 'Admin');
      const newParticipants = [
        { id: 'p1', name: 'A', color: '#fff', role: 'admin' as const },
        { id: 'p2', name: 'B', color: '#000', role: 'viewer' as const },
      ];
      useMultiplayerStore.getState().setParticipants(newParticipants);
      expect(useMultiplayerStore.getState().session!.participants).toHaveLength(2);
    });
  });

  describe('addParticipant', () => {
    it('adds a new participant', () => {
      useMultiplayerStore.getState().createSession('Test', 'Admin');
      useMultiplayerStore.getState().addParticipant({
        id: 'viewer1',
        name: 'Viewer',
        color: '#3b82f6',
        role: 'viewer',
      });
      expect(useMultiplayerStore.getState().session!.participants).toHaveLength(2);
    });

    it('does not add duplicate participant', () => {
      useMultiplayerStore.getState().createSession('Test', 'Admin');
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
    it('removes a participant by id', () => {
      useMultiplayerStore.getState().createSession('Test', 'Admin');
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

  describe('setConnected / setChannelName', () => {
    it('updates connection state', () => {
      useMultiplayerStore.getState().setConnected(true);
      expect(useMultiplayerStore.getState().isConnected).toBe(true);
      useMultiplayerStore.getState().setChannelName('session:TEST');
      expect(useMultiplayerStore.getState().channelName).toBe('session:TEST');
    });
  });
});
