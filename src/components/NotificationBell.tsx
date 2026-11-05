'use client';

import { useState } from 'react';
import { Bell, Check, CheckCheck } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button type="button" aria-label={`Notificaciones${unreadCount ? `, ${unreadCount} nuevas` : ''}`} aria-expanded={open}
        onClick={() => setOpen(value => !value)} className="relative rounded-full p-2 text-[#102B46] hover:bg-slate-100">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[11px] font-bold text-white">{unreadCount > 99 ? '99+' : unreadCount}</span>}
      </button>
      {open && <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="font-semibold text-slate-800">Notificaciones</h2>
          {unreadCount > 0 && <button type="button" onClick={() => void markAsRead()} className="inline-flex items-center gap-1 text-xs font-medium text-[#102B46] hover:underline"><CheckCheck className="h-4 w-4" />Marcar leídas</button>}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {notifications.length === 0 ? <p className="px-4 py-8 text-center text-sm text-slate-500">No tienes notificaciones.</p> : notifications.map(notification => <article key={notification.id} className={`border-b border-slate-100 px-4 py-3 last:border-0 ${notification.isRead ? '' : 'bg-blue-50/70'}`}>
            <div className="flex items-start justify-between gap-3">
              <div><h3 className="text-sm font-semibold text-slate-800">{notification.title}</h3><p className="mt-1 text-sm text-slate-600">{notification.message}</p><time className="mt-2 block text-xs text-slate-400">{new Date(notification.createdAt).toLocaleString('es-CU')}</time></div>
              {!notification.isRead && <button type="button" aria-label="Marcar como leída" title="Marcar como leída" onClick={() => void markAsRead(notification.id)} className="rounded p-1 text-[#102B46] hover:bg-white"><Check className="h-4 w-4" /></button>}
            </div>
          </article>)}
        </div>
      </div>}
    </div>
  );
}
