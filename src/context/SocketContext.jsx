import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export function SocketProvider({ children }) {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState(0);

  useEffect(() => {
    const instance = io(SOCKET_URL, { transports: ['websocket', 'polling'] });
    setSocket(instance);

    instance.on('online:count', (count) => {
      setOnlineUsers(count);
    });

    return () => {
      instance.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, onlineUsers }}>
      {children}
    </SocketContext.Provider>
  );
}

export const useSocket = () => useContext(SocketContext);
