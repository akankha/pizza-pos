import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = (import.meta as any).env?.VITE_SOCKET_URL || 'http://localhost:3001';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socketInstance.on('connect', () => {
      setConnected(true);
      console.log('Connected to server');
    });

    socketInstance.on('disconnect', () => {
      setConnected(false);
      console.log('Disconnected from server');
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, connected };
}
