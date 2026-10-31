import { NextRequest, NextResponse } from 'next/server';
import { notificationStore } from '@/lib/notification-store';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    if (session.role !== 'super_admin') return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    // 1. Obtener datos del body
    const body = await request.json();
    const { userId, title, message, type = 'info' } = body;

    // ValidaciÃ³n bÃ¡sica
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' }, 
        { status: 400 }
      );
    }

    // 3. Enviar notificaciÃ³n
    // Si userId existe, envÃ­a solo a ese usuario. Si no, podrÃ­as broadcastear a todos (requiere modificar el store)
    if (userId) {
      notificationStore.notify(userId, { title, message, type });
      return NextResponse.json({ success: true, message: `Notification sent to ${userId}` });
    } else {
      // Para pruebas simples, si no hay userId, podrÃ­amos enviar a un usuario "test" o lanzar error
      // AquÃ­ asumimos que si no hay userId, es un error a menos que implementes broadcast
      return NextResponse.json(
        { error: 'userId is required for targeted notification' }, 
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error triggering notification:', error);
    return NextResponse.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}