import { useCallback, useEffect, useState } from 'react';

export type Notification = {
  id: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
};

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/notifications', { cache: 'no-store' });
      if (response.ok) setNotifications(await response.json());
    } catch {
      // Se conserva el último listado y se vuelve a consultar en el próximo ciclo.
    }
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => void refresh(), 15000);
    const initialRefresh = window.setTimeout(() => void refresh(), 0);
    return () => { window.clearInterval(timer); window.clearTimeout(initialRefresh); };
  }, [refresh]);

  const markAsRead = useCallback(async (id?: number) => {
    try {
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(id === undefined ? {} : { id }),
      });
      if (response.ok) {
        setNotifications(previous => previous.map(item => id === undefined || item.id === id ? { ...item, isRead: true } : item));
      }
    } catch {
      // El estado local no cambia si no se pudo confirmar la lectura.
    }
  }, []);

  return { notifications, unreadCount: notifications.filter(item => !item.isRead).length, markAsRead };
}
