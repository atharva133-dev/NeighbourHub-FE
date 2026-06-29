import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  // Map of communityId -> online count
  const [onlineMap, setOnlineMap] = useState({});

  useEffect(() => {
    const instance = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    setSocket(instance);

    instance.on('online:count', (count) => {
      // The server emits this to a specific room – we track via a room-aware event
      // We use the communityId stored on the instance at the time of listening
      instance._currentCommunityId &&
        setOnlineMap((prev) => ({ ...prev, [instance._currentCommunityId]: count }));
    });

    return () => {
      instance.disconnect();
    };
  }, []);

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
