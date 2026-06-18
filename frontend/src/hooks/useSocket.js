// frontend/src/hooks/useSocket.js
import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/authStore';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

let socketInstance = null;

const useSocket = () => {
  const { token } = useAuthStore();
  const [connected, setConnected] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [lastNotification, setLastNotification] = useState(null);
  const listenersRef = useRef({});

  useEffect(() => {
    if (!token) return;

    if (!socketInstance) {
      socketInstance = io(SOCKET_URL, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });
    }

    const socket = socketInstance;

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));
    socket.on('unread_count', ({ count }) => setUnreadCount(count));
    socket.on('notification', (notif) => {
      setLastNotification(notif);
      setUnreadCount(prev => prev + 1);
      // Browser notification
      if (Notification.permission === 'granted') {
        new Notification(notif.title, { body: notif.message, icon: '/logo.png' });
      }
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('unread_count');
      socket.off('notification');
    };
  }, [token]);

  const on = useCallback((event, handler) => {
    if (!socketInstance) return;
    socketInstance.on(event, handler);
    listenersRef.current[event] = handler;
    return () => socketInstance?.off(event, handler);
  }, []);

  const emit = useCallback((event, data) => {
    socketInstance?.emit(event, data);
  }, []);

  const watchRun = useCallback((runId) => {
    emit('watch_run', { runId });
  }, [emit]);

  const markRead = useCallback((notificationId) => {
    emit('mark_read', { notificationId });
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, [emit]);

  const requestNotifPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      await Notification.requestPermission();
    }
  }, []);

  return { connected, unreadCount, lastNotification, on, emit, watchRun, markRead, requestNotifPermission };
};

export default useSocket;
