import { NextRequest } from 'next/server';
import { notificationStore } from '@/lib/notification-store';
import { verifyToken } from '@/lib/auth'; // Asegúrate de tener esta función

export const runtime = 'nodejs'; // Necesario para mantener conexión larga

export async function GET(request: NextRequest) {
  const token = request.cookies.get('token')?.value || 
                request.headers.get('Authorization')?.split(' ')[1];

  if (!token) {
    return new Response('Unauthorized', { status: 401 });
  }

  let userId: string;
  try {
    const payload = await verifyToken(token);
    userId = payload.userId;
  } catch {
    return new Response('Invalid token', { status: 401 });
  }

  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      const send = (data: string) => {
        controller.enqueue(encoder.encode(data));
      };

      send(`data: ${JSON.stringify({ type: 'connected' })}\n\n`);

      const unsubscribe = notificationStore.subscribe(userId, send);

      request.signal.addEventListener('abort', () => {
        unsubscribe();
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}