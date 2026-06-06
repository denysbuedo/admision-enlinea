import { useEffect, useState } from 'react';

export type Notification = {
  id?: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read?: boolean;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/notifications/stream', {
      withCredentials: true,
    });

    eventSource.onopen = () => setConnected(true);
    
    eventSource.onerror = () => {
      setConnected(false);
      eventSource.close();
      // Reconnect after 5 seconds
      setTimeout(() => useNotifications(), 5000);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'connected') return;

      const newNotification: Notification = {
        id: crypto.randomUUID(),
        ...data,
        read: false,
      };

      setNotifications(prev => [newNotification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  const markAsRead = (id?: string) => {
    if (id) {
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    }
  };

  return { notifications, unreadCount, connected, markAsRead };
}