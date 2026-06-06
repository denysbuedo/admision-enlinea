'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { Bell } from 'lucide-react'; // npm install lucide-react si no lo tienes

export function NotificationBell() {
  const { notifications, unreadCount, connected, markAsRead } = useNotifications();

  return (
    <div className="relative">
      <button className="relative p-2 hover:bg-gray-100 rounded-full">
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
        {!connected && (
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-yellow-500 rounded-full border-2 border-white" />
        )}
      </button>

      {notifications.length > 0 && (
        <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border overflow-hidden z-50">
          <div className="p-3 border-b flex justify-between items-center bg-gray-50">
            <h3 className="font-semibold">Notificaciones</h3>
            <button 
              onClick={() => markAsRead()}
              className="text-xs text-blue-600 hover:underline"
            >
              Marcar todas como leídas
            </button>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {notifications.map((notif) => (
              <div 
                key={notif.id}
                onClick={() => markAsRead(notif.id)}
                className={`p-3 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                  !notif.read ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium text-sm">{notif.title}</h4>
                  <span className="text-xs text-gray-500">
                    {new Date(notif.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{notif.message}</p>
                <span className={`text-xs px-2 py-0.5 rounded mt-2 inline-block ${
                  notif.type === 'success' ? 'bg-green-100 text-green-800' :
                  notif.type === 'error' ? 'bg-red-100 text-red-800' :
                  notif.type === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {notif.type}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}