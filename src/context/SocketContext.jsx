import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  // Map of communityId -> online count
  const [onlineMap, setOnlineMap] = useState({});

  // Only connect after login — avoids WebSocket retry spam on auth pages when backend is down
  useEffect(() => {
    if (!user) {
      setSocket(null);
      setOnlineMap({});
      return undefined;
    }

    const instance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 8,
    });
    setSocket(instance);

    instance.on('online:count', (count) => {
      instance._currentCommunityId &&
        setOnlineMap((prev) => ({ ...prev, [instance._currentCommunityId]: count }));
    });

    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, [user]);

  const joinCommunity = useCallback(
    (communityId) => {
      if (!socket || !communityId) return;
      const cid = communityId.toString();
      socket._currentCommunityId = cid;
      socket.emit('community:join', cid);

      // Listen for online count updates for this community
      socket.off('online:count');
      socket.on('online:count', (count) => {
        setOnlineMap((prev) => ({ ...prev, [cid]: count }));
      });
    },
    [socket]
  );

  const leaveCommunity = useCallback(
    (communityId) => {
      if (!socket || !communityId) return;
      const cid = communityId.toString();
      socket.emit('community:leave', cid);
      socket._currentCommunityId = null;
    },
    [socket]
  );

  // Convenience: online count for the currently active community
  const getOnlineCount = useCallback(
    (communityId) => {
      if (!communityId) return 0;
      return onlineMap[communityId.toString()] || 0;
    },
    [onlineMap]
  );

  return (
    <SocketContext.Provider value={{ socket, onlineMap, joinCommunity, leaveCommunity, getOnlineCount }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
