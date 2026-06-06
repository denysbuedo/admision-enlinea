import { NextRequest, NextResponse } from 'next/server';
import { notificationStore } from '@/lib/notification-store';
import { verifyToken } from '@/lib/auth'; // Ajusta la ruta si es necesario

export async function POST(request: NextRequest) {
  try {
    // 1. Obtener datos del body
    const body = await request.json();
    const { userId, title, message, type = 'info' } = body;

    // Validación básica
    if (!title || !message) {
      return NextResponse.json(
        { error: 'Title and message are required' }, 
        { status: 400 }
      );
    }

    // 2. (Opcional) Verificar autenticación si quieres proteger este endpoint
    // Si solo es para pruebas locales, puedes comentar este bloque
    /*
    const token = request.cookies.get('token')?.value || 
                  request.headers.get('Authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const payload = await verifyToken(token);
    if (payload.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    */

    // 3. Enviar notificación
    // Si userId existe, envía solo a ese usuario. Si no, podrías broadcastear a todos (requiere modificar el store)
    if (userId) {
      notificationStore.notify(userId, { title, message, type });
      return NextResponse.json({ success: true, message: `Notification sent to ${userId}` });
    } else {
      // Para pruebas simples, si no hay userId, podríamos enviar a un usuario "test" o lanzar error
      // Aquí asumimos que si no hay userId, es un error a menos que implementes broadcast
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